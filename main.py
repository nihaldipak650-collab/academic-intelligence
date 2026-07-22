"""Command-line entry point for Academic Intelligence workflows."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from src.retriever import AcademicRetriever, OpenAlexError


def parse_args() -> argparse.Namespace:
    """Parse command-line arguments."""
    parser = argparse.ArgumentParser(description="Run an Academic Intelligence workflow.")
    parser.add_argument("--mode", choices=("retriever", "analyst"), default="retriever")
    parser.add_argument("--name", help="Author's English name (retriever mode)")
    parser.add_argument("--institution", help="Institution's English name (retriever mode)")
    parser.add_argument("--years", type=int, default=5, help="Number of recent calendar years")
    return parser.parse_args()


def run_retriever(args: argparse.Namespace) -> int:
    """Resolve an author, download works, and save both JSON files."""
    if not args.name or not args.institution:
        print("Error: retriever mode requires --name and --institution", file=sys.stderr)
        return 2
    raw_dir = Path(__file__).resolve().parent / "data" / "raw"
    try:
        with AcademicRetriever() as retriever:
            author = retriever.resolve_author(args.name, args.institution)
            retriever.save_json(author, raw_dir / "author.json")
            works = retriever.fetch_recent_works(author["id"], years=args.years)
            retriever.save_json(works, raw_dir / "works.json")
    except (OpenAlexError, LookupError, ValueError, KeyError) as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1

    print(f"Matched author: {author.get('display_name')} ({author.get('id')})")
    print(f"Saved {len(works)} works to {raw_dir}")
    return 0


def run_analyst() -> int:
    """Generate a prompt-driven supervisor profile report."""
    from src.analyst_agent import AcademicIntelligenceAnalystAgent, AnalystAgentError

    try:
        with AcademicIntelligenceAnalystAgent() as agent:
            output_path = agent.generate_report()
    except AnalystAgentError as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1
    print(f"Generated supervisor profile: {output_path}")
    return 0


def main() -> int:
    """Dispatch the selected workflow."""
    args = parse_args()
    return run_analyst() if args.mode == "analyst" else run_retriever(args)


if __name__ == "__main__":
    raise SystemExit(main())
