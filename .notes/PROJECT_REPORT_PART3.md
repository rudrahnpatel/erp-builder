# ERP Builder Platform — Project Report Part 3

## Module System, Plugin Architecture & Block Composition Engine

---

## 12. Module Pack System — Core Architecture

### 12.1 What is a Pack?

A **Pack** (Module) is a self-contained ERP module defined as a TypeScript `PackDefinition` object in `src/lib/packs/registry.ts`. It contains:

- **Metadata** — id, name, description, icon, category, badge (Free/Pro), version
- **Table definitions** — Schema for each table (fields, types, config, seed data)
- **Page definitions** — Pre-composed pages with block arrays

```typescript
// src/types/pack.ts
interface PackDefinition {
  id: string;                        // "inventory"
  name: string;                      // "Inventory"
  description: string;
  icon: string;                      // Lucide icon name
  category: string;                  // "Operations"
  badge: "Free" | "Pro";
  version: string;                   // "1.2.0" — bumped on schema changes
  tables: PackTableDefinition[];     // Table schemas
  pageDefinitions: PackPageDefinition[];  // Pre-built pages
}

interface PackTableDefinition {
  name: string;                      // "Products"
  icon: string;                      // "box"
  fields: PackFieldDefinition[];     // Column definitions
  seedData?: Record<string, unknown>[];  // Sample rows
}

interface PackFieldDefinition {
  name: string;                      // "Product Name"
  type: string;                      // "TEXT", "CURRENCY", "RELATION"
  required?: boolean;
  config?: Record<string, unknown>;  // { linkedTable: "Suppliers" }
}
```

### 12.2 Pack Registry — Dual Source (Code + DB)

Packs come from **two sources**, merged at runtime:

1. **Built-in packs** — TypeScript objects in `registry.ts` (source of truth)
2. **DB-authored modules** — `ModuleDefinition` rows created by developers via GUI

```typescript
// src/lib/packs/index.ts
export async function getPackByIdAsync(packId: string) {
  // 1. Check DB-authored modules first (published only)
  const dbModule = await db.moduleDefinition.findUnique({ where: { packId } });
  if (dbModule?.published) return moduleRowToPack(dbModule);
  
  // 2. Fallback to built-in registry
  return packRegistry[packId];
}
```

### 12.3 Currently Shipped Packs

| Pack | ID | Category | Tables | Version |
|---|---|---|---|---|
| **Inventory** | `inventory` | Operations | Stock, Suppliers, Customers, Products | v1.2.0 |
| **Finance** | `finance` | Finance | Invoices, Expenses | v1.0.0 |
| **HR & Payroll** | `hr-payroll` | HR & Payroll | Departments, Employees, Leave Types, Leave Requests, Attendance, Salary Slips | v1.0.0 |

### 12.4 Pack Install Flow (How It Works)

**Step-by-step process when a user clicks "Install":**

```
1. Builder clicks "Install" on Inventory pack
2. Frontend: POST /api/packs/install { packId: "inventory" }
3. Backend reads PackDefinition from registry
4. BEGIN DATABASE TRANSACTION
5. For each table in pack (order matters — dependencies first):
   a. Create Table row with packSource="inventory", packTableKey="Products"
   b. For each field in table:
      - If type=RELATION: resolve linkedTable name → real DB tableId
      - Create Field row with packFieldKey for provenance
   c. For each seedData row:
      - Map field names → field IDs
      - Create Record row with data={fieldId: value}
6. For each pageDefinition in pack:
   a. Resolve tableRef names → real DB tableIds in block configs
   b. Create Page row with packSource + packPageKey
7. Create InstalledPack row { packId, packVersion }
8. COMMIT TRANSACTION
9. Return created tables + pages to frontend
10. Frontend shows success toast
```

**Critical rule:** RELATION fields can only resolve to tables defined **earlier** in the tables array. During fresh install, tables are created sequentially — so Suppliers must come before Products (which links to Suppliers).

### 12.5 Pack Update Flow (Additive Sync)

When the registry version is bumped (e.g., 1.1.0 → 1.2.0):

```
1. Backend compares installed version vs registry version
2. Finds existing tables by packTableKey
3. ADD missing tables + seed data (never delete existing)
4. ADD missing fields on existing tables (by packFieldKey, never delete/rename)
5. ADD missing pages (by packPageKey)
6. Stamp InstalledPack.packVersion = new version
7. Return summary of what was added
```

**Key principle:** Updates are **strictly additive** — no data loss, no field deletion, no renaming.

### 12.6 Pack Uninstall Flow

```
POST /api/packs/uninstall { packId }
→ DELETE InstalledPack (CASCADE removes all Tables → Fields → Records → Pages)
```

---

## 13. Schema Resolver — Merging Canonical + User Overrides

