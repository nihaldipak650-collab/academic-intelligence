"""Rule-based research profile analysis for cleaned paper records."""

from __future__ import annotations

import json
import re
from collections import Counter, defaultdict
from itertools import combinations
from pathlib import Path
from typing import Any


PROJECT_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_INPUT = PROJECT_ROOT / "data" / "cleaned" / "papers.json"
DEFAULT_OUTPUT = PROJECT_ROOT / "data" / "analysis" / "analysis.json"

STOPWORDS = {
    "a", "about", "after", "an", "and", "are", "as", "at", "based", "be",
    "between", "by", "can", "during", "effect", "effects", "for", "from",
    "has", "have", "in", "into", "is", "its", "may", "of", "on", "or",
    "our", "result", "results", "show", "study", "the", "their", "this",
    "through", "to", "using", "via", "was", "were", "which", "with",
}

METHOD_KEYWORDS: dict[str, tuple[str, ...]] = {
    "animal_experiment": (
        "animal model", "mouse", "mice", "murine", "rat", "rats", "rabbit",
        "zebrafish", "in vivo", "infection model",
    ),
    "cell_and_molecular": (
        "cell culture", "cell line", "western blot", "pcr", "qpcr", "rt-pcr",
        "elisa", "immunohistochemistry", "immunofluorescence", "flow cytometry",
        "gene expression", "knockout", "knockdown", "crispr",
    ),
    "omics": (
        "genomics", "genome", "transcriptomics", "transcriptome", "proteomics",
        "proteome", "metabolomics", "metabolome", "single-cell", "single cell",
        "rna-seq", "rna sequencing", "whole genome sequencing", "sequencing",
    ),
    "microscopy_and_imaging": (
        "microscopy", "electron microscopy", "confocal", "imaging", "mri", "ct scan",
    ),
    "bioinformatics_and_statistics": (
        "bioinformatics", "machine learning", "deep learning", "regression",
        "risk model", "network analysis", "phylogenetic", "meta-analysis",
    ),
    "clinical_and_epidemiology": (
        "clinical trial", "cohort", "case-control", "cross-sectional", "survey",
        "epidemiology", "prevalence", "retrospective", "prospective",
    ),
}


