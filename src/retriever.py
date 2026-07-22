"""Retrieve author metadata and works from the OpenAlex API."""

from __future__ import annotations

import json
import math
import os
import re
from datetime import date
from difflib import SequenceMatcher
from pathlib import Path
from typing import Any

import requests
from dotenv import load_dotenv
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry


PROJECT_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(PROJECT_ROOT / ".env")


class OpenAlexError(RuntimeError):
    """Raised when OpenAlex cannot satisfy a request."""


class AcademicRetriever:
    """Resolve an academic author and download their recent OpenAlex works."""

    BASE_URL = "https://api.openalex.org"

    def __init__(
        self,
        *,
        timeout: float = 30.0,
        user_agent: str = "academic-intelligence/0.1 (OpenAlex data retriever)",
    ) -> None:
        """Create a retriever with a reusable HTTP session."""
        self.timeout = timeout
        self.api_key = os.getenv("OPENALEX_API_KEY", "").strip()
        self.session = requests.Session()
        self.session.headers.update(
            {"User-Agent": user_agent, "Accept": "application/json"}
        )
        # Retry transient connection/read failures, but surface HTTP statuses
        # immediately. In particular, OpenAlex can return a many-hour
        # Retry-After value for exhausted daily credits.
        retry_policy = Retry(
            total=2,
            connect=2,
            read=2,
            status=0,
            respect_retry_after_header=False,
        )
        self.session.mount("https://", HTTPAdapter(max_retries=retry_policy))

    def close(self) -> None:
        """Close the underlying HTTP session."""
        self.session.close()

    def __enter__(self) -> "AcademicRetriever":
        return self

    def __exit__(self, *_: object) -> None:
        self.close()

    def _get(self, endpoint: str, params: dict[str, Any]) -> dict[str, Any]:
        """Perform one OpenAlex GET request and return its JSON object."""
        url = f"{self.BASE_URL}/{endpoint.lstrip('/')}"
        request_params = dict(params)
        if self.api_key:
            request_params["api_key"] = self.api_key
        try:
            response = self.session.get(
                url, params=request_params, timeout=self.timeout
            )
            response.raise_for_status()
        except requests.Timeout as exc:
            raise OpenAlexError(f"OpenAlex request timed out after {self.timeout}s: {url}") from exc
        except requests.HTTPError as exc:
            status = exc.response.status_code if exc.response is not None else "unknown"
            detail = exc.response.text[:300] if exc.response is not None else str(exc)
            raise OpenAlexError(f"OpenAlex HTTP {status} for {url}: {detail}") from exc
        except requests.RequestException as exc:
            raise OpenAlexError(f"OpenAlex request failed for {url}: {exc}") from exc

        try:
            payload = response.json()
        except requests.JSONDecodeError as exc:
            raise OpenAlexError(f"OpenAlex returned invalid JSON for {url}") from exc
        if not isinstance(payload, dict):
            raise OpenAlexError(f"OpenAlex returned an unexpected response for {url}")
        return payload

    def search_authors(self, name: str) -> list[dict[str, Any]]:
        """Search OpenAlex for author candidates matching ``name``."""
        if not name.strip():
            raise ValueError("Author name must not be empty.")
        payload = self._get("authors", {"search": name.strip(), "per-page": 50})
        results = payload.get("results", [])
        return results if isinstance(results, list) else []

    @staticmethod
    def _normalize(value: str) -> str:
        """Normalize text for tolerant name and institution comparison."""
        return re.sub(r"[^a-z0-9]+", " ", value.casefold()).strip()

    @classmethod
    def _similarity(cls, left: str, right: str) -> float:
        return SequenceMatcher(None, cls._normalize(left), cls._normalize(right)).ratio()

    @staticmethod
    def _institution_names(author: dict[str, Any], field: str) -> list[str]:
        """Extract institution names from an OpenAlex author institution field."""
        names: list[str] = []
        for item in author.get(field) or []:
            institution = item.get("institution", item) if isinstance(item, dict) else {}
            if isinstance(institution, dict) and institution.get("display_name"):
                names.append(str(institution["display_name"]))
        return names

    @classmethod
    def _institution_score(cls, names: list[str], target: str) -> float:
        """Return the best institution similarity, rewarding substring matches."""
        target_normalized = cls._normalize(target)
        best = 0.0
        for name in names:
            candidate = cls._normalize(name)
            similarity = cls._similarity(name, target)
            if candidate and (candidate in target_normalized or target_normalized in candidate):
                similarity = max(similarity, 0.95)
            best = max(best, similarity)
        return best

    def resolve_author(self, name: str, institution: str) -> dict[str, Any]:
        """Select the best candidate using name, institutions, and minor work count.

        Name similarity contributes up to 50 points, last-known institutions up
        to 30, affiliations up to 18, and works count at most 2 points.
        """
        if not institution.strip():
            raise ValueError("Institution must not be empty.")
        candidates = self.search_authors(name)
        if not candidates:
            raise LookupError(f"No OpenAlex author candidates found for {name!r}.")

        def score(author: dict[str, Any]) -> float:
            name_score = self._similarity(name, str(author.get("display_name", "")))
            last_known = self._institution_names(author, "last_known_institutions")
            affiliations = self._institution_names(author, "affiliations")
            last_score = self._institution_score(last_known, institution)
            affiliation_score = self._institution_score(affiliations, institution)
            works_count = max(0, int(author.get("works_count") or 0))
            works_score = min(2.0, math.log10(works_count + 1) / 2)
            return 50 * name_score + 30 * last_score + 18 * affiliation_score + works_score

        return max(candidates, key=score)

    def fetch_recent_works(self, author_id: str, years: int = 5) -> list[dict[str, Any]]:
        """Fetch all works for an author in the current year and prior years."""
        if not author_id.strip():
            raise ValueError("Author ID must not be empty.")
        if years < 1:
            raise ValueError("years must be at least 1.")

        short_id = author_id.rstrip("/").split("/")[-1]
        start_year = date.today().year - years + 1
        cursor = "*"
        works: list[dict[str, Any]] = []
        while cursor:
            payload = self._get(
                "works",
                {
                    "filter": f"author.id:{short_id},from_publication_date:{start_year}-01-01",
                    "per-page": 200,
                    "cursor": cursor,
                },
            )
            for work in payload.get("results", []):
                authorships = work.get("authorships") or []
                corresponding_ids = [
                    item.get("author", {}).get("id")
                    for item in authorships
                    if item.get("is_corresponding") and item.get("author", {}).get("id")
                ]
                works.append(
                    {
                        "openalex_id": work.get("id"),
                        "title": work.get("title"),
                        "publication_year": work.get("publication_year"),
                        "doi": work.get("doi"),
                        "cited_by_count": work.get("cited_by_count"),
                        "type": work.get("type"),
                        "abstract_inverted_index": work.get("abstract_inverted_index"),
                        "authorships": authorships,
                        "concepts": work.get("concepts") or [],
                        "mesh": work.get("mesh") or [],
                        "primary_location": work.get("primary_location"),
                        "corresponding_author_ids": corresponding_ids,
                    }
                )
            next_cursor = (payload.get("meta") or {}).get("next_cursor")
            cursor = str(next_cursor) if next_cursor else ""
        return works

    @staticmethod
    def save_json(data: Any, output_path: str | Path) -> None:
        """Save data as readable UTF-8 JSON, creating parent directories."""
        path = Path(output_path)
        path.parent.mkdir(parents=True, exist_ok=True)
        with path.open("w", encoding="utf-8") as file:
            json.dump(data, file, ensure_ascii=False, indent=2)
