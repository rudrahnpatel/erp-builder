# ERP Builder Platform — Project Report Part 4

## Frontend Components, Data Flow, Implementation Details & Future Scope

---

## 17. Frontend Component Architecture

### 17.1 Component Hierarchy

```
src/components/
├── layout/                    # Shell components
│   ├── Sidebar.tsx            # Navigation sidebar (collapsible, i18n-aware)
│   ├── Topbar.tsx             # Header bar (search, notifications, language toggle)
│   ├── CommandPalette.tsx     # Ctrl+K universal search (Fuse.js powered)
│   └── DevModeGate.tsx        # Developer mode toggle
│
├── blocks/                    # Page block renderers
│   ├── TableView.tsx          # Data grid with inline editing, relations
│   ├── KanbanView.tsx         # Drag-drop board grouped by field
│   ├── FormView.tsx           # Auto-generated record form
│   ├── MetricCard.tsx         # KPI card (static or live count)
│   ├── FilterBar.tsx          # Search + date range filter
│   ├── FilterBarView.tsx      # Runtime filter bar
│   ├── FilterContext.tsx      # Filter state context provider
│   ├── ChartView.tsx          # Recharts bar/line/pie
│   ├── ExportButton.tsx       # CSV export with BOM
│   ├── ImageBlock.tsx         # Image/logo with alignment
│   ├── GstCalculator.tsx      # Indian GST split calculator
│   ├── RecordFormModal.tsx    # Record add/edit modal with validation
│   └── AttendanceLogBlock.tsx # Geo-located attendance check-in/out
│
├── marketplace/               # Pack & plugin cards
│   ├── PackCard.tsx           # Module card with install/update/uninstall
│   └── PluginCard.tsx         # Plugin card with install/configure
│
├── app-runtime/               # Tenant ERP shell
│   ├── AppShell.tsx           # Runtime sidebar + navigation
│   └── SettingsPage.tsx       # Tenant settings (18+ KB)
│
├── workspace/                 # Builder workspace components
├── landing/                   # Landing page components
├── providers/                 # Context providers
└── ui/                        # shadcn/ui primitives
```

### 17.2 Key Component: TableView.tsx

The `TableView` is the most complex block (~11KB). It handles:

- **Field-type-aware rendering** — TEXT, CURRENCY (₹ formatting), CHECKBOX (toggle), SINGLE_SELECT (colored badges), RELATION (linked record chips), DATE, EMAIL, PHONE
- **Inline editing** — Click cell to edit, auto-save on blur
- **Record CRUD** — Add via modal form, delete with confirmation
- **Sorting** — Click column headers to toggle asc/desc
- **Relation resolution** — RELATION fields show display value (e.g., supplier name) not raw ID
- **Copy link** — Copy direct link to filtered table view

### 17.3 Key Component: RecordFormModal.tsx

The form modal (~15KB) dynamically generates form fields based on the table's schema:

| Field Type | Form Widget |
|---|---|
| TEXT | Text input |
| NUMBER | Number input |
| DATE | Date picker |
| TIME | Time picker |
| EMAIL | Email input with validation |
| PHONE | Phone input with +91 prefix, 10-digit validation |
| CURRENCY | Number input with ₹ prefix |
| CHECKBOX | Toggle switch |
| SINGLE_SELECT | Dropdown with options from field.config |
| MULTI_SELECT | Multi-select checkboxes |
| RELATION | Searchable dropdown fetching records from linked table |

### 17.4 Key Component: KanbanView.tsx

The Kanban board (~9KB) uses `@dnd-kit` for drag-and-drop:

```
┌─────────────┬─────────────┬─────────────┐
│  Draft      │  Sent       │  Received   │
├─────────────┼─────────────┼─────────────┤
│ ┌─────────┐ │ ┌─────────┐ │ ┌─────────┐ │
│ │ PO-001  │ │ │ PO-002  │ │ │ PO-003  │ │
│ │ ₹95,000 │ │ │ ₹42,000 │ │ │ ₹15,000 │ │
│ └─────────┘ │ └─────────┘ │ └─────────┘ │
│             │             │             │
└─────────────┴─────────────┴─────────────┘
```

