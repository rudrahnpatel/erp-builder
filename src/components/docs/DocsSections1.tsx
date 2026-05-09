"use client";

import {
  DocH1, DocH2, DocP, DocCallout, DocSteps, DocCards, DocList, DocDivider,
} from "./DocsPrimitives";

/* ── Getting Started ── */
export function SectionGettingStarted() {
  return (
    <section>
      <DocH1>Help & Documentation</DocH1>
      <DocP>
        Welcome! This guide will help you set up and use your custom ERP -
        from installing your first module to inviting your team.
      </DocP>

      <DocH2 id="what-is-mosaic">What is Mosaic?</DocH2>
      <DocP>
        Mosaic is an <strong>ERP builder</strong> - it lets you assemble a
        business management system tailored to exactly what your business needs.
        Instead of paying for a rigid, expensive ERP software, you pick and
        install only the modules you need, then customize the pages your team
        will use every day.
      </DocP>
      <DocCards
        items={[
          {
            icon: "📦",
            title: "Module Packs",
            desc: "Ready-made bundles like Inventory, CRM, or HR that instantly add the right tables and pages to your workspace.",
          },
          {
            icon: "🧩",
            title: "Page Builder",
            desc: "Drag and drop blocks onto a canvas to design exactly what your staff sees when they open the app.",
          },
          {
            icon: "🔌",
            title: "Plugins",
            desc: "Add-ons that connect your ERP to the outside world - generate PDF invoices, send SMS alerts, export to Tally, and more.",
          },
          {
            icon: "👷",
            title: "Tenant Access",
            desc: "Give your staff their own login. They use the finished ERP - they never see the builder side.",
          },
        ]}
      />

      <DocDivider />

      <DocH2 id="two-user-types">Builder vs Tenant - Who is Who?</DocH2>
      <DocP>
        Mosaic has two kinds of people. Understanding this is the most
        important thing before you start.
      </DocP>
      <DocCards
        items={[
          {
            icon: "🏗️",
            title: "You - the Builder",
            desc: "You set everything up. You install modules, design pages, create fields, and manage staff accounts. You work inside /workspace.",
          },
          {
            icon: "👨‍💼",
            title: "Your Staff - Tenant Users",
            desc: "They log in at a separate URL and just use the ERP you built. They add records, view dashboards, and do their daily work. They never see the builder.",
          },
        ]}
      />
      <DocCallout type="info">
        Your staff logs in at <strong>/apps/your-workspace-name/login</strong> - not the main login page. You create their accounts in Settings → Tenant Users.
      </DocCallout>

      <DocDivider />

      <DocH2 id="quick-start">Quick Start - Up and running in 5 minutes</DocH2>
      <DocSteps
        steps={[
          {
            title: "Create your account",
            desc: 'Go to /register and sign up. Give your workspace a name - something like "Acme Traders" or your business name.',
          },
          {
            title: "Install a Module",
            desc: 'Click "Modules" in the left sidebar. Browse the available modules and click Install on the one that fits your business - Inventory is a great starting point.',
          },
          {
            title: "See what was created",
            desc: "After installing, check the Pages section. Mosaic auto-created dashboard pages for you. Click into any page to start customizing.",
          },
          {
            title: "Open your ERP",
            desc: 'Click "Open My ERP" at the bottom of the sidebar. This opens the tenant view - what your staff will see. You can use it yourself too!',
          },
          {
            title: "Invite your staff",
            desc: "Go to Settings → Tenant Users → Add User. Set a username and password, then share the login link with your team.",
          },
        ]}
      />
    </section>
  );
}

