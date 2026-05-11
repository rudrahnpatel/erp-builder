/**
 * Plugin Executor Registry
 *
 * Maps plugin IDs to their execution type.
 * - "client" plugins run entirely in the browser (UPI QR, PDF, Tally XML)
 * - "simulated" plugins show mock results (WhatsApp, Email, SMS)
 * - "external" plugins would need real API keys (Razorpay, Google Sheets) — not implemented
 */

export type PluginExecutionType = "client" | "simulated" | "external";

export interface PluginExecutorInfo {
  type: PluginExecutionType;
  label: string;           // Button label for executing
  description: string;     // What happens when you click it
}

export const PLUGIN_EXECUTORS: Record<string, PluginExecutorInfo> = {
  "upi-payment-link": {
    type: "client",
    label: "Generate QR Code",
    description: "Generate a UPI payment QR code and deeplink",
  },
  "pdf-invoice-generator": {
    type: "client",
    label: "Generate PDF",
    description: "Create a professional GST-compliant invoice PDF",
  },
  "tally-export": {
    type: "client",
    label: "Import / Export Tally",
    description: "Import vouchers from Tally XML or export your records for Tally ERP",
  },
  "whatsapp-notifications": {
    type: "simulated",
    label: "Send Test Message",
    description: "Simulate sending a WhatsApp notification",
  },
  "email-campaigns": {
    type: "simulated",
    label: "Send Test Email",
    description: "Simulate sending an email campaign",
  },
  "sms-msg91": {
    type: "simulated",
    label: "Send Test SMS",
    description: "Simulate sending an SMS via MSG91",
  },
  "employee-attendance": {
    type: "external",
    label: "Open Attendance",
    description: "Attendance tracking is available in the HR module",
  },
  "leave-management": {
    type: "external",
    label: "Open Leave Manager",
    description: "Leave management is available in the HR module",
  },
  "gst-invoice": {
    type: "external",
    label: "Generate Invoice",
    description: "GST invoicing is available in the Finance module",
  },
  "razorpay-payments": {
    type: "external",
    label: "Connect Razorpay",
    description: "Requires Razorpay API keys to activate",
  },
  "google-sheets-sync": {
    type: "external",
    label: "Connect Sheets",
    description: "Requires Google OAuth setup to activate",
  },
  "eway-bill": {
    type: "external",
    label: "Generate E-Way Bill",
    description: "Requires NIC API credentials to activate",
  },
};
