# ERP Designer — 3-Week Roadmap (3-Member Team)

**Start Date:** 2026-04-14 (Monday)
**End Date:** 2026-05-02 (Friday)
**Team Size:** 3

---

## Tech Stack (Locked)

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 14 (App Router)** | Full-stack, SSR, API routes, file-based routing |
| Database | **PostgreSQL** (Neon free tier) | JSONB columns for dynamic schema, GIN indexes |
| ORM | **Prisma** | Type-safe queries, easy migrations, works with Neon |
| Drag & Drop | **dnd-kit** | Lightweight, composable, React-native DnD |
| State | **Zustand** | Minimal boilerplate, good for block tree state |
| Styling | **Tailwind CSS + shadcn/ui** | Rapid UI, consistent with Paperwork Minimal design system |
| Auth | **NextAuth.js** | Email + password, simple session management |
| Hosting | **Vercel + Neon** | Free tier sufficient for demo, zero DevOps |
| Icons | **Lucide React** | Clean line icons, no emojis |

---

## Team Roles

### M1 — Backend & Schema Engine (Rudra / strongest backend person)
**Owns:** Database design, API routes, dynamic schema engine, module pack system, auth
**Key deliverables:** Tables/fields CRUD API, JSON storage engine, pack install endpoint, relation engine

### Jiya — Frontend & Builder UI (strongest frontend person)
**Owns:** Page composer, block rendering, drag-drop, live preview, all UI components
**Key deliverables:** Block palette, canvas renderer, properties panel, split-screen preview, responsive shell

### M3 — Integration & Full-stack (third member)
**Owns:** Template gallery, module install flow, filters/sort/search, cross-module wiring, testing, deployment
**Key deliverables:** Marketplace page, install wizard, data filtering, seed data, demo script

---

## Week 1: Foundation (Apr 14-18)

**Goal:** App shell running, DB schema done, basic CRUD working, auth in place.

| Day | M1 (Backend) | M2 (Frontend) | M3 (Integration) |
|---|---|---|---|
| Mon | Repo setup, Prisma schema (workspaces, tables, fields, records, pages, blocks), initial migration | Next.js project scaffold, Tailwind + shadcn/ui setup, layout shell (sidebar + topbar + content area) | README, ADR-001 (tech stack), ADR-002 (JSON vs EAV), project board setup |
| Tue | Auth setup (NextAuth email+password), login/register pages, session middleware | Sidebar nav component, workspace home page (empty state), routing structure | Neon DB provisioning, Vercel project setup, env config, CI pipeline (lint + type-check) |
| Wed | Dynamic schema API: POST/GET /tables, POST/GET /fields (7 field types: text, number, date, single-select, multi-select, checkbox, relation) | Schema Designer page — left panel with field list, field type dropdowns, "+ Add Field" button | Connect frontend to backend APIs, test table creation flow end-to-end |
| Thu | Records API: POST/GET/PATCH/DELETE /records with JSONB storage, basic validation per field type | Schema Designer — right panel with live table preview, wire to GET records API | Seed data script (sample Products table with 10 rows), test all field types render correctly |
| Fri | Field update/delete APIs, reorder fields endpoint | Split-screen layout working (left editor + right preview), responsive breakpoints | Integration testing, bug fixes, Week 1 demo prep |

**Week 1 Deliverable:** You can create a table, add fields of all 7 types, add records, and see them in a split-screen schema designer. Auth works.

---

## Week 2: Core Builder (Apr 21-25)

**Goal:** Page composer with drag-drop blocks, module packs defined, install flow working.

| Day | M1 (Backend) | M2 (Frontend) | M3 (Integration) |
|---|---|---|---|
| Mon | Pages + Blocks API: CRUD for pages, block tree stored as JSON, block ordering | Page Composer layout — left block palette sidebar, center canvas area, right properties panel | Module Pack format design: TypeScript files defining tables + fields + pages + seed data |
| Tue | Block config schema per type (Table View needs table_id + visible columns; Kanban needs table_id + group_by field; etc.) | Drag-drop from palette to canvas using dnd-kit, block reordering on canvas | Write Inventory Pack (Products, Suppliers, StockMovements tables + 2 pages + sample data in INR) |
| Wed | Module Pack install endpoint: POST /packs/install — copies schema + pages + seed records into workspace | Block renderers: Table View block (reads real data), Text/Heading block, Filter Bar block | Write CRM Pack (Contacts, Companies, Deals tables + 1 pipeline kanban page + sample data) |
| Thu | Relation field resolution: when rendering, resolve FK references across tables; cascade handling on delete | Kanban View block renderer (cards grouped by single-select field), Chart block (simple bar chart via recharts) | Template Gallery page — grid of installable packs with metadata (field count, page count, description) |
| Fri | Pack uninstall endpoint, workspace reset endpoint | Properties panel — data source dropdown, visible columns toggle, sort config per block | Install flow: click "Install" on gallery -> confirmation -> pack installs -> redirect to workspace |

