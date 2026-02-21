# Overview

This is an **Idea Tracker** application — a full-stack web app for capturing, managing, and viewing project ideas. Each idea is defined by five fields: What (description), Who (target audience), Features, Done Criteria, and Inspiration. Users can create, read, update, and delete ideas through a clean, minimal UI with both grid and table views.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Overall Structure

The project follows a **monorepo pattern** with three main directories:

- `client/` — React frontend (SPA)
- `server/` — Express backend (REST API)
- `shared/` — Shared types, schemas, and route definitions used by both client and server

## Frontend

- **Framework**: React with TypeScript
- **Routing**: Wouter (lightweight client-side router) — two main routes: Home (`/`) and Idea Detail (`/ideas/:id`)
- **State Management**: TanStack React Query for server state (fetching, caching, mutations)
- **Forms**: React Hook Form with Zod resolver for validation
- **UI Components**: shadcn/ui (new-york style) built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming, custom font families (Inter for sans, Playfair Display for display)
- **Animations**: Framer Motion for list animations and transitions
- **Build Tool**: Vite with React plugin

Path aliases:
- `@/` → `client/src/`
- `@shared/` → `shared/`
- `@assets/` → `attached_assets/`

## Backend

- **Framework**: Express 5 running on Node.js
- **Language**: TypeScript, executed via `tsx`
- **API Pattern**: RESTful JSON API under `/api/` prefix
- **Route Definitions**: Centralized in `shared/routes.ts` — defines paths, HTTP methods, input schemas, and response schemas. Both client and server import from this shared module.
- **Storage Layer**: `server/storage.ts` implements a `DatabaseStorage` class behind an `IStorage` interface, allowing potential swapping of storage backends
- **Error Handling**: Zod validation errors return 400 with field-level error info; 404 for missing resources

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/ideas` | List all ideas |
| GET | `/api/ideas/:id` | Get single idea |
| POST | `/api/ideas` | Create new idea |
| PUT | `/api/ideas/:id` | Update existing idea |
| DELETE | `/api/ideas/:id` | Delete an idea |

## Database

- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: Defined in `shared/schema.ts` — single `ideas` table with fields: `id` (serial PK), `what`, `who`, `features`, `doneCriteria`, `inspiration` (all text), `createdAt` (timestamp)
- **Validation**: `drizzle-zod` generates Zod schemas from Drizzle table definitions for input validation
- **Migrations**: Managed via `drizzle-kit push` (schema push approach, not migration files)
- **Connection**: `pg.Pool` using `DATABASE_URL` environment variable

## Build & Deployment

- **Dev**: `tsx server/index.ts` with Vite dev server middleware (HMR enabled)
- **Production Build**: Custom `script/build.ts` that runs Vite for client build and esbuild for server bundling. Server dependencies are selectively bundled vs externalized for faster cold starts.
- **Output**: `dist/public/` for client assets, `dist/index.cjs` for server bundle
- **Static Serving**: In production, Express serves the built client files and falls back to `index.html` for SPA routing

# External Dependencies

## Database
- **PostgreSQL** — Required. Connection via `DATABASE_URL` environment variable. Uses `pg` (node-postgres) driver with `connect-pg-simple` for session storage capability.

## Key NPM Packages
- **drizzle-orm** + **drizzle-kit** — ORM and schema management
- **express** v5 — HTTP server
- **@tanstack/react-query** — Client-side data fetching/caching
- **zod** + **drizzle-zod** — Schema validation (shared between client and server)
- **react-hook-form** + **@hookform/resolvers** — Form management
- **framer-motion** — Animations
- **wouter** — Client-side routing
- **shadcn/ui** components (Radix UI primitives) — UI component library
- **date-fns** — Date formatting

## Replit-Specific
- `@replit/vite-plugin-runtime-error-modal` — Runtime error overlay in development
- `@replit/vite-plugin-cartographer` and `@replit/vite-plugin-dev-banner` — Dev-only Replit integration plugins