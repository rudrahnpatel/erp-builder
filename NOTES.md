# ERP Designer — Capstone Project Notes

**Status:** LOCKED IN as final-year capstone project (2026-04-08)
**One-liner:** A Notion/FlowCV-style **ERP builder platform** where SMEs assemble their own ERP from modular, drag-drop blocks and installable module packs — like WooCommerce for ERP.

---

## 1. Core Framing (the most important section)

This is **NOT** "an ERP app that looks like Notion."

This **IS** a **platform / meta-application** — a tool that lets users *design and build* their own ERP by combining dynamic tables, page blocks, views, and installable module packs. The user of our product is an SME owner/operator who needs an ERP but doesn't want rigid Odoo/Zoho structure. They assemble what they need.

**Mental model anchor:**
- FlowCV is not a CV. It's a tool to build CVs.
- WooCommerce is not a store. It's a platform to build stores.
- This project is not an ERP. It's a platform to build ERPs.

Any time we are designing a screen, planning a feature, or writing code, we must ask: **"Does this belong to the builder, or does it belong to the built thing?"** We are building the builder.

---

## 2. Why This Over a Plain Notion-Style ERP App

A plain ERP app with a Notion-like UI has weak capstone positioning:

- **No CS depth** — it's mostly CRUD + UI polish
- **No novelty** — Airtable, Notion databases, Coda, ClickUp, Monday all do variants of this
- **Hard to defend** in thesis panel — "why not just use Airtable?"
- **Scope is still huge** (4 modules) but with no compensating technical contribution

The **platform/builder** framing flips this:

- Real engineering problems (dynamic schema, plugin architecture, UI composition engine) that are genuinely hard
- Clear differentiation from finished products
- Defendable contribution — "I built the framework, the modules are proof-of-concept"
- Panel can evaluate technical depth, not just "is the UI nice"

---

## 3. Complexity Analysis — Honest Take

**Full vision (what a company like Frappe or Budibase is actually doing):**

Literally impossible for a capstone. Requires thousands of engineering-years. Reference points:

| Product | Team Size | Time Invested | Scope |
|---|---|---|---|
| WordPress + WooCommerce | Thousands of contributors | 20+ years | Definitive plugin platform |
| Frappe + ERPNext | Core ~20 + community | ~10 years | Open-source ERP platform |
| Odoo | Hundreds of engineers | Since 2005 | Modular ERP w/ massive ORM |
| Airtable | 100+ engineers | ~10 years | Just the schema engine |
| Notion | Small team → hundreds | Years to stabilize blocks | Block system |
| Budibase / Appsmith | Small teams | ~5-6 years | Low-code, still incomplete |

**Stripped MVP (what we are actually building):**

Feasible for one focused capstone with aggressive scoping. See Section 6 for the scope lock.

---

## 4. What You Are Actually Building (Subsystem Breakdown)

A real ERP builder platform has these subsystems. Marking which are **in scope** for capstone MVP vs **deferred**:

### 4.1 Dynamic Schema Engine  [IN SCOPE — simplified]
Users create tables and fields at runtime. No schema migrations, no SQL DDL by user.

- Field types (MVP): text, number, date, single-select, multi-select, checkbox, relation (FK to another user table)
- Field types (deferred): formula, rollup, lookup, attachment, user mention
- **Storage strategy:** JSON columns in Postgres. Each user "table" is a row in a `tables` metadata table; the actual data lives in a `records` table with a `jsonb` `data` column and a `table_id` FK. Indexed via Postgres GIN on `data`.
- **Why JSON over EAV or per-tenant DDL:** EAV has query pain and poor SQL ergonomics; per-tenant DDL is an ops nightmare. JSON hits the right balance for MVP and gives real-world lessons to write about in the thesis.
- **Tradeoffs to discuss in thesis:** query performance on large datasets, indexing limitations, type safety, migration story.

### 4.2 Page / Block Composition Engine  [IN SCOPE]
Users compose pages by dragging blocks onto a canvas. Pages are stored as a block tree (JSON).

- Block types (MVP, ~6): Table view, Kanban view, Form, Text/Heading, Filter bar, Chart (simple)
- Block types (deferred): Calendar view, Gallery view, Timeline, Embedded database, Rollup summaries
- Library: dnd-kit for drag-drop. Zustand or React context for tree state.
- Each block has a config schema (what it needs to render) and binds to a user table.

### 4.3 Module Packs  [IN SCOPE — internal only]
Pre-built "modules" that seed tables and pages into a user's workspace.

- MVP packs (2): **Inventory Pack** (Products, Suppliers, StockMovements tables + pages), **CRM Pack** (Contacts, Companies, Deals tables + pipeline kanban page)
- Delivered as TypeScript files in the repo (not user-uploadable), loaded via a simple registry
- "Install" = copy the pack's schema + page definitions into the user's workspace
- Demonstrates the platform concept without opening the Pandora's box of 3rd-party SDK

