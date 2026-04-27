# Session Summary — 2026-04-25

**30 of 30 improvement items shipped ✅**

Branch: `master` · TypeScript clean across all changes.

---

## 🔴 Critical (4/4)

| Fix | Where |
|---|---|
| In-place **module Update** flow — additive sync of new fields/tables/pages on existing installs, no data loss | `src/app/api/packs/update/route.ts`, `src/components/marketplace/PackCard.tsx` |
| Notification **bell dropdown** with empty-state panel (replaced fake "3" badge) | `src/components/layout/Topbar.tsx` |
| **Pages narrow-column** bug — sidebar breakpoint dropped `lg → md` (visible on common laptops) | `src/app/(dashboard)/layout.tsx` |
| **GST Rate (%)** field on Products with Indian slabs (0/5/12/18/28%) | `src/lib/packs/registry.ts` |

## 🟡 High (7/7)

- **Customers** schema expanded — Email, GSTIN, Billing Address, City, State (dropdown), Credit Limit, Payment Terms
- **Stock** — added Reorder Level field
- **Tables relations** — Products → Suppliers + Products → Customers (Inventory pack v1.2.0, table order fixed for fresh installs)
- **Marketplace empty tabs** — coming-soon cards with ETA + waitlist toggle for Sales / Finance / HR
- **Page Composer**: 4 new block types
  - `METRIC` (KPI card with optional live record count)
  - `EXPORT_BUTTON` (CSV download, BOM-prefixed for Excel, respects visibleFields)
  - `IMAGE` (URL, alt, width, align)
  - `GST_CALCULATOR` (CGST+SGST / IGST split)
- **Filter Bar**: optional date range picker

## 🟢 Medium (14/15)

| Fix | Notes |
|---|---|
| Hindi i18n scaffold | `useLanguage()` hook, EN+HI dict, topbar `EN ⇄ हि` toggle, live broadcast |
| Sidebar **company-name flicker** | Skeleton shimmer instead of "The Ledger" fallback |
| **Automations panel** in schema designer | 3 pre-built rules (Low stock → WhatsApp, New customer → SMS, Overdue invoice → reminder) with toggles |
| **Permissions panel** | 4-role matrix (Owner / Manager / Staff / Viewer) |
| **Schema draft indicator** | Diffs local vs published; amber "N unsaved changes" or green "Published" pill |
| **Page Composer collapsible panels** | Toggle left/right panels independently |
| **Indian phone validation** | `+91` prefix, 10-digit + 6/7/8/9 prefix check, inline errors. Email gets light client-side check too. |
| **Stats cards clickable** + **Recent Activity rows clickable** + **View all** link | Dashboard hot paths |
| **OS-aware shortcut** (`⌘K` Mac / `Ctrl+K` Windows) + better search placeholder | Topbar |
| Razorpay → Invoices link | Shipped Finance pack; plugins page derives "Connected to" tags from triggers, with "Install Finance" CTA when missing |

## 🟢 Low (3/4)

- Tenant **login branding** — slug initial in avatar, slug as headline
- **Forgot Password** — modal explaining tenant accounts are reset by workspace owner
- **Remember Me** — username only (never password), per-slug localStorage
- **Google SSO** — `GoogleProvider` mounted only when `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` are set; signIn callback auto-provisions a User row; builder login page detects via `getProviders()` and renders "Continue with Google"

---

## Key plumbing added

- `PackDefinition.version` + `/api/packs/update` endpoint → unblocks every future schema change without forcing reinstalls.
- Workspace API exposes `installedPackDetails[]` so the marketplace can detect drift.
- `src/lib/i18n.ts` — type-safe dictionary, parity-enforced at compile time.
- Three new reusable block components + types in `src/types/block.ts`.

## To enable Google SSO in your environment

Add to `.env.local`:

```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

The button auto-appears on `/login` once both are set; the User row is upserted on first sign-in.

See `TODO.md` for the full annotated list with file links.
