"""Canonical data structures shared by the academic intelligence pipeline."""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Any


@dataclass
class Institution:
    """A normalized institution attached to an author."""

    openalex_id: str | None
    name: str
    ror: str | None = None
    country_code: str | None = None
    type: str | None = None


@dataclass
class Author:
    """A normalized paper author and their authorship roles."""

    openalex_id: str | None
    name: str
    orcid: str | None
    position: str | None
    is_corresponding: bool
    roles: list[str] = field(default_factory=list)
    institutions: list[Institution] = field(default_factory=list)
    raw_affiliations: list[str] = field(default_factory=list)


@dataclass
class Concept:
    """An OpenAlex concept normalized for downstream analysis."""

    openalex_id: str | None
    name: str
    score: float | None = None
    level: int | None = None
    wikidata: str | None = None


@dataclass
class Source:
    """The primary publication source and access location."""

    name: str | None = None
    openalex_id: str | None = None
    type: str | None = None
    issn_l: str | None = None
    landing_page_url: str | None = None
    pdf_url: str | None = None
    is_open_access: bool | None = None


@dataclass
class ResearchEntities:
    """Reserved Analyst output; Cleaner intentionally leaves these lists empty."""

    genes: list[str] = field(default_factory=list)
    proteins: list[str] = field(default_factory=list)
    pathways: list[str] = field(default_factory=list)
    diseases: list[str] = field(default_factory=list)
    methods: list[str] = field(default_factory=list)
    experimental_periods: list[str] = field(default_factory=list)


@dataclass
class Paper:
    """Canonical paper record consumed by later pipeline stages."""

    openalex_id: str | None
    title: str
    abstract: str | None
    publication_year: int | None
    doi: str | None
    cited_by_count: int
    work_type: str | None
    authors: list[Author] = field(default_factory=list)
    concepts: list[Concept] = field(default_factory=list)
    mesh: list[dict[str, Any]] = field(default_factory=list)
    source: Source = field(default_factory=Source)
    research_entities: ResearchEntities = field(default_factory=ResearchEntities)

    def to_dict(self) -> dict[str, Any]:
        """Return a JSON-serializable representation of the paper."""
        return asdict(self)
