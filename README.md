# Infrastructure Readiness Dashboard

A local, interactive React + TypeScript prototype for tracking **Project × Infrastructure Component × Environment** readiness. No backend or external service is required.

## Run locally

Requires Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
```

Open **http://127.0.0.1:5173**. Vite will print another port if 5173 is already in use.

```sh
npm run build     # TypeScript checks and production bundle
npm run preview   # Serve the production bundle locally
npm test          # Data integrity, status consistency, and readiness calculations
npm run format    # Format application source
```

## Explore

- **Overview:** environment readiness, team readiness, active blockers, and recent component updates. Summary metrics and rows lead to filtered views.
- **Projects:** search and filter the matrix by status, application team, infrastructure owner, and component. Sort by project name, lowest readiness, or most blockers. Hide/show columns from the Columns menu.
- **Project detail:** logically grouped components, environment switching, readiness counts, and the recorded resource or table. Component rows open that detail; arrows open the component portfolio.
- **Components:** reverse the perspective to inspect an infrastructure component across all projects. Filter by status, team, and owner. Expand readiness criteria to see what each component requires.
- **Blockers:** filter by project, component, severity, infrastructure owner, and application team. Inspect the associated readiness drawer from any row.

The global environment selector supports DEV, TEST, PREPROD, PROD, and all environments. In the matrix, “All environments” shows a separate project row for each environment. Readiness drawers preserve matrix position; closing with **Esc** restores focus. Project detail’s back link restores matrix filters, sorting, and scroll position.

## Demo data and methodology

- 8 AI projects. Four have inventory from the tracker workbook; Photon, Knowledge, Analyzer, and Cost Investigator are waiting for data.
- 19 infrastructure components across DEV, TEST, PREPROD, and PROD.
- 608 records: 8 projects × 19 components × 4 environments.
- Simple cells show the resource name. Lists, GitHub teams, Graph permissions, and Key Vault roles render as tables.
- Ready means a value is recorded. Pending means Graph consent is outstanding. Missing is marked in the workbook. N/A is excluded from readiness.
- Regenerate `src/inventory.json` with `python3 scripts/build-inventory.py /path/to/tracker-projects-v2.xlsx` after the remaining projects are filled.

The prototype supports inspection and navigation. It does not write readiness changes or connect to live infrastructure. Environment and column preferences use LocalStorage; matrix context uses SessionStorage. Filters are reflected in the URL.

## Source structure

- `src/types.ts`: clean domain types for Projects, Environments, Components, ReadinessChecks, Blockers, Teams, and Owners.
- `src/data.ts`: deterministic seed data, component-specific checks, and shared calculation helpers. This is the data boundary to replace with real API results.
- `src/App.tsx`: router, shared environment state, navigation, accessible detail drawer, and readiness guide.
- `src/context.ts`: shared environment and drawer contracts, isolated from routed pages for reliable hot reload.
- `src/Overview.tsx`, `src/Projects.tsx`, `src/Components.tsx`, `src/Blockers.tsx`: the four primary views and project/component detail views.
- `src/ui.tsx`: shared status indicators, badges, progress bars, icons, and empty states.
- `src/styles.css`: layout, responsive rules, visual design, and reduced-motion support.
- `src/data.test.ts`: dataset and readiness calculation tests.

Built with React, TypeScript, Vite, React Router, and Lucide. Native HTML tables and compact CSS charts keep this prototype lean. Fonts are bundled locally.