The **Schema Resolver** (`src/lib/schema-resolver.ts`) is the engine that merges a canonical `PackDefinition` with user customizations stored in `WorkspaceSchemaOverride` rows.

### 13.1 How It Works

```
                    PackDefinition (registry.ts)
                    ┌──────────────────────────┐
                    │ Table: Products           │
                    │   Field: Product Name     │
                    │   Field: Category         │
                    │   Field: Rate             │
                    └────────────┬─────────────┘
                                │
                    ┌───────────┴───────────┐
                    │   Schema Resolver     │
                    │   resolvePackSchema() │
                    └───────────┬───────────┘
                                │
              WorkspaceSchemaOverride rows
              ┌─────────────────────────────┐
              │ ADD_FIELD: "Expiry Date"     │
              │ HIDE_FIELD: "Products.Rate"  │
              │ RENAME_TABLE: "Items"        │
              └───────────────┬─────────────┘
                              │
                    ┌─────────┴──────────┐
                    │ Resolved Schema    │
                    │ Table: Items       │ ← renamed
                    │   Field: Product Name  │
                    │   Field: Category      │
                    │   Field: Rate (hidden) │ ← hidden
                    │   Field: Expiry Date   │ ← added
                    └────────────────────┘
```

### 13.2 Override Processing Order

```typescript
for (const override of allOverrides) {
  switch (override.overrideType) {
    case RENAME_TABLE:         // Change display name
    case ADD_FIELD:            // Add user-created field
    case HIDE_FIELD:           // Hide without deleting
    case RENAME_FIELD:         // Change field display name
    case CHANGE_FIELD_OPTIONS: // Modify SELECT options
    case ADD_TABLE:            // Add entirely new table
  }
}
```

---

## 14. Plugin Architecture

### 14.1 What is a Plugin?

A **Plugin** extends functionality beyond schema and pages. Unlike packs (which add tables/pages), plugins add **behavior** — notifications, calculations, integrations.

```typescript
// src/types/plugin.ts
interface PluginDefinition {
  id: string;                    // "whatsapp-notifications"
  name: string;                  // "WhatsApp Notifications"
  description: string;
  icon: string;                  // Lucide icon name
  category: string;              // "Communication"
  badge: "Free" | "Pro";
  installs: number;              // Social proof counter
  configFields: PluginConfigField[];  // User-configurable settings
  triggers: PluginTrigger[];     // When plugin fires
}

interface PluginConfigField {
  name: string;                  // "API Key"
  type: "TEXT" | "CHECKBOX" | "SELECT";
  placeholder?: string;
  defaultValue?: string | boolean;
  options?: string[];            // For SELECT type
}

interface PluginTrigger {
  event: string;                 // "record.created", "manual", "schedule.daily"
  table: string;                 // "Invoices"
  condition?: string;            // "status = overdue"
  action: string;                // "Send payment reminder"
}
```

### 14.2 Currently Registered Plugins

| Plugin | ID | Category | Badge | Triggers |
|---|---|---|---|---|
| WhatsApp Notifications | `whatsapp-notifications` | Communication | Pro | record.created → Orders, record.updated → Invoices |
| Employee Attendance | `employee-attendance` | HR | Free | — |
| GST Invoice Generator | `gst-invoice` | Finance | Pro | record.created → Invoices |
| Email Campaigns | `email-campaigns` | Communication | Free | — |
| Leave Management | `leave-management` | HR | Free | — |
| Payment Gateway (Razorpay) | `razorpay-payments` | Finance | Pro | payment.captured → Invoices |

### 14.3 Plugin Lifecycle

```
INSTALL  → InstalledPlugin.create { pluginId, config: {}, enabled: true }
CONFIGURE → InstalledPlugin.update { config: { apiKey: "...", ... } }
TOGGLE   → InstalledPlugin.update { enabled: true/false }
UNINSTALL → InstalledPlugin.delete
```

### 14.4 Plugin-Pack Connection

Plugins derive a "Connected to" tag from their `triggers[].table`. If the referenced table exists in the workspace, it shows a clickable chip. If not, it shows an amber "Install [Pack]" CTA.

---

## 15. Block Composition Engine

### 15.1 What is a Block?

A **Block** is the atomic unit of UI composition. Pages are JSON arrays of blocks stored in `Page.blocks`. The Page Composer lets builders visually assemble pages; the Tenant Runtime renders them.

```typescript
// src/types/block.ts
type BlockType =
  | "TABLE_VIEW"     | "KANBAN_VIEW"    | "FORM"
  | "TEXT"           | "FILTER_BAR"     | "CHART"
  | "METRIC"         | "EXPORT_BUTTON"  | "IMAGE"
  | "GST_CALCULATOR";

interface Block {
  id: string;
  type: BlockType;
  config: BlockConfig;
  children?: Block[];
}
```

### 15.2 Block Types — Full Reference

