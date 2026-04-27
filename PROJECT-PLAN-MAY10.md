# ERP Builder — Final Sprint Plan
**Today:** 2026-04-26 (Sun) · **Deadline:** 2026-05-10 (Sun) · **Days left: 15**

> Two-track delivery: **functional app + black book**.
> One missed track = one missed submission. Plan accordingly.

---

## 📐 Scope Lock — What We Are & Aren't Building

### ✅ MUST SHIP (demo-critical)
| # | Item | Owner |
|---|---|---|
| 1 | RELATION display values + chips end-to-end (Products → Suppliers visible) | Rudra → Jiya |
| 2 | `fields/sync` data-integrity fix (no record loss on schema edit) | Rudra |
| 3 | One plugin executing end-to-end (`whatsapp` OR `excel-export`, pick one) | Jiya |
| 4 | `prisma/seed.ts` — "Acme Traders" demo workspace one-command setup | Milan |
| 5 | Module Configure page verified pack-aware | Milan |
| 6 | FILTER_BAR runtime island connecting to TABLE_VIEW | Milan |
| 7 | Workspace stats dashboard tiles | Rudra → Milan |

### 🟡 NICE-TO-HAVE (only if Week 1 finishes early)
- Second plugin executor
- Recent activity feed on dashboard
- KANBAN_VIEW relation chips

### 🚫 CUT — explicitly NOT shipping (mention in "Future Scope" of black book)
- All 6 plugin executors (only 1 needed)
- Real WhatsApp/Razorpay/SMTP API calls (simulate in executor)
- Multi-workspace per user
- Real-time collaboration
- Mobile-first responsive ERP runtime
- Webhook system
- Audit logs UI
- Granular role permissions enforcement (UI exists, server-side checks WIP)
- Advanced chart block

---

## 📅 Calendar — Day-by-Day

### WEEK 1: Apr 26 – May 2 — **Code Freeze Sprint**
> Goal: end of week 2 May, all 7 must-ship items merged. **No new features after this date.**

| Date | Rudra | Jiya | Milan |
|---|---|---|---|
| **Sun 26 Apr** | R1: fix sync ID-preservation bug | J1: create `plugin-runtime.ts` types | M1: audit & fix Configure page pack-awareness |
| **Mon 27 Apr** | R2 part 1: relation resolver (single table) | J2: pick `excel-export.ts` executor (reuse existing CSV) | M2 part 1: scaffold `prisma/seed.ts` + Acme user/workspace |
| **Tue 28 Apr** | R2 part 2: batch resolver + tests | J2 cont: index map + first executor wired | M2 part 2: pre-install Inventory + 30 realistic records |
| **Wed 29 Apr** | R3: `/api/workspace/stats` endpoint | J3: `/api/plugins/[id]/execute` route | M2 part 3: seed 2 custom pages with side-by-side metrics |
| **Thu 30 Apr** | Buffer / unblock Jiya & Milan | J4: Test Plugin button + result toast | M3: FILTER_BAR client island wiring |
| **Fri 1 May** | R4: custom-field-update verification | J5: RELATION chips in TableView (consumes R2) | M4: dashboard quick-action tiles |
| **Sat 2 May** | **CODE FREEZE 11 PM** — full team bug bash | bug bash | bug bash + tag commit `v1.0-demo` |

### WEEK 2: May 3 – May 10 — **Black Book + Demo Polish**

| Date | Rudra | Jiya | Milan |
|---|---|---|---|
| **Sun 3 May** | Black book Ch 4 + 5 (System Analysis, Design) — reuse SYSTEM-DESIGN.md | Black book Ch 7 (UI screenshots — capture 25+) | Black book Ch 1 + 2 (Intro, Lit Survey) |
| **Mon 4 May** | Ch 6 (Implementation — backend, APIs, code samples) | Ch 6 (Implementation — frontend, blocks, plugin) | Ch 8 (Testing — write 10 test cases manually run) |
| **Tue 5 May** | Bug fixes from rehearsal | Bug fixes from rehearsal | **First end-to-end rehearsal** — log issues |
| **Wed 6 May** | Black book consolidation pass | Black book consolidation pass | Demo script polish + screen recording |
| **Thu 7 May** | Final API doc appendix | Final UI walkthrough appendix | Ch 3 (Requirements), Ch 9 (Conclusion + Future Scope) |
| **Fri 8 May** | **Black book draft complete by 6 PM** — review by all 3 | (same) | (same) |
| **Sat 9 May** | Print & bind black book | Final demo rehearsal #2 | Submission checklist + backup deployment |
| **Sun 10 May** | **SUBMIT** | **SUBMIT** | **SUBMIT** |

---

## 📖 Black Book Chapter Assignment

> Standard SY/TY engineering format — adjust per your college template.