### 4.4 Template Gallery / Marketplace-Lite  [IN SCOPE — static]
Browsable list of installable module packs with previews, field counts, page counts. No ratings, no billing, no uploads. Proves the marketplace concept.

### 4.5 Plugin SDK + 3rd-Party Upload  [DEFERRED — future work]
Real plugin architecture with sandboxing, lifecycle hooks, dependency resolution. This is WordPress-level scope. Thesis chapter: "Future work — extending to a full plugin ecosystem."

### 4.6 Workflow / Automation Engine  [DEFERRED — future work]
Visual if-this-then-that builder with cross-module triggers. Alone this is a 6-month project. Thesis future-work chapter.

### 4.7 Permissions / RBAC  [MINIMAL — single tenant, owner only]
MVP has one user = workspace owner. No roles, no field-level permissions. Thesis mentions it as scale-out concern.

### 4.8 Auto-generated API  [STRETCH GOAL]
Dynamic schemas produce dynamic REST endpoints. Nice to have. Build if ahead of schedule.

### 4.9 Multi-tenancy  [MINIMAL — logical only]
Row-level `workspace_id` on everything. No custom subdomains, no branding. Enough to show the architecture supports it.

### 4.10 Live Preview (FlowCV-style)  [IN SCOPE — key differentiator]
Split-screen: left = schema/block editor, right = live rendered preview. Every edit reflects instantly. This is the signature UX. Copied directly from FlowCV's editing flow.

---

## 5. Capstone MVP — Scope Lock

### In scope
1. Dynamic schema engine with 7 field types and JSON-column storage
2. Page composer with ~6 block types + drag-drop
3. Live split-screen preview (FlowCV-style)
4. 2 pre-built module packs (Inventory, CRM) loaded from code
5. Template gallery (static list of packs)
6. Module install flow (copy schema + pages into workspace)
7. Single-tenant, single-user auth
8. Custom fields on installed module tables (user adds "Expiry Date" to Inventory.Products)
9. Relation fields across module packs (CRM.Deals references Inventory.Products)
10. Basic filter, sort, search on table views

### Explicitly out of scope (document as future work)
- 3rd-party plugin SDK with sandboxing
- Formula / rollup / lookup fields
- Real multi-tenancy with subdomains and branding
- Workflow / automation engine
- Plugin marketplace with billing, ratings, uploads
- Mobile app (responsive web only)
- Real-time collaboration
- Version history / undo beyond basic
- Auth with SSO / OAuth (email + password only)
- Billing / payments

---

## 6. Demo Narrative (for capstone defense)

This is the story you tell on defense day, in order:

1. **Open empty workspace.** "Meet Acme Traders, a small distributor. They need an ERP but nothing off-the-shelf fits."
2. **Open template gallery.** "Here is the module marketplace. Two packs: Inventory, CRM."
3. **Install Inventory Pack.** "Watch — the platform seeds Products, Suppliers, StockMovements tables and two pre-built pages."
4. **Show live preview on the right** as tables populate.
5. **Customize a field.** "Acme wants to track expiry dates. I add an 'Expiry Date' field of type date. Preview updates live."
6. **Drag a Kanban view block** onto the Products page, group by Category. "One drag, instant Kanban."
7. **Install CRM Pack** alongside. "Both modules share the Company table via a relation field — that's the platform's dynamic relation engine at work."
8. **Filter the Deals view** by linked Product.
9. **Zoom out.** "Everything you just saw is stored as metadata. No code was written, no tables were migrated. The schema engine and block composer handle the rest."
10. **Thesis slide:** "Future work — plugin SDK, workflow automation, multi-tenant marketplace."

---

## 7. CS Depth Angles for Thesis

Good thesis defenses need *hard technical problems* you solved. These are yours:

### 7.1 Dynamic Schema Storage Tradeoffs
Write a full chapter comparing EAV, JSON-column, per-tenant DDL. Benchmark query performance on each at 10k / 100k / 1M records. Justify the JSON-column choice with data.

### 7.2 Block Tree Rendering and State Management
How do you render a user-defined tree of blocks efficiently? React reconciliation issues, state propagation from schema changes to block re-renders, avoiding unnecessary re-renders.

### 7.3 Relationship Discovery and Cascade Handling
When a user adds a relation field, how does the platform enforce referential integrity on a schema it didn't design? What happens on delete?

### 7.4 (Stretch) LLM-Assisted Schema Synthesis
User types "I want to track customers and their orders" and the platform generates a schema + initial page layout. This is text-to-schema synthesis and connects to current research in natural-language interfaces to databases. If time permits, this alone is a publishable angle.

### 7.5 (Stretch) Formula Language Design
If formula fields get implemented, even a tiny expression language (parser, evaluator, dependency graph) is thesis-worthy.

---

