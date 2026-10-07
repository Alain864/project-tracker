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
- **Project detail:** logically grouped components, environment switching, readiness counts, ownership, and blockers. Component rows open checklists; arrows open the component portfolio.
- **Components:** reverse the perspective to inspect an infrastructure component across all projects. Filter by status, team, and owner. Expand readiness criteria to see what each component requires.
- **Blockers:** filter by project, component, severity, infrastructure owner, and application team. Inspect the associated readiness drawer from any row.

The global environment selector supports DEV, QA, PROD, and all environments. In the matrix, “All environments” shows a separate project row for each environment. Readiness drawers preserve matrix position; closing with **Esc** restores focus. Project detail’s back link restores matrix filters, sorting, and scroll position.

## Demo data and methodology

- 8 AI projects across Aura, Photon, and Cloud Platform.
- All 17 requested infrastructure component types.
- 408 readiness records: 8 projects × 17 components × 3 environments.
- Every component has its own realistic readiness checklist.
- Ready, In Progress, Blocked, Not Started, and N/A are represented in every environment.
- Tickets, resource references, owners, and October 2026 update dates are fictional. Ticket identifiers are displayed as references, not external links.
- Readiness = Ready component records ÷ required component records. N/A is excluded; partial checks do not count as a Ready component.
- A ready project has all required components Ready in the selected environment; selecting all environments requires readiness across DEV, QA, and PROD.
- The blocker age is anchored to October 7, 2026 to keep the sample consistent.

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
