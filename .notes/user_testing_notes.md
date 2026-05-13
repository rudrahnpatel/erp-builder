# 🧪 User Testing Notes — Mosaic ERP Builder
**Date:** 13 May 2026 | **Tester:** Automated (Antigravity) | **For:** Presentation Prep

---

## Summary

Tested the FULL user flow: Landing Page → Sign Up → Onboarding → Builder Dashboard → Module Install (4 modules) → Plugin Install (2 plugins) → Tenant App Login → Every Single Page explored. 

**Overall Rating: 8/10** — App is solid and demo-ready with a few text bugs that MUST be fixed.

Available modules in registry: **Inventory, Finance, HR & Payroll, Quotations & Invoicing, Helpdesk & CS, Manufacturing** (CRM is commented out/hidden).
Installed & tested: **Inventory, Finance, HR & Payroll, Quotations & Invoicing** (4 out of 6).
Could not install: **Helpdesk & CS, Manufacturing** — session redirect bug prevented access to marketplace after certain state changes (see Bug #16).

---

## 📦 Module & Plugin Installation Results

### Modules Installed ✅
| Module | Status | Tables Created | Pages Created | Sample Data |
|---|---|---|---|---|
| Inventory & Warehouse | ✅ Installed | Products, Customers, Suppliers, Stock | Products Overview, Current Stock, Suppliers, Customers | ✅ 3 products, 1 customer, 1 supplier |
| Finance | ✅ Installed | Invoices, Expenses | Invoice Tracker | ❌ Empty tables |
| HR & Payroll | ✅ Installed | Employees, Attendance | Employee Directory, Attendance Dashboard | ✅ 5 employees, attendance records |
| Quotations & Invoicing | ✅ Installed | Quotations, Estimates | Quotations, New Quotation, Estimates, New Estimate | ✅ 5 quotations, 5 estimates |

### Modules NOT Tested (but exist in code)
| Module | Status | Notes |
|---|---|---|
| Helpdesk & CS (Support) | ❌ Not installed | Exists in registry, should install same as others |
| Manufacturing | ❌ Not installed | Exists in registry, should install same as others |
| CRM (Sales) | 🚫 Commented out | In code but hidden: `// [crmPack.id]: crmPack,` |

### Plugins Installed ✅  
| Plugin | Status | Shows in Tenant App |
|---|---|---|
| WhatsApp Notifications | ✅ Installed | ✅ "WhatsApp Alerts" under TOOLS section |
| Google Sheets Sync | ✅ Installed | ✅ "Google Sheets Sync" under TOOLS section |

### Final Builder Dashboard Stats
- **Installed Modules:** 4
- **Active Plugins:** 2
- **Tables Created:** 10+ (with fields and sample data)
- **Custom Pages:** 15+

---

## 🔍 Page-by-Page Tenant App Review

### Sidebar Structure (after all installs)
```
📱 Test ERP (TEST-ERP-123)
├── 🏠 Home
├── ⚙ BUILTIN
│   └── 📊 Dashboard
├── ⚙ INVENTORY  
│   ├── 📊 Products Overview
│   ├── 📦 Current Stock
│   ├── 👤 Suppliers
│   └── 👤 Customers
├── ⚙ QUOTATION
│   ├── 📄 Quotations
│   ├── 📊 New Quotation
│   ├── 📊 Estimates
│   └── 📊 New Estimate
├── ⚙ FINANCE
│   └── 📄 Invoice Tracker
├── ⚙ HR PAYROLL
│   ├── 👤 Employee Directory
│   └── 📊 Attendance Dashboa... (truncated!)
├── ⚙ TOOLS
│   ├── 📢 WhatsApp Alerts
│   └── 📊 Google Sheets Sync
└── ⚙ Settings
```

### Page Review Details

| Page | Visual Quality | Data | Issues Found |
|---|---|---|---|
| **Dashboard** | ⚠️ Empty | None | Only shows placeholder text — needs widgets/stats |
| **Products Overview** | ✅ Great | 3 products (A4 Paper, Keyboard, Mouse) | Table with search, filter, add record — all working |
| **Current Stock** | ✅ Good | 3 stock items | Shows stock data with status |
| **Suppliers** | ✅ Great | 1 supplier (Krishna Polymers) | Clean table with all fields |
| **Customers** | ✅ Great | 1 customer (ABC Manufacturing, Pune) | Full details: GSTIN, payment terms (NET 30), contact |
| **Quotations** | ✅ Excellent | 5 quotations with ₹ amounts | Professional table with status badges (PENDING), action icons |
| **New Quotation** | ✅ Excellent | N/A | Split-pane: form left + live PDF preview right. Template selector (Classic/Modern/Minimal) |
| **Estimates** | ✅ Excellent | 5 estimates (₹18,113 total) | Tab filters (All/Unpaid/Overdue/Paid), summary bar at bottom |
| **New Estimate** | ✅ Excellent | N/A | Split-pane form + live preview. GST toggle, line items, print/PDF |
| **Invoice Tracker** | ✅ Good | Empty | Clean table, ready for data |
| **Employee Directory** | ✅ Great | 5 employees | Dept badges (FINANCE, ENGINEERING, SALES, OPERATIONS), Copy Link + Edit |
| **Attendance Dashboard** | ⚠️ Bug | Has records | Employee names show "Unknown" — data sync issue |
| **WhatsApp Alerts** | ✅ Good | N/A | Clean "Send Test Message" form with phone number + message body |
| **Google Sheets Sync** | ✅ Good | N/A | Shows "requires Google OAuth setup" info message — correct behavior |

---

## 🔴 CRITICAL / MUST FIX (6 issues)

### 1. Button text shows literal "RiTableLine" instead of "Table"
**Files:**
- `src/app/(dashboard)/tables/page.tsx` line 482 — **"Create RiTableLine"** → **"Create Table"**
- `src/app/(dashboard)/dev/modules/[moduleId]/tables/page.tsx` line 184 — **"New RiTableLine"** → **"New Table"**
- `src/app/(dashboard)/dev/modules/[moduleId]/tables/page.tsx` line 494 — **"Create First RiTableLine"** → **"Create First Table"**

### 2. Description text shows literal icon names on Dev Modules page
- `src/app/(dashboard)/dev/modules/page.tsx` line 201 — _"Page Builder and RiTableLine"_ → **"Page Builder and Table Designer"**
- `src/app/(dashboard)/dev/modules/page.tsx` line 409 — Same fix

### 3. Plugins page broken punctuation
- `src/app/(dashboard)/plugins/page.tsx` line 100
- **"need:from"** → **"need — from"**
- **"collections:in"** → **"collections — in"**

### 4. Attendance shows "Unknown" employee names
- All attendance records show "Unknown" instead of employee names
- Likely the seeded attendance records reference employee IDs that don't map properly

### 5. Next.js Dev Toolbar visible on ALL pages
- The "N" button at bottom-left is visible everywhere
- Currently also showing "2 Issues" badge — will look bad in presentation

### 6. Comment in API route leaks icon name
- `src/app/api/tables/[id]/fields/route.ts` line 44 — comment says "isCustom:true on RiTableLine" → cosmetic but sloppy
- `src/components/blocks/FilterContext.tsx` line 31 — comment says "used by RiTableLine/Kanban/Chart" → should say "Table/Kanban/Chart"

---

## 🟡 HIGH PRIORITY

### 7. Tenant Dashboard is completely empty
- Just shows: _"Your workspace at a glance. Use the sidebar to navigate..."_
- This is the FIRST thing users see — needs at minimum some stats cards

### 8. "Attendance Dashboa..." — sidebar text is truncated
- Full name "Attendance Dashboard" gets cut off in the sidebar

### 9. Quotations show "Dummy Client 0/1/2/3/4" 
- Seeded data has obvious dummy names — for presentation should be real-sounding

### 10. New Quotation/Estimate shows "Your Company Name" placeholder
- The live preview shows "Your Company Name" and default contact info
- Settings didn't pre-fill from onboarding data
- Located in: `src/app/(dashboard)/quotation/create/page.tsx` line 70

---

## 🟠 MEDIUM PRIORITY

### 11. Sidebar slug "TEST-ERP-123" shown in uppercase
- Should display as lowercase or more friendly format

### 12. Onboarding preset doesn't auto-install selected modules
- Selected "Inventory & Warehouse" preset but got 0 modules — had to install manually

### 13. Builder Dashboard says "Welcome back" on first visit
- Should say "Welcome" or "Your ERP is ready" for first-time users

### 14. Settings page — Company Profile fields all empty after onboarding
- Company Name entered during onboarding doesn't pre-fill in Settings

### 15. CRM module is commented out / hidden
- Line 14 in `src/lib/packs/index.ts`: `// [crmPack.id]: crmPack,`
- If you want to show it in the demo, uncomment this line

### 16. Session redirect bug — builder redirects to onboarding after certain operations
- After multiple workspace/session changes, the builder redirects to /onboarding
- API `/api/workspace` returns wrong workspace session
- This is a session-management issue — needs investigation

---

## ✅ What Works GREAT (Presentation Highlights)

| Feature | Quality | Demo Value |
|---|---|---|
| **Quotations System** | ⭐⭐⭐⭐⭐ | Live PDF preview, template selection, ₹ formatting — SHOW THIS! |
| **Estimates System** | ⭐⭐⭐⭐⭐ | Tabs, summary bar, GST toggle, Print/PDF — SHOW THIS! |
| **Module Marketplace** | ⭐⭐⭐⭐⭐ | Beautiful cards, one-click install, auto-table creation |
| **Plugin System** | ⭐⭐⭐⭐ | WhatsApp + Google Sheets working, shows in tenant sidebar |
| **Employee Directory** | ⭐⭐⭐⭐ | Department badges, seeded data looks professional |
| **Products + Customers** | ⭐⭐⭐⭐ | GSTIN, payment terms, HSN codes — Indian SME focused |
| **Builder Dashboard** | ⭐⭐⭐⭐ | Stats auto-update, quick actions, module graph |
| **Onboarding Wizard** | ⭐⭐⭐⭐ | 4-step flow, domain check, preset selection |
| **Tenant Login** | ⭐⭐⭐⭐ | Branded with app name, clean design |
| **Theme Toggle** | ⭐⭐⭐ | Light/dark mode works across all pages |

---

## 🎯 Fix Priority for Presentation

### DO NOW (< 10 min total)
| # | Fix | Time |
|---|---|---|
| 1 | Replace "RiTableLine" with "Table" in button text (3 files) | 2 min |
| 2 | Replace "RiTableLine" in modules page description text (1 file) | 1 min |
| 3 | Fix "need:from" and "collections:in" punctuation | 1 min |
| 5 | Hide Next.js dev toolbar via CSS | 1 min |
| 6 | Fix icon name leaks in comments (2 files) | 1 min |

### SHOULD FIX (< 30 min)
| # | Fix | Time |
|---|---|---|
| 4 | Fix attendance "Unknown" employee names | 10 min |
| 9 | Replace "Dummy Client" with real names in seed data | 10 min |
| 10 | Pre-fill company name from onboarding in quotation preview | 10 min |
| 8 | Shorten "Attendance Dashboard" sidebar label | 2 min |

### NICE TO HAVE
| # | Fix | Time |
|---|---|---|
| 7 | Add basic stats to tenant dashboard | 30 min |
| 11 | Fix slug uppercase display | 5 min |
| 15 | Uncomment CRM module if needed for demo | 1 min |

---

## 🎤 Recommended Demo Flow for Presentation
1. **Landing Page** → Show hero, scroll to features
2. **Sign Up** → Quick Google OAuth
3. **Onboarding** → Name app, pick Inventory preset, claim domain, launch
4. **Builder Dashboard** → Show stats, quick actions
5. **Module Marketplace** → Install Finance + HR modules (live)
6. **Browse Plugins** → Install WhatsApp (live)
7. **Manage Tables** → Show auto-created tables with fields
8. **"Open my ERP"** → Switch to tenant app
9. **Quotations** → ⭐ Star demo — show list, create new, live PDF preview
10. **Employee Directory** → Show seeded data, department badges
11. **WhatsApp Alerts** → Show plugin integration
12. **Theme Toggle** → Quick dark mode switch for wow factor
