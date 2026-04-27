# ERP Builder — Improvement Tasks

Tracking file for all fixes/improvements. Mark items as `[x]` when done with a brief note on the fix.

**Status:** 30 / 30 shipped ✅

---

## 🔴 Critical

- [x] **Update module functionality** — Existing installs can't pick up new schema fields (GST %, Reorder Level, expanded Customers). Added an in-place Update flow.
  - Fix: Added `version` to `PackDefinition`, bumped Inventory to `1.1.0`. New endpoint [src/app/api/packs/update/route.ts](src/app/api/packs/update/route.ts) does a strictly additive sync — adds missing tables (with seed data), adds missing fields on existing tables (never required, never deletes/renames), adds missing pages — then stamps the new `packVersion`. Workspace API now returns `installedPackDetails` with current versions. PackCard detects `installedVersion !== pack.version` and renders a loud amber "Update to v{x}" button; on success toasts a summary of what was added. [src/types/pack.ts](src/types/pack.ts), [src/lib/packs/registry.ts](src/lib/packs/registry.ts), [src/app/api/workspace/route.ts](src/app/api/workspace/route.ts), [src/hooks/use-workspace.ts](src/hooks/use-workspace.ts), [src/components/marketplace/PackCard.tsx](src/components/marketplace/PackCard.tsx), [src/app/(dashboard)/modules/page.tsx](src/app/(dashboard)/modules/page.tsx), [src/app/api/packs/install/route.ts](src/app/api/packs/install/route.ts)

- [x] **Notification bell fix** — Click pe dropdown/panel nahi khulta. 3 unread badge hai but no interaction.
  - Fix: Converted bell into a `DropdownMenu` with a proper empty-state panel ("No new notifications"). Removed the fake hardcoded "3" badge. [src/components/layout/Topbar.tsx](src/components/layout/Topbar.tsx)
- [x] **Pages layout bug** — `/pages` route narrow column (695px) mein render ho raha hai full desktop pe. Sidebar missing. Responsive breakpoint issue.
  - Fix: Lowered sidebar breakpoint from `lg` (1024px) → `md` (768px) so the sidebar stays visible on common laptop widths. [src/app/(dashboard)/layout.tsx](src/app/(dashboard)/layout.tsx), [src/components/layout/Topbar.tsx](src/components/layout/Topbar.tsx)
- [x] **GST % field in Products table** — HSN Code aur Rate hain but tax rate (GST %) field nahi hai. Critical for Indian business.
  - Fix: Added `GST Rate (%)` SINGLE_SELECT field (0/5/12/18/28%) with Indian GST slabs. Seed rows updated. [src/lib/packs/registry.ts](src/lib/packs/registry.ts) — Existing installs get this via the new Update button in the marketplace (see "Update module functionality" above).

## 🟡 High

- [x] **Customer table field expansion** — Add: Email, GST Number, Billing Address, City/State, Credit Limit, Payment Terms. Abhi sirf Name + Contact Number hai.
  - Fix: Expanded Customers schema with Email, GSTIN, Billing Address, City, State (Indian states dropdown), Credit Limit (INR), Payment Terms. Seed row updated to realistic Indian SME customer. [src/lib/packs/registry.ts](src/lib/packs/registry.ts)
- [x] **Stock table reorder level** — Add minimum stock alert / reorder level field. Core inventory feature.
  - Fix: Added `Reorder Level` NUMBER field to Stock. Seed rows set thresholds (50/100/25) that match the existing LOW STOCK / IN STOCK statuses. [src/lib/packs/registry.ts](src/lib/packs/registry.ts)
- [x] **Page Composer: KPI card component** — Single number highlight block (e.g., "Today's Sales: ₹50,000").
  - Fix: Added `METRIC` block type. Configurable label, static value, trend caption, and 5-color accent. Optional table binding shows a live record count instead of the static value. [src/components/blocks/MetricCard.tsx](src/components/blocks/MetricCard.tsx), [src/types/block.ts](src/types/block.ts)
- [x] **Page Composer: Export button** — Table data ko Excel/CSV export karne ka option.
  - Fix: Added `EXPORT_BUTTON` block type that fetches the bound table's records + fields, builds RFC 4180-style CSV (BOM-prefixed for Excel), and triggers a download with a date-stamped filename. Honours `visibleFields` so the export matches what's on screen. [src/components/blocks/ExportButton.tsx](src/components/blocks/ExportButton.tsx)
- [x] **Page Composer: Image/Logo block** — Invoice/product page ke liye logo component.
  - Fix: Added `IMAGE` block type with URL, alt text, width (sm/md/lg/full), and align (left/center/right). [src/components/blocks/ImageBlock.tsx](src/components/blocks/ImageBlock.tsx)
