"""Deterministic Chinese presentation layer for Analyst Markdown reports."""

from __future__ import annotations

import argparse
import re
from collections import Counter
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_INPUT = PROJECT_ROOT / "data" / "reports" / "Xiang_Rong_profile.md"
DEFAULT_OUTPUT = PROJECT_ROOT / "data" / "reports" / "Xiang_Rong_profile_zh.md"


class PresentationError(RuntimeError):
    """Raised when a report cannot be converted without changing evidence."""


class ChineseReportPresenter:
    """Convert report headings to Chinese without changing report evidence."""

    HEADING_MAP = {
        "## ✨ One-line Summary": "## ✨ 一句话核心总结",
        "## ✨ 一句话硬核总结": "## ✨ 一句话核心总结",
        "## 🧬 Academic Mapping": "## 🧬 科研方向图谱",
        "## 🎓 Undergraduate Perspective": "## 🎓 本科生视角",
        "### Suitable Undergraduate Profile": "### 适合的本科生类型",
        "### Possible Undergraduate Tasks": "### 本科生可能参与的任务",
        "### Expected Skill Development": "### 预期能力成长",
        "### Long-term Advisor Fit": "### 长期学业导师适配度",
        "## 📈 Growth Path": "## 📈 本科生成长路径",
        "### 0-3 Months": "### 0–3个月：基础准备",
        "### 3-6 Months": "### 3–6个月：边界清晰任务",
        "### 6-12 Months": "### 6–12个月：能力提升与阶段成果",
        "## ⚠️ Risk Controller": "## ⚠️ 本科科研风险控制",
        "### Technical Barrier": "### 技术门槛",
        "### Learning Cost": "### 学习成本",
        "### Feedback Cycle": "### 反馈周期",
        "### Expected Milestone Feasibility": "### 阶段成果可行性",
        "### Coursework Conflict": "### 课业冲突风险",
        "### Risk Mitigation Strategy": "### 风险降低策略",
        "## 🔎 Evidence Confidence": "## 🔎 证据置信度",
        "## 🛠️ Survival Checklist": "## 🛠️ 本科生准备清单",
        "## 📚 Evidence Source": "## 📚 论文证据来源",
    }

    CHINESE_TOP_LEVEL_HEADINGS = (
        "# 导师画像：",
        "## ✨ 一句话核心总结",
        "## 🧬 科研方向图谱",
        "## 🎓 本科生视角",
        "## 📈 本科生成长路径",
        "## ⚠️ 本科科研风险控制",
        "## 🔎 证据置信度",
        "## 🛠️ 本科生准备清单",
        "## 📚 论文证据来源",
    )

    @staticmethod
    def _tokens(report: str) -> dict[str, Counter[str]]:
        """Extract protected evidence tokens for before/after comparison."""
        evidence_ids = Counter(re.findall(r"\[E\d+\]", report))
        dois = Counter(
            match.rstrip(".,;|)")
            for match in re.findall(r"(?i)10\.\d{4,9}/[^\s|]+", report)
        )
        years = Counter(re.findall(r"(?<!\d)(?:19|20)\d{2}(?!\d)", report))
        confidence = Counter(re.findall(r"\b(?:High|Medium|Low)\b", report))
        no_evidence = Counter(
            re.findall(r"Evidence insufficient\. Unable to determine\.", report)
        )
        return {
            "evidence_ids": evidence_ids,
            "dois": dois,
            "years": years,
            "confidence": confidence,
            "no_evidence": no_evidence,
        }

    @staticmethod
    def _evidence_rows(report: str) -> list[str]:
        """Return evidence table rows, including original paper titles."""
        return [line for line in report.splitlines() if re.match(r"^\|\s*E\d+\s*\|", line)]

    @classmethod
    def convert_text(cls, report: str) -> str:
        """Replace exact heading lines with stable Chinese presentation labels."""
        converted_lines = [cls.HEADING_MAP.get(line, line) for line in report.splitlines()]
        converted = "\n".join(converted_lines)
        if report.endswith("\n"):
            converted += "\n"
        return converted

    @classmethod
    def validate_conversion(cls, original: str, converted: str) -> None:
        """Verify that presentation conversion preserves structure and evidence."""
        for category, original_tokens in cls._tokens(original).items():
            converted_tokens = cls._tokens(converted)[category]
            if original_tokens != converted_tokens:
                raise PresentationError(f"Protected {category} changed during conversion.")

        if cls._evidence_rows(original) != cls._evidence_rows(converted):
            raise PresentationError("Evidence table rows or paper titles changed.")

        missing = [
            heading for heading in cls.CHINESE_TOP_LEVEL_HEADINGS if heading not in converted
        ]
        if missing:
            raise PresentationError("Missing Chinese report headings: " + ", ".join(missing))

        positions = [converted.index(heading) for heading in cls.CHINESE_TOP_LEVEL_HEADINGS]
        if positions != sorted(positions):
            raise PresentationError("Chinese report headings are out of order.")

    @classmethod
    def convert(cls, input_path: str | Path, output_path: str | Path) -> Path:
        """Convert one report, validate it, and save the Chinese presentation."""
        source = Path(input_path)
        destination = Path(output_path)
        try:
            original = source.read_text(encoding="utf-8")
        except FileNotFoundError as exc:
            raise PresentationError(f"Input report not found: {source}") from exc

        converted = cls.convert_text(original)
        cls.validate_conversion(original, converted)
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_text(converted, encoding="utf-8")
        return destination


def parse_args() -> argparse.Namespace:
    """Parse presenter command-line arguments."""
    parser = argparse.ArgumentParser(description="Create a Chinese Analyst demo report.")
    parser.add_argument("--input", type=Path, default=DEFAULT_INPUT)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    return parser.parse_args()


def main() -> int:
    """Run deterministic report conversion."""
    args = parse_args()
    try:
        output = ChineseReportPresenter.convert(args.input, args.output)
    except (OSError, PresentationError) as exc:
        print(f"Error: {exc}")
        return 1
    print(f"Chinese demo report generated: {output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
