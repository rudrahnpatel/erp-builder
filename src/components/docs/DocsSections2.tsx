"use client";

import {
  DocH2, DocP, DocCallout, DocSteps, DocCards, DocList, DocDivider,
} from "./DocsPrimitives";

/* ── Tables & Data ── */
export function SectionSchema() {
  return (
    <section>
      <DocH2 id="tables-overview">Tables Overview</DocH2>
      <DocP>
        Tables are where your business data lives. Each module you install
        creates its own tables automatically, such as Products, Customers, and Invoices.
        You can also create blank custom tables from scratch in the Tables
        section of the sidebar.
      </DocP>
      <DocCallout type="info">
        You can add custom fields to any table, including ones created by modules. Go to Tables, click on the table name, and use the + Add Field button.
      </DocCallout>

      <DocH2 id="field-types">Field Types</DocH2>
      <DocP>
        When you add a field to a table, you choose what type of data it stores.
        Here are all the available types:
      </DocP>
      <DocCards
        items={[
          { icon: "📝", title: "Text", desc: "A single line of text. Use for names, descriptions, SKU codes, etc." },
          { icon: "🔢", title: "Number", desc: "Any numeric value, such as quantities, counts, or measurements." },
          { icon: "₹", title: "Currency", desc: "A monetary value displayed in ₹. Stored precisely to avoid rounding errors." },
          { icon: "📅", title: "Date", desc: "A date picker. Use for invoice dates, joining dates, deadlines, etc." },
          { icon: "☑️", title: "Checkbox", desc: "A true/false toggle. Great for 'Is Active?', 'PF Enrolled?', 'Done?'" },
          { icon: "📌", title: "Single Select", desc: "Pick one option from a dropdown you define (e.g., Status: Active / Inactive)." },
          { icon: "🏷️", title: "Multi Select", desc: "Pick multiple options from a list (e.g., Tags: Urgent, Pending, Reviewed)." },
          { icon: "🔗", title: "Relation", desc: "Link a record to another table. For example, link an Invoice to a Customer record." },
          { icon: "📧", title: "Email", desc: "An email address with built-in format validation." },
          { icon: "📱", title: "Phone", desc: "A phone number field." },
          { icon: "🌐", title: "URL", desc: "A website link." },
          { icon: "💬", title: "Text Area", desc: "Multiple lines of text. Use for notes, addresses, long descriptions." },
        ]}
      />

      <DocH2 id="adding-records">Adding Records</DocH2>
      <DocP>
        Records are the rows of data in your tables, representing a single product,
        customer, or invoice. Your staff adds records through the tenant app;
        you can also add them directly from the builder.
      </DocP>
      <DocSteps
        steps={[
          {
            title: "Open the tenant app",
            desc: 'Click "Open My ERP" in the sidebar. This is where day-to-day data entry happens.',
          },
          {
            title: "Navigate to a table",
            desc: "Click any table or page in the sidebar of the tenant app.",
          },
          {
            title: "Add a record",
            desc: 'Click the "+ Add Record" button at the top of the table. Fill in the form and save.',
          },
          {
            title: "Edit or delete",
            desc: "Click any row to expand it and edit inline. Use the delete button on any row to remove it.",
          },
        ]}
      />
      <DocCallout type="warning">
        Deleted records cannot be recovered. There is no trash or undo for record deletions.
      </DocCallout>
    </section>
  );
}

