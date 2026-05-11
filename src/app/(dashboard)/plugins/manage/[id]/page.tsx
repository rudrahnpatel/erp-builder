"use client";

import { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { PLUGIN_EXECUTORS } from "@/lib/plugins/executors";
import {
  RiArrowLeftLine, RiLoader4Line, RiSaveLine, RiCheckLine,
  RiToggleFill, RiToggleLine, RiFlashlightLine, RiLinkM,
  RiAlertLine, RiQrCodeLine, RiFileTextLine, RiDownloadLine,
  RiWhatsappLine, RiMailLine, RiMessage2Line, RiDeleteBinLine,
} from "react-icons/ri";

import type { PluginDefinition, PluginConfigField } from "@/types/plugin";

interface PluginDetail extends PluginDefinition {
  installed: boolean;
  enabled: boolean;
  savedConfig: Record<string, unknown>;
  installedPluginId: string | null;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());
import { UPIExecutor, PDFExecutor, TallyExecutor, SimulatedExecutor } from "@/components/plugins/SharedExecutors";
// ── Main Plugin Config Page ──
export default function PluginConfigPage() {
  const { id: pluginId } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: plugin, mutate } = useSWR<PluginDetail>(`/api/plugins/${pluginId}`, fetcher);
  const [config, setConfig] = useState<Record<string, unknown>>({});
  const [initialized, setInitialized] = useState(false);
  const [saving, setSaving] = useState(false);

  // Seed form from savedConfig once loaded
  if (plugin && !initialized) {
    const initial: Record<string, unknown> = {};
    for (const field of plugin.configFields) {
      initial[field.name] = (plugin.savedConfig as any)?.[field.name] ?? field.defaultValue ?? "";
    }
    setConfig(initial);
    setInitialized(true);
  }

  const saveConfig = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/plugins/${pluginId}/config`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config }),
      });
      if (!res.ok) throw new Error("Save failed");
      toast.success("Configuration saved!");
      mutate();
    } catch {
      toast.error("Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  const togglePlugin = async () => {
    await fetch("/api/plugins/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pluginId }),
    });
    mutate();
  };

  const installPlugin = async () => {
    await fetch("/api/plugins/install", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pluginId }),
    });
    mutate();
    toast.success("Plugin installed!");
  };

  const uninstallPlugin = async () => {
    if (!confirm("Uninstall this plugin? Your saved configuration will be lost.")) return;
    await fetch("/api/plugins/uninstall", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pluginId }),
    });
    toast.success("Plugin uninstalled");
    router.push("/plugins/manage");
  };

  if (!plugin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const executor = PLUGIN_EXECUTORS[pluginId];
  const accentColor = pluginId.includes("whatsapp") ? "var(--accent-emerald)"
    : pluginId.includes("upi") || pluginId.includes("credit") ? "var(--accent-cyan)"
    : pluginId.includes("pdf") || pluginId.includes("mail") ? "var(--accent-amber)"
    : pluginId.includes("tally") || pluginId.includes("gst") ? "var(--accent-violet)"
    : "var(--primary)";

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-6 px-4 animate-fade-in-up">
      {/* Back */}
      <Link href="/plugins/manage" className="inline-flex items-center gap-1.5 text-sm transition-colors hover:underline" style={{ color: "var(--foreground-muted)" }}>
        <RiArrowLeftLine className="h-4 w-4" /> Back to Manage Plugins
      </Link>

      {/* Header */}
      <header className="flex items-start gap-4">
        <div className="h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-black/5 dark:border-white/5"
          style={{ background: `color-mix(in oklch, ${accentColor}, transparent 88%)`, color: accentColor }}>
          <DynamicIcon name={plugin.icon} className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-semibold tracking-tight">{plugin.name}</h1>
            <Badge variant={plugin.badge === "Pro" ? "default" : "secondary"}
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border-0 ${
                plugin.badge === "Pro" ? "bg-primary/10 text-primary" : "bg-success/10 text-success"
              }`}>{plugin.badge}</Badge>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "var(--foreground-muted)" }}>{plugin.description}</p>
        </div>
        {plugin.installed && (
          <button onClick={togglePlugin} className="shrink-0 transition-transform hover:scale-110"
            style={{ color: plugin.enabled ? accentColor : "var(--muted-foreground)" }}
            title={plugin.enabled ? "Disable Plugin" : "Enable Plugin"}>
            {plugin.enabled ? <RiToggleFill className="h-9 w-9" /> : <RiToggleLine className="h-9 w-9" />}
          </button>
        )}
      </header>

      {/* Not Installed State */}
      {!plugin.installed && (
        <section className="rounded-xl border p-6 text-center space-y-4" style={{ background: "var(--surface-1)", borderColor: "var(--border-subtle)" }}>
          <RiAlertLine className="h-8 w-8 mx-auto" style={{ color: "var(--foreground-dimmed)" }} />
          <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>This plugin is not installed yet. Install it to configure and use it.</p>
          <Button onClick={installPlugin} className="gap-2">
            <RiDownloadLine className="h-4 w-4" /> Install Plugin
          </Button>
        </section>
      )}

      {/* Configuration */}
      {plugin.installed && (
        <section className="rounded-xl border p-5 space-y-4" style={{ background: "var(--surface-1)", borderColor: "var(--border-subtle)" }}>
          <h2 className="text-sm font-semibold">Configuration</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {plugin.configFields.map((field: PluginConfigField) => (
              <div key={field.name} className={`space-y-1.5 ${field.name === "Template" ? "sm:col-span-2" : ""}`}>
                <label className="text-xs font-medium" style={{ color: "var(--foreground-muted)" }}>{field.name}</label>
                {field.type === "TEXT" && (
                  <Input value={String(config[field.name] ?? "")}
                    onChange={(e) => setConfig({ ...config, [field.name]: e.target.value })}
                    placeholder={field.placeholder} className="h-9" />
                )}
                {field.type === "CHECKBOX" && (
                  <button onClick={() => setConfig({ ...config, [field.name]: !config[field.name] })}
                    className="flex items-center gap-2 text-sm"
                    style={{ color: config[field.name] ? accentColor : "var(--muted-foreground)" }}>
                    {config[field.name] ? <RiToggleFill className="h-6 w-6" /> : <RiToggleLine className="h-6 w-6" />}
                    {config[field.name] ? "Enabled" : "Disabled"}
                  </button>
                )}
                {field.type === "SELECT" && field.options && field.name !== "Template" && (
                  <select value={String(config[field.name] ?? "")}
                    onChange={(e) => setConfig({ ...config, [field.name]: e.target.value })}
                    className="w-full h-9 px-3 text-sm rounded-lg border bg-transparent"
                    style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                    {field.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                )}
                {field.type === "SELECT" && field.options && field.name === "Template" && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                    {field.options.map((opt) => {
                      const isActive = config[field.name] === opt;
                      const svgMap: Record<string, React.ReactNode> = {
                        Modern: (
                          <svg viewBox="0 0 120 160" className="w-full h-full"><rect width="120" height="160" fill="#fff"/><rect width="120" height="22" fill="#005BBF"/><text x="6" y="12" fill="#fff" fontSize="5" fontWeight="bold">Company Name</text><text x="90" y="14" fill="#fff" fontSize="7" fontWeight="bold">INVOICE</text><text x="6" y="19" fill="#cde" fontSize="3">GSTIN: 22AAAA0000A1Z5</text><rect x="6" y="26" width="50" height="16" rx="1" fill="#f5f5fa"/><rect x="64" y="26" width="50" height="16" rx="1" fill="#f5f5fa"/><text x="8" y="30" fill="#888" fontSize="2.5" fontWeight="bold">BILL TO</text><text x="8" y="35" fill="#222" fontSize="3.5" fontWeight="bold">Customer Name</text><text x="8" y="39" fill="#888" fontSize="2.5">123 Main St</text><text x="66" y="30" fill="#888" fontSize="2.5" fontWeight="bold">FROM</text><text x="66" y="35" fill="#222" fontSize="3.5" fontWeight="bold">Company Name</text><rect x="6" y="48" width="108" height="6" fill="#005BBF" rx="0.5"/><text x="8" y="52.5" fill="#fff" fontSize="2.5" fontWeight="bold"># Item  HSN  Qty  Rate  CGST  SGST  Amount</text><rect x="6" y="55" width="108" height="5" fill="#fafaff"/><text x="8" y="58.5" fill="#333" fontSize="2.5">1 Sample Item  8471  2  1,500  9%  9%  3,540</text><rect x="6" y="61" width="108" height="5" fill="#fff"/><text x="8" y="64.5" fill="#333" fontSize="2.5">2 Service  9983  1  5,000  9%  9%  5,900</text><rect x="76" y="70" width="38" height="16" rx="1" fill="#f5f5fa"/><text x="78" y="75" fill="#888" fontSize="2.5">Subtotal</text><text x="112" y="75" fill="#222" fontSize="2.5" textAnchor="end">8,000</text><text x="78" y="79" fill="#888" fontSize="2.5">CGST</text><text x="112" y="79" fill="#222" fontSize="2.5" textAnchor="end">720</text><rect x="76" y="86" width="38" height="6" rx="1" fill="#005BBF"/><text x="78" y="90" fill="#fff" fontSize="3" fontWeight="bold">TOTAL</text><text x="112" y="90" fill="#fff" fontSize="3" fontWeight="bold" textAnchor="end">₹9,440</text></svg>
                        ),
                        Classic: (
                          <svg viewBox="0 0 120 160" className="w-full h-full"><rect width="120" height="160" fill="#fff"/><text x="6" y="12" fill="#333" fontSize="6" fontFamily="serif" fontWeight="bold">Company Name</text><text x="6" y="17" fill="#888" fontSize="3" fontFamily="serif">123 Business Ave</text><text x="90" y="14" fill="#333" fontSize="7" fontFamily="serif" fontWeight="bold">INVOICE</text><line x1="6" y1="22" x2="114" y2="22" stroke="#333" strokeWidth="0.5"/><rect x="6" y="26" width="50" height="14" fill="none"/><text x="6" y="30" fill="#888" fontSize="2.5" fontWeight="bold">BILL TO</text><text x="6" y="35" fill="#333" fontSize="3.5" fontWeight="bold">Customer Name</text><rect x="6" y="46" width="108" height="6" fill="#c8c8c8"/><text x="8" y="50.5" fill="#333" fontSize="2.5" fontWeight="bold">#  Item  HSN  Qty  Rate  CGST  SGST  Amount</text><rect x="6" y="53" width="108" height="5" fill="#fff"/><text x="8" y="56.5" fill="#333" fontSize="2.5">1 Sample Item  8471  2  1,500  9%  9%  3,540</text><line x1="6" y1="58" x2="114" y2="58" stroke="#ccc" strokeWidth="0.3"/><rect x="6" y="59" width="108" height="5" fill="#fff"/><text x="8" y="62.5" fill="#333" fontSize="2.5">2 Service  9983  1  5,000  9%  9%  5,900</text><text x="78" y="72" fill="#888" fontSize="2.5">Subtotal</text><text x="112" y="72" fill="#333" fontSize="2.5" textAnchor="end">8,000</text><line x1="76" y1="78" x2="114" y2="78" stroke="#333" strokeWidth="0.5"/><text x="78" y="83" fill="#333" fontSize="3.5" fontWeight="bold">TOTAL</text><text x="112" y="83" fill="#333" fontSize="3.5" fontWeight="bold" textAnchor="end">₹9,440</text><line x1="76" y1="85" x2="114" y2="85" stroke="#333" strokeWidth="0.5"/></svg>
                        ),
                        Minimalist: (
                          <svg viewBox="0 0 120 160" className="w-full h-full"><rect width="120" height="160" fill="#fff"/><text x="6" y="12" fill="#000" fontSize="6" fontWeight="bold">Company Name</text><text x="6" y="17" fill="#999" fontSize="3">GSTIN: 22AAAA0000A1Z5</text><text x="114" y="14" fill="#000" fontSize="7" fontWeight="bold" textAnchor="end">INVOICE</text><line x1="6" y1="22" x2="114" y2="22" stroke="#000" strokeWidth="0.3"/><text x="6" y="30" fill="#999" fontSize="2.5" fontWeight="bold">BILL TO</text><text x="6" y="35" fill="#000" fontSize="3.5" fontWeight="bold">Customer Name</text><rect x="6" y="46" width="108" height="6" fill="#f0f0f0"/><text x="8" y="50.5" fill="#333" fontSize="2.5" fontWeight="bold">#  Item  HSN  Qty  Rate  Tax  Amount</text><rect x="6" y="53" width="108" height="5" fill="#fff"/><text x="8" y="56.5" fill="#333" fontSize="2.5">1 Sample Item  8471  2  1,500  18%  3,540</text><line x1="6" y1="58.5" x2="114" y2="58.5" stroke="#e0e0e0" strokeWidth="0.2"/><rect x="6" y="59" width="108" height="5" fill="#fff"/><text x="8" y="62.5" fill="#333" fontSize="2.5">2 Service  9983  1  5,000  18%  5,900</text><text x="78" y="72" fill="#999" fontSize="2.5">Subtotal</text><text x="112" y="72" fill="#000" fontSize="2.5" textAnchor="end">8,000</text><line x1="76" y1="78" x2="114" y2="78" stroke="#000" strokeWidth="0.3"/><text x="78" y="83" fill="#000" fontSize="3.5" fontWeight="bold">TOTAL</text><text x="112" y="83" fill="#000" fontSize="3.5" fontWeight="bold" textAnchor="end">₹9,440</text><line x1="76" y1="85" x2="114" y2="85" stroke="#000" strokeWidth="0.3"/></svg>
                        ),
                        Corporate: (
                          <svg viewBox="0 0 120 160" className="w-full h-full"><rect width="120" height="160" fill="#fff"/><rect width="120" height="24" fill="#143250"/><text x="6" y="12" fill="#fff" fontSize="5.5" fontWeight="bold">Company Name</text><text x="6" y="20" fill="#c0d0e0" fontSize="3">GSTIN: 22AAAA0000A1Z5</text><text x="90" y="16" fill="#fff" fontSize="8" fontWeight="bold">INVOICE</text><rect x="6" y="28" width="50" height="16" rx="1" fill="#f0f5fa"/><rect x="64" y="28" width="50" height="16" rx="1" fill="#f0f5fa"/><text x="8" y="32" fill="#888" fontSize="2.5" fontWeight="bold">BILL TO</text><text x="8" y="37" fill="#222" fontSize="3.5" fontWeight="bold">Customer Name</text><text x="66" y="32" fill="#888" fontSize="2.5" fontWeight="bold">FROM</text><text x="66" y="37" fill="#222" fontSize="3.5" fontWeight="bold">Company Name</text><rect x="6" y="50" width="108" height="6" fill="#143250" rx="0.5"/><text x="8" y="54.5" fill="#fff" fontSize="2.5" fontWeight="bold">#  Item  HSN  Qty  Rate  CGST  SGST  Amount</text><rect x="6" y="57" width="108" height="5" fill="#fafaff"/><text x="8" y="60.5" fill="#333" fontSize="2.5">1 Sample Item  8471  2  1,500  9%  9%  3,540</text><rect x="6" y="63" width="108" height="5" fill="#fff"/><text x="8" y="66.5" fill="#333" fontSize="2.5">2 Service  9983  1  5,000  9%  9%  5,900</text><rect x="76" y="72" width="38" height="14" rx="1" fill="#f0f5fa"/><text x="78" y="77" fill="#888" fontSize="2.5">Subtotal</text><text x="112" y="77" fill="#222" fontSize="2.5" textAnchor="end">8,000</text><rect x="76" y="86" width="38" height="6" rx="1" fill="#143250"/><text x="78" y="90" fill="#fff" fontSize="3" fontWeight="bold">TOTAL</text><text x="112" y="90" fill="#fff" fontSize="3" fontWeight="bold" textAnchor="end">₹9,440</text></svg>
                        ),
                        Creative: (
                          <svg viewBox="0 0 120 160" className="w-full h-full"><rect width="120" height="160" fill="#fff"/><rect x="6" y="6" width="108" height="20" rx="3" fill="#E63946"/><text x="12" y="16" fill="#fff" fontSize="5.5" fontWeight="bold">Company Name</text><text x="12" y="22" fill="#fff" fontSize="3">GSTIN: 22AAAA0000A1Z5</text><text x="104" y="20" fill="#fff" fontSize="7" fontWeight="bold" textAnchor="end">INVOICE</text><rect x="6" y="30" width="50" height="16" rx="1" fill="#fff0f3"/><rect x="64" y="30" width="50" height="16" rx="1" fill="#fff0f3"/><text x="8" y="34" fill="#888" fontSize="2.5" fontWeight="bold">BILL TO</text><text x="8" y="39" fill="#222" fontSize="3.5" fontWeight="bold">Customer Name</text><text x="66" y="34" fill="#888" fontSize="2.5" fontWeight="bold">FROM</text><text x="66" y="39" fill="#222" fontSize="3.5" fontWeight="bold">Company Name</text><rect x="6" y="52" width="108" height="6" fill="#E63946" rx="0.5"/><text x="8" y="56.5" fill="#fff" fontSize="2.5" fontWeight="bold">#  Item  HSN  Qty  Rate  CGST  SGST  Amount</text><rect x="6" y="59" width="108" height="5" fill="#fafaff"/><text x="8" y="62.5" fill="#333" fontSize="2.5">1 Sample Item  8471  2  1,500  9%  9%  3,540</text><rect x="6" y="65" width="108" height="5" fill="#fff"/><text x="8" y="68.5" fill="#333" fontSize="2.5">2 Service  9983  1  5,000  9%  9%  5,900</text><rect x="76" y="74" width="38" height="14" rx="1" fill="#fff0f3"/><text x="78" y="79" fill="#888" fontSize="2.5">Subtotal</text><text x="112" y="79" fill="#222" fontSize="2.5" textAnchor="end">8,000</text><rect x="76" y="88" width="38" height="6" rx="1" fill="#E63946"/><text x="78" y="92" fill="#fff" fontSize="3" fontWeight="bold">TOTAL</text><text x="112" y="92" fill="#fff" fontSize="3" fontWeight="bold" textAnchor="end">₹9,440</text></svg>
                        ),
                        Retail: (
                          <svg viewBox="0 0 120 160" className="w-full h-full"><rect width="120" height="160" fill="#fff"/><text x="60" y="12" fill="#2a9d8f" fontSize="5.5" fontWeight="bold" textAnchor="middle">Company Name</text><text x="60" y="17" fill="#888" fontSize="3" textAnchor="middle">123 Business Ave</text><text x="60" y="21" fill="#888" fontSize="3" textAnchor="middle">GSTIN: 22AAAA0000A1Z5</text><line x1="6" y1="24" x2="114" y2="24" stroke="#aaa" strokeWidth="0.5" strokeDasharray="2,2"/><text x="6" y="32" fill="#888" fontSize="2.5" fontWeight="bold">BILL TO</text><text x="6" y="37" fill="#222" fontSize="3.5" fontWeight="bold">Customer Name</text><rect x="6" y="46" width="108" height="6" fill="#2a9d8f" rx="0.5"/><text x="8" y="50.5" fill="#fff" fontSize="2.5" fontWeight="bold">#  Item  HSN  Qty  Rate  Tax  Amount</text><rect x="6" y="53" width="108" height="5" fill="#f0fff8"/><text x="8" y="56.5" fill="#333" fontSize="2.5">1 Sample Item  8471  2  1,500  18%  3,540</text><rect x="6" y="59" width="108" height="5" fill="#fff"/><text x="8" y="62.5" fill="#333" fontSize="2.5">2 Service  9983  1  5,000  18%  5,900</text><text x="78" y="72" fill="#888" fontSize="2.5">Subtotal</text><text x="112" y="72" fill="#222" fontSize="2.5" textAnchor="end">8,000</text><line x1="76" y1="78" x2="114" y2="78" stroke="#2a9d8f" strokeWidth="0.3"/><text x="78" y="83" fill="#2a9d8f" fontSize="3.5" fontWeight="bold">TOTAL</text><text x="112" y="83" fill="#2a9d8f" fontSize="3.5" fontWeight="bold" textAnchor="end">₹9,440</text><line x1="76" y1="85" x2="114" y2="85" stroke="#2a9d8f" strokeWidth="0.3"/><line x1="6" y1="100" x2="114" y2="100" stroke="#aaa" strokeWidth="0.5" strokeDasharray="2,2"/></svg>
                        ),
                      };
                      return (
                        <div
                          key={opt}
                          onClick={() => setConfig({ ...config, [field.name]: opt })}
                          className={`cursor-pointer rounded-xl border p-3 transition-all duration-200 relative overflow-hidden select-none ${isActive ? "shadow-md ring-2" : "hover:border-foreground-muted hover:shadow-sm"}`}
                          style={{ borderColor: isActive ? accentColor : "var(--border-subtle)", ...(isActive ? { ringColor: accentColor } as any : {}) }}
                        >
                          <div className="aspect-[3/4] rounded-lg mb-3 border overflow-hidden shadow-sm" style={{ borderColor: "var(--border-subtle)" }}>
                            {svgMap[opt]}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium" style={{ color: isActive ? accentColor : "var(--foreground)" }}>{opt}</span>
                            {isActive && (
                              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: accentColor }}>
                                <span className="h-1.5 w-1.5 rounded-full" style={{ background: accentColor }} /> Active
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
          <Button onClick={saveConfig} disabled={saving} size="sm" className="gap-2 mt-2">
            {saving ? <RiLoader4Line className="h-4 w-4 animate-spin" /> : <RiSaveLine className="h-4 w-4" />}
            Save Configuration
          </Button>
        </section>
      )}

      {/* Executor */}
      {plugin.installed && plugin.enabled && executor && executor.type !== "external" && (
        <section className="rounded-xl border p-5 space-y-4" style={{ background: "var(--surface-1)", borderColor: "var(--border-subtle)" }}>
          <div className="flex items-center gap-2">
            <RiFlashlightLine className="h-4 w-4" style={{ color: accentColor }} />
            <h2 className="text-sm font-semibold">{executor.label}</h2>
          </div>
          <p className="text-xs" style={{ color: "var(--foreground-dimmed)" }}>{executor.description}</p>
          {pluginId === "upi-payment-link" && <UPIExecutor config={config} />}
          {pluginId === "pdf-invoice-generator" && <PDFExecutor config={config} />}
          {pluginId === "tally-export" && <TallyExecutor config={config} />}
          {executor.type === "simulated" && <SimulatedExecutor pluginId={pluginId} config={config} />}
        </section>
      )}

      {/* External notice */}
      {plugin.installed && executor?.type === "external" && (
        <section className="rounded-xl border p-5" style={{ background: "color-mix(in oklch, var(--accent-amber), transparent 94%)", borderColor: "color-mix(in oklch, var(--accent-amber), transparent 70%)" }}>
          <div className="flex items-center gap-2 mb-2">
            <RiAlertLine className="h-4 w-4" style={{ color: "var(--accent-amber)" }} />
            <span className="text-sm font-medium" style={{ color: "var(--accent-amber)" }}>External Integration</span>
          </div>
          <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>{executor.description}</p>
        </section>
      )}

      {/* Uninstall */}
      {plugin.installed && (
        <section className="rounded-xl border p-5"
          style={{ background: "var(--surface-1)", borderColor: "color-mix(in oklch, var(--danger), transparent 70%)" }}>
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "color-mix(in oklch, var(--danger), transparent 85%)", color: "var(--danger)" }}>
              <RiDeleteBinLine className="h-4 w-4" />
            </div>
            <div className="flex-1 space-y-2">
              <h2 className="text-sm font-medium">Uninstall Plugin</h2>
              <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
                Remove this plugin and delete all saved configuration. This action cannot be undone.
              </p>
              <Button variant="destructive" size="sm" onClick={uninstallPlugin} className="gap-2">
                <RiDeleteBinLine className="h-3.5 w-3.5" /> Uninstall {plugin.name}
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