## 8. Key Risks (and how to manage)

| Risk | Severity | Mitigation |
|---|---|---|
| Scope creep | HIGH | Strict scope lock in Section 5. Every "nice to have" goes to future work. |
| Dynamic schema is harder than I think | HIGH | Start with the simplest JSON-column approach. Do not optimize until you hit a real bottleneck. |
| Drag-drop UX is fiddly | MEDIUM | Use dnd-kit, do not roll your own. Accept rough edges in v1. |
| Live preview performance | MEDIUM | Debounce updates. Re-render only affected blocks, not full tree. |
| Module pack design is vague | MEDIUM | Nail down the pack format early — schema JSON + page JSON + seed data. Don't invent a new DSL. |
| Two modules don't actually integrate | MEDIUM | Force the demo to show cross-module relation. If that doesn't work, the whole platform story collapses. |
| Panel asks "why not just build an ERP?" | LOW | Section 2 is your answer. Practice it. |
| Burnout from huge scope | HIGH | Timebox aggressively. Ship ugly first, polish last. |

---

## 9. Open Decisions (answer before coding)

1. **Stack.** Likely Next.js + Postgres + Prisma + dnd-kit + Zustand + Tailwind + shadcn/ui. Confirm.
2. **Auth.** NextAuth with email+password? Clerk? Simple custom?
3. **Hosting.** Vercel + Neon/Supabase Postgres? Railway? Self-hosted for demo?
4. **Design reference.** FlowCV directly, or FlowCV + Airtable hybrid, or Budibase/Appsmith? (Aesthetic decision drives Stitch prompts.)
5. **Team size.** Solo or team? Scope assumes focused solo effort; a team can expand MVP slightly.
6. **Thesis writing approach.** Write-as-you-go or end-load? Recommended: write-as-you-go, starting with the "Related Work" and "Design Decisions" chapters while coding.
7. **Source control + docs.** GitHub repo with README + ADRs (Architecture Decision Records) from day one.

---

## 10. Next Steps (before writing any code)

1. **Lock in the stack and tooling** (Section 9.1–9.3)
2. **Pick the aesthetic reference** (Section 9.4) so Stitch prompts are consistent
3. **Regenerate the 4–5 builder screens** in Stitch with corrected framing:
   - Template Gallery / Module Marketplace
   - Schema Designer (Airtable-style field editor)
   - Page Composer with Live Preview (FlowCV-style split)
   - Workspace Home (builder-focused, not dashboard-focused)
   - Module Install Flow
4. **Write the one-page project proposal** for the capstone committee using Sections 1–3 of this doc
5. **Set up the repo** with README, initial ADRs, and an empty Next.js scaffold
6. **First coding milestone:** Static page composer rendering a hardcoded block tree — no backend yet. Proves the rendering engine works.
7. **Second coding milestone:** Dynamic schema + one table type + JSON storage. Create a table via UI, add rows, see them render.
8. **Third milestone:** Wire composer to schema — a Table block reads a real user table.
9. **Fourth milestone:** First module pack installs end-to-end.
10. **Fifth milestone:** Cross-module relation works in demo.

---

## 11. Current Stitch Project State

- **Project ID:** `7991188958363854876`
- **Title:** "Notion-Style ERP for SMEs"
- **Design system:** "Paperwork Minimal" (auto-generated — Inter font, light paper aesthetic, blue primary `#005bbf`, ghost borders, no-line rule)
- **Old screens (WRONG framing — not usable):**
  - Dashboard (`a009f82e180543e09e9704b60d8d957b`) — shows finished ERP, not builder
  - Inventory Table (`a694803220b24bb2a06f91a4d01ccf44`) — shows finished CRUD, emojis everywhere
- **New screens (CORRECT builder framing — generated 2026-04-09):**
  - Module Marketplace (`8c416c79a8b74655a7b665fb8db0037c`) — template gallery with installable pack cards
  - Schema Designer (`26bf7d50fe6f4bbf9d06fde16c623a9e`) — split-view: field editor + live table preview
  - Page Composer (`8a84668cd6554974b3c671ba75bce8dd`) — block palette + canvas + properties panel

---

## 12. Rules of Engagement for Future Sessions

When working on this project in any future Claude session:

1. **Remember: we are building the builder, not the built thing.** Every design decision goes through this filter.
2. **No emojis in generated artifacts.** See `feedback_stitch_no_emojis.md`. Use text labels and vector icons.
3. **Honor the scope lock.** If a feature is in "out of scope" or "future work," do not quietly add it. Flag it and ask.
4. **Use ₹ and Indian sample data.** Target user is Indian SMEs.
5. **Stack and decisions are locked in ADRs.** Before changing a framework or approach, read the ADR.
6. **Thesis-write as you go.** Every architecture decision that took more than an hour of thought deserves an ADR entry.

---

*End of notes. Updated when scope, stack, or direction changes.*