| Ch | Title | Pages (approx) | Owner |
|---|---|---|---|
| – | Title page · Certificate · Declaration · Acknowledgement · Abstract | 6 | Milan (template) |
| 1 | Introduction (problem, motivation, objectives) | 4 | Milan |
| 2 | Literature Survey (Notion/Airtable/Zoho — what gap we fill) | 6 | Milan |
| 3 | Requirements (functional, non-functional, hardware/software) | 4 | Milan |
| 4 | System Analysis (use cases, feasibility, modules) | 6 | Rudra |
| 5 | System Design (ER, DFD, sequence, architecture) — **lift from `SYSTEM-DESIGN.md`** | 12 | Rudra |
| 6 | Implementation (tech stack, key code, snippets) | 14 | Rudra (backend) + Jiya (frontend) |
| 7 | Output / Screenshots (annotated UI walkthrough) | 12 | Jiya |
| 8 | Testing (test cases table, results) | 6 | Milan |
| 9 | Conclusion + Future Scope | 3 | Milan |
| – | References + Appendices (API list, schema dump) | 4 | Rudra |
| **Total** | | **~77 pages** | |

### Black Book Conventions (don't forget)
- **Font:** Times New Roman 12pt body, 14pt headings, 1.5 line spacing
- **Margins:** Left 1.5", Right/Top/Bottom 1"
- **Page numbers:** bottom-center, Roman for prelims, Arabic from Ch 1
- **Figures:** numbered `Fig 5.1`, captioned, referenced in text before they appear
- **Tables:** numbered `Table 3.1`, header row in bold
- **Bibliography:** IEEE format minimum 15 entries

---

## 🧪 Test Cases (for Ch 8) — Pre-decide These Now

| TC# | Module | Test | Expected | Actual |
|---|---|---|---|---|
| 1 | Auth | Builder signup with new email | Workspace created, redirected to dashboard | |
| 2 | Auth | Tenant login with wrong password | 401, error message shown | |
| 3 | Pack | Install Inventory pack | 7 tables + 4 pages created, marketplace shows installed | |
| 4 | Pack | Update Inventory v1.2 → v1.3 | Only missing fields added, existing data intact | |
| 5 | Schema | Add custom field to Stock | Field appears in TableView, records preserve data | |
| 6 | Composer | Drag METRIC block, set 1/2 width | Two metrics sit side-by-side | |
| 7 | Runtime | Add new Product record from form | Row appears in tenant table view |  |
| 8 | Relation | Pick Supplier on Product | Display name (not UUID) shown as chip | |
| 9 | Plugin | Run Excel Export on Products | CSV downloads with current rows | |
| 10 | i18n | Toggle to Hindi | Sidebar labels change to Devanagari | |

---

## 🎬 Demo Day Script (10 min)

1. **Cold start (60s)** — show `npm run db:seed && npm run dev` → log in as `demo@acme.in`
2. **Marketplace (60s)** — show installed Inventory pack, click "Update to v1.3"
3. **Schema designer (90s)** — add a custom field "Expiry Date" to Stock, publish
4. **Page composer (120s)** — drag in a METRIC block, drag handle to make it 1/2 width, drag another beside it. Publish.
5. **Plugin (60s)** — run Excel Export on Products, show CSV
6. **Tenant runtime (180s)** — open `acme.erpbuilder.app`, log in as staff, show Filter Bar narrowing the table, click a Supplier chip on a Product
7. **Hindi toggle (30s)** — flip language, sidebar updates
8. **Q&A buffer (60s)**

---

## ⚠️ Failure Modes — Pre-mortem

| Risk | Mitigation |
|---|---|
| Demo DB corrupts day-of | `prisma/seed.ts` is idempotent + recorded video backup ready by May 9 |
| Vercel deploy breaks during demo | Run from `localhost` in demo, deploy is a stretch |
| Black book printing queue jam on May 9 | Get one printed proof copy by May 7, final copies May 8 evening |
| One person sick last week | Each person owns sole chapters but the *code* is collectively understood — pair on hot paths through April |
| Internet dies | Pre-load all pages, kill all `useSWR` revalidate-on-focus during demo |

---

## 🔁 Standup Cadence (No Skipping)

- **Daily 9 PM** — 10-min text standup in WhatsApp: yesterday/today/blockers
- **Sat 2 May** — In-person bug bash, full integration run
- **Sat 9 May** — Final dry run with timer

---

## ✅ Submission Day (May 10) Checklist

- [ ] Black book printed × 3 copies (1 college, 1 guide, 1 backup)
- [ ] Demo laptop charged + spare charger
- [ ] Demo video on USB drive backup
- [ ] `git push` final commit by 11 PM May 9
- [ ] Github repo visibility set to college-required setting
- [ ] `README.md` has run instructions (Milan to verify)
- [ ] Plagiarism check on black book < 10%

---

*Update this file daily. If a Week 1 task slips past Sat 2 May code freeze, it's automatically cut to "future scope" — protect the black book time at all costs.*
