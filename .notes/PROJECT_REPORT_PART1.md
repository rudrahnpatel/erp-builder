# ERP Builder Platform — Comprehensive Project Report

## Part 1: Overview, Motivation, Target Audience & Scope

---

## 1. Project Title

**ERP Builder Platform — A No-Code, Modular ERP Construction Toolkit for Indian SMEs**

---

## 2. Abstract

ERP Builder is a **meta-application** — a platform that lets small and medium enterprises (SMEs) design, assemble, and deploy their own custom Enterprise Resource Planning (ERP) systems without writing a single line of code. Unlike monolithic ERP solutions (Tally, Zoho, Odoo) that impose rigid workflows, ERP Builder provides a **modular, block-based composition engine** where business owners install pre-built module packs (Inventory, Finance, HR), customize schemas, compose pages from drag-and-drop blocks, and deploy a fully functional ERP runtime for their staff.

**Mental Model:**
- FlowCV is not a CV — it's a tool to *build* CVs.
- WooCommerce is not a store — it's a platform to *build* stores.
- **ERP Builder is not an ERP — it's a platform to *build* ERPs.**

---

## 3. Problem Statement

### 3.1 The SME Software Gap in India

India has over **63 million MSMEs** (Micro, Small & Medium Enterprises) contributing ~30% of GDP. Yet the vast majority operate on:
- **Paper registers and Excel spreadsheets** — error-prone, no automation
- **Tally / Busy** — accounting-focused, not holistic ERP
- **Zoho / Odoo** — expensive, complex, require technical staff to configure

### 3.2 Why Existing Solutions Fail for SMEs

| Problem | Impact |
|---|---|
| Rigid module structure | SMEs can't pick only what they need |
| High cost of customization | ₹2–10 lakh for Odoo/SAP implementation |
| No Indian-context defaults | No GST slabs, no GSTIN fields, no INR formatting out of the box |
| Technical expertise required | Need IT staff or consultants to configure |
| Vendor lock-in | Data trapped in proprietary formats |

### 3.3 The Gap We Fill

There is no platform that lets a non-technical Indian business owner:
1. **Browse** a marketplace of ERP modules
2. **Install** only what they need (Inventory today, HR next month)
3. **Customize** fields and pages without coding
4. **Deploy** a staff-facing ERP runtime instantly

ERP Builder fills this gap.

---

## 4. Project Objectives

1. Build a **dynamic schema engine** that lets users create tables and fields at runtime using JSON-column storage
2. Implement a **page composition engine** with drag-and-drop blocks (tables, kanban, metrics, forms, charts)
3. Design a **module pack system** where pre-built ERP modules can be installed, updated, and uninstalled
4. Create a **plugin architecture** for extending functionality (WhatsApp notifications, GST invoicing, payment gateways)
5. Deliver a **dual-interface system** — Builder UI for business owners, Runtime UI for staff
6. Support **Indian business context** — INR currency, GST tax slabs, Indian state dropdowns, Hindi i18n
7. Implement **dual authentication** — NextAuth JWT for builders, custom JWT for tenant staff

---

## 5. Target Audience

### 5.1 Primary Users

| User Type | Who They Are | What They Do |
|---|---|---|
| **Builder (Business Owner)** | SME owner, manager, or operations head | Configures the ERP — installs modules, designs schemas, composes pages, manages staff accounts |
| **Tenant User (Staff)** | Employees, warehouse staff, salespeople | Uses the deployed ERP — enters data, views reports, exports records |

### 5.2 Target Industries

- **Trading & Distribution** — Stock tracking, supplier management, purchase orders
- **Manufacturing** — BOM, work orders, quality checks, finished goods
- **Retail & FMCG** — Product catalogs, customer management, invoicing
- **Services** — HR management, attendance, payroll, leave tracking
- **Any Indian SME** with 5–200 employees needing a customizable ERP

### 5.3 Geographic Focus

**India** — All sample data, tax structures (GST slabs: 0/5/12/18/28%), currency (INR), state dropdowns, GSTIN validation, and phone validation (+91, 10-digit) are India-specific.

---

## 6. Scope

### 6.1 In Scope (Implemented)

