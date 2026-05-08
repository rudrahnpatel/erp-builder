# ERP Builder — Modules, Plugins & Blocks Design Guide

> Har suggested module ka schema, pages, relations — aur plugins/blocks kaise add karein.
> All diagrams are in Mermaid format — GitHub renders them automatically.
> Use [mermaid.live](https://mermaid.live) to open any individual block interactively.

---

## 1. Module Architecture (How Packs Work)

A **Pack** = a `PackDefinition` object in `registry.ts`. Installing it **materialises** tables, fields, seed data, and pages into the workspace DB.

```mermaid
flowchart TD
    subgraph CodeLayer["📦 Code Layer"]
        REG["PackDefinition\nregistry.ts"]
        REG --- T["tables[\n  name, icon,\n  fields[], seedData[]\n]"]
        REG --- P["pageDefinitions[\n  key, title,\n  blocks[]\n]"]
    end

    subgraph InstallAPI["⚙️ POST /api/packs/install"]
        I1["Create Table rows"]
        I2["Create Field rows\n(resolve RELATION → real tableId)"]
        I3["Create Record rows\n(seed data keyed by fieldId)"]
        I4["Create Page rows\n(resolve tableRef → tableId)"]
        I5["Create InstalledPack row"]
    end

    subgraph DB["🗄️ PostgreSQL"]
        DBT["Tables"]
        DBF["Fields"]
        DBR["Records"]
        DBP["Pages"]
        DBI["InstalledPack"]
    end

    REG -->|read| InstallAPI
    I1 --> DBT
    I2 --> DBF
    I3 --> DBR
    I4 --> DBP
    I5 --> DBI
```

**Rule:** RELATION fields sirf un tables ko link kar sakte hain jo pack mein **pehle** define hue hain (order matters during fresh install).

---

## 2. Suggested Module Packs

---

### 2.1 CRM & Sales Pack

**Category:** Sales · **Badge:** Free · **Target:** B2B businesses

```mermaid
erDiagram
    Leads {
        string Name PK
        string Company
        string Phone
        string Email
        enum Source "IndiaMART | Reference | Website | Cold Call"
        enum Status "New | Contacted | Qualified | Lost"
        string AssignedTo
        string Notes
    }
    Companies {
        string CompanyName PK
        string Industry
        string City
        enum State "Indian states dropdown"
        string GSTIN
        string Website
        currency AnnualRevenue "INR"
    }
    Contacts {
        string FullName PK
        string Phone
        string Email
        string Designation
        string WhatsApp
    }
    Deals {
        string DealTitle PK
        currency Value "INR"
        enum Stage "Prospect | Proposal | Negotiation | Won | Lost"
        date ExpectedClose
        string AssignedTo
    }
    Activities {
        enum Type "Call | Meeting | Email | Demo"
        date Date
        string Notes
        boolean Done
    }
    Quotations {
        string QuoteNo PK
        date Date
        date ValidUntil
        currency Total "INR"
        enum Status "Draft | Sent | Accepted | Rejected"
    }

    Companies ||--o{ Contacts : "has"
    Companies ||--o{ Deals : "has"
    Deals ||--o{ Activities : "has"
    Deals ||--o{ Quotations : "has"
```

#### Pages

```mermaid
flowchart LR
    subgraph CRMPages["📄 CRM Pages"]
        D["CRM Dashboard\n─────────\nMETRIC: Total Deals\nMETRIC: Won This Month\nMETRIC: Pipeline Value\nTABLE_VIEW: Recent Deals"]
        LP["Lead Pipeline\n─────────\nFILTER_BAR\nKANBAN_VIEW\ngroupBy: Status"]
        DP["Deal Pipeline\n─────────\nFILTER_BAR\nKANBAN_VIEW\ngroupBy: Stage"]
        CL["Contacts\n─────────\nFILTER_BAR\nTABLE_VIEW"]
        AL["Activities Log\n─────────\nFILTER_BAR\nTABLE_VIEW\nEXPORT_BUTTON"]
    end
```

---

### 2.2 HR & Payroll Pack

**Category:** HR & Payroll · **Badge:** Free · **Target:** 10–200 person companies

```mermaid
erDiagram
    Departments {
        string DeptName PK
        string ManagerName
        string Location
    }
    Employees {
        string EmployeeID PK
        string FullName
        string Designation
        date DateOfJoining
        string Phone
        string Email
        string AadhaarNo
        string PANNo
        string BankAccount
        string IFSC
        enum SalaryType "Fixed | Variable"
        currency BasicSalary "INR"
        boolean PFEnrolled
        boolean ESIEnrolled
        enum Status "Active | Resigned | Terminated"
    }
    LeaveTypes {
        string LeaveName PK "CL | SL | PL | Maternity"
        int AnnualQuota
        boolean CarryForward
    }
    LeaveRequests {
        date FromDate
        date ToDate
        int Days
        string Reason
        enum Status "Pending | Approved | Rejected"
        string ApprovedBy
    }
    Attendance {
        date Date
        string CheckIn
        string CheckOut
        number HoursWorked
        enum Status "Present | Absent | Half Day | WFH"
    }
    SalarySlips {
        string Month
        string Year
        currency Basic "INR"
        currency HRA "INR"
        currency SpecialAllowance "INR"
        currency Gross "INR"
        currency PFDeduction "INR"
        currency ESIDeduction "INR"
        currency TDS "INR"
        currency NetPayable "INR"
        enum Status "Draft | Paid"
    }

    Departments ||--o{ Employees : "has"
    Employees ||--o{ LeaveRequests : "applies"
    Employees ||--o{ Attendance : "logs"
    Employees ||--o{ SalarySlips : "receives"
    LeaveTypes ||--o{ LeaveRequests : "categorises"
```

#### Pages

```mermaid
flowchart LR
    subgraph HRPages["📄 HR Pages"]
        HD["HR Dashboard\n─────────\nMETRIC: Total Employees\nMETRIC: On Leave Today\nMETRIC: Pending Approvals\nTABLE_VIEW: Attendance"]
        ED["Employee Directory\n─────────\nFILTER_BAR\nTABLE_VIEW\nEXPORT_BUTTON"]
        LM["Leave Mgmt\n─────────\nFILTER_BAR\nKANBAN_VIEW\ngroupBy: Status"]
        PR["Payroll\n─────────\nFILTER_BAR\nTABLE_VIEW\nEXPORT_BUTTON"]
    end
```

---

### 2.3 Manufacturing Pack

**Category:** Operations · **Badge:** Free · **Target:** Factories, workshops

```mermaid
erDiagram
    RawMaterials {
        string MaterialName PK
        string Unit
        number CurrentStock
        number ReorderLevel
        currency Price "INR"
    }
    BOM {
        string ProductName PK
        string Version
        string Notes
    }
    BOMItems {
        number QtyRequired
        string Unit
    }
    WorkOrders {
        string WONumber PK
        number QtyToProduce
        date StartDate
        date EndDate
        enum Status "Planned | In Progress | Completed | On Hold"
        string AssignedLine
    }
    QualityChecks {
        date CheckDate
        string Inspector
        enum Result "Pass | Fail"
        number DefectsFound
        string Notes
    }
    FinishedGoods {
        string ProductName
        number QtyProduced
        date ProductionDate
        string BatchNo
    }

    BOM ||--o{ BOMItems : "has"
    RawMaterials ||--o{ BOMItems : "used in"
    BOM ||--o{ WorkOrders : "produces"
    WorkOrders ||--o{ QualityChecks : "inspected"
    WorkOrders ||--o{ FinishedGoods : "outputs"
```

---

### 2.4 Field Sales Pack

**Category:** Sales · **Target:** FMCG distributors, traders

```mermaid
erDiagram
    Salespeople {
        string Name PK
        string Phone
        string VehicleNo
        currency TargetPerMonth "INR"
    }
    Routes {
        string RouteName PK
        string AreasCovered
    }
    VanOrders {
        string OrderNo PK
        date Date
        currency Total "INR"
        enum Status "Pending | Delivered | Partial | Cancelled"
    }
    VanOrderItems {
        number Qty
        currency Rate "INR"
        currency Amount "INR"
    }
    Collections {
        date Date
        currency AmountCollected "INR"
        enum PaymentMode "Cash | UPI | Cheque"
        string Notes
    }

    Salespeople ||--o{ Routes : "assigned"
    Salespeople ||--o{ VanOrders : "creates"
    Salespeople ||--o{ Collections : "collects"
    VanOrders ||--o{ VanOrderItems : "has"
```

---

### 2.5 Service & Maintenance Pack

**Category:** Operations · **Target:** AMC / repair companies

```mermaid
erDiagram
    ServiceTickets {
        string TicketNo PK
        string IssueDescription
        enum Priority "Low | Medium | High | Critical"
        enum Status "Open | In Progress | Resolved | Closed"
        date CreatedDate
        date ResolvedDate
    }
    Engineers {
        string Name PK
        string Phone
        string Specialisation
        string Location
    }
    AMCContracts {
        string ProductEquipment
        date StartDate
        date EndDate
        currency Amount "INR"
        number VisitsPerYear
        enum Status "Active | Expired"
    }
    ServiceVisits {
        date VisitDate
        string WorkDone
        string PartsUsed
        currency LabourCharge "INR"
        enum Status "Scheduled | Done"
    }
    SpareParts {
        string PartName PK
        string PartNo
        string CompatibleEquipment
        number StockQty
        currency Price "INR"
    }

    ServiceTickets ||--o{ ServiceVisits : "has"
    Engineers ||--o{ ServiceVisits : "performs"
    AMCContracts ||--o{ ServiceTickets : "raises"
```

---

### 2.6 Module Dependency Graph

```mermaid
flowchart TD
    INV["📦 Inventory Pack\n(base)\n─────────\nProducts, Stock,\nSuppliers, Customers,\nGodowns, Purchase Orders"]

    FIN["💰 Finance Pack\n─────────\nInvoices, Expenses,\nPayment Receipts"]

    CRM["🤝 CRM Pack\n(standalone)\n─────────\nLeads, Companies,\nContacts, Deals"]

    HR["👥 HR Pack\n(standalone)\n─────────\nDepartments, Employees,\nAttendance, Payroll"]

    MFG["🏭 Manufacturing Pack\n─────────\nBOM, Work Orders,\nQuality Checks"]

    FS["🚐 Field Sales Pack\n─────────\nSalespeople, Routes,\nVan Orders, Collections"]

    SVC["🔧 Service Pack\n─────────\nTickets, Engineers,\nAMC, Spare Parts"]

    INV -->|"Customers → Invoices"| FIN
    INV -->|"Products, Godowns"| MFG
    INV -->|"Products, Customers"| FS
    INV -.->|"optional: Customers"| SVC
    CRM -.->|"optional: link to Customers"| INV
```

---

## 3. Plugin Architecture

### How Plugins Work

```mermaid
sequenceDiagram
    actor Builder
    participant UI as Plugins Page
    participant API as /api/plugins/install
    participant DB as PostgreSQL
    participant EXT as External API

    Builder->>UI: Click "Install" on plugin card
    UI->>API: POST { pluginId: "pdf-invoice" }
    API->>DB: InstalledPlugin.create { pluginId, config: {}, enabled: true }
    DB-->>API: OK
    API-->>UI: Plugin installed

    Note over Builder,EXT: ── CONFIGURE ──
    Builder->>UI: Fill config (Company Name, GSTIN, Logo)
    UI->>API: PATCH /api/plugins/:id/config { config: {...} }
    API->>DB: Update InstalledPlugin.config
    DB-->>API: OK

    Note over Builder,EXT: ── TRIGGER FIRES ──
    Builder->>UI: Click "Generate PDF" on Invoice row
    UI->>API: POST /api/plugins/execute { pluginId, recordId }
    API->>DB: Read plugin config + record data
    API->>EXT: Call external API or generate locally
    EXT-->>API: Result (PDF / payment link / XML)
    API-->>UI: Return result to user
```

### Plugin Trigger Types

```mermaid
flowchart LR
    subgraph Triggers["⚡ Trigger Types"]
        RC["record.create\nNew record added"]
        RU["record.update\nRecord modified"]
        RD["record.delete\nRecord removed"]
        SD["schedule.daily\nCron - once per day"]
        SW["schedule.weekly\nCron - once per week"]
        MN["manual\nUser clicks button"]
    end

    subgraph Examples["💡 Examples"]
        E1["New Customer → Welcome SMS"]
        E2["Stock below Reorder → WhatsApp alert"]
        E3["Record audit log"]
        E4["Overdue invoice reminder"]
        E5["Payroll reminder"]
        E6["Export to Tally XML"]
    end

    RC --> E1
    RU --> E2
    RD --> E3
    SD --> E4
    SW --> E5
    MN --> E6
```

---

### Suggested New Plugins

```mermaid
flowchart TD
    subgraph Plugins["🔌 New Plugins"]
        PDF["📄 PDF Invoice Generator\n─────────\nconfig: companyName, GSTIN, logo, bank\ntrigger: manual on Invoices\nuses: jsPDF / react-pdf"]
        UPI["💳 UPI Payment Link\n─────────\nconfig: upiId, merchantName\ntrigger: manual on Invoices\ngenerates: upi:// deeplink + QR"]
        GS["📊 Google Sheets Sync\n─────────\nconfig: spreadsheetId, serviceAccount\ntrigger: record.create + daily cron\ndirection: ERP↔Sheets"]
        TLY["🧮 Tally Export\n─────────\nconfig: companyName\ntrigger: manual on Invoices/Expenses\noutput: Tally-compatible XML"]
        EWB["🚛 E-Way Bill\n─────────\nconfig: GST credentials, NIC API key\ntrigger: record.create on Stock Movements\ncalls: NIC E-Way Bill API"]
        SMS["📱 SMS via MSG91\n─────────\nconfig: apiKey, senderId\ntrigger: record.create on any table\nsends: transactional SMS"]
    end
```

#### Plugin Config Structure

```mermaid
flowchart LR
    subgraph PluginDef["PluginDefinition (registry)"]
        ID["id: 'pdf-invoice'"]
        NM["name: 'PDF Invoice Generator'"]
        IC["icon: 'file-text'"]
        CF["configFields:\n  companyName (text)\n  companyGSTIN (text)\n  logoUrl (text)\n  bankDetails (textarea)"]
        TR["triggers:\n  event: manual\n  table: Invoices\n  label: Generate PDF"]
    end

    subgraph DBRow["InstalledPlugin (DB)"]
        PID["pluginId: 'pdf-invoice'"]
        CFG["config: JSON\n  actual values filled by builder"]
        EN["enabled: true"]
    end

    PluginDef -->|install| DBRow
```

---

## 4. New Block Types

### Currently Existing

```mermaid
flowchart LR
    subgraph Existing["✅ Existing Blocks"]
        TEXT["TEXT\nHeading + desc"]
        METRIC["METRIC\nKPI card"]
        TV["TABLE_VIEW\nData grid"]
        KV["KANBAN_VIEW\nDrag-drop board"]
        FB["FILTER_BAR\nSearch + date"]
        FORM["FORM\nRecord form"]
        EB["EXPORT_BUTTON\nCSV download"]
        IMG["IMAGE\nLogo / banner"]
        GST["GST_CALCULATOR\nTax calc"]
        CH["CHART\nBar chart"]
        ATT["ATTENDANCE_LOG\nCheck in/out"]
    end
```

### Suggested New Blocks

```mermaid
flowchart TD
    subgraph NewBlocks["🆕 Suggested Blocks"]
        CAL["📅 CALENDAR_VIEW\n─────────\nconfig:\n  tableRef, dateField,\n  titleField, colorField\n─────────\nShows records on\nmonth/week calendar"]

        SSB["📊 SUMMARY_STATS_BAR\n─────────\nconfig:\n  tableRef,\n  stats: count, sum,\n  avg, count_where\n─────────\nHorizontal stat cards"]

        TL["📏 TIMELINE_VIEW\n─────────\nconfig:\n  tableRef, startDate,\n  endDate, labelField\n─────────\nGantt-style bars"]

        AF["✅ APPROVAL_FLOW\n─────────\nconfig:\n  tableRef, statusField,\n  pendingValue, approvedValue\n─────────\nApprove/Reject buttons"]

        MV["🗺️ MAP_VIEW\n─────────\nconfig:\n  tableRef, cityField,\n  stateField, labelField\n─────────\nIndia map with pins"]
    end
```

#### Calendar View — Data Flow

```mermaid
sequenceDiagram
    participant Composer as Page Composer
    participant DB as PostgreSQL
    participant Runtime as ERP Runtime

    Composer->>DB: Save block { type: CALENDAR_VIEW, config: { tableRef: "Leave Requests", dateField: "From Date", titleField: "Employee" } }

    Runtime->>DB: GET /api/tables/:id/records
    DB-->>Runtime: All Leave Request records
    Runtime->>Runtime: Map each record to calendar event { date: record[dateField], title: record[titleField], color: by Status }
    Runtime-->>Runtime: Render month grid with event chips
```

#### Approval Flow — Data Flow

```mermaid
sequenceDiagram
    actor Manager
    participant UI as Approval Flow Block
    participant API as /api/tables/:id/records/:rid
    participant DB as PostgreSQL

    UI->>API: GET records WHERE Status = "Pending"
    API->>DB: SELECT * FROM records
    DB-->>API: Filtered records
    API-->>UI: Pending items list

    Manager->>UI: Click "Approve" on Leave Request
    UI->>API: PATCH { data: { statusFieldId: "Approved" } }
    API->>DB: Record.update
    DB-->>API: OK
    API-->>UI: Row moves to Approved
```

---

## 5. How to Add a New Module (Step by Step)

```mermaid
flowchart TD
    S1["Step 1\nDefine PackDefinition\nin registry.ts\n─────────\nid, name, category,\ntables[], pageDefinitions[]"]
    S2["Step 2\nRegister in\nsrc/lib/packs/index.ts\n─────────\nAdd to packRegistry array"]
    S3["Step 3\nAutomatic!\n─────────\ncategory field puts it\nunder correct Marketplace tab"]
    S4["Step 4\nDone! ✅\n─────────\nInstall/Update/Uninstall\nhandled by existing system"]

    S1 --> S2 --> S3 --> S4
```

---

## 6. How to Add a New Plugin (Step by Step)

```mermaid
flowchart TD
    P1["Step 1\nDefine PluginDefinition\nin src/lib/plugins/registry.ts\n─────────\nid, name, icon, configFields[],\ntriggers[]"]
    P2["Step 2\nAdd to allPlugins array\nin same file"]
    P3["Step 3\nHandle trigger\nin TableView or cron\n─────────\nmanual → row action button\nrecord.* → API middleware\nschedule → cron job"]

    P1 --> P2 --> P3
```

---

## 7. How to Add a New Block (Step by Step)

```mermaid
flowchart TD
    B1["Step 1\nAdd to BlockType\nin src/types/block.ts\n─────────\nCALENDAR_VIEW\nSUMMARY_STATS_BAR\netc."]
    B2["Step 2\nCreate Component\nin src/components/blocks/\n─────────\nCalendarView.tsx\nSummaryStatsBar.tsx"]
    B3["Step 3\nRegister in\nBlockRenderer\n─────────\ncase CALENDAR_VIEW:\n  return CalendarView"]
    B4["Step 4\nAdd to Block Palette\nin Page Editor\n─────────\nlabel + icon in palette list"]
    B5["Step 5\nAdd Inspector Config\nin Properties Panel\n─────────\nConfig fields builder can edit"]

    B1 --> B2 --> B3 --> B4 --> B5
```

---

*End of Design Guide — ERP Builder capstone project.*
