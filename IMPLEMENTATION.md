# ERP Builder Platform — Implementation Spec for Antigravity

> Feed this file + the `screens/` folder to Antigravity as context.

---

## What We Are Building

A **no-code ERP builder platform** where Indian SMEs assemble their own ERP by installing module packs (Inventory, CRM, Attendance, etc.) and plugins (WhatsApp notifications, Razorpay payments, GST invoicing). Think **WooCommerce for ERP** — users don't code, they configure.

**This is the BUILDER, not the built ERP.** Every screen is a configuration/setup interface.

---

## Tech Stack

```
Framework:    Next.js 14 (App Router, TypeScript)
Database:     PostgreSQL (Neon — serverless)
ORM:          Prisma
Styling:      Tailwind CSS + shadcn/ui
Icons:        Lucide React
State:        Zustand (client-side block tree)
Drag & Drop:  @dnd-kit/core + @dnd-kit/sortable
Auth:         NextAuth.js (credentials provider, email + password)
Charts:       Recharts (for chart blocks)
Deploy:       Vercel
```

---

## Design System

- **Font:** Inter (all weights)
- **Primary color:** `#005bbf` (blue)
- **Background:** `#f8f9fa` (warm off-white)
- **Cards:** `#ffffff` on `#f1f4f6` backgrounds (tonal separation, no hard borders)
- **Text:** `#2b3437` (never pure black)
- **Border style:** Ghost borders only — `outline_variant` at 15% opacity
- **No emojis anywhere.** Use Lucide line icons.
- **Indian context:** Use INR, Indian names, GST references in sample data

Reference screenshots in `screens/` folder:
- `01-module-marketplace.png` — Module pack cards grid
- `02-schema-designer.png` — Split-view field editor + live table preview
- `03-page-composer.png` — Block palette + canvas + properties panel
- `04-plugin-marketplace.png` — Plugin cards (WhatsApp, Attendance, GST, etc.)
- `05-attendance-module-builder.png` — Module configuration wizard with live preview

---

## Database Schema (Prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String
  workspace Workspace?
  createdAt DateTime @default(now())
}

model Workspace {
  id        String   @id @default(cuid())
  name      String
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id])
  tables    Table[]
  pages     Page[]
  installedPacks InstalledPack[]
  installedPlugins InstalledPlugin[]
  createdAt DateTime @default(now())
}

model Table {
  id          String   @id @default(cuid())
  name        String
  icon        String?  // Lucide icon name
  workspaceId String
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  fields      Field[]
  records     Record[]
  packSource  String?  // which pack created this table (null = user-created)
  createdAt   DateTime @default(now())
}

model Field {
  id        String   @id @default(cuid())
  name      String
  type      FieldType
  config    Json     @default("{}") // options for select, linked table for relation, etc.
  required  Boolean  @default(false)
  order     Int
  tableId   String
  table     Table    @relation(fields: [tableId], references: [id], onDelete: Cascade)
}

enum FieldType {
  TEXT
  NUMBER
  DATE
  SINGLE_SELECT
  MULTI_SELECT
  CHECKBOX
  RELATION
  TIME
  EMAIL
  PHONE
  CURRENCY
}