class ResearchAnalyst:
    """Build a deterministic research profile from canonical Paper records."""

    @staticmethod
    def _paper_text(paper: dict[str, Any]) -> str:
        return " ".join(
            str(paper.get(field) or "") for field in ("title", "abstract")
        ).casefold()

    @staticmethod
    def _tokens(text: str) -> list[str]:
        words = re.findall(r"[a-z][a-z0-9-]{2,}", text.casefold())
        return [word for word in words if word not in STOPWORDS]

    @classmethod
    def analyze_themes(cls, papers: list[dict[str, Any]]) -> list[dict[str, Any]]:
        """Rank themes from OpenAlex concepts and frequent title/abstract terms."""
        concept_papers: dict[str, set[int]] = defaultdict(set)
        concept_scores: dict[str, list[float]] = defaultdict(list)
        text_papers: dict[str, set[int]] = defaultdict(set)

        for index, paper in enumerate(papers):
            for concept in paper.get("concepts") or []:
                if not isinstance(concept, dict):
                    continue
                name = str(concept.get("name") or "").strip()
                if name:
                    concept_papers[name].add(index)
                    if isinstance(concept.get("score"), (int, float)):
                        concept_scores[name].append(float(concept["score"]))

            title_tokens = cls._tokens(str(paper.get("title") or ""))
            abstract_tokens = cls._tokens(str(paper.get("abstract") or ""))
            for token in set(title_tokens + abstract_tokens):
                text_papers[token].add(index)

        themes: list[dict[str, Any]] = []
        for name, paper_ids in concept_papers.items():
            scores = concept_scores[name]
            themes.append(
                {
                    "theme": name,
                    "paper_count": len(paper_ids),
                    "paper_share": round(len(paper_ids) / len(papers), 4) if papers else 0.0,
                    "source": "concepts",
                    "average_relevance": round(sum(scores) / len(scores), 4) if scores else None,
                }
            )

        concept_names = {name.casefold() for name in concept_papers}
        for term, paper_ids in text_papers.items():
            minimum = 2 if len(papers) >= 3 else 1
            if len(paper_ids) >= minimum and term not in concept_names:
                themes.append(
                    {
                        "theme": term,
                        "paper_count": len(paper_ids),
                        "paper_share": round(len(paper_ids) / len(papers), 4) if papers else 0.0,
                        "source": "title_abstract",
                        "average_relevance": None,
                    }
                )
        themes.sort(
            key=lambda item: (
                item["paper_count"],
                item["average_relevance"] or 0.0,
                item["source"] == "concepts",
            ),
            reverse=True,
        )
        return themes[:20]

    @classmethod
    def analyze_methods(cls, papers: list[dict[str, Any]]) -> dict[str, Any]:
        """Count papers matching predefined method and technology keywords."""
        category_papers: dict[str, set[int]] = defaultdict(set)
        keyword_counts: Counter[str] = Counter()
        for index, paper in enumerate(papers):
            text = cls._paper_text(paper)
            for category, keywords in METHOD_KEYWORDS.items():
                for keyword in keywords:
                    pattern = rf"(?<![a-z0-9]){re.escape(keyword)}(?![a-z0-9])"
                    if re.search(pattern, text):
                        category_papers[category].add(index)
                        keyword_counts[keyword] += 1

        categories = [
            {
                "category": category,
                "paper_count": len(category_papers.get(category, set())),
                "paper_share": round(len(category_papers.get(category, set())) / len(papers), 4)
                if papers else 0.0,
            }
            for category in METHOD_KEYWORDS
        ]
        categories.sort(key=lambda item: item["paper_count"], reverse=True)
        return {
            "categories": categories,
            "keywords": [
                {"keyword": keyword, "paper_count": count}
                for keyword, count in keyword_counts.most_common()
            ],
        }

    @staticmethod
    def _author_key(author: dict[str, Any]) -> str:
        return str(author.get("openalex_id") or author.get("name") or "").strip().casefold()

    @classmethod
    def analyze_author_network(cls, papers: list[dict[str, Any]]) -> dict[str, Any]:
        """Calculate first-author repetition, pairwise overlap, and team stability."""
        first_authors: list[str] = []
        teams: list[set[str]] = []
        author_counts: Counter[str] = Counter()

        for paper in papers:
            authors = [item for item in paper.get("authors") or [] if isinstance(item, dict)]
            team = {cls._author_key(author) for author in authors if cls._author_key(author)}
            teams.append(team)
            author_counts.update(team)
            first = next(
                (cls._author_key(author) for author in authors if author.get("position") == "first"),
                cls._author_key(authors[0]) if authors else "",
            )
            if first:
                first_authors.append(first)

        repeated_first_papers = sum(count for count in Counter(first_authors).values() if count > 1)
        first_repeat_rate = repeated_first_papers / len(first_authors) if first_authors else 0.0

        overlaps: list[float] = []
        for left, right in combinations(teams, 2):
            union = left | right
            overlaps.append(len(left & right) / len(union) if union else 0.0)
        mean_overlap = sum(overlaps) / len(overlaps) if overlaps else 0.0
        stability = 0.4 * first_repeat_rate + 0.6 * mean_overlap

        return {
            "paper_count": len(papers),
            "unique_author_count": len(author_counts),
            "unique_first_author_count": len(set(first_authors)),
            "first_author_repeat_rate": round(first_repeat_rate, 4),
            "mean_pairwise_author_jaccard": round(mean_overlap, 4),
            "team_stability_index": round(stability, 4),
            "team_stability_definition": (
                "0.4 × first-author repeat rate + 0.6 × mean pairwise author Jaccard"
            ),
            "frequent_authors": [
                {"author_key": key, "paper_count": count}
                for key, count in author_counts.most_common(10)
                if count > 1
            ],
        }

    @staticmethod
    def analyze_continuity(papers: list[dict[str, Any]]) -> dict[str, Any]:
        """Count publications by year and describe observed continuity."""
        counts = Counter(
            paper.get("publication_year")
            for paper in papers
            if isinstance(paper.get("publication_year"), int)
        )
        if not counts:
            return {"by_year": {}, "active_years": 0, "year_span": None, "continuity_rate": 0.0}
        first_year, last_year = min(counts), max(counts)
        span = last_year - first_year + 1
        return {
            "by_year": {str(year): counts.get(year, 0) for year in range(first_year, last_year + 1)},
            "active_years": len(counts),
            "year_span": {"from": first_year, "to": last_year},
            "continuity_rate": round(len(counts) / span, 4),
        }

    @staticmethod
    def assess_undergraduate_risk(
        methods: dict[str, Any], author_network: dict[str, Any]
    ) -> dict[str, Any]:
        """Estimate undergraduate execution risk using transparent heuristics."""
        counts = {
            item["category"]: item["paper_count"] for item in methods["categories"]
        }
        active_method_categories = sum(value > 0 for value in counts.values())
        complexity_points = min(3, active_method_categories)
        animal_points = 2 if counts.get("animal_experiment", 0) else 0
        omics_points = 3 if counts.get("omics", 0) else 0
        stability = float(author_network.get("team_stability_index", 0.0))
        stability_points = 2 if stability < 0.2 else 1 if stability < 0.4 else 0
        score = complexity_points + animal_points + omics_points + stability_points
        level = "high" if score >= 7 else "medium" if score >= 4 else "low"
        return {
            "risk_level": level,
            "risk_score": score,
            "maximum_score": 10,
            "factors": {
                "experimental_complexity": {
                    "points": complexity_points,
                    "active_method_categories": active_method_categories,
                },
                "animal_models": {
                    "points": animal_points,
                    "detected": bool(counts.get("animal_experiment", 0)),
                },
                "omics_technology": {
                    "points": omics_points,
                    "detected": bool(counts.get("omics", 0)),
                },
                "team_stability": {"points": stability_points, "index": stability},
            },
            "disclaimer": "Rule-based preliminary implementation risk, not a judgment of research quality.",
        }

    @classmethod
    def analyze(cls, papers: list[dict[str, Any]]) -> dict[str, Any]:
        """Create the complete Analyst v0.1 structured result."""
        methods = cls.analyze_methods(papers)
        author_network = cls.analyze_author_network(papers)
        return {
            "schema_version": "analyst.v0.1",
            "paper_count": len(papers),
            "research_themes": cls.analyze_themes(papers),
            "technical_routes": methods,
            "author_network": author_network,
            "publication_continuity": cls.analyze_continuity(papers),
            "undergraduate_risk": cls.assess_undergraduate_risk(methods, author_network),
        }

    @classmethod
    def analyze_file(
        cls,
        input_path: str | Path = DEFAULT_INPUT,
        output_path: str | Path = DEFAULT_OUTPUT,
    ) -> dict[str, Any]:
        """Read cleaned papers, analyze them, and save structured JSON."""
        source = Path(input_path)
        destination = Path(output_path)
        try:
            with source.open("r", encoding="utf-8") as file:
                papers = json.load(file)
        except FileNotFoundError as exc:
            raise FileNotFoundError(f"Cleaned papers file not found: {source}") from exc
        except json.JSONDecodeError as exc:
            raise ValueError(f"Cleaned papers file is not valid JSON: {source}") from exc
        if not isinstance(papers, list):
            raise ValueError("Cleaned papers JSON must contain an array.")
        result = cls.analyze([item for item in papers if isinstance(item, dict)])
        destination.parent.mkdir(parents=True, exist_ok=True)
        with destination.open("w", encoding="utf-8") as file:
            json.dump(result, file, ensure_ascii=False, indent=2)
        return result


def main() -> int:
    """Run Analyst v0.1 with the default project paths."""
    try:
        result = ResearchAnalyst.analyze_file()
    except (OSError, ValueError) as exc:
        print(f"Error: {exc}")
        return 1
    print(f"Analyzed {result['paper_count']} papers to {DEFAULT_OUTPUT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
