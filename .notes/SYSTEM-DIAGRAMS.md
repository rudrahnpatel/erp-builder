# ERP Builder — Comprehensive System Diagrams

This document contains 10 Mermaid diagrams capturing the entire architecture, data flow, and module structure of the ERP Builder application, based on the provided design files.

## 1. Entity Relationship Diagram (ERD)
Captures the isolated workspace model where builders manage tables, fields, records, and pages.

```mermaid
erDiagram
    User ||--o| Workspace : "owns (1-to-1)"
    Workspace ||--o{ Table : "has"
    Workspace ||--o{ Page : "has"
    Workspace ||--o{ InstalledPack : "has"
    Workspace ||--o{ InstalledPlugin : "has"
    Workspace ||--o{ TenantUser : "has"
    Table ||--o{ Field : "has"
    Table ||--o{ Record : "stores"
    InstalledPack ||--o{ WorkspaceSchemaOverride : "tracks deltas"

    User { string id PK string email }
    Workspace { string id PK string name string userId FK }
    Table { string id PK string name string workspaceId FK }
    Field { string id PK string name enum type string tableId FK }
    Record { string id PK json data string tableId FK }
    Page { string id PK string title json blocks }
    InstalledPack { string id PK string packId string packVersion }
    InstalledPlugin { string id PK string pluginId json config boolean enabled }
    TenantUser { string id PK string username string role }
```

## 2. Use Case Diagram
Illustrates the separate functionalities available to the Builder (Business Owner) versus the Tenant User (Staff).

```mermaid
flowchart LR
    Builder((Builder))
    Tenant((Tenant))
    
    subgraph ERP_System ["ERP Builder System"]
        UC1(Design Schemas & Tables)
        UC2(Compose Pages visually)
        UC3(Install Modules/Plugins)
        UC4(View Dashboards)
        UC5(Manage Data Records)
        UC6(Generate Invoices & Run Workflows)
    end
    
    Builder --> UC1
    Builder --> UC2
    Builder --> UC3
    Builder --> UC4
    Builder --> UC5
    
    Tenant --> UC4
    Tenant --> UC5
    Tenant --> UC6
```

## 3. Class Diagram
Represents the data structures that define packs, tables, pages, and plugins in the registry.

```mermaid
classDiagram
    class PackDefinition {
        +String id
        +String name
        +Array tables
        +Array pageDefinitions
        +install()
    }
    class Table {
        +String name
        +String icon
        +Array fields
        +create()
    }
    class Page {
        +String title
        +Array blocks
        +render()
    }
    class PluginDefinition {
        +String id
        +Array configFields
        +Array triggers
        +execute()
    }
    PackDefinition "1" *-- "many" Table
    PackDefinition "1" *-- "many" Page
```

## 4. Activity Diagram
Visualizes the process of a Tenant User requesting a custom page and the system rendering dynamic blocks.

```mermaid
stateDiagram-v2
    [*] --> FetchPageInfo: User requests page
    FetchPageInfo --> FetchBlocks: System fetches blocks JSON
    FetchBlocks --> RenderBlocks
    
    state RenderBlocks {
        [*] --> CheckBlockType
        CheckBlockType --> RenderTable : if type == TABLE_VIEW
        CheckBlockType --> RenderMetric : if type == METRIC
        CheckBlockType --> RenderForm : if type == FORM
        CheckBlockType --> RenderCalendar : if type == CALENDAR_VIEW
    }
    
    RenderBlocks --> DisplayPage
    DisplayPage --> [*]
```

## 5. Sequence Diagram
Demonstrates a plugin execution flow (e.g., generating a PDF invoice or making an external API call).

```mermaid
sequenceDiagram
    actor User
    participant UI as ERP Interface
    participant PluginAPI as /api/plugins/execute
    participant DB as PostgreSQL
    participant ExternalSystem as External Service (e.g. MSG91, Tally)

    User->>UI: Click Plugin Action (e.g. Generate PDF)
    UI->>PluginAPI: POST { pluginId, recordId }
    PluginAPI->>DB: Fetch InstalledPlugin config + Record data
    DB-->>PluginAPI: Config & Data JSON
    PluginAPI->>ExternalSystem: Execute external API call
    ExternalSystem-->>PluginAPI: Response (PDF link / Status)
    PluginAPI-->>UI: Action Result
    UI-->>User: Visual Feedback
```

