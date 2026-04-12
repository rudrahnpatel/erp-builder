# Handover: Milan (M3) — Integration & Full-stack

**Role:** You own the Template gallery, module install flow, cross-module wiring visualizations, testing, demo seed data, and overall product journey integration.

> **Your Core Mission:** Make it a cohesive product. You are responsible for ensuring the onboarding flow works, the module configurations feel real, and the final demo is flawless with Indian SME seed data.

---

## 🔴 Priority 1: Fix the Module Configure Page (Phase 4)
*File: `src/app/(dashboard)/modules/[packId]/configure/page.tsx`*

Currently, this page is entirely hardcoded to show an "Attendance" module regardless of what pack you clicked in the marketplace.

**To-Do:**
1. Make it pack-aware: Use the `packId` from the URL parameters to fetch the real pack definition (`getPackById` or from `api/packs`).
2. **Step 1 (Builder):** Render the actual tables and fields that belong to the pack.
3. **Step 2 (Data Model):** Show a clean read-only ERD-style list of the tables.
4. **Deploy Step:** The final "Deploy" button should execute `POST /api/packs/install { packId }` and redirect the user back to their workspace dashboard.
5. If the pack is already installed (check `workspace.installedPacks`), show an "Already Installed" state rather than letting them reinstall.

---

## 🟡 Priority 2: Runtime Page Renderer (Phase 6)
*File: `src/app/apps/[slug]/pages/[pageId]/page.tsx`* (Verify/Create this route)

Jiya is building the blocks in the editor, but you need to ensure they render properly for the **end user**.

**To-Do:**
1. Create a server component that fetches the page JSON from `GET /api/pages/[id]`.
2. Map over the `blocks` array.
3. For `TABLE_VIEW` and `KANBAN_VIEW`, fetch the live records via RSC.
4. For `FILTER_BAR`, build a client-component wrapper ("island") that holds the search state and re-fetches its sibling data blocks.

---

## 🟡 Priority 3: Workspace Home Dashboard
*File: `src/app/(dashboard)/workspace/page.tsx`*

**To-Do:**
1. Connect the UI to the actual `/api/workspace` stats.
2. Show active counts: number of tables, total records, installed packs.
3. Build quick action buttons: "Install Modules", "Open App Runtime", etc.

---

## 🟢 Priority 4: Auth, Onboarding & Demo Readiness (Phases 7 & 8)
- **Auth/Onboarding:** Verify that the `/onboarding` slug claim flow links up gracefully to NextAuth. Ensure clicking "Launch" drops the user exactly into their newly minted workspace.
- **Seed Data Snippet:** Create/modify `prisma/seed.ts` to automatically populate an "Acme Traders Pvt Ltd" workspace with the Inventory and CRM packs pre-installed. We need a one-command reset (`npx prisma db seed`) for demo day.
- **End-to-end rehearsal:** Walk the narrative: "Empty Workspace -> Install Pack -> Adjust Field -> Relate Data -> Filter".