| Block Type | Component File | What It Renders | Key Config |
|---|---|---|---|
| `TEXT` | — (inline) | Page heading + description | `content`, `level` (h1/h2/h3/p), `description` |
| `METRIC` | `MetricCard.tsx` | KPI card — static value or live record count | `metricLabel`, `metricValue`, `metricTrend`, `metricAccent`, `tableRef` |
| `TABLE_VIEW` | `TableView.tsx` | Full data grid (sortable, editable inline) | `tableRef`/`tableId`, `visibleFields`, `sortField`, `sortDirection` |
| `KANBAN_VIEW` | `KanbanView.tsx` | Drag-and-drop kanban board | `tableRef`, `groupByField` |
| `FILTER_BAR` | `FilterBarView.tsx` | Search input + optional date range | `tableRef`, `includeDateRange`, `dateField` |
| `FORM` | `FormView.tsx` | Add-record form auto-generated from schema | `tableRef` |
| `EXPORT_BUTTON` | `ExportButton.tsx` | CSV download (BOM-prefixed for Excel) | `tableRef`, `visibleFields`, `exportLabel` |
| `IMAGE` | `ImageBlock.tsx` | Logo / banner with alignment | `imageUrl`, `imageAlt`, `imageWidth`, `imageAlign` |
| `GST_CALCULATOR` | `GstCalculator.tsx` | CGST+SGST or IGST calculation | `gstDefaultAmount`, `gstDefaultRate`, `gstSplit` |
| `CHART` | `ChartView.tsx` | Bar/line/pie chart | `tableRef`, `chartType` |

### 15.3 Page Composer — Three-Panel Layout

```
┌──────────┬────────────────────────┬──────────────┐
│  Block   │                       │  Properties  │
│  Palette │       Canvas          │  Panel       │
│          │                       │              │
│ TABLE_V  │  ┌─────────────────┐  │  Table: ...  │
│ KANBAN   │  │ TEXT: Dashboard  │  │  Fields: ... │
│ FORM     │  └─────────────────┘  │  Sort: ...   │
│ TEXT     │  ┌────────┬────────┐  │  Width: ...  │
│ FILTER   │  │METRIC  │METRIC  │  │              │
│ CHART    │  │Revenue │Orders  │  │              │
│ METRIC   │  └────────┴────────┘  │              │
│ EXPORT   │  ┌─────────────────┐  │              │
│ IMAGE    │  │ TABLE_VIEW      │  │              │
│ GST_CALC │  │ (Products)      │  │              │
│          │  └─────────────────┘  │              │
└──────────┴────────────────────────┴──────────────┘
```

- **Block Palette** (left) — Draggable block list, click or drag to add
- **Canvas** (center) — Drop zone, flex-wrap grid, blocks sit side-by-side based on `widthPct`
- **Properties Panel** (right) — Config for selected block (data source, columns, sort, width)
- Panels are **independently collapsible** via topbar toggles

### 15.4 Block Data Flow (Builder → Runtime)

```
Builder: Compose page → Save blocks JSON → POST /api/pages/:id
                                              │
                                    Page.blocks stored in DB
                                              │
Tenant: Open page → GET /api/pages/:id → Parse blocks JSON
                                              │
                                    BlockRenderer resolves each block
                                              │
                        ┌─────────────────────┼───────────────────┐
                        │                     │                   │
                   TABLE_VIEW            METRIC              KANBAN
                   GET records       count records      GET records
                   from tableId      from tableId     group by field
```

---

## 16. Authentication System

### 16.1 Dual Auth Architecture

The app runs **two independent auth systems** in parallel:

| Aspect | Builder Auth | Tenant Auth |
|---|---|---|
| **Library** | NextAuth.js v4 | Custom JWT |
| **Providers** | Credentials + Google SSO | Username + Password |
| **Cookie** | `next-auth.session-token` | `tenant-token` |
| **JWT Payload** | `{ id, email, workspaceId }` | `{ userId, workspaceId, role }` |
| **Login Route** | `/login` | `/apps/[slug]/login` |
| **Password Hash** | bcrypt | bcrypt |

### 16.2 Builder Auth Flow

```
1. User visits /login
2. Enters email + password (or clicks "Continue with Google")
3. POST /api/auth/callback/credentials → bcrypt.compare()
4. If valid: NextAuth writes JWT as httpOnly cookie
5. Redirect to /workspace
6. Google SSO: auto-creates User row on first login
```

### 16.3 Tenant Auth Flow

```
1. Staff visits /apps/acme-traders/login
2. Enters username + password
3. POST /api/tenant/login → lookup TenantUser by workspaceId + username
4. bcrypt.compare() → if valid, sign JWT with NEXTAUTH_SECRET
5. Set 'tenant-token' httpOnly cookie
6. Redirect to /apps/acme-traders
```

---

*End of Part 3. Continued in Part 4: Frontend Components, Data Flow & Implementation Details.*