## 6. State Transition Diagram
Shows the lifecycle of a typical entity, using Service Tickets from the Service & Maintenance Pack as an example.

```mermaid
stateDiagram-v2
    [*] --> Open: Ticket raised
    Open --> InProgress: Assigned to Engineer
    InProgress --> OnHold: Waiting for spare parts
    OnHold --> InProgress: Parts received
    InProgress --> Resolved: Issue fixed
    Resolved --> Closed: Verified by customer
    Closed --> [*]
```

## 7. Deployment Diagram
Illustrates the physical architecture involving Vercel hosting, Next.js, Prisma ORM, and Neon Database.

```mermaid
flowchart TD
    subgraph Client ["Client Device"]
        Browser["Web Browser (React)"]
    end
    
    subgraph Cloud ["Vercel Serverless"]
        Frontend["Next.js App Router (UI)"]
        API["Next.js API Routes"]
        Prisma["Prisma ORM Engine"]
    end
    
    subgraph Database ["Neon Serverless DB"]
        PostgreSQL[("PostgreSQL Database")]
    end

    Browser <-->|HTTPS| Frontend
    Browser <-->|HTTPS / REST| API
    Frontend <--> API
    API <--> Prisma
    Prisma <-->|Connection Pool| PostgreSQL
```

## 8. Module Hierarchy Diagram
Maps out the dependencies across available ERP packs.

```mermaid
flowchart TD
    INV["📦 Inventory Pack\n(base)"]
    FIN["💰 Finance Pack"]
    CRM["🤝 CRM Pack\n(standalone)"]
    HR["👥 HR Pack\n(standalone)"]
    MFG["🏭 Manufacturing Pack"]
    FS["🚐 Field Sales Pack"]
    SVC["🔧 Service Pack"]

    INV -->|"Customers → Invoices"| FIN
    INV -->|"Products, Godowns"| MFG
    INV -->|"Products, Customers"| FS
    INV -.->|"optional: Customers"| SVC
    CRM -.->|"optional: link to Customers"| INV
```

## 9. System Architecture Diagram
Details the high-level routing separation between Builder dashboard and Tenant runtime.

```mermaid
flowchart TD
    subgraph Users ["👥 Users"]
        BUILDER["🏗️ Builder (Owner)"]
        TENANT["👷 Tenant User (Staff)"]
    end

    subgraph AppRouter ["⚛️ Next.js 16"]
        UI_Builder["Builder Routes /(dashboard)"]
        UI_Tenant["Tenant Runtime /apps/[slug]"]
        APIs["API Routes /api/*"]
    end

    subgraph Infrastructure ["🗄️ Backend Services"]
        Prisma["Prisma ORM"]
        Neon[("Neon PostgreSQL")]
        Registry["Pack Registry (registry.ts)"]
    end

    BUILDER --> UI_Builder
    TENANT --> UI_Tenant
    UI_Builder --> APIs
    UI_Tenant --> APIs
    APIs --> Prisma
    Prisma --> Neon
    APIs -.->|reads| Registry
```

## 10. Authentication Flow Diagram
Clarifies the dual-authentication strategy using NextAuth for Builders and Custom JWTs for Tenants.

```mermaid
flowchart TD
    subgraph BuilderAuth ["🔐 Builder Auth (NextAuth)"]
        LoginBuilder["Visit /login"] --> OAuth["Email/Password or Google SSO"]
        OAuth --> VerifyBuilder{"Valid?"}
        VerifyBuilder -->|Yes| SessionBuilder["Set NextAuth JWT Cookie"]
    end

    subgraph TenantAuth ["🔐 Tenant Auth (Custom)"]
        LoginTenant["Visit /apps/slug/login"] --> CredsTenant["Username + Password"]
        CredsTenant --> VerifyTenant{"Valid?"}
        VerifyTenant -->|Yes| SessionTenant["Set 'tenant-token' JWT Cookie"]
    end

    SessionBuilder --> Workspace["Redirect → /workspace"]
    SessionTenant --> ERP["Redirect → /apps/slug"]
```
