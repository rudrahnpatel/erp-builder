# 🔌 Plugins Implementation Plan — ERP Builder

## Current State Summary

### What Exists
- **12 plugins** defined in `src/lib/plugins/registry.ts` (all definition-only, zero runtime logic)
- **Plugin system infra**: `InstalledPlugin` Prisma model, install/toggle/uninstall APIs, plugins page UI with search/cards
- **Plugin page**: `/plugins` — marketplace-style grid showing all 12 plugins with install/enable/configure buttons
- **Modules (Packs)**: Inventory, Finance, HR, Quotation, Support — each creates tables + pages on install

### What's Missing
- **No plugin actually DOES anything** — install/toggle works but "Configure" is a dead button
- **No plugin configuration UI** — `savedConfig` is stored but never editable by users
- **No plugin execution/runtime** — no plugin-specific pages, no plugin-triggered actions

---

## 🎯 Module vs Plugin Boundary

> [!IMPORTANT]
> **Modules** = data foundations (tables + pages). They CREATE the schema.
> **Plugins** = functional add-ons. They ACT ON existing data. Never create tables.

| Aspect | Module (Pack) | Plugin |
|--------|--------------|--------|
| Creates tables? | ✅ Yes | ❌ Never |
| Creates pages? | ✅ Yes (sidebar pages) | ❌ Not in sidebar — has its own config page at `/plugins/[id]` |
| Has its own data model? | In Pack's tables | Stores config in `InstalledPlugin.config` JSON |
| Dependencies? | None — standalone | May depend on a module's tables (e.g., Razorpay needs Finance → Invoices) |
| Example | Inventory module → Stock, Products, Suppliers tables | PDF Invoice plugin → generates PDF from Finance module's Invoices table |

### Where Some Plugins Belong Better as Module Pages

Some "plugins" in the registry are really **module features** — they don't make sense without a specific module and should be pages INSIDE that module rather than standalone plugins:

| Plugin | Should Be | Reason |
|--------|-----------|--------|
| Employee Attendance | ✅ **Already exists as HR module page** | Has its own `AttendanceRecord` model, `/attendance-log` route, full check-in/out UI |
| Leave Management | 🔁 **HR Module page** | Tightly coupled to HR employees table, makes no sense standalone |
| GST Invoice Generator | 🔁 **Finance Module feature** | Only works on Finance module's Invoices table |
| E-Way Bill Generation | 🔁 **Logistics/Inventory feature** | Only works on Stock Movements table |

### True Standalone Plugins (keep as plugins)

| Plugin | Category | Why It's a Plugin |
|--------|----------|-------------------|
| WhatsApp Notifications | Communication | Cross-module — can send from Orders, Invoices, any table |
| Email Campaigns | Communication | Cross-module — sends bulk emails from any customer list |
| SMS via MSG91 | Communication | Cross-module — transactional SMS from any trigger |
| Payment Gateway (Razorpay) | Finance | External integration — connects to Razorpay API |
| UPI Payment Link | Finance | Utility — generates QR/deeplinks, works with any amount |
| PDF Invoice Generator | Finance | Utility — generates PDFs from Invoices/Quotations |
| Google Sheets Sync | Operations | Cross-module — syncs any table to Sheets |
| Tally Export | Finance | External integration — exports to Tally XML format |

---

## 📊 Plugin Difficulty Matrix

| Plugin | Effort | Real Backend? | Can We Demo It? | Priority |
|--------|--------|--------------|-----------------|----------|
| **UPI Payment Link** | 🟢 Easy (2h) | No (client-only QR gen) | ✅ Live QR code | **P0** |
| **PDF Invoice Generator** | 🟢 Easy (3h) | No (jsPDF client-side) | ✅ Downloads real PDF | **P0** |
| **Tally Export** | 🟡 Medium (3h) | No (XML template in-browser) | ✅ Downloads XML file | **P1** |
| **Email Campaigns** | 🟡 Medium (2h) | Simulated (no real SMTP) | ⚠️ Config UI + simulate send | **P1** |
| **WhatsApp Notifications** | 🟡 Medium (2h) | Simulated (no real API) | ⚠️ Config UI + simulate | **P2** |
| **SMS via MSG91** | 🟡 Medium (2h) | Simulated | ⚠️ Config UI + simulate | **P2** |
| **Google Sheets Sync** | 🔴 Hard (6h+) | Yes (needs OAuth + Sheets API) | ❌ Not without real creds | **P3 — Skip** |
| **Razorpay Payments** | 🔴 Hard (4h+) | Yes (needs Razorpay keys) | ❌ Not without test keys | **P3 — Skip** |

