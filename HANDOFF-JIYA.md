# Handover: Jiya (M2) — Frontend & Builder UI

**Role:** You own the Page Composer, block rendering, drag-drop interactions, live previews, and all core UI components.

> **Your Core Mission:** Strip out the hardcoded sample data. Make the platform truly "buildable" by wiring the Schema Designer and the Page Composer to live database records.

---

## 🔴 Priority 1: Wire Page Composer to Live Records (Phase 3)
*File: `src/app/(dashboard)/pages/[pageId]/edit/page.tsx`*

This is the largest frontend task. Currently, blocks like `TABLE_VIEW` and `KANBAN` show static arrays of data.

**To-Do:**
1. **Properties Panel ("Data Source"):** Populate the table `<select>` dropdown with real workspace tables fetched from `/api/tables`.
2. **Block State:** When a user selects a table, store `config.tableId` in the block's state.
3. **Dynamic Table View:** When `block.config.tableId` is set, fetch `GET /api/tables/[id]/records`. Render dynamic columns based on the table's actual fields instead of the hardcoded 5-column layout.
4. **Dynamic Kanban View:** Fetch records and group them by `block.config.groupByField`. The columns should be the options of that `SINGLE_SELECT` field.
5. **Dynamic Form Block:** Generate form inputs based on the structure of the selected table's schema.
6. **Relation UI:** Render `RELATION` type cells as clickable primary-colored chips showing the `fieldId_display` value (Rudra will provide this from the API).

---

## 🟡 Priority 2: Wire Schema Designer to Live Data (Phase 2)
*File: `src/app/(dashboard)/schema/[tableId]/page.tsx`*

**To-Do:**
1. Remove `initialFields` and `sampleData`.
2. On initial load, fetch the real fields using SWR from `GET /api/tables/[id]/fields`.
3. The right-side "Live Preview" panel must render real records from `GET /api/tables/[id]/records` (limit to 10 rows to save ops, and debounce).
4. Connect the "Publish Schema" button to call `PUT /api/tables/[id]/fields/sync` (Rudra is building this API).
5. **Field Types:** Fix the Field Type selector — right now the type badge is just display-only text. Make it a functional `<select>` or dropdown menu.

---

## 🟢 Priority 3: Sprint Polish & UI Refinements
- **Runtime Page Render:** Work with Milan to ensure the block renderers you built for the composer also work cleanly in the end-user runtime context (`/apps/[slug]/pages/[pageId]/page.tsx`).
- **Responsive Checks:** Ensure the split-screen drag-and-drop degrades gracefully or gives a nice warning on smaller tablet/mobile screens.
- **Hover/Active States:** Ensure "selected block" ring styles feel snappy.