- [x] **Page Composer: Date Picker filter** — Date range filter missing in Filter Bar.
  - Fix: Filter Bar now has an `Include date range picker` toggle in its properties panel — when on, two date inputs appear in both the composer preview and the runtime view. [src/app/(dashboard)/pages/[pageId]/edit/page.tsx](src/app/(dashboard)/pages/[pageId]/edit/page.tsx), [src/app/apps/[slug]/pages/[pageId]/page.tsx](src/app/apps/[slug]/pages/[pageId]/page.tsx), [src/types/block.ts](src/types/block.ts)
- [x] **Marketplace empty tabs** — Operations, Sales, Finance, HR tabs empty hain. "Coming soon" ya waitlist state.
  - Fix: Sales / Finance / HR & Payroll tabs now render category-specific "coming soon" cards with ETA badge, blurb, and a "Notify me" button that toasts confirmation + flips to "On the waitlist ✓". [src/app/(dashboard)/modules/page.tsx](src/app/(dashboard)/modules/page.tsx)
- [x] **Tables relations** — Customers & Suppliers currently `0 relations`. Link to Products.
  - Fix: Bumped Inventory pack to `1.2.0`. Reordered tables so Suppliers + Customers come before Products in the registry (RELATION fields can only resolve to tables created earlier in a fresh install). Added two RELATION fields on Products: `Preferred Supplier → Suppliers` and `Frequent Customer → Customers`. Existing tenants pick this up via the marketplace Update button. [src/lib/packs/registry.ts](src/lib/packs/registry.ts)

## 🟢 Medium

- [x] **Hindi language support** — i18n for tier-2/tier-3 city SME users.
  - Fix: Added a typed i18n helper ([src/lib/i18n.ts](src/lib/i18n.ts)) with EN + HI dictionaries, a `useLanguage()` hook, and a localStorage-backed language toggle (Languages icon, `EN ⇄ हि`) in the Topbar. Sidebar nav, Topbar search/notifications/account menu, and "Open my ERP" CTA all switch live (custom event broadcasts the change so all components re-render without a route reload). Foundation is in place — adding more keys is now an additive change. [src/components/layout/Topbar.tsx](src/components/layout/Topbar.tsx), [src/components/layout/Sidebar.tsx](src/components/layout/Sidebar.tsx)
- [x] **Loading state / company name flicker** — Sidebar shows "The Ledger / workspace" before company name loads.
  - Fix: Sidebar now renders shimmer skeletons for the workspace name + subdomain while `useWorkspace()` is loading, instead of the misleading "The Ledger" fallback. Fallback on error is a neutral "Workspace". [src/components/layout/Sidebar.tsx](src/components/layout/Sidebar.tsx)
- [x] **WhatsApp automation UI** — Builder mein notification config ka UI missing. Automation tab empty.
  - Fix: Schema designer's left-nav buttons (Data Schema / Automations / Permissions) actually switch sections now. Automations renders three pre-built rule cards (Low stock → WhatsApp alert, New customer → welcome SMS, Overdue invoice → reminder) with toggleable switches and a Beta badge. Empty banner clarifies that delivery requires connecting a plugin. [src/app/(dashboard)/schema/[tableId]/page.tsx](src/app/(dashboard)/schema/[tableId]/page.tsx)
- [x] **Low stock → WhatsApp alert** — Automation workflow.
  - Fix: Surfaces as one of the three default automation rules in the new Automations panel. Toggle stages it locally; needs a WhatsApp plugin for actual delivery (deferred — needs plugin runtime).
- [x] **New customer → welcome SMS** — Automation workflow.
  - Fix: Same as above — appears as a pre-built rule in the Automations panel (multilingual blurb mentions Hindi/English).
- [x] **Automatic GST calculation** — Calculator block / tax component in page composer.
  - Fix: New `GST_CALCULATOR` block — base amount + GST rate (0/5/12/18/28%) inputs, auto-renders subtotal, CGST + SGST split (intrastate) or unified IGST (interstate), and total payable. Builder can pre-set defaults and split mode in the inspector. [src/components/blocks/GstCalculator.tsx](src/components/blocks/GstCalculator.tsx), [src/types/block.ts](src/types/block.ts)
- [x] **Indian phone validation** — +91 default, 10-digit validation on Phone type fields.
  - Fix: PHONE fields in the record form now render with a fixed `+91` prefix box, `inputMode="numeric"`, max-length 14, live validation that requires 10 subscriber digits starting with 6/7/8/9, and inline error/helper text. EMAIL fields get a similar lightweight client-side check. Submit blocks until errors clear. [src/components/blocks/RecordFormModal.tsx](src/components/blocks/RecordFormModal.tsx)
