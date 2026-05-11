import { PluginDefinition } from "@/types/plugin";

export const whatsappPlugin: PluginDefinition = {
  id: "whatsapp-notifications",
  name: "WhatsApp Notifications",
  description:
    "Send order confirmations, payment reminders, and stock alerts to customers automatically.",
  icon: "whatsapp",
  category: "Communication",
  badge: "Pro",
  installs: 1200,
  configFields: [
    { name: "API Key", type: "TEXT", placeholder: "Enter WhatsApp Business API key" },
    { name: "Default Country Code", type: "TEXT", defaultValue: "+91" },
    { name: "Send Order Confirmation", type: "CHECKBOX", defaultValue: true },
    { name: "Send Payment Reminder", type: "CHECKBOX", defaultValue: true },
    { name: "Send Stock Alert", type: "CHECKBOX", defaultValue: false },
  ],
  triggers: [
    { event: "record.created", table: "Orders", action: "Send order confirmation" },
    { event: "record.updated", table: "Invoices", condition: "status = overdue", action: "Send payment reminder" },
  ],
};

export const attendancePlugin: PluginDefinition = {
  id: "employee-attendance",
  name: "Employee Attendance",
  description:
    "Track check-in/out, late arrivals, and overtime. Supports biometric and manual inputs.",
  icon: "fingerprint",
  category: "HR",
  badge: "Free",
  installs: 900,
  supersededBy: "HR Module",
  configFields: [
    { name: "Working Hours Start", type: "TEXT", defaultValue: "09:00" },
    { name: "Working Hours End", type: "TEXT", defaultValue: "18:00" },
    { name: "Grace Period (min)", type: "TEXT", defaultValue: "15" },
    { name: "Auto-mark Absent", type: "CHECKBOX", defaultValue: true },
  ],
  triggers: [],
};

export const gstPlugin: PluginDefinition = {
  id: "gst-invoice",
  name: "GST Invoice Generator",
  description:
    "Auto-generate GST-compliant invoices with GSTIN validation and HSN code look-up.",
  icon: "file-check",
  category: "Finance",
  badge: "Pro",
  installs: 1500,
  supersededBy: "Quotation & Invoicing",
  configFields: [
    { name: "Business GSTIN", type: "TEXT", placeholder: "22AAAAA0000A1Z5" },
    { name: "Default Tax Rate", type: "SELECT", defaultValue: "18", options: ["5", "12", "18", "28"] },
    { name: "Include E-Way Bill", type: "CHECKBOX", defaultValue: false },
  ],
  triggers: [
    { event: "record.created", table: "Invoices", action: "Generate GST invoice PDF" },
  ],
};

export const emailPlugin: PluginDefinition = {
  id: "email-campaigns",
  name: "Email Campaigns",
  description:
    "Send bulk emails to customer segments and track opens, clicks, and bounces.",
  icon: "mail",
  category: "Communication",
  badge: "Free",
  installs: 1100,
  configFields: [
    { name: "SMTP Host", type: "TEXT", placeholder: "smtp.example.com" },
    { name: "SMTP Port", type: "TEXT", defaultValue: "587" },
    { name: "From Email", type: "TEXT", placeholder: "hello@acmetraders.in" },
    { name: "Track Opens", type: "CHECKBOX", defaultValue: true },
  ],
  triggers: [],
};

export const leavePlugin: PluginDefinition = {
  id: "leave-management",
  name: "Leave Management",
  description:
    "Simplified leave requests, approval workflows, and annual balance tracking.",
  icon: "calendar-off",
  category: "HR",
  badge: "Free",
  installs: 950,
  supersededBy: "HR Module",
  configFields: [
    { name: "Annual Leave Quota", type: "TEXT", defaultValue: "24" },
    { name: "Require Manager Approval", type: "CHECKBOX", defaultValue: true },
    { name: "Allow Half-Day Leave", type: "CHECKBOX", defaultValue: true },
  ],
  triggers: [],
};

export const razorpayPlugin: PluginDefinition = {
  id: "razorpay-payments",
  name: "Payment Gateway (Razorpay)",
  description:
    "Accept UPI, cards, and netbanking. Automatic reconciliation with sales ledger.",
  icon: "credit-card",
  category: "Finance",
  badge: "Pro",
  installs: 3200,
  configFields: [
    { name: "Razorpay Key ID", type: "TEXT", placeholder: "rzp_live_..." },
    { name: "Razorpay Key Secret", type: "TEXT", placeholder: "Enter secret key" },
    { name: "Auto-Capture Payments", type: "CHECKBOX", defaultValue: true },
    { name: "Enable Refunds", type: "CHECKBOX", defaultValue: false },
  ],
  triggers: [
    { event: "payment.captured", table: "Invoices", action: "Mark invoice as paid" },
  ],
};

