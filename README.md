# ReleaseRadar

[![[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/danudey/releaseradar)]](https://deploy.workers.cloudflare.com)

A mission-control style dashboard for tracking internal **hashreleases** (builds from commits) and managing the lifecycle of public **releases** across Open Source and Enterprise projects. Features interactive progress tracking, high-density data visualization, and real-time status updates.

## Overview

ReleaseRadar provides engineering teams with a sophisticated control center to monitor build health, release readiness, and promotion workflows. Key entities:

- **Hashreleases**: Internal builds with build success, component versions (API/UI/Operator), test results, and readiness status.
- **Releases**: Promotions from hashreleases with granular step tracking (Images Published, Artifacts Published, Operator Published, Docs Merged).

**Core Views**:
- **Mission Control**: Split-screen dashboard for both projects with latest releases and build alerts.
- **Project Stream**: Branch-filtered history of hashreleases and promotions.
- **Release Command Center**: Interactive stepper for toggling release steps (Pending → In Progress → Done → Error).

Designed with a dark-mode "Developer Professional" aesthetic: glowing status pills, smooth animations, and responsive layouts.

## Features

- Fixed sidebar navigation between Open Source & Enterprise projects
- Real-time latest releases/hashreleases with failure alerts
- Filterable project streams by release branch (e.g., `release-2.5`)
- Interactive Release Stepper with cyclic state transitions and optimistic updates
- High-contrast status indicators (Green=Success, Amber=In Progress, Red=Error)
- Persistent storage via Cloudflare Durable Objects (single Global DO for all entities)
- Responsive design (mobile-first) with shadcn/ui components
- Type-safe API with TanStack Query for data fetching/mutations

## Tech Stack

- **Frontend**: React 18, React Router 6, TypeScript, Vite, Tailwind CSS 3, shadcn/ui, Framer Motion, Lucide React, TanStack Query, Sonner (toasts)
- **Backend**: Hono (Edge runtime), Cloudflare Workers, Durable Objects (Entity pattern)
- **State & Data**: Zustand (global), React Hook Form (forms), Zod (validation), Date-fns
- **Dev Tools**: Bun (fast installs/scripts), ESLint, Tailwind config with custom animations/shadows

## Quick Start

1. **Clone & Install**:
   ```bash
   git clone <your-repo>
   cd release-radar
   bun install
   ```

2. **Development**:
   ```bash
   bun run dev
   ```
   Opens at `http://localhost:3000`. Backend APIs at `/api/*`.

3. **Type Generation** (Cloudflare bindings):
   ```bash
   bun run cf-typegen
   ```

## Development

- **Frontend**: Edit `src/pages/HomePage.tsx` (main dashboard). Add routes in `src/main.tsx`.
- **Backend**: Add API routes in `worker/user-routes.ts`. Define entities in `worker/entities.ts` (extends `IndexedEntity`).
- **Data Flow**: Client → Hono → Entity → Global Durable Object. Mock seeding on first access.
- **Shared Types**: `shared/types.ts` (auto-synced frontend/backend).
- **UI Components**: All shadcn/ui in `src/components/ui/*`. Custom sidebar: `src/components/app-sidebar.tsx`.
- **Lint & Build**:
  ```bash
  bun run lint
  bun run build
  bun run preview
  ```

**Key Patterns**:
- Use `api<T>(path)` helper for fetch.
- Entities auto-index for listing/pagination.
- Optimistic updates for step toggles.

## Deployment

Deploy to Cloudflare Workers with full-stack support (frontend + backend + DO storage):

```bash
bun run deploy
```

[![[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/danudey/releaseradar)]](https://deploy.workers.cloudflare.com)

- **Assets**: Static frontend served via SPA mode.
- **Bindings**: Single `GlobalDurableObject` (managed automatically).
- **Migrations**: SQLite DO classes auto-migrate.
- **Observability**: Metrics/logs enabled.

**Production Tips**:
- Custom domain: Update `wrangler.jsonc`.
- Environment vars: Via Wrangler dashboard.
- Preview deploys: `wrangler deploy --name preview-<branch>`.

## Architecture

```
Client (React) → Hono Worker (/api/*) → Entity Wrappers → GlobalDurableObject (Storage)
                          ↓
                   IndexedEntity (HashreleaseEntity, ReleaseEntity)
```

- **Entities**: `HashreleaseEntity` (project/branch-indexed), `ReleaseEntity` (step states).
- **Seeding**: Auto-populate mock data on first API call.
- **Pitfalls Avoided**: Atomic updates (CAS), pagination cursors, no layout shifts.

## Contributing

1. Fork & PR.
2. Follow TypeScript/Tailwind conventions.
3. Test APIs via browser/Postman.
4. Update types in `shared/types.ts` for new features.

## License

MIT. Built with ❤️ by Cloudflare Workers team patterns.