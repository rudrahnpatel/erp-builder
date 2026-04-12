# Handover: Rudra (M1) — Backend & Schema Engine

**Role:** You own the Database design, API routes, dynamic schema engine, module pack system, and auth layer.

> **Your Core Mission:** Enable horizontal wiring. The frontend team (Jiya) needs your APIs to save schema drafts, and the integration team (Milan) needs your relation engine to link CRM Deals to Inventory Products for the final demo.

---

## 🔴 Priority 1: The Critical Gap (Phase 1)
Currently, the Schema Designer's "Save Draft" and "Publish Schema" buttons are broken because the sync endpoint does not exist.

### Build `/api/tables/[id]/fields/sync/route.ts`
- **Method:** `PUT`
- **Payload:** `{ fields: FieldItem[] }`
- **Logic:**
  1. Receive the array of fields from the client.
  2. Diff this array against the current fields in the DB for this table.
  3. **Create** new fields (you can identify new fields from the client because their IDs typically start with `"temp-"` or aren't real CUIDs).
  4. **Update** existing fields (by their real ID).
  5. **Delete** fields that exist in the DB but are missing from the incoming array.
- This entirely unblocks Jiya from finishing the Schema Designer wiring.

---

## 🟡 Priority 2: Cross-Module Relation Engine (Phase 5)
This is the thesis demo's key differentiator — showing that the platform can relate a Deal in the CRM pack to a Product in the Inventory pack.

### Modify `/api/tables/[id]/records/route.ts` (GET Handler)
Currently, `RELATION` fields just store the target record ID. When rendering a table, we need the display string.
- **Logic:**
  1. After fetching the base records, identify any fields of type `RELATION`.
  2. For those fields, resolve the `config.linkedTableId`.
  3. Batch-fetch the linked records.
  4. Find the first `TEXT` field of the linked table and use it as the "display value" for the relation.
  5. Append this to the record payload (e.g., `"[fieldId]_display": "Krishna Traders"`).
- This allows both the Page Composer blocks and the Runtime Table Views to render human-readable relation tags.

---

## 🟢 Priority 3: Sprint Polish
- **Database Optimization:** Ensure GIN indexes are set up on the JSONB columns if queries start slowing down during testing.
- **Custom Fields:** Verify that adding a custom field (like "Expiry Date") to a pre-installed module pack's table works cleanly without breaking the schema.
- **Assist Milan:** Help Milan wire up the `/api/workspace` stats into the main dashboard page.