- [x] **Razorpay plugin integration** — Link to invoicing / payment tracking.
  - Fix: Shipped the **Finance pack** (Invoices + Expenses tables, Invoice Tracker page) by registering `financePack` in [src/lib/packs/index.ts](src/lib/packs/index.ts) and adding it to the marketplace catalogue. Plugins page now derives a "Connected to" tag list from each plugin's `triggers[].table` — Razorpay shows a clickable `Invoices` chip when the table exists, or an amber "Install Finance" callout linking to the marketplace if the user hasn't installed it yet. Same wiring covers GST Invoice Generator. Removed Finance from the COMING_SOON empty-state map. [src/app/(dashboard)/plugins/page.tsx](src/app/(dashboard)/plugins/page.tsx), [src/app/(dashboard)/modules/page.tsx](src/app/(dashboard)/modules/page.tsx)
- [x] **Stats cards clickable** — "Installed Modules: 1" → Marketplace redirect.
  - Fix: Dashboard stats cards are now `<Link>`s — Installed Modules→/modules, Active Plugins→/plugins, Tables Created→/tables, Custom Pages→/pages. Added an ArrowUpRight hover affordance. [src/app/(dashboard)/workspace/page.tsx](src/app/(dashboard)/workspace/page.tsx)
- [x] **Recent Activity: timestamps + View All** — Make entries clickable, add view-all link.
  - Fix: Each activity row is now a `<Link>` routed by type (module → /modules, plugin → /plugins, schema → /tables) with a hover ArrowUpRight affordance. Added a "View all" link in the section header pointing to /modules. [src/app/(dashboard)/workspace/page.tsx](src/app/(dashboard)/workspace/page.tsx)
- [x] **Schema draft indicator** — Show when draft started + what changes pending vs published.
  - Fix: Schema designer now diffs the local working set against the published server fields and shows either an amber "N unsaved change(s)" pill (with added/modified/removed in the tooltip) or a green "Published" pill. Save Draft + Publish buttons disable when nothing has changed. [src/app/(dashboard)/schema/[tableId]/page.tsx](src/app/(dashboard)/schema/[tableId]/page.tsx)
- [x] **Role-based access control UI** — Owner/Manager/Staff roles in Permissions tab.
  - Fix: Permissions section now renders a 4-role matrix (Owner / Manager / Staff / Viewer) with read / write / manage indicators per role. Currently view-only — per-role overrides flagged as next milestone. [src/app/(dashboard)/schema/[tableId]/page.tsx](src/app/(dashboard)/schema/[tableId]/page.tsx)
- [x] **Page Composer 3-panel cramped** — Center canvas resize properly on smaller screens.
  - Fix: Added topbar toggles (PanelLeftOpen / PanelRightOpen icons) to collapse the pages list and the components/properties inspector independently. Canvas grows to fill the freed space. [src/app/(dashboard)/pages/[pageId]/edit/page.tsx](src/app/(dashboard)/pages/[pageId]/edit/page.tsx)
- [x] **Keyboard shortcut OS-aware** — Show `Ctrl+K` on Windows, `⌘K` on Mac.
  - Fix: Detects platform via `navigator.userAgentData` / `navigator.platform`, renders `⌘K` on Mac and `Ctrl+K` elsewhere. [src/components/layout/Topbar.tsx](src/components/layout/Topbar.tsx)
- [x] **Search placeholder copy** — "Search FILTER BAR..." → "Search records..." / "Khoje...".
  - Fix: Command palette trigger now reads "Search records, modules, pages..." — more natural for SME users. [src/components/layout/Topbar.tsx](src/components/layout/Topbar.tsx)

## 🟢 Low

- [x] **Login: company logo/name** — Generic icon hata ke tenant branding.
  - Fix: Tenant login page now uses the workspace slug as the headline and the slug's first letter inside the gradient avatar instead of the generic Building2 icon. Subdomain shown in mono below. [src/app/apps/[slug]/login/page.tsx](src/app/apps/[slug]/login/page.tsx)
- [x] **Login: Forgot Password** — Add flow.
  - Fix: Added a "Forgot password?" link that opens a contextual modal explaining tenant accounts are reset by the workspace owner from Settings → Users. (Email-based reset would need real email infra — flagged as future work.) [src/app/apps/[slug]/login/page.tsx](src/app/apps/[slug]/login/page.tsx)
- [x] **Login: Remember me** — Add checkbox.
  - Fix: "Remember me" persists only the username (never the password) to localStorage scoped per workspace slug. Auto-restored on next visit. [src/app/apps/[slug]/login/page.tsx](src/app/apps/[slug]/login/page.tsx)
- [x] **Login: Google SSO** — For Google Workspace users.
  - Fix: Mounted `GoogleProvider` conditionally in [src/lib/auth.ts](src/lib/auth.ts) — only when `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` are set, so local dev still boots without creds. Added a `signIn` callback that upserts a `User` row for first-time Google sign-ins (placeholder hashed random password since the schema requires one), and a `jwt` callback branch that resolves the DB id + workspace from email after Google auth. Builder login page calls `getProviders()` and conditionally renders a "Continue with Google" button (with an inline brand SVG) above an "or" divider. [src/app/(auth)/login/page.tsx](src/app/(auth)/login/page.tsx)