/* ── Modules ── */
export function SectionModules() {
  return (
    <section>
      <DocH2 id="what-are-modules">What are Modules?</DocH2>
      <DocP>
        Modules (also called Packs) are pre-built bundles that add a complete
        set of tables and pages to your workspace in one click. Think of them
        like apps you install on your phone - each one adds new functionality.
      </DocP>
      <DocCallout type="tip">
        You can install multiple modules together. For example, Inventory + Finance gives you products, stock, suppliers, and invoicing all linked up automatically.
      </DocCallout>

      <DocH2 id="installing-modules">Installing a Module</DocH2>
      <DocSteps
        steps={[
          {
            title: "Go to Modules",
            desc: "Click Modules in the left sidebar to open the Module Marketplace.",
          },
          {
            title: "Browse and pick one",
            desc: "Each module card shows what tables and pages it includes. Read the description to find what fits your business.",
          },
          {
            title: "Click Install",
            desc: "Mosaic automatically creates all the tables, fields, and dashboard pages for that module. A success message confirms it's ready.",
          },
          {
            title: "Start using it",
            desc: "Go to Pages - you'll see the new pages created. Open your ERP to see the live version your staff will use.",
          },
        ]}
      />
      <DocCallout type="warning">
        Uninstalling a module deletes all its tables and the data inside them. Make sure you export any important data before uninstalling.
      </DocCallout>

      <DocH2 id="available-modules">Available Modules</DocH2>
      <DocCards
        items={[
          {
            icon: "📦",
            title: "Inventory",
            desc: "Products, suppliers, stock movements, purchase orders, customers, and godowns. Best for trading, retail, distribution.",
          },
          {
            icon: "💰",
            title: "Finance",
            desc: "Invoices, expenses, and payment receipts. Works best alongside Inventory to auto-link customers and products.",
          },
          {
            icon: "🤝",
            title: "CRM & Sales",
            desc: "Leads, companies, contacts, deals, activities, and quotations. For B2B sales teams managing a pipeline.",
          },
          {
            icon: "👥",
            title: "HR & Payroll",
            desc: "Departments, employees, attendance, leave management, and salary slips. For teams of 10–200 people.",
          },
          {
            icon: "🏭",
            title: "Manufacturing",
            desc: "Bill of materials, work orders, quality checks, and finished goods tracking. For factories and workshops.",
          },
          {
            icon: "🚐",
            title: "Field Sales",
            desc: "Salespeople, routes, van orders, and collections. For FMCG distributors and field sales teams.",
          },
          {
            icon: "🔧",
            title: "Service & AMC",
            desc: "Service tickets, engineers, AMC contracts, service visits, and spare parts. For repair and maintenance companies.",
          },
        ]}
      />
    </section>
  );
}

/* ── Page Builder ── */
export function SectionPageBuilder() {
  return (
    <section>
      <DocH2 id="composing-pages">Composing a Page</DocH2>
      <DocP>
        Every page your staff sees is built in the Page Composer. You drag
        blocks onto a canvas, configure each one, and hit Publish. It's
        similar to building a slide in PowerPoint - but the blocks are live
        and connected to your data.
      </DocP>
      <DocSteps
        steps={[
          {
            title: "Open a page to edit",
            desc: 'Go to Pages in the sidebar. Click the edit (pencil) icon on any page, or create a new one with the + button.',
          },
          {
            title: "Add blocks from the palette",
            desc: "The right panel shows all available blocks. Click any block to add it to the canvas, or drag it to a specific position.",
          },
          {
            title: "Configure the block",
            desc: "Click a block on the canvas to select it. The inspector panel on the right lets you set what table it shows, what width it takes up, and other settings.",
          },
          {
            title: "Publish the page",
            desc: "Click the Publish button at the top. Your changes go live immediately - refresh the tenant view to see them.",
          },
        ]}
      />
      <DocCallout type="tip">
        Width snaps to preset fractions - ¼, ½, ¾, or full width. Two half-width blocks sit side-by-side automatically, letting you build multi-column layouts.
      </DocCallout>

      <DocH2 id="block-types">What Each Block Does</DocH2>
      <DocCards
        items={[
          { icon: "📊", title: "Metric", desc: "A KPI card showing a count, total, or custom number. Great for dashboards - e.g. Total Products, Revenue This Month." },
          { icon: "📋", title: "Table View", desc: "A full data grid showing all records in a table. Staff can add, edit, and delete rows directly from here." },
          { icon: "🗂️", title: "Kanban View", desc: "A drag-and-drop board grouped by a field like Status or Stage. Ideal for leads, orders, or tasks." },
          { icon: "🔍", title: "Filter Bar", desc: "Adds a search box and date filter above a table or kanban. Helps staff find records quickly." },
          { icon: "📝", title: "Form", desc: "A clean form for adding new records. Auto-generated from your table's fields." },
          { icon: "⬇️", title: "Export Button", desc: "One-click CSV download of any table's data. Opens correctly in Excel with Indian Rupee formatting." },
          { icon: "🧮", title: "GST Calculator", desc: "An inline GST calculator. Configure it for CGST+SGST (intrastate) or IGST (interstate)." },
          { icon: "📈", title: "Chart", desc: "A bar chart connected to your table data to visualize totals and trends." },
          { icon: "🖼️", title: "Image", desc: "Add your company logo or a banner image to any page." },
          { icon: "✍️", title: "Text", desc: "A heading and description block for labelling sections of a page." },
        ]}
      />

      <DocH2 id="page-tips">Tips & Tricks</DocH2>
      <DocList
        items={[
          "Put a Filter Bar block above a Table View - they link automatically so searching works across the whole page.",
          "Use two Metric blocks at 50% width side by side for a clean KPI row at the top of a dashboard.",
          "Name your pages clearly - your staff sees these names in the sidebar of the tenant app.",
          "Pages created by modules can be edited and customized. Your changes are kept even when the module updates.",
          "You can create blank pages from scratch for things like notice boards, calculators, or custom dashboards.",
        ]}
      />
    </section>
  );
}