/* ── Plugins ── */
export function SectionPlugins() {
  return (
    <section>
      <DocH2 id="what-are-plugins">What are Plugins?</DocH2>
      <DocP>
        Plugins add extra actions to your ERP that connect to the outside world,
        such as generating a PDF invoice, sending an SMS to a customer,
        or exporting data to Tally. They run when something happens in your data
        (like a new order) or when you manually trigger them from a record.
      </DocP>
      <DocCards
        items={[
          { icon: "📄", title: "PDF Invoice", desc: "Generate a GST-compliant PDF invoice directly from any invoice record. Configure your company name, GSTIN, logo, and bank details." },
          { icon: "💳", title: "UPI Payment Link", desc: "Create a UPI payment deeplink and QR code from an invoice. Share it with customers for instant payment." },
          { icon: "📊", title: "Google Sheets Sync", desc: "Automatically sync any table's records to a Google Sheet and back. Great for teams that prefer spreadsheets." },
          { icon: "🧮", title: "Tally Export", desc: "Export invoices and expenses as a Tally-compatible XML file for your accountant." },
          { icon: "📱", title: "SMS via MSG91", desc: "Send an automatic SMS when a new record is created (e.g., a welcome message to a new customer)." },
          { icon: "🚛", title: "E-Way Bill", desc: "Generate E-Way Bills through the NIC portal directly from stock movement records." },
        ]}
      />

      <DocH2 id="installing-plugins">Installing a Plugin</DocH2>
      <DocSteps
        steps={[
          {
            title: "Go to Plugins",
            desc: "Click Plugins in the left sidebar to open the Plugin Marketplace.",
          },
          {
            title: "Click Install on a plugin",
            desc: "The plugin is added to your workspace. It's not active yet; you need to configure it first.",
          },
          {
            title: "Fill in the configuration",
            desc: "Each plugin has a settings form for details like your company GSTIN, API keys, or logo URL. Fill these in and save.",
          },
          {
            title: "Use it from your records",
            desc: "Depending on the plugin, it will either run automatically when records are created, or appear as a button on specific table rows (e.g. 'Generate PDF').",
          },
        ]}
      />
      <DocCallout type="tip">
        You can enable or disable a plugin any time without losing its configuration. This is useful if you want to temporarily stop automatic SMS alerts.
      </DocCallout>
    </section>
  );
}

/* ── Tenant Access ── */
export function SectionTenantAccess() {
  return (
    <section>
      <DocDivider />
      <DocH2 id="inviting-staff">Inviting Your Staff</DocH2>
      <DocP>
        Your staff never needs to touch the builder. They get their own
        separate login to the finished ERP you built.
      </DocP>
      <DocSteps
        steps={[
          {
            title: "Go to Settings",
            desc: "Click the gear icon or navigate to Settings from the sidebar.",
          },
          {
            title: "Open Tenant Users",
            desc: 'Click the "Tenant Users" tab. You\'ll see a list of all staff accounts.',
          },
          {
            title: "Add a new user",
            desc: "Click Add User. Enter a username (e.g. their first name) and set a password. Choose their role if applicable.",
          },
          {
            title: "Share the login link",
            desc: "Give your staff the link - it's shown at the top of the Tenant Users page. It looks like: /apps/your-workspace/login",
          },
        ]}
      />

      <DocH2 id="tenant-login">Staff Login</DocH2>
      <DocP>
        Once you've created a staff account, they can log in at the tenant
        login page. They'll only see the pages and tables you've set up,
        with no access to the builder side.
      </DocP>
      <DocList
        items={[
          "Tenant login URL format: /apps/[your-workspace-slug]/login",
          "Staff use a username + password - not an email address.",
          "You can reset a staff member's password anytime from Settings → Tenant Users.",
          "If a staff member is removed, their login immediately stops working.",
          "Staff can view and edit records but cannot change schemas, install modules, or edit pages.",
        ]}
      />
      <DocCallout type="info">
        Your workspace slug is shown in the sidebar and in Settings. It's usually your business name in lowercase (e.g., acme-traders).
      </DocCallout>

      {/* Footer CTA */}
      <div
        className="mt-16 rounded-2xl p-6 text-center"
        style={{
          background: "var(--surface-2)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <p className="text-lg font-semibold mb-1" style={{ color: "var(--foreground)" }}>
          Still have questions?
        </p>
        <p className="text-sm mb-4" style={{ color: "var(--foreground-muted)" }}>
          Go back to the builder and explore - most things are self-explanatory
          once you have a module installed.
        </p>
        <a
          href="/workspace"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ background: "var(--primary)" }}
        >
          Go to Builder →
        </a>
      </div>

      <div className="pb-10" />
    </section>
  );
}
