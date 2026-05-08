# ERP Builder Platform — Project Report Part 2

## Technology Stack & System Architecture

---

## 9. Technology Stack

### 9.1 Stack Overview

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND                          │
│  Next.js 16 (App Router) · React 19 · TypeScript    │
│  Tailwind CSS v4 · shadcn/ui · Lucide React Icons   │
│  Zustand (state) · dnd-kit (drag-drop)              │
│  Framer Motion · GSAP (animations)                  │
│  Recharts (charts) · Fuse.js (search)               │
│  SWR (data fetching) · cmdk (command palette)       │
├─────────────────────────────────────────────────────┤
│                   BACKEND                           │
│  Next.js API Routes (Server-side)                   │
│  NextAuth.js v4 (Builder auth)                      │
│  Custom JWT (Tenant auth)                           │
│  bcryptjs (password hashing)                        │
├─────────────────────────────────────────────────────┤
│                   DATABASE                          │
│  PostgreSQL (Neon Serverless)                       │
│  Prisma ORM v6.4 (with Neon adapter)               │
│  JSONB columns for dynamic schema storage           │
├─────────────────────────────────────────────────────┤
│                   DEPLOYMENT                        │
│  Vercel (hosting) · Neon (managed DB)               │
└─────────────────────────────────────────────────────┘
```

### 9.2 Dependency Table

| Package | Version | Purpose |
|---|---|---|
| `next` | 16.2.3 | Full-stack React framework with App Router |
| `react` / `react-dom` | 19.2.4 | UI library |
| `@prisma/client` | 6.4.1 | Type-safe database ORM |
| `@neondatabase/serverless` | 0.10.4 | Serverless PostgreSQL connection pooling |
| `@prisma/adapter-neon` | 6.4.1 | Prisma-Neon bridge for serverless |
| `next-auth` | 4.24.13 | Builder authentication (credentials + Google) |
| `bcryptjs` | 3.0.3 | Password hashing (bcrypt) |
| `zustand` | 5.0.12 | Lightweight state management |
| `@dnd-kit/core` + `sortable` | 6.3.1 / 10.0.0 | Drag-and-drop for page composer |
| `recharts` | 3.8.1 | Chart rendering in blocks |
| `fuse.js` | 7.3.0 | Fuzzy search for command palette |
| `cmdk` | 1.1.1 | Command palette UI (Ctrl+K) |
| `swr` | 2.4.1 | Data fetching with caching |
| `framer-motion` | 12.38.0 | Page transitions and animations |
| `gsap` | 3.15.0 | Landing page animations |
| `lucide-react` | 1.8.0 | Icon library (line icons, no emojis) |
| `sonner` | 2.0.7 | Toast notifications |
| `tailwindcss` | v4 | Utility-first CSS framework |
| `shadcn` | 4.2.0 | Accessible UI component library |

### 9.3 Why This Stack

| Decision | Reasoning |
|---|---|
| **Next.js over plain React** | SSR, API routes, file-based routing — full-stack in one framework |
| **PostgreSQL over MongoDB** | JSONB gives schema flexibility while retaining SQL query power and GIN indexes |
| **JSON columns over EAV** | EAV has query pain and poor SQL ergonomics; JSON hits the right balance for dynamic schemas |
| **JSON columns over per-tenant DDL** | Per-tenant DDL is an ops nightmare; JSON avoids schema migrations per user |
| **Prisma over raw SQL** | Type-safe queries, easy migrations, works with Neon serverless |
| **Zustand over Redux** | Minimal boilerplate, perfect for block tree state in page composer |
| **dnd-kit over react-dnd** | Lightweight, composable, better React 18+ support |
| **shadcn/ui over Material UI** | Copy-paste components, full control, smaller bundle |

---

## 10. System Architecture

### 10.1 High-Level Architecture

The system has **two distinct user interfaces** served by the same Next.js application but through completely different route groups:

```
┌──────────────────┐     ┌──────────────────┐
│  Builder User    │     │  Tenant User     │
│  (Business Owner)│     │  (Staff)         │
└────────┬─────────┘     └────────┬─────────┘
         │                        │
    /(dashboard)/*          /apps/[slug]/*
         │                        │
┌────────┴────────────────────────┴─────────┐
│           Next.js 16 App Router           │
│                                           │
│  ┌─────────────┐    ┌──────────────────┐  │
│  │ Builder UI  │    │ Tenant Runtime   │  │
│  │ /workspace  │    │ /apps/[slug]     │  │
│  │ /modules    │    │ /apps/[slug]/    │  │
│  │ /plugins    │    │   [tableId]      │  │
│  │ /schema     │    │ /apps/[slug]/    │  │
│  │ /pages      │    │   pages/[pageId] │  │
│  │ /settings   │    │ /apps/[slug]/    │  │
│  │ /tables     │    │   settings       │  │
│  └──────┬──────┘    └───────┬──────────┘  │
│         │                   │             │
│  ┌──────┴───────────────────┴──────────┐  │
│  │        API Routes (/api/*)          │  │
│  │  /api/auth    /api/tables           │  │
│  │  /api/packs   /api/pages            │  │
│  │  /api/plugins /api/workspace        │  │
│  │  /api/tenant  /api/search           │  │
│  └──────────────────┬─────────────────┘  │
└─────────────────────┼─────────────────────┘
                      │
              ┌───────┴───────┐
              │  Prisma ORM   │
              └───────┬───────┘
                      │
              ┌───────┴───────┐
              │  PostgreSQL   │
              │  (Neon)       │
              └───────────────┘
```

### 10.2 Route Architecture

#### Builder Routes `/(dashboard)/*`

| Route | Purpose |
|---|---|
| `/workspace` | Dashboard — installed modules, quick stats, recent activity |
| `/modules` | Module Marketplace — browse and install packs |
| `/plugins` | Plugin Marketplace — browse and configure plugins |
| `/schema/[tableId]` | Schema Designer — field editor + live table preview |
| `/pages/[pageId]/edit` | Page Composer — block palette + canvas + properties |
| `/tables` | All Tables — browse all workspace tables |
| `/settings` | Workspace settings, tenant user management |

#### Tenant Runtime Routes `/apps/[slug]/*`

| Route | Purpose |
|---|---|
| `/apps/[slug]` | ERP Home — dashboard with metrics |
| `/apps/[slug]/login` | Tenant login (username + password) |
| `/apps/[slug]/[tableId]` | Table view with CRUD |
| `/apps/[slug]/pages/[pageId]` | Custom page (composed by builder) |
| `/apps/[slug]/settings` | Tenant settings |

#### API Routes `/api/*`

| Group | Routes | Operations |
|---|---|---|
| **Auth** | `/api/auth/[...nextauth]`, `/api/auth/register` | Builder signup/login (NextAuth) |
| **Tenant Auth** | `/api/tenant/login`, `/api/tenant/logout` | Staff login/logout (custom JWT) |
| **Workspace** | `/api/workspace`, `/api/workspace/check-slug`, `/api/workspace/tenant-users`, `/api/workspace/admin` | Workspace CRUD, tenant user management |
| **Tables** | `/api/tables`, `/api/tables/[id]`, `/api/tables/[id]/fields`, `/api/tables/[id]/fields/sync`, `/api/tables/[id]/records`, `/api/tables/[id]/records/[recordId]` | Full table/field/record CRUD |
| **Pages** | `/api/pages`, `/api/pages/[id]`, `/api/pages/reorder` | Page CRUD + reordering |
| **Packs** | `/api/packs`, `/api/packs/install`, `/api/packs/update`, `/api/packs/uninstall`, `/api/packs/reinstall-page` | Module lifecycle management |
| **Plugins** | `/api/plugins`, `/api/plugins/install`, `/api/plugins/uninstall`, `/api/plugins/toggle`, `/api/plugins/[id]/config` | Plugin lifecycle + configuration |
| **Search** | `/api/search` | Global search index |
| **Misc** | `/api/account`, `/api/onboarding/launch`, `/api/health` | Account deletion, onboarding, health check |

---

## 11. Database Design

### 11.1 Database: PostgreSQL on Neon Serverless

Connection is established through a **Neon serverless adapter** with WebSocket pooling:

```typescript
// src/lib/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";

neonConfig.webSocketConstructor = globalThis.WebSocket;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaNeon(pool);
const prisma = new PrismaClient({ adapter });
```

### 11.2 Entity Relationship Summary

The database contains **12 models** organized into 4 logical groups:

**Core Identity:**
- `User` — Builder accounts (email, hashed password, name)
- `Workspace` — One per user, identified by unique slug
- `TenantUser` — Staff accounts scoped to a workspace

**Dynamic Schema Engine:**
- `Table` — User/pack-created tables with provenance tags
- `Field` — Column definitions (11 types) with ordering and pack provenance
- `Record` — Actual data rows stored as JSONB keyed by field IDs

**Composition Engine:**
- `Page` — Composed pages stored as JSON block arrays
- `InstalledPack` — Tracks installed modules with versions
- `InstalledPlugin` — Tracks installed plugins with config
- `WorkspaceSchemaOverride` — User's delta changes on top of pack schemas
- `ModuleDefinition` — Developer-authored modules (DB-stored packs)

**Specialized:**
- `GlobalSearchIndex` — Indexed content for universal search
- `AttendanceRecord` — Dedicated attendance tracking (geo-located)
- `EmployeeToken` — Employee authentication tokens

### 11.3 Field Types (11 supported)

```
TEXT · NUMBER · DATE · SINGLE_SELECT · MULTI_SELECT ·
CHECKBOX · RELATION · TIME · EMAIL · PHONE · CURRENCY
```

### 11.4 Key Design Decisions

| Decision | Rationale |
|---|---|
| `Record.data` is JSONB keyed by **field IDs** (not names) | Renames never corrupt data |
| `packSource` + `packTableKey` provenance tags | Update engine can find canonical fields even after user renames |
| `WorkspaceSchemaOverride` stores only **deltas** | Never duplicates the full schema; canonical source remains in registry.ts |
| `InstalledPack.packVersion` tracks version | Enables in-place updates without data loss |
| Cascade deletes on workspace | Clean uninstall — removing a pack removes all its tables, fields, records, and pages |

### 11.5 Override Types (Schema Customization)

Users can customize installed pack schemas via 6 override types:

```
ADD_FIELD · RENAME_FIELD · HIDE_FIELD ·
CHANGE_FIELD_OPTIONS · ADD_TABLE · RENAME_TABLE
```

---

*End of Part 2. Continued in Part 3: Module System, Plugin Architecture & Block Engine.*