---

## 🏗️ Architecture Plan

### 1. Plugin Configuration Page (`/plugins/[id]`)

Currently missing. Every installed plugin needs a config page where users can:
- Edit config fields (the `configFields` from the registry definition)
- See connected tables/triggers
- Test/execute the plugin action

**Route:** `src/app/(dashboard)/plugins/[id]/page.tsx`

```
/plugins                    → Plugin marketplace (exists)
/plugins/upi-payment-link   → UPI config + QR generator
/plugins/pdf-invoice-generator → PDF config + generate button
/plugins/tally-export       → Tally config + export button
```

### 2. Plugin Config Save API

**Route:** `PATCH /api/plugins/[id]/config`

```typescript
// Updates InstalledPlugin.config JSON
// Body: { config: Record<string, any> }
```

### 3. Plugin Execution Pattern

Each plugin that "does something" gets an executor:

```
src/lib/plugins/executors/
├── upi-payment-link.ts      // Generates UPI deeplink + QR data URL
├── pdf-invoice-generator.ts  // Returns jsPDF blob
├── tally-export.ts           // Returns Tally XML string
└── index.ts                  // Executor registry
```

For **client-side plugins** (UPI, PDF): the executor runs in the browser.
For **simulated plugins** (WhatsApp, SMS, Email): show a "simulated send" result toast.

### 4. Type Extension

```typescript
// Extend PluginDefinition to support execution
export interface PluginDefinition {
  // ... existing fields ...
  executionType: "client" | "server" | "simulated";
  // "client" = runs in browser (UPI QR, PDF)
  // "server" = needs API call (Google Sheets, Razorpay) 
  // "simulated" = config-only, shows mock result
}
```

---

## 📋 Implementation Plan — Phased

### Phase 1: Plugin Infrastructure (shared, do first) — ~2h

1. **Create plugin config page** (`/plugins/[id]/page.tsx`)
   - Read plugin definition from registry
   - Read saved config from `GET /api/plugins/[id]`
   - Render config fields dynamically (TEXT → input, CHECKBOX → toggle, SELECT → dropdown)
   - Save on submit via `PATCH /api/plugins/[id]/config`
   - Shows "not installed" state if plugin isn't installed yet

2. **Create config save API** (`PATCH /api/plugins/[id]`)
   - Validates plugin exists and is installed
   - Saves config to `InstalledPlugin.config`

3. **Update "Configure" button** on plugins page to `<Link href="/plugins/[id]">`

---

### Phase 2: UPI Payment Link Plugin — 🟢 ~2h

**What it does:** Given a UPI ID + amount, generates a UPI deeplink and renders a scannable QR code.

**Implementation:**
- **No backend needed** — entirely client-side
- Uses `qrcode` npm package (or canvas-based QR) to render QR from UPI URI
- UPI URI format: `upi://pay?pa={upiId}&pn={merchantName}&am={amount}&cu=INR`

**Config page additions:**
- Amount input field (manual entry or pulled from selected Invoice)
- "Generate QR" button
- Rendered QR code with copy-deeplink button
- Print-friendly QR card

**Files to create:**
```
src/app/(dashboard)/plugins/[id]/page.tsx     (shared — Phase 1)
src/lib/plugins/executors/upi-payment-link.ts
```

---

### Phase 3: PDF Invoice Generator — 🟢 ~3h

**What it does:** Generates a professional PDF invoice using company profile + invoice data.

**Implementation:**
- Uses `jspdf` (already in the project for quotation/estimate PDFs)
- Pulls company profile from workspace settings
- User selects a Quotation or Estimate to export
- Generates branded PDF with:
  - Company logo, name, GSTIN
  - Customer details
  - Line items with HSN, qty, rate, tax
  - Total with CGST/SGST/IGST breakdown
  - Bank details footer
  - UPI QR (if UPI plugin is installed — nice cross-plugin feature)

**Config page additions:**
- Company info (pre-filled from Settings if available)
- Select record to export (dropdown of quotations/estimates)
- Preview + Download button

**Files to create:**
```
src/lib/plugins/executors/pdf-invoice-generator.ts
```

> [!TIP]
> Since Quotation and Estimate pages already have PDF preview/download built-in,
> this plugin is really about adding **a dedicated, configurable PDF generator page**
> that can pull from any data source, not just the existing hardcoded flows.

---

### Phase 4: Tally Export Plugin — 🟡 ~3h

**What it does:** Exports invoices/expenses as Tally-compatible XML for import into Tally ERP.