**Week 2 Deliverable:** Full page composer with 6 block types, drag-drop working. Two module packs installable from a gallery. Kanban and table views render real data.

---

## Week 3: Integration & Polish (Apr 28 - May 2)

**Goal:** Cross-module relations work, filters work, demo is rehearsed and polished.

| Day | M1 (Backend) | M2 (Frontend) | M3 (Integration) |
|---|---|---|---|
| Mon | Cross-module relation engine: CRM.Deals can reference Inventory.Products via relation field | Relation field UI: dropdown picker that searches records from linked table | End-to-end test: install both packs, verify cross-module relation renders correctly |
| Tue | Filter/sort/search API: query params on GET /records for text search, field filters, multi-sort | Filter Bar block wired to API — field selector, operator dropdown, value input, "Apply" button | Workspace Home page — shows installed modules, recent pages, quick actions |
| Wed | Custom fields on installed packs: user adds "Expiry Date" to Products table, records update | Sort UI on table headers (click to toggle asc/desc), search bar component | Error handling pass: loading states, empty states, error toasts, form validations |
| Thu | Performance: add GIN index on JSONB, test with 500+ records, optimize slow queries | UI polish: hover states, transitions, mobile responsive check, consistent spacing | Demo seed data: "Acme Traders Pvt Ltd" workspace with realistic Indian SME data |
| Fri | Final bug fixes, API cleanup | Final UI fixes, screenshot captures for thesis | Demo rehearsal, deploy to production Vercel, demo script walkthrough |

**Week 3 Deliverable:** Complete demo-ready app. Cross-module relations, filters, custom fields all work. Deployed and rehearsed.

---

## Daily Standup Format (10 min, every morning)

1. Kya kiya kal? (What did you do yesterday?)
2. Aaj kya karega? (What will you do today?)
3. Koi blocker hai? (Any blockers?)

---

## Risk Mitigation

| Risk | Plan |
|---|---|
| Drag-drop takes too long | Use dnd-kit examples as-is, don't customize animations. Ugly but working > pretty but stuck |
| JSONB queries slow | Add GIN indexes early. If still slow, limit preview to 50 rows |
| Module pack format unclear | Nail it down Day 1 of Week 2. Simple TypeScript objects, not a DSL |
| Someone falls behind | Cross-train on Day 1. If M2 is stuck, M3 can pick up UI tasks and vice versa |
| Auth eats too much time | Use NextAuth credentials provider with hardcoded demo user if needed. Auth is not the demo |

---

## Stitch Screens (Builder-Focused, Generated 2026-04-09)

Use these as UI reference while building:

| Screen | Stitch ID | Shows |
|---|---|---|
| Module Marketplace | `8c416c79a8b74655a7b665fb8db0037c` | Template gallery with installable pack cards |
| Schema Designer | `26bf7d50fe6f4bbf9d06fde16c623a9e` | Split-view: field editor + live table preview |
| Page Composer | `8a84668cd6554974b3c671ba75bce8dd` | Block palette + canvas + properties panel |

All screens use "Paperwork Minimal" design system (Inter, #005bbf blue, no emojis).

---

## Definition of Done (for capstone demo)

- [ ] Empty workspace -> install Inventory Pack -> tables + pages appear
- [ ] Install CRM Pack alongside -> both modules visible
- [ ] Add custom "Expiry Date" field to Products table -> preview updates live
- [ ] Drag Kanban block onto a page -> groups by Category field
- [ ] CRM.Deals references Inventory.Products via relation field
- [ ] Filter Deals by linked Product
- [ ] All in INR with Indian sample data
- [ ] Deployed on Vercel, accessible via URL
- [ ] Demo takes < 8 minutes to walk through
