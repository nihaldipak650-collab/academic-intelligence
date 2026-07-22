"""Normalize raw OpenAlex works into the canonical Paper schema."""

from __future__ import annotations

import json
import re
from datetime import date
from pathlib import Path
from typing import Any

from src.schemas import Author, Concept, Institution, Paper, Source


PROJECT_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_INPUT = PROJECT_ROOT / "data" / "raw" / "works.json"
DEFAULT_OUTPUT = PROJECT_ROOT / "data" / "cleaned" / "papers.json"


class PaperCleaner:
    """Convert raw OpenAlex work records into normalized Paper records."""

    @staticmethod
    def restore_abstract(inverted_index: Any) -> str | None:
        """Restore readable text from an OpenAlex abstract inverted index."""
        if not isinstance(inverted_index, dict) or not inverted_index:
            return None

        positioned_tokens: list[tuple[int, str]] = []
        for token, positions in inverted_index.items():
            if not isinstance(token, str) or not isinstance(positions, list):
                continue
            for position in positions:
                if isinstance(position, int) and position >= 0:
                    positioned_tokens.append((position, token))
        if not positioned_tokens:
            return None

        positioned_tokens.sort(key=lambda item: item[0])
        text = " ".join(token for _, token in positioned_tokens)
        text = re.sub(r"\s+([,.;:!?%\)\]\}])", r"\1", text)
        text = re.sub(r"([\(\[\{])\s+", r"\1", text)
        text = re.sub(r"\s+(['’](?:s|t|re|ve|ll|d|m))\b", r"\1", text, flags=re.I)
        return text.strip() or None

    @staticmethod
    def clean_doi(value: Any) -> str | None:
        """Return a lowercase bare DOI without URL or ``doi:`` prefix."""
        if not isinstance(value, str):
            return None
        doi = value.strip()
        doi = re.sub(r"^https?://(?:dx\.)?doi\.org/", "", doi, flags=re.I)
        doi = re.sub(r"^doi:\s*", "", doi, flags=re.I).strip()
        return doi.lower() or None

    @staticmethod
    def normalize_year(value: Any) -> int | None:
        """Normalize a plausible publication year to an integer."""
        try:
            year = int(value)
        except (TypeError, ValueError):
            return None
        return year if 1000 <= year <= date.today().year + 1 else None

    @staticmethod
    def _clean_institutions(authorship: dict[str, Any]) -> list[Institution]:
        institutions: list[Institution] = []
        seen: set[str] = set()
        for raw in authorship.get("institutions") or []:
            if not isinstance(raw, dict):
                continue
            name = str(raw.get("display_name") or "").strip()
            identifier = str(raw.get("id") or "").strip()
            key = identifier or name.casefold()
            if not name or not key or key in seen:
                continue
            seen.add(key)
            institutions.append(
                Institution(
                    openalex_id=identifier or None,
                    name=name,
                    ror=raw.get("ror"),
                    country_code=raw.get("country_code"),
                    type=raw.get("type"),
                )
            )
        return institutions

    @classmethod
    def clean_authors(cls, value: Any) -> list[Author]:
        """Normalize authors and explicitly organize authorship roles."""
        if not isinstance(value, list):
            return []
        authors: list[Author] = []
        for raw in value:
            if not isinstance(raw, dict):
                continue
            author_data = raw.get("author") or {}
            name = str(author_data.get("display_name") or raw.get("raw_author_name") or "").strip()
            if not name:
                continue
            position = str(raw.get("author_position") or "").strip() or None
            corresponding = bool(raw.get("is_corresponding"))
            roles = [position] if position in {"first", "middle", "last"} else []
            if corresponding:
                roles.append("corresponding")
            raw_affiliations = [
                item.strip()
                for item in raw.get("raw_affiliation_strings") or []
                if isinstance(item, str) and item.strip()
            ]
            authors.append(
                Author(
                    openalex_id=author_data.get("id"),
                    name=name,
                    orcid=author_data.get("orcid") or raw.get("raw_orcid"),
                    position=position,
                    is_corresponding=corresponding,
                    roles=roles,
                    institutions=cls._clean_institutions(raw),
                    raw_affiliations=list(dict.fromkeys(raw_affiliations)),
                )
            )
        return authors

    @staticmethod
    def clean_concepts(value: Any) -> list[Concept]:
        """Normalize, deduplicate, and score-sort OpenAlex concepts."""
        if not isinstance(value, list):
            return []
        concepts: list[Concept] = []
        seen: set[str] = set()
        for raw in value:
            if not isinstance(raw, dict):
                continue
            name = str(raw.get("display_name") or "").strip()
            identifier = str(raw.get("id") or "").strip()
            key = identifier or name.casefold()
            if not name or not key or key in seen:
                continue
            seen.add(key)
            try:
                score = float(raw["score"]) if raw.get("score") is not None else None
            except (TypeError, ValueError):
                score = None
            try:
                level = int(raw["level"]) if raw.get("level") is not None else None
            except (TypeError, ValueError):
                level = None
            concepts.append(
                Concept(identifier or None, name, score, level, raw.get("wikidata"))
            )
        return sorted(concepts, key=lambda item: item.score or 0.0, reverse=True)

    @staticmethod
    def clean_source(location: Any) -> Source:
        """Normalize the primary OpenAlex location and source."""
        if not isinstance(location, dict):
            return Source()
        raw_source = location.get("source") or {}
        return Source(
            name=raw_source.get("display_name"),
            openalex_id=raw_source.get("id"),
            type=raw_source.get("type"),
            issn_l=raw_source.get("issn_l"),
            landing_page_url=location.get("landing_page_url"),
            pdf_url=location.get("pdf_url"),
            is_open_access=location.get("is_oa"),
        )

    @classmethod
    def clean_work(cls, raw: dict[str, Any]) -> Paper:
        """Convert one raw OpenAlex work to a canonical Paper."""
        try:
            cited_by_count = max(0, int(raw.get("cited_by_count") or 0))
        except (TypeError, ValueError):
            cited_by_count = 0
        return Paper(
            openalex_id=raw.get("openalex_id") or raw.get("id"),
            title=str(raw.get("title") or "").strip(),
            abstract=cls.restore_abstract(raw.get("abstract_inverted_index")),
            publication_year=cls.normalize_year(raw.get("publication_year")),
            doi=cls.clean_doi(raw.get("doi")),
            cited_by_count=cited_by_count,
            work_type=raw.get("type"),
            authors=cls.clean_authors(raw.get("authorships")),
            concepts=cls.clean_concepts(raw.get("concepts")),
            mesh=[item for item in raw.get("mesh") or [] if isinstance(item, dict)],
            source=cls.clean_source(raw.get("primary_location")),
        )

    @classmethod
    def clean_file(
        cls,
        input_path: str | Path = DEFAULT_INPUT,
        output_path: str | Path = DEFAULT_OUTPUT,
    ) -> list[dict[str, Any]]:
        """Clean a raw works JSON array and save canonical papers as JSON."""
        source_path = Path(input_path)
        destination = Path(output_path)
        try:
            with source_path.open("r", encoding="utf-8") as file:
                raw_works = json.load(file)
        except FileNotFoundError as exc:
            raise FileNotFoundError(f"Raw works file not found: {source_path}") from exc
        except json.JSONDecodeError as exc:
            raise ValueError(f"Raw works file is not valid JSON: {source_path}") from exc
        if not isinstance(raw_works, list):
            raise ValueError("Raw works JSON must contain an array.")

        papers = [cls.clean_work(item).to_dict() for item in raw_works if isinstance(item, dict)]
        destination.parent.mkdir(parents=True, exist_ok=True)
        with destination.open("w", encoding="utf-8") as file:
            json.dump(papers, file, ensure_ascii=False, indent=2)
        return papers


def main() -> int:
    """Run Cleaner v0.1 with the default project paths."""
    try:
        papers = PaperCleaner.clean_file()
    except (OSError, ValueError) as exc:
        print(f"Error: {exc}")
        return 1
    print(f"Cleaned {len(papers)} papers to {DEFAULT_OUTPUT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
