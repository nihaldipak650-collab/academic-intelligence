# Legacy web/ site — RETIRED

This directory is **not** an authoritative advisor data source and must not be
deployed to GitHub Pages.

- Formal public advisors come from `data/advisors-v1` → `frontend/public` via
  `frontend/scripts/public-advisor-dto.mjs`.
- Local review (13 advisors, including pending) uses
  `frontend/config/local-review-cohort-13.json` and `.local-review/` (gitignored).
- `web/reports/` has been removed; do not restore Experience-bearing or
  `review_pending` legacy Markdown reports here.
- `web/advisors.json` is intentionally empty (`[]`).
- Legacy rollback workflow `.github/workflows/deploy-pages.yml` fails closed.
- Production Pages workflow: `.github/workflows/deploy-frontend-pages.yml`.

The remaining static HTML/JS/CSS files are kept only as historical reference and
are not part of the release gate.