model Record {
  id        String   @id @default(cuid())
  data      Json     // { "fieldId1": "value1", "fieldId2": 42, ... }
  tableId   String
  table     Table    @relation(fields: [tableId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Page {
  id          String   @id @default(cuid())
  title       String
  icon        String?
  blocks      Json     // block tree: [{ type, config, children }]
  workspaceId String
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  packSource  String?
  order       Int      @default(0)
  createdAt   DateTime @default(now())
}

model InstalledPack {
  id          String   @id @default(cuid())
  packId      String   // references the pack registry key
  workspaceId String
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  installedAt DateTime @default(now())
  @@unique([packId, workspaceId])
}

model InstalledPlugin {
  id          String   @id @default(cuid())
  pluginId    String
  config      Json     @default("{}")
  enabled     Boolean  @default(true)
  workspaceId String
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  installedAt DateTime @default(now())
  @@unique([pluginId, workspaceId])
}
```

---

## App Structure

```
src/
  app/
    layout.tsx                  # Root layout with Inter font
    page.tsx                    # Landing / redirect to workspace
    (auth)/
      login/page.tsx
      register/page.tsx
    (dashboard)/
      layout.tsx                # Sidebar + topbar shell
      workspace/
        page.tsx                # Workspace home — installed modules, quick actions
      modules/
        page.tsx                # Module Marketplace (see 01-module-marketplace.png)
        [packId]/
          configure/page.tsx    # Module config wizard (see 05-attendance-module-builder.png)
      plugins/
        page.tsx                # Plugin Marketplace (see 04-plugin-marketplace.png)
      schema/
        [tableId]/page.tsx      # Schema Designer split-view (see 02-schema-designer.png)
      pages/
        [pageId]/
          edit/page.tsx         # Page Composer (see 03-page-composer.png)
          preview/page.tsx      # Full preview mode
    api/
      auth/[...nextauth]/route.ts
      tables/route.ts           # GET (list), POST (create)
      tables/[id]/route.ts      # GET, PATCH, DELETE
      tables/[id]/fields/route.ts
      tables/[id]/records/route.ts
      tables/[id]/records/[recordId]/route.ts
      pages/route.ts
      pages/[id]/route.ts
      packs/route.ts            # GET available packs
      packs/install/route.ts    # POST install a pack
      plugins/route.ts          # GET available plugins
      plugins/install/route.ts  # POST install a plugin
  components/
    layout/
      Sidebar.tsx
      Topbar.tsx
      Breadcrumbs.tsx
    blocks/
      BlockRenderer.tsx         # Renders any block by type
      TableViewBlock.tsx
      KanbanViewBlock.tsx
      FormBlock.tsx
      TextBlock.tsx
      FilterBarBlock.tsx
      ChartBlock.tsx
    composer/
      BlockPalette.tsx          # Draggable block list
      Canvas.tsx                # Drop zone + block tree
      PropertiesPanel.tsx       # Config for selected block
    schema/
      FieldList.tsx             # Left panel field editor
      FieldEditor.tsx           # Single field row
      LivePreview.tsx           # Right panel table preview
    marketplace/
      PackCard.tsx
      PluginCard.tsx
      InstallButton.tsx
    ui/                         # shadcn/ui components
  lib/
    db.ts                       # Prisma client singleton
    auth.ts                     # NextAuth config
    packs/                      # Module pack definitions
      registry.ts               # Pack registry
      inventory.ts              # Inventory pack definition
      crm.ts                    # CRM pack definition
      attendance.ts             # Attendance pack definition
    plugins/                    # Plugin definitions
      registry.ts
      whatsapp.ts
      gst-invoice.ts
      razorpay.ts
      email-campaigns.ts
      leave-management.ts
    store/
      block-store.ts            # Zustand store for page composer
      schema-store.ts           # Zustand store for schema editor
  types/
    pack.ts                     # PackDefinition type
    plugin.ts                   # PluginDefinition type
    block.ts                    # Block, BlockType, BlockConfig types
```

---

## Module Pack Format

Each module pack is a TypeScript file exporting a `PackDefinition`:

```typescript
// lib/packs/inventory.ts
import { PackDefinition } from "@/types/pack";

export const inventoryPack: PackDefinition = {
  id: "inventory",
  name: "Inventory Management",
  description: "Track stock across godowns, manage suppliers, and monitor stock movements.",
  icon: "package",           // Lucide icon name
  category: "Operations",
  badge: "Free",
  fields: 24,
  pages: 6,
  tables: [
    {
      name: "Products",
      icon: "box",
      fields: [
        { name: "Product Name", type: "TEXT", required: true },
        { name: "SKU", type: "TEXT", required: true },
        { name: "Category", type: "SINGLE_SELECT", config: { options: ["Raw Materials", "Finished Goods", "Packaging"] } },
        { name: "Price (INR)", type: "CURRENCY", config: { currency: "INR" } },
        { name: "Stock Qty", type: "NUMBER" },
        { name: "Supplier", type: "RELATION", config: { linkedTable: "Suppliers" } },
        { name: "Reorder Level", type: "NUMBER" },
      ],
      seedData: [
        { "Product Name": "Basmati Rice 5kg", "SKU": "BR-005", "Category": "Finished Goods", "Price (INR)": 450, "Stock Qty": 120 },
        { "Product Name": "Cardboard Box 12x12", "SKU": "CB-012", "Category": "Packaging", "Price (INR)": 25, "Stock Qty": 500 },
        // ... more rows
      ]
    },
    {
      name: "Suppliers",
      icon: "truck",
      fields: [
        { name: "Supplier Name", type: "TEXT", required: true },
        { name: "Contact Person", type: "TEXT" },
        { name: "Phone", type: "PHONE" },
        { name: "Email", type: "EMAIL" },
        { name: "City", type: "TEXT" },
        { name: "GST Number", type: "TEXT" },
      ]
    },
    {
      name: "Stock Movements",
      icon: "arrow-left-right",
      fields: [
        { name: "Product", type: "RELATION", config: { linkedTable: "Products" } },
        { name: "Type", type: "SINGLE_SELECT", config: { options: ["Inward", "Outward", "Transfer", "Adjustment"] } },
        { name: "Quantity", type: "NUMBER", required: true },
        { name: "Date", type: "DATE" },
        { name: "Godown", type: "SINGLE_SELECT", config: { options: ["Main Warehouse", "Godown A", "Godown B"] } },
        { name: "Notes", type: "TEXT" },
      ]
    }
  ],
  pages: [
    {
      title: "Products Overview",
      icon: "layout-dashboard",
      blocks: [
        { type: "TEXT", config: { content: "Products Overview", level: "h1" } },
        { type: "FILTER_BAR", config: { tableRef: "Products" } },
        { type: "TABLE_VIEW", config: { tableRef: "Products", visibleFields: ["Product Name", "SKU", "Category", "Price (INR)", "Stock Qty"] } },
      ]
    },
    {
      title: "Stock Pipeline",
      icon: "kanban",
      blocks: [
        { type: "TEXT", config: { content: "Stock Movement Pipeline", level: "h1" } },
        { type: "KANBAN_VIEW", config: { tableRef: "Stock Movements", groupByField: "Type" } },
      ]
    }
  ]
};
```

---

## Plugin Format

```typescript
// lib/plugins/whatsapp.ts
import { PluginDefinition } from "@/types/plugin";

export const whatsappPlugin: PluginDefinition = {
  id: "whatsapp-notifications",
  name: "WhatsApp Notifications",
  description: "Send order confirmations, payment reminders, and stock alerts to customers via WhatsApp.",
  icon: "message-circle",
  category: "Communication",
  badge: "Pro",
  installs: 1200,
  configFields: [
    { name: "API Key", type: "TEXT", placeholder: "Enter WhatsApp Business API key" },
    { name: "Default Country Code", type: "TEXT", defaultValue: "+91" },
    { name: "Send Order Confirmation", type: "CHECKBOX", defaultValue: true },
    { name: "Send Payment Reminder", type: "CHECKBOX", defaultValue: true },
    { name: "Send Stock Alert", type: "CHECKBOX", defaultValue: false },
  ],
  triggers: [
    { event: "record.created", table: "Orders", action: "Send order confirmation" },
    { event: "record.updated", table: "Invoices", condition: "status = overdue", action: "Send payment reminder" },
  ]
};
```

---

## Key Pages to Build (with screen references)

### 1. Module Marketplace (`/modules`)
**Reference:** `screens/01-module-marketplace.png`
- Grid of `PackCard` components
- Search bar + category filter tabs (All, Operations, Sales, Finance, HR)
- Each card: icon, name, description, field/page count, "Free"/"Pro" badge, "Install" button
- Install button opens confirmation dialog, then runs pack install

### 2. Plugin Marketplace (`/plugins`)
**Reference:** `screens/04-plugin-marketplace.png`
- Same layout as module marketplace but for plugins
- Cards show: WhatsApp, Attendance, GST Invoice, Email, Leave Management, Razorpay
- Install count shown on each card
- Plugin config modal after install (API keys, toggles)

### 3. Schema Designer (`/schema/[tableId]`)
**Reference:** `screens/02-schema-designer.png`
- Split-screen: left = field editor, right = live table preview
- Left panel: list of fields, each with name input, type dropdown, config gear
- "+" button to add new field
- Right panel: table with sample data, updates live as fields change
- Breadcrumb: Modules > [Table Name] > Schema

### 4. Page Composer (`/pages/[pageId]/edit`)
**Reference:** `screens/03-page-composer.png`
- Three-panel layout: left (block palette), center (canvas), right (properties)
- Block palette: draggable items — Table View, Kanban, Form, Text, Filter Bar, Chart
- Canvas: drop zone, renders placed blocks with drag handles + delete button
- Properties panel: shows config for selected block (data source, columns, sort)
- "Preview" toggle button in top bar

### 5. Module Configuration Wizard (`/modules/[packId]/configure`)
**Reference:** `screens/05-attendance-module-builder.png`
- Split-screen: left = step wizard, right = live preview
- Step 1: Configure Fields (checkboxes to include/exclude fields)
- Step 2: Set Rules (working hours, thresholds)
- Step 3: Choose Views (table, kanban, calendar)
- Progress indicator in top bar
- Live preview shows sample data with Indian names

---

## Starting Order for Implementation

**Phase 1 — Scaffold (Day 1-2)**
1. `npx create-next-app@latest erp-builder --typescript --tailwind --app --src-dir`
2. Install: `prisma @prisma/client next-auth zustand @dnd-kit/core @dnd-kit/sortable lucide-react recharts`
3. Init shadcn/ui: `npx shadcn-ui@latest init`
4. Add shadcn components: button, card, input, select, dialog, dropdown-menu, badge, tabs, separator, toast
5. Set up Prisma schema (copy from above), run `npx prisma db push`
6. Build layout shell: Sidebar + Topbar + content area

**Phase 2 — Module & Plugin Marketplace (Day 3-5)**
1. Write pack definitions (inventory, crm, attendance)
2. Write plugin definitions (whatsapp, gst, razorpay, etc.)
3. Build PackCard and PluginCard components
4. Build marketplace pages with search + filters
5. Build install API endpoint + install flow UI

**Phase 3 — Schema Designer (Day 6-8)**
1. Build Field CRUD API
2. Build Record CRUD API with JSONB storage
3. Build split-screen schema designer page
4. Wire left panel field edits to right panel live preview

**Phase 4 — Page Composer (Day 9-12)**
1. Build block type definitions and BlockRenderer
2. Build individual block components (TableView, Kanban, etc.)
3. Build drag-drop canvas with dnd-kit
4. Build properties panel
5. Wire blocks to real data from tables

**Phase 5 — Polish & Demo (Day 13-15)**
1. Module config wizard with steps
2. Cross-module relations
3. Filters, sort, search
4. Error handling, loading states, empty states
5. Seed demo data ("Acme Traders Pvt Ltd")
6. Deploy to Vercel

---

## Sample Data Theme

All sample data uses Indian SME context:
- **Company:** Acme Traders Pvt Ltd (Delhi-based distributor)
- **Currency:** INR (use Rs. or the rupee symbol)
- **Employee names:** Priya Sharma, Amit Patel, Deepika Nair, Rahul Verma, Anjali Gupta
- **Products:** Basmati Rice, Toor Dal, Cardamom, Turmeric Powder
- **Suppliers:** Krishna Traders (Mumbai), Patel Exports (Ahmedabad), Sharma & Sons (Jaipur)
- **Godowns:** Main Warehouse (Delhi), Godown A (Gurgaon), Godown B (Noida)
- **GST references:** GSTIN format 22AAAAA0000A1Z5
