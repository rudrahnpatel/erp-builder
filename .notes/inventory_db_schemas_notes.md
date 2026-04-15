# ERP Builder — DB Schema Design Notes

> Bottom-up approach: **DB → Pages → Module UI**.  
> Complete one module fully before starting the next.

---

## The Core Rule (One Sentence)

Pre-built pack schemas live in `registry.ts` and are **never touched by users**. User changes get stored as *overrides* in the DB and merged at runtime by `schema-resolver.ts`.

---

## When Designing Any Pack's Tables

**Four questions to answer first:**
1. What are the *master* entities? (things that persist — Products, Suppliers, Employees)
2. What are the *transactions*? (events that reference masters — Stock Movement, Invoice)
3. Do any transactions have *line items*? (PO → PO Items, Invoice → Invoice Items) → two tables
4. Are any SELECT options going to grow over time? (Godowns, Departments) → make it a table with a RELATION, not a hard-coded SELECT

**Always include on master tables:** `Is Active (CHECKBOX)` — for soft-deleting records.

**Indian compliance fields** (add wherever relevant):

| Field | Where |
|---|---|
| GSTIN (15-char) | Any vendor or customer |
| PAN Number | Any entity involved in payments |
| State (SINGLE_SELECT, all Indian states) | Any address — determines CGST+SGST vs IGST |
| HSN / SAC Code | Products and invoice line items |
| GST Rate (%) | `0%, 5%, 12%, 18%, 28%` — 5 fixed slabs |
| All amounts | CURRENCY with `{ currency: "INR" }` |

**Table install order matters:** A table can only reference a table defined *before it* in the `tables[]` array (the install route resolves RELATIONs top-to-bottom).

---

## Module Status

### ✅ Inventory (Done)
7 tables · 65 fields · DB pushed · Isolation architecture live

| Table | Fields | Purpose |
|---|---|---|
| Products | 12 | SKU catalog, HSN codes, GST rates |
| Suppliers | 12 | Vendor master with GSTIN, state |
| Godowns | 9 | Warehouse/location master |
| Stock Movements | 10 | Inward / outward / transfer ledger |
| Purchase Orders | 8 | PO header per supplier |
| Purchase Order Items | 7 | Line items per PO |
| Stock Alerts | 7 | Low-stock triggers |

**Next:** Build the 6 Inventory pages (see below).

---

### ⬜ CRM & Sales (Next after Inventory)
7 tables: Companies → Contacts → Leads → Deals → Quotations → Activities → Sales Targets  
Key compliance: GSTIN on Companies, State for tax zone.

### ⬜ HR & Payroll
8 tables: Employees → Attendance → Leaves → Payroll → Departments → Holidays → Assets → Training  
Key compliance: PAN + Aadhaar + UAN on Employees, ESI threshold ₹21,000/month salary.

### ⬜ Finance
7 tables: Customers → Invoices → Invoice Items → Payments → Expenses → Bank Accounts → Tax Filings  
Key compliance: CGST/SGST vs IGST split on invoices, GSTR-1/3B filing tracker.

---

## Inventory Pages to Build (6 total)

| Page | What it shows | Key Block |
|---|---|---|
| Products Overview | All products, filterable by category/active | Table view + filter |
| Low Stock Dashboard | Products below reorder level | Filtered table (Stock Qty < Reorder Level) |
| Stock Movement Log | All inward/outward/transfer events | Table view + date filter |
| Supplier Directory | Supplier list + add/edit form | Table view |
| Purchase Orders | POs with status | Table view + kanban by Status |
| Godown Summary | Stock breakdown per location | Table view grouped by Godown |

---

## Pack Metadata Checklist (before pushing any new pack)

```
[ ] Table install order is dependency-correct (no forward RELATION references)
[ ] All CURRENCY fields have { currency: "INR" }
[ ] Is Active CHECKBOX on every master table
[ ] GSTIN / PAN / HSN / State added where Indian compliance requires it
[ ] fields: N in pack metadata matches actual field count (count manually)
[ ] pages: N matches pageDefinitions.length
[ ] Seed data added (2–4 rows per master table)
```

---

*Last updated: 2026-04-15 | Session 44852630*
