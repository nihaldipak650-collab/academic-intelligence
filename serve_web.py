"""Sync selected evidence reports and serve the static 0.5 Beta website locally."""

from __future__ import annotations

import argparse
import json
import shutil
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parent
WEB_ROOT = PROJECT_ROOT / "web"
SOURCE_REPORTS = PROJECT_ROOT / "data" / "reports"
PUBLIC_REPORTS = WEB_ROOT / "reports"


def sync_reports() -> list[str]:
    """Copy only reports declared by advisors.json without altering their content."""
    config_path = WEB_ROOT / "advisors.json"
    advisors = json.loads(config_path.read_text(encoding="utf-8"))
    if not isinstance(advisors, list):
        raise ValueError("web/advisors.json must contain a JSON array")

    PUBLIC_REPORTS.mkdir(parents=True, exist_ok=True)
    copied: list[str] = []
    for advisor in advisors:
        report_name = Path(str(advisor["report"])).name
        source_value = advisor.get("source_report")
        source = (
            (PROJECT_ROOT / str(source_value)).resolve()
            if source_value
            else (SOURCE_REPORTS / report_name).resolve()
        )
        if PROJECT_ROOT.resolve() not in source.parents:
            raise ValueError(f"Configured report source is outside project root: {source}")
        if not source.is_file():
            raise FileNotFoundError(f"Configured report not found: {source}")
        shutil.copy2(source, PUBLIC_REPORTS / report_name)
        copied.append(report_name)
    return copied


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Serve the Academic Intelligence 0.5 Beta website")
    parser.add_argument("--host", default="127.0.0.1", help="Bind address (default: 127.0.0.1)")
    parser.add_argument("--port", type=int, default=8000, help="Port (default: 8000)")
    parser.add_argument("--sync-only", action="store_true", help="Only refresh public report copies")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    copied = sync_reports()
    print(f"Synced {len(copied)} advisor reports.")
    if args.sync_only:
        return

    handler = lambda *handler_args, **handler_kwargs: SimpleHTTPRequestHandler(  # noqa: E731
        *handler_args, directory=str(WEB_ROOT), **handler_kwargs
    )
    server = ThreadingHTTPServer((args.host, args.port), handler)
    print(f"Academic Intelligence 0.5 Beta: http://{args.host}:{args.port}/")
    print("Press Ctrl+C to stop.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