- Groups records by a SINGLE_SELECT field
- Drag cards between columns to update the field value
- Card shows first 2-3 fields as preview

---

## 18. Record CRUD — Data Flow

### 18.1 How Records Are Stored

Records use a **flat JSON blob** keyed by **field IDs** (not field names):

```json
{
  "id": "clx7abc123",
  "tableId": "clx7def456",
  "data": {
    "clx7field1": "Wireless Mouse",        // TEXT
    "clx7field2": "Electronics",            // SINGLE_SELECT
    "clx7field3": 850,                      // CURRENCY
    "clx7field4": true,                     // CHECKBOX
    "clx7field5": "clx7supplierRecId"       // RELATION → Record ID
  }
}
```

**Why field IDs not names?** If a user renames "Product Name" to "Item Name", all existing records still work because `data.clx7field1` hasn't changed.

### 18.2 CRUD Operations

| Operation | HTTP | Body | Backend Action |
|---|---|---|---|
| **List** | `GET /api/tables/:id/records` | — | Fetch fields + records for table |
| **Create** | `POST /api/tables/:id/records` | `{ data: { fieldId: value } }` | `Record.create()` |
| **Update** | `PATCH /api/tables/:id/records/:rid` | `{ data: { fieldId: newVal } }` | Merge into existing data JSON |
| **Delete** | `DELETE /api/tables/:id/records/:rid` | — | `Record.delete()` |

### 18.3 Relation Field Resolution

When rendering, RELATION fields need to show display values (not raw IDs):

```
1. TableView receives records with data = { supplierId: "clx7rec123" }
2. For each RELATION field, batch-fetch referenced records
3. Extract display value (first TEXT field of linked table)
4. Render as clickable chip: "Krishna Polymers" instead of "clx7rec123"
```

---

## 19. Universal Search System

### 19.1 Architecture

```
┌────────────────────────────┐
│  Ctrl+K / ⌘K triggers      │
│  CommandPalette.tsx         │
│  (cmdk library)            │
└──────────┬─────────────────┘
           │
    GET /api/search?workspaceId=...
           │
┌──────────┴─────────────────┐
│  GlobalSearchIndex table   │
│  Indexed: pages, tables,   │
│  records, modules          │
└──────────┬─────────────────┘
           │
    Fuse.js fuzzy matching
           │
┌──────────┴─────────────────┐
│  Results grouped by type   │
│  with navigation links     │
└────────────────────────────┘
```

### 19.2 What's Indexed

| Type | Content Indexed |
|---|---|
| `page` | Page titles, block content |
| `table` | Table names, field names |
| `record` | Record values (first few text fields) |
| `module` | Pack names, descriptions |

---

## 20. Internationalization (i18n)

### 20.1 Implementation

```typescript
// src/lib/i18n.ts — Type-safe dictionary system
const dictionaries = {
  en: { sidebar: { workspace: "Workspace", modules: "Modules", ... } },
  hi: { sidebar: { workspace: "कार्यक्षेत्र", modules: "मॉड्यूल", ... } },
};

// useLanguage() hook — localStorage-backed, broadcasts changes via custom event
```

### 20.2 Supported Languages

| Language | Code | Coverage |
|---|---|---|
| English | `en` | Full |
| Hindi | `hi` | Sidebar, Topbar, common actions |

Toggle in Topbar: `EN ⇄ हि` — switches live without page reload.

---

## 21. Directory Structure — Full Map

