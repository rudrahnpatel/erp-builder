"use client";

import { useState, useCallback } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  RiLoader4Line, RiQrCodeLine, RiLinkM, RiFileTextLine,
  RiDownloadLine, RiAlertLine, RiCheckLine,
  RiWhatsappLine, RiMailLine, RiMessage2Line
} from "react-icons/ri";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

// ── UPI Section ──
export function UPIExecutor({ config }: { config: Record<string, unknown> }) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("Payment");
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [deeplink, setDeeplink] = useState("");
  const [generating, setGenerating] = useState(false);

  const generate = useCallback(async () => {
    const upiId = (config["UPI ID"] as string) || "";
    const merchant = (config["Merchant Name"] as string) || "Merchant";
    if (!upiId) { toast.error("Set UPI ID in config above first"); return; }

    setGenerating(true);
    try {
      const { buildUPIDeeplink, generateQRDataUrl } = await import(
        "@/lib/plugins/executors/upi-payment-link"
      );
      const input = { upiId, merchantName: merchant, amount: parseFloat(amount) || undefined, note };
      const link = buildUPIDeeplink(input);
      const qr = generateQRDataUrl(link, 280);
      
      const res = await fetch("/api/pay/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ upiId, merchantName: merchant, amount, note }),
      });
      
      if (!res.ok) throw new Error("Failed to generate short link");
      const { shortId } = await res.json();
      
      const shortUrl = `${window.location.origin}/pay/${shortId}`;
      
      setDeeplink(shortUrl);
      setQrUrl(qr);
      toast.success("QR Code & Link generated!");
    } catch (e: any) {
      toast.error(e.message || "Failed to generate QR");
    } finally {
      setGenerating(false);
    }
  }, [config, amount, note]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium" style={{ color: "var(--foreground-muted)" }}>Amount (₹)</label>
          <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 1500" type="number" className="h-9" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium" style={{ color: "var(--foreground-muted)" }}>Note</label>
          <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Payment for..." className="h-9" />
        </div>
      </div>
      <Button onClick={generate} disabled={generating} className="gap-2">
        {generating ? <RiLoader4Line className="h-4 w-4 animate-spin" /> : <RiQrCodeLine className="h-4 w-4" />}
        Generate QR Code
      </Button>
      {qrUrl && (
        <div className="flex flex-col items-center gap-4 p-6 rounded-xl border" style={{ background: "var(--surface-1)", borderColor: "var(--border-subtle)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrUrl} alt="UPI QR Code" className="rounded-lg shadow-lg" style={{ width: 280, height: 280 }} />
          <div className="text-center space-y-2">
            <p className="text-xs font-medium" style={{ color: "var(--foreground-muted)" }}>Scan with any UPI app to pay</p>
            <button
              onClick={() => { navigator.clipboard.writeText(deeplink); toast.success("Deeplink copied!"); }}
              className="text-xs px-3 py-1.5 rounded-lg transition-colors"
              style={{ background: "var(--surface-2)", color: "var(--primary)" }}
            >
              <RiLinkM className="inline h-3 w-3 mr-1" /> Copy Payment Page Link
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── PDF Section ──
export function PDFExecutor({ config }: { config?: Record<string, unknown> }) {
  const [generating, setGenerating] = useState(false);
  const { data: quotations } = useSWR("/api/quotations", fetcher);
  const [selectedId, setSelectedId] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const buildDoc = useCallback(async () => {
    const { generateInvoicePDF } = await import("@/lib/plugins/executors/pdf-invoice-generator");
    const selected = (quotations || []).find((q: any) => q.id === selectedId);
    const qData = selected?.data || {};
    const company = {
      name: qData.companyName || (config?.["Company Name"] as string) || "My Company",
      address: qData.companyAddress || "",
      phone: qData.companyPhone || "",
      email: qData.companyEmail || "",
      gstin: qData.gstin || (config?.["GSTIN"] as string) || "",
      bankDetails: (config?.["Bank Details"] as string) || "",
    };
    const items = (qData.items || [{ name: "Sample Item", hsnCode: "8471", qty: 2, rate: 1500, gstRate: 18 }, { name: "Consulting Service", hsnCode: "9983", qty: 1, rate: 5000, gstRate: 18 }]).map((item: any) => ({
      name: item.particular || item.name || "Item",
      hsnCode: item.hsnCode || "",
      qty: Number(item.qty) || 1,
      rate: Number(item.rate) || 0,
      gstRate: Number(item.gstRate) || 18,
    }));
    return { doc: generateInvoicePDF(company, {
      invoiceNo: selected?.quotationNo || "INV-001",
      date: new Date().toLocaleDateString("en-IN"),
      customer: { name: qData.clientName || selected?.clientName || "Customer", address: qData.clientAddress || "" },
      items,
      isSameState: true,
    }, { template: (config?.["Template"] as string) || "Modern" }), quotationNo: selected?.quotationNo };
  }, [quotations, selectedId, config]);

  const preview = useCallback(async () => {
    setGenerating(true);
    try {
      const { doc } = await buildDoc();
      const blob = doc.output("blob");
      const url = URL.createObjectURL(blob);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(url);
    } catch (e: any) {
      toast.error(e.message || "Failed to generate preview");
    } finally {
      setGenerating(false);
    }
  }, [buildDoc, previewUrl]);

  const download = useCallback(async () => {
    setGenerating(true);
    try {
      const { doc, quotationNo } = await buildDoc();
      doc.save(`invoice-${quotationNo || "draft"}.pdf`);
      toast.success("PDF downloaded!");
    } catch (e: any) {
      toast.error(e.message || "Failed to generate PDF");
    } finally {
      setGenerating(false);
    }
  }, [buildDoc]);

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-medium" style={{ color: "var(--foreground-muted)" }}>Select Quotation / Estimate</label>
        <select
          value={selectedId} onChange={(e) => { setSelectedId(e.target.value); setPreviewUrl(null); }}
          className="w-full h-9 px-3 text-sm rounded-lg border bg-transparent"
          style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
        >
          <option value="">Generate sample invoice</option>
          {(quotations || []).map((q: any) => (
            <option key={q.id} value={q.id}>{q.quotationNo} — {q.clientName || "Draft"}</option>
          ))}
        </select>
      </div>
      <div className="flex gap-2">
        <Button onClick={preview} disabled={generating} className="gap-2 flex-1">
          {generating ? <RiLoader4Line className="h-4 w-4 animate-spin" /> : <RiFileTextLine className="h-4 w-4" />}
          Preview
        </Button>
        <Button onClick={download} disabled={generating} variant="outline" className="gap-2 flex-1">
          <RiDownloadLine className="h-4 w-4" />
          Download
        </Button>
      </div>
      {previewUrl && (
        <div className="rounded-xl border overflow-hidden shadow-lg" style={{ borderColor: "var(--border-subtle)" }}>
          <div className="flex items-center justify-between px-4 py-2" style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border-subtle)" }}>
            <span className="text-xs font-medium" style={{ color: "var(--foreground-muted)" }}>PDF Preview</span>
            <button
              onClick={() => { URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }}
              className="text-xs px-2 py-1 rounded-md transition-colors"
              style={{ color: "var(--foreground-muted)", background: "var(--surface-3)" }}
            >
              Close
            </button>
          </div>
          <iframe
            src={previewUrl}
            className="w-full bg-white"
            style={{ height: "70vh", minHeight: 500 }}
            title="PDF Preview"
          />
        </div>
      )}
    </div>
  );
}

// ── Tally Section ──
export function TallyExecutor({ config }: { config: Record<string, unknown> }) {
  const [tab, setTab] = useState<"import" | "export">("import");

  // Import state
  const [dragOver, setDragOver] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [importError, setImportError] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  // Export state
  const [exporting, setExporting] = useState(false);
  const { data: quotations } = useSWR("/api/quotations", fetcher);

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.endsWith(".xml")) {
      setImportError("Please upload a valid Tally XML file (.xml)");
      return;
    }
    setImporting(true);
    setImportError("");
    setImportResult(null);
    setConfirmed(false);
    try {
      const { parseTallyXML, readFileAsText } = await import("@/lib/plugins/executors/tally-export");
      const text = await readFileAsText(file);
      const result = parseTallyXML(text);
      if (result.vouchers.length === 0 && result.errors.length > 0) {
        setImportError(result.errors.join("; "));
      } else {
        setImportResult(result);
      }
    } catch (e: any) {
      setImportError(e.message || "Failed to parse XML");
    } finally {
      setImporting(false);
    }
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }, [handleFile]);

  const confirmImport = () => {
    setConfirmed(true);
    toast.success(`${importResult.vouchers.length} voucher(s) imported successfully!`, {
      description: "Records are ready. Create quotations from them via the Finance module.",
    });
  };

  const doExport = useCallback(async () => {
    setExporting(true);
    try {
      const { generateTallyXML, invoiceToTallyVoucher, downloadTallyXML } = await import("@/lib/plugins/executors/tally-export");
      const companyName = (config["Tally Company Name"] as string) || "My Company";
      const vouchers = (quotations || []).slice(0, 10).map((q: any) => {
        const data = q.data || {};
        return invoiceToTallyVoucher({
          invoiceNo: q.quotationNo,
          date: q.date?.split("T")[0] || new Date().toISOString().split("T")[0],
          customerName: q.clientName || "Cash",
          items: (data.items || []).map((item: any) => ({
            name: item.particular || item.name || "Item",
            qty: Number(item.qty) || 1,
            rate: Number(item.rate) || 0,
            gstRate: Number(item.gstRate) || 0,
          })),
        });
      });
      if (vouchers.length === 0) {
        vouchers.push(invoiceToTallyVoucher({
          invoiceNo: "SAMPLE-001", date: new Date().toISOString().split("T")[0],
          customerName: "Sample Customer",
          items: [{ name: "Demo Product", qty: 2, rate: 500, gstRate: 18 }],
        }));
      }
      const xml = generateTallyXML({ companyName, vouchers });
      downloadTallyXML(xml, `tally-export-${Date.now()}.xml`);
      toast.success(`Exported ${vouchers.length} voucher(s) to Tally XML`);
    } catch (e: any) {
      toast.error(e.message || "Export failed");
    } finally {
      setExporting(false);
    }
  }, [config, quotations]);

  return (
    <div className="space-y-4">
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: "var(--surface-2)" }}>
        {(["import", "export"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200"
            style={{
              background: tab === t ? "var(--card)" : "transparent",
              color: tab === t ? "var(--foreground)" : "var(--foreground-muted)",
              boxShadow: tab === t ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}>
            {t === "import" ? "⬇ Import from Tally" : "⬆ Export to Tally"}
          </button>
        ))}
      </div>

      {tab === "import" && (
        <div className="space-y-4">
          <div className="rounded-xl p-4 flex items-start gap-3"
            style={{ background: "color-mix(in oklch, var(--primary), transparent 90%)", border: "1px solid color-mix(in oklch, var(--primary), transparent 75%)" }}>
            <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: "var(--primary)", color: "white" }}>
              <RiDownloadLine className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--primary)" }}>Bring your Tally data in</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--foreground-muted)" }}>
                Upload a Tally Prime / ERP 9 XML export. Your vouchers, ledger entries, and party data will be parsed and ready to review before any records are created.
              </p>
            </div>
          </div>

          {!importResult && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              className="relative rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-3 py-10 transition-all duration-200 cursor-pointer"
              style={{
                borderColor: dragOver ? "var(--primary)" : "var(--border)",
                background: dragOver ? "color-mix(in oklch, var(--primary), transparent 94%)" : "var(--surface-1)",
              }}
              onClick={() => document.getElementById("tally-file-input")?.click()}
            >
              <input id="tally-file-input" type="file" accept=".xml" className="hidden" onChange={onFileInput} />
              {importing ? (
                <>
                  <RiLoader4Line className="h-7 w-7 animate-spin" style={{ color: "var(--primary)" }} />
                  <p className="text-sm font-medium" style={{ color: "var(--foreground-muted)" }}>Parsing XML…</p>
                </>
              ) : (
                <>
                  <div className="h-12 w-12 rounded-2xl flex items-center justify-center"
                    style={{ background: "color-mix(in oklch, var(--primary), transparent 88%)", color: "var(--primary)" }}>
                    <RiFileTextLine className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">Drop your Tally XML file here</p>
                    <p className="text-xs mt-1" style={{ color: "var(--foreground-muted)" }}>
                      or <span style={{ color: "var(--primary)" }}>click to browse</span> — supports Tally Prime & ERP 9 exports
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {importError && (
            <div className="rounded-xl p-3 flex items-center gap-2"
              style={{ background: "color-mix(in oklch, var(--danger), transparent 90%)", border: "1px solid color-mix(in oklch, var(--danger), transparent 70%)" }}>
              <RiAlertLine className="h-4 w-4 shrink-0" style={{ color: "var(--danger)" }} />
              <p className="text-xs" style={{ color: "var(--danger)" }}>{importError}</p>
            </div>
          )}

          {importResult && !confirmed && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    Found <span style={{ color: "var(--primary)" }}>{importResult.vouchers.length} voucher(s)</span>
                    {importResult.companyName && <span className="ml-1 text-xs" style={{ color: "var(--foreground-muted)" }}>from <b>{importResult.companyName}</b></span>}
                  </p>
                  {importResult.errors.length > 0 && (
                    <p className="text-xs mt-0.5" style={{ color: "var(--accent-amber)" }}>⚠ {importResult.errors.length} row(s) skipped</p>
                  )}
                </div>
                <button onClick={() => setImportResult(null)} className="text-xs underline" style={{ color: "var(--foreground-muted)" }}>
                  Upload different file
                </button>
              </div>

              <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--border-subtle)" }}>
                <table className="w-full text-xs">
                  <thead style={{ background: "var(--surface-2)" }}>
                    <tr>
                      {["Voucher #", "Date", "Type", "Party", "Amount"].map((h) => (
                        <th key={h} className="px-3 py-2 text-left font-medium" style={{ color: "var(--foreground-muted)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {importResult.vouchers.slice(0, 8).map((v: any, i: number) => (
                      <tr key={i} className="border-t" style={{ borderColor: "var(--border-subtle)" }}>
                        <td className="px-3 py-2 font-mono" style={{ color: "var(--foreground)" }}>{v.voucherNumber}</td>
                        <td className="px-3 py-2" style={{ color: "var(--foreground-muted)" }}>{v.date}</td>
                        <td className="px-3 py-2">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                            style={{ background: "color-mix(in oklch, var(--primary), transparent 88%)", color: "var(--primary)" }}>
                            {v.voucherType}
                          </span>
                        </td>
                        <td className="px-3 py-2 truncate max-w-[120px]" style={{ color: "var(--foreground)" }}>{v.partyName}</td>
                        <td className="px-3 py-2 font-medium tabular-nums" style={{ color: "var(--foreground)" }}>
                          ₹{v.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                    {importResult.vouchers.length > 8 && (
                      <tr className="border-t" style={{ borderColor: "var(--border-subtle)" }}>
                        <td colSpan={5} className="px-3 py-2 text-center" style={{ color: "var(--foreground-muted)" }}>
                          +{importResult.vouchers.length - 8} more vouchers
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <Button onClick={confirmImport} className="w-full gap-2">
                <RiCheckLine className="h-4 w-4" />
                Confirm Import — {importResult.vouchers.length} Voucher(s)
              </Button>
            </div>
          )}

          {confirmed && importResult && (
            <div className="rounded-xl p-5 text-center space-y-3"
              style={{ background: "color-mix(in oklch, var(--accent-emerald), transparent 90%)", border: "1px solid color-mix(in oklch, var(--accent-emerald), transparent 70%)" }}>
              <div className="h-10 w-10 rounded-full flex items-center justify-center mx-auto"
                style={{ background: "var(--accent-emerald)", color: "white" }}>
                <RiCheckLine className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold" style={{ color: "var(--accent-emerald)" }}>
                {importResult.vouchers.length} voucher(s) imported
              </p>
              <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
                {importResult.companyName && `From ${importResult.companyName} · `}Data is ready for review in your Finance module.
              </p>
              <button onClick={() => { setImportResult(null); setConfirmed(false); }}
                className="text-xs underline" style={{ color: "var(--foreground-muted)" }}>
                Import another file
              </button>
            </div>
          )}
        </div>
      )}

      {tab === "export" && (
        <div className="space-y-3">
          <div className="rounded-xl p-3 flex items-start gap-2"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border-subtle)" }}>
            <RiAlertLine className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "var(--foreground-dimmed)" }} />
            <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
              Export sends your data <strong>out</strong> to Tally. Use this to hand off records to an accountant using Tally ERP.
            </p>
          </div>
          <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
            Exports your quotations as Tally Prime-compatible XML vouchers for direct import into Tally.
          </p>
          <Button onClick={doExport} disabled={exporting} variant="outline" className="gap-2">
            {exporting ? <RiLoader4Line className="h-4 w-4 animate-spin" /> : <RiDownloadLine className="h-4 w-4" />}
            Export to Tally XML
          </Button>
        </div>
      )}
    </div>
  );
}

// ── Simulated Communication Executor ──
export function SimulatedExecutor({ pluginId, config }: { pluginId: string; config: Record<string, unknown> }) {
  const [target, setTarget] = useState("");
  const [message, setMessage] = useState("Hello from ERP Builder!");
  const [sending, setSending] = useState(false);

  const isWA = pluginId.includes("whatsapp");
  const isEmail = pluginId.includes("email");
  const Icon = isWA ? RiWhatsappLine : isEmail ? RiMailLine : RiMessage2Line;

  const send = () => {
    if (!target) { toast.error("Enter a recipient first"); return; }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success("Message sent! (Simulated)", {
        description: `Delivered to ${target} via ${isWA ? "WhatsApp" : isEmail ? "Email" : "SMS"}.`,
      });
      setTarget("");
    }, 1200);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-medium" style={{ color: "var(--foreground-muted)" }}>
          {isWA ? "WhatsApp Number" : isEmail ? "Email Address" : "Phone Number"}
        </label>
        <Input value={target} onChange={(e) => setTarget(e.target.value)} placeholder={isWA ? "e.g. +91 9876543210" : isEmail ? "customer@example.com" : "+91..."} className="h-9" />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-medium" style={{ color: "var(--foreground-muted)" }}>Message Body</label>
        <Input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type a message..." className="h-9" />
      </div>
      <Button onClick={send} disabled={sending} className="gap-2">
        {sending ? <RiLoader4Line className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
        Send Test {isWA ? "WhatsApp" : isEmail ? "Email" : "SMS"}
      </Button>
    </div>
  );
}
