/**
 * Simulated plugin executor for communication plugins (WhatsApp, Email, SMS).
 * These don't make real API calls but provide a realistic config + test flow.
 */

export interface SimulatedResult {
  success: boolean;
  pluginId: string;
  action: string;
  message: string;
  preview?: string;     // What the message would look like
  timestamp: string;
  simulated: true;
}

export function simulateWhatsApp(
  config: Record<string, unknown>,
  recipient: string,
  message: string
): SimulatedResult {
  const countryCode = (config["Default Country Code"] as string) || "+91";
  const phone = recipient.startsWith("+") ? recipient : `${countryCode}${recipient}`;

  return {
    success: true,
    pluginId: "whatsapp-notifications",
    action: "Send WhatsApp Message",
    message: `Message would be sent to ${phone} via WhatsApp Business API`,
    preview: message,
    timestamp: new Date().toISOString(),
    simulated: true,
  };
}

export function simulateEmail(
  config: Record<string, unknown>,
  to: string,
  subject: string,
  body: string
): SimulatedResult {
  const from = (config["From Email"] as string) || "noreply@example.com";
  const host = (config["SMTP Host"] as string) || "smtp.example.com";

  return {
    success: true,
    pluginId: "email-campaigns",
    action: "Send Email",
    message: `Email would be sent from ${from} to ${to} via ${host}`,
    preview: `Subject: ${subject}\n\n${body}`,
    timestamp: new Date().toISOString(),
    simulated: true,
  };
}

export function simulateSMS(
  config: Record<string, unknown>,
  phone: string,
  message: string
): SimulatedResult {
  const senderId = (config["Sender ID"] as string) || "ERPSMS";

  return {
    success: true,
    pluginId: "sms-msg91",
    action: "Send SMS",
    message: `SMS would be sent to ${phone} via MSG91 (Sender: ${senderId})`,
    preview: message,
    timestamp: new Date().toISOString(),
    simulated: true,
  };
}