```
erp-builder/
├── prisma/
│   ├── schema.prisma          # 12 models, 229 lines
│   └── migrations/            # Prisma migration history
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout (Inter font, providers)
│   │   ├── page.tsx           # Landing page
│   │   ├── globals.css        # Design system (12KB)
│   │   ├── (auth)/
│   │   │   ├── login/         # Builder login
│   │   │   └── register/      # Builder signup
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx     # Sidebar + Topbar shell
│   │   │   ├── workspace/     # Dashboard home
│   │   │   ├── modules/       # Module marketplace
│   │   │   ├── plugins/       # Plugin marketplace
│   │   │   ├── schema/[tableId]/ # Schema designer
│   │   │   ├── pages/[pageId]/edit/ # Page composer
│   │   │   ├── tables/        # All tables
│   │   │   ├── settings/      # Settings
│   │   │   └── dev/           # Developer tools
│   │   ├── apps/[slug]/
│   │   │   ├── layout.tsx     # Runtime shell
│   │   │   ├── page.tsx       # ERP home
│   │   │   ├── login/         # Tenant login
│   │   │   ├── [tableId]/     # Table view
│   │   │   └── pages/[pageId]/ # Custom page
│   │   ├── api/               # 13 API route groups
│   │   ├── onboarding/        # First-time setup
│   │   └── attendance/        # Attendance portal
│   ├── components/            # 8 component groups
│   ├── hooks/                 # use-workspace, use-dev-mode
│   ├── lib/
│   │   ├── auth.ts            # NextAuth config (credentials + Google)
│   │   ├── db.ts              # Prisma client (Neon adapter)
│   │   ├── schema-resolver.ts # Pack schema + override merger
│   │   ├── i18n.ts            # EN/HI dictionaries
│   │   ├── slug.ts            # Subdomain validation
│   │   ├── default-pages.ts   # Built-in Dashboard + Settings pages
│   │   ├── packs/
│   │   │   ├── registry.ts    # Pack definitions (36KB, 1071 lines)
│   │   │   └── index.ts       # Registry + async DB lookup
│   │   └── plugins/
│   │       └── registry.ts    # Plugin definitions (6 plugins)
│   └── types/
│       ├── block.ts           # BlockType, BlockConfig, Block
│       ├── pack.ts            # PackDefinition types
│       ├── plugin.ts          # PluginDefinition types
│       └── next-auth.d.ts     # Session type augmentation
├── SYSTEM-DESIGN.md           # Architecture diagrams (Mermaid)
├── IMPLEMENTATION.md          # Implementation spec
├── ROADMAP.md                 # 3-week development plan
├── TODO.md                    # 30/30 improvements shipped
└── package.json               # 28 dependencies
```

---

## 22. Design System

| Token | Value |
|---|---|
| **Font** | Inter (all weights) |
| **Primary** | `#005bbf` (blue) |
| **Background** | `#f8f9fa` (warm off-white) |
| **Cards** | `#ffffff` on `#f1f4f6` |
| **Text** | `#2b3437` (never pure black) |
| **Borders** | Ghost borders — `outline_variant` at 15% opacity |
| **Icons** | Lucide React line icons (no emojis) |
| **Currency** | INR (₹) |
| **Animations** | Framer Motion page transitions, GSAP landing page |

---

## 23. Future Scope

| Feature | Description | Complexity |
|---|---|---|
| **Plugin SDK** | Third-party developers upload plugins with sandboxing | Very High |
| **Workflow Engine** | Visual if-this-then-that builder with cross-module triggers | High |
| **Formula Fields** | Expression language with parser, evaluator, dependency graph | High |
| **Real Multi-tenancy** | Custom subdomains, tenant branding, data isolation | High |
| **Mobile App** | React Native companion app for field staff | High |
| **Real-time Collaboration** | WebSocket-based live editing | Medium |
| **Advanced Charts** | Interactive dashboards with drill-down | Medium |
| **Audit Logs** | Complete change history with diff viewer | Medium |
| **Webhook System** | External integrations via webhooks | Medium |
| **Calendar/Timeline Views** | New block types for date-based data | Medium |
| **Approval Flows** | Built-in approve/reject workflows | Medium |
| **Billing Integration** | Paid plans, usage metering | Medium |
| **LLM Schema Synthesis** | "I want to track orders" → auto-generates schema + pages | Research |

---

## 24. Testing