| # | Feature | Status |
|---|---|---|
| 1 | Dynamic schema engine with 11 field types | ✅ Done |
| 2 | Page composer with 10 block types + drag-drop | ✅ Done |
| 3 | 3 module packs (Inventory, Finance, HR) | ✅ Done |
| 4 | 6 plugins (WhatsApp, Attendance, GST, Email, Leave, Razorpay) | ✅ Done |
| 5 | Module install / update / uninstall lifecycle | ✅ Done |
| 6 | Dual auth (Builder NextAuth + Tenant custom JWT) | ✅ Done |
| 7 | Tenant ERP runtime with AppShell | ✅ Done |
| 8 | Schema customization with override system | ✅ Done |
| 9 | Relation fields across tables | ✅ Done |
| 10 | Universal search (Ctrl+K command palette with Fuse.js) | ✅ Done |
| 11 | Hindi language support (i18n) | ✅ Done |
| 12 | Google SSO (optional) | ✅ Done |
| 13 | Indian phone/email validation | ✅ Done |
| 14 | GST calculator block | ✅ Done |
| 15 | CSV export with BOM for Excel | ✅ Done |
| 16 | Tenant user management | ✅ Done |
| 17 | Onboarding flow with workspace slug | ✅ Done |

### 6.2 Out of Scope (Future Work)

| Feature | Reason |
|---|---|
| Third-party plugin SDK with sandboxing | WordPress-level scope (~thousands of engineering-years) |
| Formula / rollup / lookup fields | Complex expression language + dependency graph |
| Real multi-tenancy with custom subdomains | Infrastructure complexity |
| Workflow / automation engine | 6+ month standalone project |
| Plugin marketplace with billing & ratings | Requires payment infrastructure |
| Mobile native app | Responsive web only for MVP |
| Real-time collaboration | WebSocket infrastructure |
| Version history / undo | Complex state management |
| Granular RBAC enforcement | UI exists, server-side checks deferred |

---

## 7. Feasibility Analysis

### 7.1 Technical Feasibility

| Aspect | Assessment |
|---|---|
| Next.js 14+ App Router | Mature, production-ready framework with SSR + API routes |
| PostgreSQL + Prisma | Industry-standard, JSONB support for dynamic schemas |
| Neon Serverless | Free tier sufficient for demo, zero DevOps |
| dnd-kit | Lightweight React DnD library, well-documented |
| Vercel deployment | Zero-config deployment, free tier available |

### 7.2 Operational Feasibility

- **3-member team** (Rudra — Backend, Jiya — Frontend, Milan — Integration)
- **3-week development timeline** (Apr 14 – May 2, 2026)
- **Agile methodology** with daily standups and weekly milestones

### 7.3 Economic Feasibility

| Resource | Cost |
|---|---|
| Neon PostgreSQL (free tier) | ₹0 |
| Vercel hosting (free tier) | ₹0 |
| Domain (optional) | ~₹800/year |
| Development tools (VS Code, Git) | ₹0 |
| **Total MVP cost** | **₹0 – ₹800** |

---

## 8. Literature Survey — Comparison with Existing Solutions

| Feature | Tally | Zoho | Odoo | Airtable | Notion | **ERP Builder** |
|---|---|---|---|---|---|---|
| Modular pack install | ✗ | Partial | ✓ | ✗ | ✗ | **✓** |
| No-code schema design | ✗ | ✗ | ✗ | ✓ | ✓ | **✓** |
| Drag-drop page composer | ✗ | ✗ | ✗ | ✗ | ✓ | **✓** |
| Indian GST built-in | ✓ | ✓ | Plugin | ✗ | ✗ | **✓** |
| INR / Hindi support | ✓ | ✓ | ✓ | ✗ | ✗ | **✓** |
| Staff runtime (tenant) | ✗ | ✓ | ✓ | ✗ | ✗ | **✓** |
| Free / open | ✗ | ✗ | Partial | ✗ | ✗ | **✓** |
| Plugin ecosystem | ✗ | ✓ | ✓ | ✗ | ✗ | **✓ (registry)** |
| Custom fields on modules | ✗ | ✗ | Partial | ✓ | ✓ | **✓** |

**Key differentiator:** ERP Builder combines the **schema flexibility of Airtable** with the **modular pack system of Odoo** and the **Indian business context of Tally** — in a single, free, no-code platform.

---

*End of Part 1. Continued in Part 2: Technology Stack & System Architecture.*
