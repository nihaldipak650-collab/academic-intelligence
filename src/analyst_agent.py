"""Prompt-driven LLM agent for undergraduate-oriented supervisor profiles."""

from __future__ import annotations

import json
import os
import re
from pathlib import Path
from typing import Any

import requests
from dotenv import load_dotenv
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_PAPERS = PROJECT_ROOT / "data" / "cleaned" / "papers.json"
DEFAULT_AUTHOR = PROJECT_ROOT / "data" / "raw" / "author.json"
DEFAULT_PROMPT = PROJECT_ROOT / "prompts" / "academic_intelligence.md"
DEFAULT_REPORTS = PROJECT_ROOT / "data" / "reports"
load_dotenv(PROJECT_ROOT / ".env")


class AnalystAgentError(RuntimeError):
    """Raised when agent configuration, input, or model output is invalid."""


class AcademicIntelligenceAnalystAgent:
    """Generate a supervisor profile through a configurable LLM prompt."""

    PROVIDER_BASE_URLS = {
        "openai": "https://api.openai.com/v1",
        "deepseek": "https://api.deepseek.com/v1",
    }
    REQUIRED_HEADINGS = (
        "# 导师画像：", "## ✨ 一句话硬核总结", "## 🧬 Academic Mapping",
        "## 🎓 Undergraduate Perspective", "## 📈 Growth Path",
        "## ⚠️ Risk Controller", "## 🔎 Evidence Confidence",
        "## 🛠️ Survival Checklist", "## 📚 Evidence Source",
    )
    REQUIRED_SUBSECTIONS = (
        "### Suitable Undergraduate Profile",
        "### Possible Undergraduate Tasks",
        "### Expected Skill Development",
        "### Long-term Advisor Fit",
        "### 0-3 Months",
        "### 3-6 Months",
        "### 6-12 Months",
        "### Technical Barrier",
        "### Learning Cost",
        "### Feedback Cycle",
        "### Expected Milestone Feasibility",
        "### Coursework Conflict",
        "### Risk Mitigation Strategy",
    )

    def __init__(self, *, timeout: float = 120.0) -> None:
        """Load provider configuration and create a reusable HTTP session."""
        self.provider = os.getenv("LLM_PROVIDER", "openai").strip().casefold()
        self.api_key = os.getenv("API_KEY", "").strip()
        self.model = os.getenv("MODEL", "").strip()
        configured_url = os.getenv("LLM_BASE_URL", "").strip()
        self.base_url = configured_url or self.PROVIDER_BASE_URLS.get(self.provider, "")
        self.timeout = timeout
        missing = [
            name
            for name, value in (
                ("API_KEY", self.api_key),
                ("MODEL", self.model),
                ("LLM_BASE_URL", self.base_url),
            )
            if not value or value.startswith("your_")
        ]
        if missing:
            raise AnalystAgentError("Missing LLM configuration: " + ", ".join(missing) + ". Update .env.")

        self.session = requests.Session()
        self.session.headers.update({
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "User-Agent": "academic-intelligence-analyst/0.1",
        })
        retry = Retry(total=2, connect=2, read=2, status=0)
        self.session.mount("https://", HTTPAdapter(max_retries=retry))

    def close(self) -> None:
        """Close the HTTP session."""
        self.session.close()

    def __enter__(self) -> "AcademicIntelligenceAnalystAgent":
        return self

    def __exit__(self, *_: object) -> None:
        self.close()

    @staticmethod
    def _read_json(path: Path) -> Any:
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except FileNotFoundError as exc:
            raise AnalystAgentError(f"Input file not found: {path}") from exc
        except json.JSONDecodeError as exc:
            raise AnalystAgentError(f"Invalid JSON input: {path}") from exc

    @classmethod
    def load_inputs(cls, papers_path: Path = DEFAULT_PAPERS, author_path: Path = DEFAULT_AUTHOR) -> tuple[str, list[dict[str, Any]]]:
        """Load the supervisor name and canonical papers."""
        papers, author = cls._read_json(papers_path), cls._read_json(author_path)
        if not isinstance(papers, list):
            raise AnalystAgentError("papers.json must contain a JSON array.")
        if not isinstance(author, dict):
            raise AnalystAgentError("author.json must contain a JSON object.")
        name = str(author.get("display_name") or "").strip()
        if not name:
            raise AnalystAgentError("author.json does not contain display_name.")
        return name, [paper for paper in papers if isinstance(paper, dict)]

    @staticmethod
    def _evidence_payload(papers: list[dict[str, Any]]) -> list[dict[str, Any]]:
        """Keep analysis evidence while controlling request size."""
        fields = ("openalex_id", "title", "publication_year", "doi", "authors", "concepts", "mesh")
        evidence = [{field: paper.get(field) for field in fields} for paper in papers]
        for item, paper in zip(evidence, papers):
            item["abstract"] = (paper.get("abstract") or "")[:12000] or None
        return evidence

    @staticmethod
    def _load_prompt(path: Path = DEFAULT_PROMPT) -> str:
        try:
            return path.read_text(encoding="utf-8").strip()
        except FileNotFoundError as exc:
            raise AnalystAgentError(f"Prompt file not found: {path}") from exc

    def _call_model(self, system_prompt: str, user_prompt: str) -> str:
        """Call an OpenAI-compatible chat completions endpoint."""
        url = f"{self.base_url.rstrip('/')}/chat/completions"
        payload = {"model": self.model, "messages": [{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}], "temperature": 0.2}
        try:
            response = self.session.post(url, json=payload, timeout=self.timeout)
            response.raise_for_status()
        except requests.Timeout as exc:
            raise AnalystAgentError(f"LLM request timed out after {self.timeout}s.") from exc
        except requests.HTTPError as exc:
            status = exc.response.status_code if exc.response is not None else "unknown"
            detail = exc.response.text[:500] if exc.response is not None else str(exc)
            raise AnalystAgentError(f"LLM HTTP {status}: {detail}") from exc
        except requests.RequestException as exc:
            raise AnalystAgentError(f"LLM request failed: {exc}") from exc
        try:
            content = response.json()["choices"][0]["message"]["content"]
        except (ValueError, KeyError, IndexError, TypeError) as exc:
            raise AnalystAgentError("LLM returned an unexpected response structure.") from exc
        if not isinstance(content, str) or not content.strip():
            raise AnalystAgentError("LLM returned an empty report.")
        return content.strip()

    @classmethod
    def _validate_report(cls, report: str) -> None:
        required = cls.REQUIRED_HEADINGS + cls.REQUIRED_SUBSECTIONS
        missing = [heading for heading in required if heading not in report]
        if missing:
            raise AnalystAgentError("LLM output is missing required headings: " + ", ".join(missing))
        positions = [report.index(heading) for heading in cls.REQUIRED_HEADINGS]
        if positions != sorted(positions):
            raise AnalystAgentError("LLM output headings are not in the required order.")

    @staticmethod
    def _slug(name: str) -> str:
        return re.sub(r"[^A-Za-z0-9]+", "_", name).strip("_") or "supervisor"

    def generate_report(self, *, papers_path: Path = DEFAULT_PAPERS, author_path: Path = DEFAULT_AUTHOR, prompt_path: Path = DEFAULT_PROMPT, reports_dir: Path = DEFAULT_REPORTS) -> Path:
        """Generate, validate, and save one Markdown supervisor profile."""
        name, papers = self.load_inputs(papers_path, author_path)
        user_prompt = f"导师姓名：{name}\n论文数量：{len(papers)}\n\n以下 JSON 是唯一可用的论文证据：\n" + json.dumps(self._evidence_payload(papers), ensure_ascii=False)
        report = self._call_model(self._load_prompt(prompt_path), user_prompt)
        if report.startswith("```"):
            report = re.sub(r"^```(?:markdown)?\s*|\s*```$", "", report, flags=re.I).strip()
        self._validate_report(report)
        reports_dir.mkdir(parents=True, exist_ok=True)
        output_path = reports_dir / f"{self._slug(name)}_profile.md"
        output_path.write_text(report + "\n", encoding="utf-8")
        return output_path