**Implementation:**
- Client-side XML generation using template strings
- Tally XML format: `<ENVELOPE><HEADER>...</HEADER><BODY><IMPORTDATA>...</IMPORTDATA></BODY></ENVELOPE>`
- Pulls data from Quotations or Estimates table
- Downloads as `.xml` file

**Config page additions:**
- Tally Company Name field
- Date range filter
- Select records to export (multi-select)
- "Export to XML" button → downloads file

**Files to create:**
```
src/lib/plugins/executors/tally-export.ts
```

---

### Phase 5: Communication Plugins (Simulated) — 🟡 ~2h each

These plugins won't make real API calls but will have **full config UIs** and **simulated execution**:

#### WhatsApp Notifications
- Config: API key, country code, toggle which notifications to send
- Execute: "Send Test Message" → shows simulated success toast with message preview
- Connected tables indicator

#### Email Campaigns  
- Config: SMTP host/port, from email, track opens toggle
- Execute: "Send Test Email" → shows simulated send dialog

#### SMS via MSG91
- Config: API key, Sender ID
- Execute: "Send Test SMS" → shows simulated success

**Pattern for all three:**
```typescript
// Shared simulated executor
export function simulatePluginExecution(pluginId: string, config: Record<string, any>) {
  return {
    success: true,
    message: `Simulated: ${pluginId} would execute with config`,
    timestamp: new Date().toISOString(),
  };
}
```

---

### Phase 6: Module-Absorbed Plugins (Reclassify) — 🟡 ~1h

These plugins should be **removed from the plugin marketplace** and moved to their parent module's pages:

| Plugin → Module | Action |
|-----------------|--------|
| Employee Attendance → HR | ✅ **Already done** — exists as `/attendance-log` |
| Leave Management → HR | Add as HR module page definition in `registry.ts` |
| GST Invoice Generator → Finance | Add as Finance module page definition |
| E-Way Bill → Inventory | Add as Inventory module page definition |

> [!NOTE]
> For the reclassification, we just add `pageDefinitions` to the respective packs in `registry.ts`.
> The plugins remain in the registry as "installed features" but their functionality lives in the module's pages.

---

## 📁 Final File Structure

```
src/
├── app/(dashboard)/plugins/
│   ├── page.tsx                          # Plugin marketplace (exists)
│   └── [id]/
│       └── page.tsx                      # Plugin config + execution page (NEW)
├── lib/plugins/
│   ├── registry.ts                       # Plugin definitions (exists — minor updates)
│   └── executors/
│       ├── index.ts                      # Executor registry
│       ├── upi-payment-link.ts           # UPI QR generator
│       ├── pdf-invoice-generator.ts      # jsPDF invoice generator
│       ├── tally-export.ts               # Tally XML exporter
│       └── simulated.ts                  # Catch-all for WhatsApp/SMS/Email
└── app/api/plugins/
    ├── route.ts                          # GET all plugins (exists)
    ├── install/route.ts                  # POST install (exists)
    ├── toggle/route.ts                   # POST toggle (exists)
    ├── uninstall/route.ts                # POST uninstall (exists)
    └── [id]/
        ├── route.ts                      # GET plugin config (NEW)
        └── config/route.ts              # PATCH save config (NEW)
```

---

## ⏱️ Time Estimates

| Phase | Work | Time |
|-------|------|------|
| Phase 1 | Plugin config infrastructure | 2h |
| Phase 2 | UPI Payment Link (working QR) | 2h |
| Phase 3 | PDF Invoice Generator | 3h |
| Phase 4 | Tally Export | 3h |
| Phase 5 | Communication plugins (simulated) | 3h (1h each × 3) |
| Phase 6 | Module reclassification | 1h |
| **Total** | | **~14h** |

---

## 🎯 Recommended Execution Order

```
P0 — Do Now:
  1. Phase 1 (infrastructure) — unlocks everything
  2. Phase 2 (UPI) — quickest win, fully working demo
  3. Phase 3 (PDF) — leverages existing jsPDF, high demo value

P1 — Do Next:
  4. Phase 4 (Tally Export) — easy, downloads real XML
  5. Phase 5 (Communication — WhatsApp only) — most recognizable plugin

P2 — If Time Permits:
  6. Phase 5 (Email, SMS) — similar pattern
  7. Phase 6 (reclassification) — cleanup
```

> [!IMPORTANT]
> **Phase 1 + 2 + 3 = ~7 hours** and gives you 3 fully functional plugins in the demo.
> This is the minimum viable plugin system that actually demonstrates the architecture working end-to-end.
