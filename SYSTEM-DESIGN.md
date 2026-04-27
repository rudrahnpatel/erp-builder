# ERP Builder — System Design

> All diagrams are in Mermaid format — GitHub renders them automatically.
> Use [mermaid.live](https://mermaid.live) to open any individual block interactively.

---

## 1. ER Diagram (Database Schema)

Every workspace gets its own isolated copy of tables, records, pages, and pack installs. The only shared data is the `PackDefinition` which lives in code (`registry.ts`), not the DB.

```mermaid
erDiagram
    User {
        string id PK
        string email UK
        string password
        string name
        datetime createdAt
    }
    Workspace {
        string id PK
        string name
        string slug UK
        string userId FK
        datetime createdAt
    }
    Table {
        string id PK
        string name
        string icon
        string workspaceId FK
        string packSource
        string packTableKey
        boolean isCustom
        datetime createdAt
    }
    Field {
        string id PK
        string name
        enum type
        json config
        boolean required
        int order
        string tableId FK
        string packFieldKey
        boolean isCustom
        boolean isHidden
    }
    Record {
        string id PK
        json data
        string tableId FK
        datetime createdAt
        datetime updatedAt
    }
    Page {
        string id PK
        string title
        json blocks
        string workspaceId FK
        string packSource
        string packPageKey
        int order
        datetime createdAt
    }
    InstalledPack {
        string id PK
        string packId
        string packVersion
        string workspaceId FK
        datetime installedAt
    }
    WorkspaceSchemaOverride {
        string id PK
        string installedPackId FK
        enum overrideType
        string targetKey
        json payload
        datetime createdAt
    }
    InstalledPlugin {
        string id PK
        string pluginId
        json config
        boolean enabled
        string workspaceId FK
        datetime installedAt
    }
    TenantUser {
        string id PK
        string workspaceId FK
        string username
        string password
        string role
        datetime createdAt
    }

    User          ||--o|  Workspace              : "owns (1-to-1)"
    Workspace     ||--o{  Table                  : "has"
    Workspace     ||--o{  Page                   : "has"
    Workspace     ||--o{  InstalledPack           : "has"
    Workspace     ||--o{  InstalledPlugin         : "has"
    Workspace     ||--o{  TenantUser              : "has"
    Table         ||--o{  Field                  : "has"
    Table         ||--o{  Record                 : "stores"
    InstalledPack ||--o{  WorkspaceSchemaOverride : "tracks deltas"
```

**Key design decisions:**
- `packSource` + `packTableKey` / `packFieldKey` — provenance tags so the update engine can find canonical fields even after the user renames them.
- `Record.data` is a flat JSON blob keyed by **field IDs** (not names), so renames never corrupt data.
- `WorkspaceSchemaOverride` stores only the user's *delta* on top of the canonical pack — never duplicates the full schema.

---

## 2. High-Level System Architecture

Two distinct user types hit the same Next.js app but through completely different route groups.

```mermaid
flowchart TD
    subgraph Users["👥 Users"]
        BUILDER["🏗️ Builder\n(Business Owner)\nCreates the ERP"]
        TENANT["👷 Tenant User\n(Staff)\nUses the ERP"]
    end

    subgraph NextJS["⚛️ Next.js 16 — App Router"]
        subgraph BuilderUI["Builder Routes  /(dashboard)"]
            WS["/workspace — Dashboard"]
            MOD["/modules — Marketplace"]
            PG["/pages — Page Composer"]
            SCH["/schema — Table Designer"]
            PLG["/plugins — Plugins"]
        end

        subgraph TenantUI["Tenant Runtime  /apps/[slug]"]
            HOME["/apps/[slug] — ERP Home"]
            TBL["/apps/[slug]/[tableId] — Table"]
            CPAG["/apps/[slug]/pages/[pageId] — Custom Page"]
            SETT["/apps/[slug]/settings — Settings"]
        end

        subgraph APIRoutes["🔌 API Routes"]
            AAUTH["/api/auth — NextAuth"]
            ATAUTH["/api/tenant/login|logout"]
            AWORK["/api/workspace"]
            ATBL["/api/tables/:id/records"]
            APAG["/api/pages"]
            APACK["/api/packs — install|update|uninstall"]
            APLG["/api/plugins"]
            ATU["/api/workspace/tenant-users"]
        end
    end

    subgraph Data["🗄️ Data"]
        PRISMA["Prisma ORM"]
        NEON["PostgreSQL\n(Neon Serverless)"]
        REGISTRY["Pack Registry\nregistry.ts — in-code\nNOT in DB"]
    end

    BUILDER --> BuilderUI
    TENANT  --> TenantUI
    BuilderUI --> APIRoutes
    TenantUI  --> APIRoutes
    APIRoutes --> PRISMA
    PRISMA    --> NEON
    APACK     -.->|reads| REGISTRY
```

---

## 3. Authentication Flow

The app runs **two independent auth systems** in parallel — one for builders, one for their staff.

```mermaid
flowchart TD
    subgraph BuilderAuth["🔐 Builder Auth — NextAuth JWT"]
        B1["Visit /login"] --> B2{"Provider?"}
        B2 -->|Email + Password| B3["POST /api/auth/callback/credentials\nbcrypt.compare()"]
        B2 -->|Google SSO| B4["OAuth Redirect\nGOOGLE_CLIENT_ID required"]
        B3 --> B5{"Password valid?"}
        B5 -->|No| B6["401 — back to /login"]
        B5 -->|Yes| B7["NextAuth writes JWT\nhttpOnly cookie\nPayload: id, email, workspaceId"]
        B4 --> B8["Auto-create workspace\nif first Google login"]
        B8 --> B7
        B7 --> B9["Redirect → /workspace"]
    end

    subgraph TenantAuth["🔐 Tenant Auth — Custom JWT"]
        T1["Visit /apps/slug/login"] --> T2["POST /api/tenant/login\nbody: username + password"]
        T2 --> T3["Lookup TenantUser WHERE\nworkspaceId + username"]
        T3 --> T4{"bcrypt.compare?"}
        T4 -->|No| T5["401 Unauthorized"]
        T4 -->|Yes| T6["sign JWT with NEXTAUTH_SECRET\nSet 'tenant-token' httpOnly cookie\nPayload: userId, workspaceId, role"]
        T6 --> T7["Redirect → /apps/slug"]
    end

    subgraph Logout["🚪 Logout"]
        BL["Builder: signOut()\nClears NextAuth cookie"] 
        TL["Tenant: POST /api/tenant/logout\nClears tenant-token cookie"]
    end
```

---

## 4. Pack (Module) Lifecycle

A **Pack** is a pre-built ERP module (e.g. Inventory). It lives as a `PackDefinition` object in `registry.ts` (code). Installing it *materialises* a copy into the workspace's DB tables.

```mermaid
sequenceDiagram
    actor Builder
    participant UI   as Marketplace UI
    participant API  as /api/packs/install
    participant UPD  as /api/packs/update
    participant REG  as registry.ts (code)
    participant DB   as PostgreSQL

    Note over Builder,DB: ── INSTALL ──

    Builder->>UI: Click "Install Inventory"
    UI->>API: POST { packId: "inventory" }
    API->>REG: getPackById("inventory")
    REG-->>API: PackDefinition v1.2.0

    API->>DB: BEGIN TRANSACTION
    loop For each Table (order matters — deps first)
        API->>DB: Table.create (packSource, packTableKey)
        loop For each Field
            API->>DB: Field.create (resolve RELATION → real tableId)
        end
        loop Seed Rows
            API->>DB: Record.create (data keyed by fieldId)
        end
    end
    loop For each Page
        API->>DB: Page.create (resolve tableRef → tableId in blocks JSON)
    end
    API->>DB: InstalledPack.create { packId, packVersion: "1.2.0" }
    API->>DB: COMMIT
    API-->>UI: { tables:[...], pages:[...] }
    UI-->>Builder: Toast "Inventory installed ✓"

    Note over Builder,DB: ── UPDATE (registry bumped to v1.3.0) ──

    Builder->>UI: "Update to v1.3.0" badge appears
    UI->>UPD: POST { packId: "inventory" }
    UPD->>DB: BEGIN TRANSACTION
    UPD->>DB: Find existing tables by packTableKey
    UPD->>DB: ADD missing tables + seed data
    UPD->>DB: ADD missing fields only (by packFieldKey, never delete/rename)
    UPD->>DB: ADD missing pages (by packPageKey)
    UPD->>DB: InstalledPack.packVersion = "1.3.0"
    UPD->>DB: COMMIT
    UPD-->>UI: { added: { tables:[], fields:["Products→GST Rate"], pages:[] } }
    UI-->>Builder: Toast lists what was added

    Note over Builder,DB: ── UNINSTALL ──

    Builder->>UI: Uninstall
    UI->>API: POST /api/packs/uninstall { packId }
    API->>DB: DELETE InstalledPack (CASCADE → Tables, Fields, Records, Pages)
    API-->>UI: 200 OK
```

---

## 5. Page Composer — Builder to Runtime

The **Page Composer** lets builders visually assemble pages from blocks. The page is stored as a JSON array of blocks in `Page.blocks`. The **ERP Runtime** reads that JSON and renders the actual UI.

```mermaid
flowchart LR
    subgraph Composer["📝 Builder — Page Composer"]
        direction TB
        PAL["Block Palette\n(right panel)"]
        CANVAS["Canvas\nflex-wrap grid\nblocks side-by-side"]
        INSP["Inspector\n— Display Title\n— Block Size\n  drag dots to resize\n  width snaps to ¼ ⅓ ½ ⅔ ¾ 1\n— Block-specific config"]
        SAVE["Publish Page\nPATCH /api/pages/:id\n{ title, blocks: [...] }"]

        PAL -->|drag / click| CANVAS
        CANVAS <-->|select block| INSP
        CANVAS --> SAVE
    end

    subgraph BlockJSON["🧩 Each Block stored as JSON"]
        direction TB
        B1["{ type: 'METRIC',\n  config: {\n    widthPct: 50,\n    heightPx: 200,\n    metricLabel: 'Revenue',\n    tableRef: 'Products',\n    metricAccent: 'emerald' }}"]
        B2["{ type: 'TABLE_VIEW',\n  config: {\n    widthPct: 100,\n    tableRef: 'Products',\n    visibleFields: [...] }}"]
        B3["{ type: 'GST_CALCULATOR',\n  config: {\n    gstDefaultRate: '18%',\n    gstSplit: 'intrastate' }}"]
    end

    subgraph Runtime["🚀 Tenant — ERP Runtime"]
        direction TB
        READ["GET /api/pages/:id\nFetch blocks JSON"]
        RENDER["Render each block\nby type"]
        LAY["flex-wrap container\nblockSizeStyle(widthPct, heightPx)\nblocks sit side-by-side"]

        READ --> RENDER --> LAY
    end

    SAVE -->|stored in DB| READ
    B1 & B2 & B3 -.->|example payloads| RENDER
```

**Supported block types:**

| Type | What it renders |
|---|---|
| `TEXT` | Page heading + description |
| `METRIC` | KPI card — static value or live record count |
| `TABLE_VIEW` | Full data grid (sortable, editable inline) |
| `KANBAN_VIEW` | Drag-and-drop kanban board |
| `FILTER_BAR` | Search input + optional date range |
| `FORM` | Add-record form auto-generated from schema |
| `EXPORT_BUTTON` | CSV download (BOM-prefixed for Excel) |
| `IMAGE` | Logo / banner with alignment |
| `GST_CALCULATOR` | CGST+SGST or IGST calculation |
| `CHART` | Placeholder (data source WIP) |

---

## 6. Record CRUD — Data Flow

Records are the actual business data (rows in a table). The data is a JSON blob keyed by **field IDs** so renames never break anything.

```mermaid
sequenceDiagram
    actor Tenant
    participant UI  as Table View UI
    participant API as /api/tables/:id/records
    participant DB  as PostgreSQL

    Note over Tenant,DB: ── READ ──
    Tenant->>UI: Opens "Products" table
    UI->>API: GET /api/tables/:tableId/records
    API->>DB: SELECT fields + records WHERE tableId
    DB-->>API: fields:[{id,name,type}]\nrecords:[{data:{fieldId:value}}]
    API-->>UI: Normalised rows (fieldId → column)
    UI-->>Tenant: Renders grid

    Note over Tenant,DB: ── CREATE ──
    Tenant->>UI: Click "Add Record"
    UI-->>Tenant: RecordFormModal (fields from schema)
    Tenant->>UI: Fill form → Submit
    UI->>API: POST { data: { fieldId: value, ... } }
    API->>DB: Record.create
    DB-->>API: new Record
    API-->>UI: 201 Created
    UI-->>Tenant: New row appears

    Note over Tenant,DB: ── UPDATE ──
    Tenant->>UI: Edit inline / submit form
    UI->>API: PATCH /records/:recordId { data: { fieldId: newVal } }
    API->>DB: Record.update (merge data JSON)
    DB-->>API: updated Record
    API-->>UI: 200 OK

    Note over Tenant,DB: ── DELETE ──
    Tenant->>UI: Delete row
    UI->>API: DELETE /records/:recordId
    API->>DB: Record.delete
    DB-->>API: 204
    API-->>UI: Row removed
```

---

## 7. Full API Route Map

```mermaid
flowchart LR
    subgraph Auth["Auth"]
        A1["POST /api/auth/register"]
        A2["POST /api/auth/callback/credentials"]
        A3["POST /api/tenant/login"]
        A4["POST /api/tenant/logout"]
    end

    subgraph WorkspaceAPI["Workspace"]
        W1["GET /api/workspace"]
        W2["GET /api/workspace/check-slug"]
        W3["GET|POST /api/workspace/tenant-users"]
        W4["PATCH|DELETE /api/workspace/tenant-users/:id"]
        W5["GET|PATCH /api/workspace/admin"]
    end

    subgraph TableAPI["Tables & Records"]
        T1["GET|POST /api/tables"]
        T2["GET|PATCH|DELETE /api/tables/:id"]
        T3["GET|POST /api/tables/:id/records"]
        T4["PATCH|DELETE /api/tables/:id/records/:recordId"]
        T5["GET|POST /api/tables/:id/fields"]
        T6["POST /api/tables/:id/fields/sync"]
    end

    subgraph PageAPI["Pages"]
        P1["GET|POST /api/pages"]
        P2["GET|PATCH|DELETE /api/pages/:id"]
        P3["PATCH /api/pages/reorder"]
    end

    subgraph PackAPI["Packs (Modules)"]
        PK1["GET /api/packs"]
        PK2["POST /api/packs/install"]
        PK3["POST /api/packs/update"]
        PK4["POST /api/packs/uninstall"]
        PK5["POST /api/packs/reinstall-page"]
    end

    subgraph PluginAPI["Plugins"]
        PL1["GET /api/plugins"]
        PL2["POST /api/plugins/install"]
        PL3["POST /api/plugins/uninstall"]
        PL4["POST /api/plugins/toggle"]
        PL5["GET|PATCH /api/plugins/:id/config"]
    end

    subgraph MiscAPI["Misc"]
        M1["DELETE /api/account"]
        M2["POST /api/onboarding/launch"]
    end
```

---

## Summary — How Everything Connects

```mermaid
flowchart TD
    REG["📦 Pack Registry\nregistry.ts\nSource of truth for\nmodule schemas"] -->|install materialises| DB

    DB[("🗄️ PostgreSQL\nTables · Fields · Records\nPages · Packs · Plugins\nTenantUsers")] 

    DB -->|builder reads/writes via| BUILDER_UI["🏗️ Builder UI\nDesign schemas\nCompose pages\nInstall modules"]
    DB -->|tenant reads/writes via| TENANT_UI["👷 Tenant ERP\nView tables\nAdd records\nUse custom pages"]

    BUILDER_UI -->|publishes Page JSON| TENANT_UI
    BUILDER_UI -->|creates TenantUsers| TENANT_UI

    NEXTAUTH["🔐 NextAuth JWT\nBuilder sessions"] --> BUILDER_UI
    TAUTH["🔐 Custom JWT\nTenant sessions"] --> TENANT_UI
```