### 24.1 Test Cases

| TC# | Module | Test | Expected Result |
|---|---|---|---|
| 1 | Auth | Builder signup with new email | Workspace created, redirected to dashboard |
| 2 | Auth | Tenant login with wrong password | 401, error message shown |
| 3 | Auth | Google SSO first-time login | User auto-created, workspace setup begins |
| 4 | Pack | Install Inventory pack | 4 tables + 4 pages created, marketplace shows installed |
| 5 | Pack | Update Inventory v1.1 → v1.2 | Only missing fields/relations added, existing data intact |
| 6 | Pack | Uninstall pack | All pack tables, records, pages removed |
| 7 | Schema | Add custom field to Stock table | Field appears in TableView, records preserve data |
| 8 | Schema | Hide a pack field | Field hidden from views but data preserved |
| 9 | Composer | Drag METRIC block, set 1/2 width | Two metrics sit side-by-side |
| 10 | Composer | Add TABLE_VIEW with visibleFields | Only selected columns shown |
| 11 | Runtime | Add new Product record from form | Row appears in tenant table view |
| 12 | Runtime | Phone field validation | +91 prefix, rejects non-10-digit, rejects invalid start digits |
| 13 | Relation | Pick Supplier on Product | Display name shown as chip, not UUID |
| 14 | Plugin | Install and configure WhatsApp plugin | Config saved, plugin enabled |
| 15 | Export | Run CSV Export on Products | CSV downloads with BOM, correct columns |
| 16 | GST | Calculate GST on ₹10,000 at 18% | CGST ₹900 + SGST ₹900 = Total ₹11,800 |
| 17 | i18n | Toggle to Hindi | Sidebar labels change to Devanagari |
| 18 | Search | Ctrl+K search for "Products" | Products table and page appear in results |
| 19 | Tenant | Create tenant user, login as staff | Staff sees runtime ERP with correct pages |
| 20 | Onboarding | Choose slug "acme-traders" | Workspace created with slug, redirect to workspace |

---

## 25. Conclusion

ERP Builder successfully demonstrates that a **modular, no-code ERP construction platform** is feasible as a web application. By separating the **builder interface** (where business owners configure) from the **runtime interface** (where staff operate), we achieve a clean architecture that can scale to support multiple module packs, plugins, and customizations.

The key technical contributions are:
1. **Dynamic Schema Engine** — JSON-column storage with field-ID-keyed records for rename-safe data persistence
2. **Pack System with Provenance Tracking** — Additive update mechanism that never loses user data
3. **Schema Resolver** — Real-time merger of canonical pack definitions with user override deltas
4. **Block Composition Engine** — Type-safe, extensible page builder with 10 block types
5. **Dual Authentication** — Separate builder and tenant auth flows with independent JWT strategies

The platform is designed with **Indian SME context** at its core — GST tax slabs, INR formatting, Indian state dropdowns, +91 phone validation, and Hindi language support make it immediately relevant to its target audience.

---

## 26. References

1. Next.js Documentation — https://nextjs.org/docs
2. Prisma ORM Documentation — https://www.prisma.io/docs
3. PostgreSQL JSONB — https://www.postgresql.org/docs/current/datatype-json.html
4. Neon Serverless — https://neon.tech/docs
5. NextAuth.js — https://next-auth.js.org
6. dnd-kit — https://dndkit.com
7. Zustand — https://zustand-demo.pmnd.rs
8. Recharts — https://recharts.org
9. shadcn/ui — https://ui.shadcn.com
10. Fuse.js — https://fusejs.io
11. Lucide Icons — https://lucide.dev
12. Framer Motion — https://www.framer.com/motion
13. GST Council of India — https://gstcouncil.gov.in
14. MSME Annual Report — https://msme.gov.in
15. Tailwind CSS — https://tailwindcss.com

---

*End of Project Report. All 4 parts together form the complete comprehensive documentation.*
*Files: PROJECT_REPORT_PART1.md → PART2.md → PART3.md → PART4.md*
