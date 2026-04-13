# Handoff: Jiya — Builder UI + Plugin System

---

## Track A: Wire the Builder UI to Live Data

### A1 — Page Composer
*`src/app/(dashboard)/pages/[pageId]/edit/page.tsx`*

1. Populate the Data Source dropdown with real workspace tables from `GET /api/tables`.
2. When a table is selected, store `config.tableId` in block state.
3. **Table View block:** Fetch `GET /api/tables/[id]/records`. Render columns from actual fields, not the hardcoded layout.
4. **Kanban block:** Group records by `block.config.groupByField`. Columns = options of that SINGLE_SELECT field.
5. **Form block:** Generate inputs from the selected table's field schema.
6. **Relation cells:** Render as clickable chips using the `fieldId_display` value from the records API.

### A2 — Schema Designer
*`src/app/(dashboard)/schema/[tableId]/page.tsx`*

1. Remove `initialFields` and `sampleData`.
2. On load, fetch fields from `GET /api/tables/[id]/fields`.
3. Live Preview renders real records from `GET /api/tables/[id]/records` — limit 10 rows, debounce updates.
4. Connect "Publish Schema" to `PUT /api/tables/[id]/fields/sync`.
5. Make the Field Type badge a functional dropdown, not display-only text.

---

## Track B: Plugin System

### B1 — Define the data contract
*Create `src/types/plugin-runtime.ts`*

```typescript
export interface PluginInput {
  records: Record<string, any>[]
  fields: { name: string; type: string }[]
  config: Record<string, any>
  trigger?: {
    event: string
    record?: Record<string, any>
  }
}

export interface PluginOutput {
  success: boolean
  message: string
  data?: any
}

export interface PluginExecutor {
  id: string
  execute: (input: PluginInput) => Promise<PluginOutput>
  validate?: (config: Record<string, any>) => string[]
}
```

### B2 — Build plugin executors
*`src/lib/plugins/executors/`*

One file per plugin. Each implements `PluginExecutor`. For demo purposes, executors don't need to call real external APIs — simulate the flow and return a valid `PluginOutput`.

| Plugin | What it does | Key config fields |
|---|---|---|
| `whatsapp.ts` | Sends WhatsApp message per record | `apiKey`, `countryCode` |
| `gst-invoice.ts` | Generates GST-compliant PDF | `gstin`, `taxRate` |
| `excel-export.ts` | Converts records to XLSX download | — |
| `email-campaigns.ts` | Sends bulk email to records | `smtpHost`, `fromEmail` |
| `razorpay.ts` | Creates payment link for a record | `keyId`, `keySecret` |
| `leave-management.ts` | Processes leave request record | `quota`, `requireApproval` |

Export all executors from `src/lib/plugins/executors/index.ts` as a map: `pluginId -> PluginExecutor`.

### B3 — Plugin config UI

1. After install, show a config modal with inputs generated from `pluginDef.configFields`.
2. Save config via `PATCH /api/plugins/[id]/config`.
3. "Test Plugin" button — runs executor with mock `PluginInput`, displays the `PluginOutput` result inline.
4. Enabled/Disabled toggle per installed plugin.

### B4 — Plugin execution API
*`POST /api/plugins/[pluginId]/execute`*

```typescript
// Request body
{ tableId: string, recordIds?: string[] }

// Handler steps:
// 1. Fetch records from tableId (filter by recordIds if provided)
// 2. Fetch InstalledPlugin.config for this workspace
// 3. Build PluginInput
// 4. Call executor.execute(input)
// 5. Return PluginOutput
```
