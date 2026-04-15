# ERP Builder — Plan

> Strategy: **Complete one module end-to-end before starting the next.**
> Order: Inventory → CRM & Sales → HR & Payroll → Finance

---

## Current State

| Layer | Status |
|---|---|
| Isolation architecture (schema-resolver, override system) | ✅ Done |
| Inventory DB — 7 tables, 65 fields, in DB | ✅ Done |
| Pack install route (provenance tagging) | ✅ Done |
| Fields/tables API (override-aware CRUD) | ✅ Done |
| Inventory pages UI | ⬜ Not started |
| CRM, HR, Finance DB schemas | ⬜ Stubs only |
| CRM, HR, Finance pages UI | ⬜ Not started |

---

## Phase 1 — Inventory Module (Current Focus)

### Step 1: Pages ← YOU ARE HERE

Six pages need to be built for Inventory. Each page is a `Page` record with `blocks` that the page renderer (`/pages/[pageId]`) renders.

| # | Page | What |
|---|---|---|
| 1 | Products Overview | Table view of all products, filterable by Category / Active |
| 2 | Low Stock Dashboard | Products where Stock Qty < Reorder Level |
| 3 | Stock Movement Log | All inward / outward / transfer events, date filter |
| 4 | Supplier Directory | Supplier list + add/edit form |
| 5 | Purchase Orders | PO list with Status kanban |
| 6 | Godown Summary | Stock view grouped by warehouse |

**To build each page:**
1. Define the `pageDefinitions` block config in `registry.ts` (already partially there)
2. Build the block renderer in `/pages/[pageId]/page.tsx` so it can display `TABLE_VIEW`, `KANBAN_VIEW`, `FILTER_BAR` blocks
3. Wire add/edit actions for records

### Step 2: Record CRUD UI

The page renderer needs to support:
- Viewing a table of records
- Opening a record detail/edit form
- Adding a new record
- Filtering/searching

This is the core of what makes the ERP usable.

### Step 3: Module Overview Page

The Inventory module landing page (`/modules/inventory`) should show:
- Quick stats (total products, low stock count, pending POs)
- Links to all 6 pages
- Recent activity (last 5 stock movements)

---

## Phase 2 — CRM & Sales

Same pattern as Inventory. Do DB schema first (7 tables), then pages.

Tables: Companies → Contacts → Leads → Deals → Quotations → Activities → Sales Targets

---

## Phase 3 — HR & Payroll

Tables: Employees → Attendance → Leaves → Payroll → Departments → Holidays → Assets → Training

---

## Phase 4 — Finance

Tables: Customers → Invoices → Invoice Items → Payments → Expenses → Bank Accounts → Tax Filings

---

## Guiding Principle

> One module done properly > four modules half-built.

Each module should feel usable — real data, real pages, real forms — before starting the next. The DB schemas for other modules can be added quickly once the pattern is set.

---

*Last updated: 2026-04-15*
