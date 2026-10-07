# Prototype verification

Verified October 7, 2026.

- `npm run build`: passed TypeScript checks and production bundling.
- `npm test`: all 9 tests passed, covering dataset integrity, all 17 requested components, component-specific checklists, valid ownership relationships, status/checklist consistency, N/A exclusions, record scoping, and combined component/owner/status filtering.
- Dependency installation audit: zero reported vulnerabilities after updating the test runner.
- Dataset: 28 projects × 17 components × DEV/QA/PROD = 1,428 records.
- Overview: interactive readiness summaries, environment and team links, component blocker links, and recent-update drawers.
- Matrix: project search, status/component/team/owner/environment filters, empty states, reset, sorting, column visibility, and all-environment rows (84).
- Matrix scrolling: all 17 component headers represented; sticky project and header offsets remain zero relative to the scroll container during horizontal and vertical scrolling.
- Project detail: all 17 components grouped into six sections; component drawer and component portfolio links work. Return navigation preserves matrix filters, sort, and scroll.
- Component detail: Redis shows 24 required projects in DEV. Blocked filtering shows three; combining Commerce narrows to Orders. Component criteria show seven Redis-specific checks.
- Blockers: 33 DEV records, 120 across all environments, 57 Critical. Project/component/severity filters and associated drawers work.
- Drawer: Orders × Redis shows INFRA-2841, its owner, resource reference, update date, and five of seven completed checks. Escape dismissal and focus return work.
- Responsive layout inspected at 1440×1000, 1366×900, and 390×844. Mobile overview and matrix have no page-level horizontal overflow; the matrix scrolls inside its container.
- Compiled production application tested separately from the development server: overview → matrix → drawer → project → component → blockers; no browser console warnings or errors. Readiness guide opens and closes.

Preview servers were stopped after verification. Start the application with `npm run dev` as described in README.md. The server is expected to keep running until Ctrl+C.

Visual previews are saved in `artifacts/`.
