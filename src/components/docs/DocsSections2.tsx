"use client";

import {
  DocH2, DocP, DocCallout, DocSteps, DocCards, DocList, DocDivider,
} from "./DocsPrimitives";
import {
  Type, Hash, IndianRupee, Calendar, CheckSquare, List, ListPlus, Link2, Mail, Phone, Globe, AlignLeft,
  FileText, QrCode, ArrowRightLeft, FileArchive, MessageSquare, Truck
} from "lucide-react";

/*  Tables & Data  */
export function SectionSchema() {
  return (
    <section>
      <DocH2 id="tables-overview">Tables Overview</DocH2>
      <DocP>
        Tables are where your business data lives. Each module you install
<<<<<<< HEAD
        creates its own tables automatically, such as Products, Customers, and Invoices.
        You can also create blank custom tables from scratch in the Tables
        section of the sidebar.
      </DocP>
      <DocCallout type="info">
        You can add custom fields to any table, including ones created by modules. Go to Tables, click on the table name, and use the + Add Field button.
=======
        creates its own tables automatically : Products, Customers, Invoices,
        etc. You can also create blank custom tables from scratch in the Tables
        section of the sidebar.
      </DocP>
      <DocCallout type="info">
        You can add custom fields to any table : even ones created by modules. Go to Tables, click on the table name, and use the + Add Field button.
>>>>>>> 81abcc974ae9b58018fed0a924167eca9ae4b168
      </DocCallout>

      <DocH2 id="field-types">Field Types</DocH2>
      <DocP>
        When you add a field to a table, you choose what type of data it stores.
        Here are all the available types:
      </DocP>
      <DocCards
        items={[
<<<<<<< HEAD
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
=======
          { icon: <Type className="h-5 w-5" />, title: "Text", desc: "A single line of text. Use for names, descriptions, SKU codes, etc." },
          { icon: <Hash className="h-5 w-5" />, title: "Number", desc: "Any numeric value : quantities, counts, measurements." },
          { icon: <IndianRupee className="h-5 w-5" />, title: "Currency", desc: "A monetary value displayed in ₹. Stored precisely to avoid rounding errors." },
          { icon: <Calendar className="h-5 w-5" />, title: "Date", desc: "A date picker. Use for invoice dates, joining dates, deadlines, etc." },
          { icon: <CheckSquare className="h-5 w-5" />, title: "Checkbox", desc: "A true/false toggle. Great for 'Is Active?', 'PF Enrolled?', 'Done?'" },
          { icon: <List className="h-5 w-5" />, title: "Single Select", desc: "Pick one option from a dropdown you define : e.g. Status: Active / Inactive." },
          { icon: <ListPlus className="h-5 w-5" />, title: "Multi Select", desc: "Pick multiple options from a list : e.g. Tags: Urgent, Pending, Reviewed." },
          { icon: <Link2 className="h-5 w-5" />, title: "Relation", desc: "Link a record to another table : e.g. link an Invoice to a Customer record." },
          { icon: <Mail className="h-5 w-5" />, title: "Email", desc: "An email address with built in format validation." },
          { icon: <Phone className="h-5 w-5" />, title: "Phone", desc: "A phone number field." },
          { icon: <Globe className="h-5 w-5" />, title: "URL", desc: "A website link." },
          { icon: <AlignLeft className="h-5 w-5" />, title: "Text Area", desc: "Multiple lines of text. Use for notes, addresses, long descriptions." },
>>>>>>> 81abcc974ae9b58018fed0a924167eca9ae4b168
        ]}
      />

      <DocH2 id="adding-records">Adding Records</DocH2>
      <DocP>
<<<<<<< HEAD
        Records are the rows of data in your tables, representing a single product,
        customer, or invoice. Your staff adds records through the tenant app;
=======
        Records are the rows of data in your tables : a single product, a
        customer, an invoice. Your staff adds records through the tenant app;
>>>>>>> 81abcc974ae9b58018fed0a924167eca9ae4b168
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

/*  Plugins  */
export function SectionPlugins() {
  return (
    <section>
      <DocH2 id="what-are-plugins">What are Plugins?</DocH2>
      <DocP>
<<<<<<< HEAD
        Plugins add extra actions to your ERP that connect to the outside world,
        such as generating a PDF invoice, sending an SMS to a customer,
=======
        Plugins add extra actions to your ERP that connect to the outside world.
        For example : generating a PDF invoice, sending an SMS to a customer,
>>>>>>> 81abcc974ae9b58018fed0a924167eca9ae4b168
        or exporting data to Tally. They run when something happens in your data
        (like a new order) or when you manually trigger them from a record.
      </DocP>
      <DocCards
        items={[
<<<<<<< HEAD
          { icon: "📄", title: "PDF Invoice", desc: "Generate a GST-compliant PDF invoice directly from any invoice record. Configure your company name, GSTIN, logo, and bank details." },
          { icon: "💳", title: "UPI Payment Link", desc: "Create a UPI payment deeplink and QR code from an invoice. Share it with customers for instant payment." },
          { icon: "📊", title: "Google Sheets Sync", desc: "Automatically sync any table's records to a Google Sheet and back. Great for teams that prefer spreadsheets." },
          { icon: "🧮", title: "Tally Export", desc: "Export invoices and expenses as a Tally-compatible XML file for your accountant." },
          { icon: "📱", title: "SMS via MSG91", desc: "Send an automatic SMS when a new record is created (e.g., a welcome message to a new customer)." },
          { icon: "🚛", title: "E-Way Bill", desc: "Generate E-Way Bills through the NIC portal directly from stock movement records." },
=======
          { icon: <FileText className="h-5 w-5" />, title: "PDF Invoice", desc: "Generate a GST compliant PDF invoice directly from any invoice record. Configure your company name, GSTIN, logo, and bank details." },
          { icon: <QrCode className="h-5 w-5" />, title: "UPI Payment Link", desc: "Create a UPI payment deeplink and QR code from an invoice. Share it with customers for instant payment." },
          { icon: <ArrowRightLeft className="h-5 w-5" />, title: "Google Sheets Sync", desc: "Automatically sync any table's records to a Google Sheet : and back. Great for teams that prefer spreadsheets." },
          { icon: <FileArchive className="h-5 w-5" />, title: "Tally Export", desc: "Export invoices and expenses as a Tally compatible XML file for your accountant." },
          { icon: <MessageSquare className="h-5 w-5" />, title: "SMS via MSG91", desc: "Send an automatic SMS when a new record is created : e.g. a welcome message to a new customer." },
          { icon: <Truck className="h-5 w-5" />, title: "E-Way Bill", desc: "Generate E Way Bills through the NIC portal directly from stock movement records." },
>>>>>>> 81abcc974ae9b58018fed0a924167eca9ae4b168
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
<<<<<<< HEAD
            desc: "The plugin is added to your workspace. It's not active yet; you need to configure it first.",
          },
          {
            title: "Fill in the configuration",
            desc: "Each plugin has a settings form for details like your company GSTIN, API keys, or logo URL. Fill these in and save.",
=======
            desc: "The plugin is added to your workspace. It's not active yet : you need to configure it first.",
          },
          {
            title: "Fill in the configuration",
            desc: "Each plugin has a settings form : things like your company GSTIN, API keys, or logo URL. Fill these in and save.",
>>>>>>> 81abcc974ae9b58018fed0a924167eca9ae4b168
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

/*  Tenant Access  */
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
<<<<<<< HEAD
            desc: "Give your staff the link - it's shown at the top of the Tenant Users page. It looks like: /apps/your-workspace/login",
=======
            desc: "Give your staff the link : it's shown at the top of the Tenant Users page. It looks like: /apps/your-workspace/login",
>>>>>>> 81abcc974ae9b58018fed0a924167eca9ae4b168
          },
        ]}
      />

      <DocH2 id="tenant-login">Staff Login</DocH2>
      <DocP>
        Once you've created a staff account, they can log in at the tenant
<<<<<<< HEAD
        login page. They'll only see the pages and tables you've set up,
        with no access to the builder side.
=======
        login page. They'll only see the pages and tables you've set up :
        nothing from the builder side.
>>>>>>> 81abcc974ae9b58018fed0a924167eca9ae4b168
      </DocP>
      <DocList
        items={[
          "Tenant login URL format: /apps/[your-workspace-slug]/login",
<<<<<<< HEAD
          "Staff use a username + password - not an email address.",
=======
          "Staff use a username + password : not an email address.",
>>>>>>> 81abcc974ae9b58018fed0a924167eca9ae4b168
          "You can reset a staff member's password anytime from Settings → Tenant Users.",
          "If a staff member is removed, their login immediately stops working.",
          "Staff can view and edit records but cannot change schemas, install modules, or edit pages.",
        ]}
      />
      <DocCallout type="info">
<<<<<<< HEAD
        Your workspace slug is shown in the sidebar and in Settings. It's usually your business name in lowercase (e.g., acme-traders).
=======
        Your workspace slug is shown in the sidebar and in Settings. It's usually your business name, lowercased : e.g. acme-traders.
>>>>>>> 81abcc974ae9b58018fed0a924167eca9ae4b168
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
<<<<<<< HEAD
          Go back to the builder and explore - most things are self-explanatory
=======
          Go back to the builder and explore : most things are self-explanatory
>>>>>>> 81abcc974ae9b58018fed0a924167eca9ae4b168
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