export const pdfPlugin: PluginDefinition = {
  id: "pdf-invoice-generator",
  name: "PDF Invoice Generator",
  description: "Generate professional PDF invoices with jsPDF / react-pdf.",
  icon: "file-text",
  category: "Finance",
  badge: "Free",
  installs: 4500,
  supersededBy: "Quotation & Invoicing",
  configFields: [
    { name: "Company Name", type: "TEXT", placeholder: "Your Company Ltd." },
    { name: "GSTIN", type: "TEXT", placeholder: "22AAAAA0000A1Z5" },
    { name: "Logo URL", type: "TEXT", placeholder: "https://..." },
    { name: "Bank Details", type: "TEXT", placeholder: "A/C Number, IFSC, etc." },
    { name: "Template", type: "SELECT", defaultValue: "Modern", options: ["Modern", "Classic", "Minimalist", "Corporate", "Creative", "Retail"] },
  ],
  triggers: [
    { event: "manual", table: "Invoices", action: "Generate PDF" },
  ],
};

export const upiPlugin: PluginDefinition = {
  id: "upi-payment-link",
  name: "UPI Payment Link",
  description: "Generate UPI deeplinks and QR codes for instant payments.",
  icon: "smartphone",
  category: "Finance",
  badge: "Free",
  installs: 8200,
  configFields: [
    { name: "UPI ID", type: "TEXT", placeholder: "merchant@upi" },
    { name: "Merchant Name", type: "TEXT", placeholder: "Merchant Name" },
  ],
  triggers: [
    { event: "manual", table: "Invoices", action: "Generate Payment Link/QR" },
  ],
};

export const googleSheetsPlugin: PluginDefinition = {
  id: "google-sheets-sync",
  name: "Google Sheets Sync",
  description: "Two-way data sync between ERP and Google Sheets.",
  icon: "table",
  category: "Operations",
  badge: "Pro",
  installs: 2100,
  configFields: [
    { name: "Spreadsheet ID", type: "TEXT", placeholder: "1BxiMVs0XRY..." },
    { name: "Service Account JSON", type: "TEXT", placeholder: "{...}" },
  ],
  triggers: [
    { event: "record.created", table: "Any", action: "Sync to Sheets" },
    { event: "cron.daily", table: "Any", action: "Daily Sync" },
  ],
};

export const tallyPlugin: PluginDefinition = {
  id: "tally-export",
  name: "Tally Export",
  description: "Export invoices and expenses to Tally-compatible XML.",
  icon: "database",
  category: "Finance",
  badge: "Pro",
  installs: 3400,
  configFields: [
    { name: "Tally Company Name", type: "TEXT", placeholder: "Acme Corp" },
  ],
  triggers: [
    { event: "manual", table: "Invoices/Expenses", action: "Export XML" },
  ],
};

export const ewayBillPlugin: PluginDefinition = {
  id: "eway-bill",
  name: "E-Way Bill Generation",
  description: "Automatically generate E-Way Bills via NIC API.",
  icon: "truck",
  category: "Logistics",
  badge: "Pro",
  installs: 1800,
  configFields: [
    { name: "GST Username", type: "TEXT", placeholder: "Enter GST username" },
    { name: "GST Password", type: "TEXT", placeholder: "Enter GST password" },
    { name: "NIC API Key", type: "TEXT", placeholder: "Enter NIC API key" },
  ],
  triggers: [
    { event: "record.created", table: "Stock Movements", action: "Generate E-Way Bill" },
  ],
};

export const msg91Plugin: PluginDefinition = {
  id: "sms-msg91",
  name: "SMS via MSG91",
  description: "Send transactional SMS notifications using MSG91.",
  icon: "message-square",
  category: "Communication",
  badge: "Pro",
  installs: 2900,
  configFields: [
    { name: "MSG91 API Key", type: "TEXT", placeholder: "Enter API Key" },
    { name: "Sender ID", type: "TEXT", placeholder: "6-character Sender ID" },
  ],
  triggers: [
    { event: "record.created", table: "Any", action: "Send SMS" },
  ],
};

export const allPlugins: PluginDefinition[] = [
  whatsappPlugin,
  attendancePlugin,
  gstPlugin,
  emailPlugin,
  leavePlugin,
  razorpayPlugin,
  pdfPlugin,
  upiPlugin,
  googleSheetsPlugin,
  tallyPlugin,
  ewayBillPlugin,
  msg91Plugin,
];
