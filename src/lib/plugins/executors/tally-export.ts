/**
 * Tally Export — generates Tally Prime-compatible XML from invoice data.
 * Runs entirely client-side. Downloads as .xml file.
 */

export interface TallyVoucherItem {
  ledgerName: string;
  amount: number;
  isDr: boolean; // true = Debit, false = Credit
}

export interface TallyVoucher {
  voucherNumber: string;
  date: string;       // "YYYYMMDD" format
  voucherType: string; // "Sales", "Purchase", "Receipt", "Payment", "Journal"
  partyName: string;
  narration?: string;
  items: TallyVoucherItem[];
}

export interface TallyExportConfig {
  companyName: string;
  vouchers: TallyVoucher[];
}

/**
 * Generate Tally Prime-compatible XML string.
 */
export function generateTallyXML(config: TallyExportConfig): string {
  const { companyName, vouchers } = config;

  const voucherXMLs = vouchers
    .map((v) => {
      const ledgerEntries = v.items
        .map(
          (item) => `
          <ALLLEDGERENTRIES.LIST>
            <LEDGERNAME>${escapeXml(item.ledgerName)}</LEDGERNAME>
            <ISDEEMEDPOSITIVE>${item.isDr ? "Yes" : "No"}</ISDEEMEDPOSITIVE>
            <AMOUNT>${item.isDr ? -Math.abs(item.amount) : Math.abs(item.amount)}</AMOUNT>
          </ALLLEDGERENTRIES.LIST>`
        )
        .join("");

      return `
      <VOUCHER REMOTEID="${escapeXml(v.voucherNumber)}" VCHTYPE="${escapeXml(v.voucherType)}" ACTION="Create">
        <VOUCHERTYPENAME>${escapeXml(v.voucherType)}</VOUCHERTYPENAME>
        <DATE>${escapeXml(v.date)}</DATE>
        <VOUCHERNUMBER>${escapeXml(v.voucherNumber)}</VOUCHERNUMBER>
        <PARTYLEDGERNAME>${escapeXml(v.partyName)}</PARTYLEDGERNAME>
        <NARRATION>${escapeXml(v.narration || "")}</NARRATION>
        <EFFECTIVEDATE>${escapeXml(v.date)}</EFFECTIVEDATE>${ledgerEntries}
      </VOUCHER>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>All Masters and Vouchers</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>${escapeXml(companyName)}</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
        <TALLYMESSAGE xmlns:UDF="TallyUDF">${voucherXMLs}
        </TALLYMESSAGE>
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;
}

/**
 * Convert quotation/invoice data to Tally vouchers.
 */
export function invoiceToTallyVoucher(
  data: {
    invoiceNo: string;
    date: string; // ISO date or "YYYY-MM-DD"
    customerName: string;
    items: Array<{
      name: string;
      qty: number;
      rate: number;
      gstRate?: number;
    }>;
    notes?: string;
  }
): TallyVoucher {
  const dateStr = data.date.replace(/-/g, ""); // "20260510"
  const subtotal = data.items.reduce(
    (acc, item) => acc + item.qty * item.rate,
    0
  );
  const totalTax = data.items.reduce(
    (acc, item) => acc + item.qty * item.rate * ((item.gstRate || 0) / 100),
    0
  );
  const grandTotal = subtotal + totalTax;

  const ledgerItems: TallyVoucherItem[] = [
    // Debit: Customer (Sundry Debtors)
    {
      ledgerName: data.customerName,
      amount: grandTotal,
      isDr: true,
    },
    // Credit: Sales Account
    {
      ledgerName: "Sales Account",
      amount: subtotal,
      isDr: false,
    },
  ];

  // Add tax ledger entries
  if (totalTax > 0) {
    const halfTax = totalTax / 2;
    ledgerItems.push(
      {
        ledgerName: "CGST",
        amount: halfTax,
        isDr: false,
      },
      {
        ledgerName: "SGST",
        amount: halfTax,
        isDr: false,
      }
    );
  }

  return {
    voucherNumber: data.invoiceNo,
    date: dateStr,
    voucherType: "Sales",
    partyName: data.customerName,
    narration: data.notes || `Sale vide Invoice No. ${data.invoiceNo}`,
    items: ledgerItems,
  };
}

/**
 * Trigger XML download in the browser.
 */
export function downloadTallyXML(xml: string, filename: string = "tally-export.xml") {
  const blob = new Blob([xml], { type: "application/xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// ── TALLY IMPORT ─────────────────────────────────────────────────────────────

export interface TallyImportedVoucher {
  voucherNumber: string;
  date: string;         // "YYYY-MM-DD" formatted
  voucherType: string;
  partyName: string;
  narration: string;
  totalAmount: number;  // Debit total (positive)
  ledgerEntries: Array<{
    ledgerName: string;
    amount: number;
    isDr: boolean;
  }>;
}

export interface TallyImportResult {
  vouchers: TallyImportedVoucher[];
  companyName: string;
  errors: string[];
}

/**
 * Parse a Tally XML file (exported from Tally Prime / Tally ERP 9).
 * Accepts both EXPORTDATA (Tally export) and IMPORTDATA (our own exports) envelopes.
 * Runs entirely client-side using DOMParser.
 */
export function parseTallyXML(xmlString: string): TallyImportResult {
  const errors: string[] = [];
  const vouchers: TallyImportedVoucher[] = [];
  let companyName = "";

  let doc: Document;
  try {
    const parser = new DOMParser();
    doc = parser.parseFromString(xmlString, "application/xml");
    const parseError = doc.querySelector("parsererror");
    if (parseError) throw new Error("Invalid XML: " + parseError.textContent);
  } catch (e: any) {
    return { vouchers: [], companyName: "", errors: [e.message] };
  }

  // Extract company name
  const companyEl =
    doc.querySelector("SVCURRENTCOMPANY") ||
    doc.querySelector("COMPANYNAME");
  if (companyEl?.textContent) companyName = companyEl.textContent.trim();

  // Find all VOUCHER elements — works for both Tally export and our format
  const voucherEls = doc.querySelectorAll("VOUCHER");

  voucherEls.forEach((v, idx) => {
    try {
      const get = (tag: string) =>
        v.querySelector(tag)?.textContent?.trim() || "";

      const rawDate = get("DATE") || get("EFFECTIVEDATE");
      const date = formatTallyDate(rawDate);
      const voucherType = get("VOUCHERTYPENAME") || v.getAttribute("VCHTYPE") || "Journal";
      const voucherNumber =
        get("VOUCHERNUMBER") ||
        v.getAttribute("REMOTEID") ||
        `IMP-${String(idx + 1).padStart(3, "0")}`;
      const partyName = get("PARTYLEDGERNAME") || get("BASICBUYERNAME") || "Unknown";
      const narration = get("NARRATION");

      const ledgerEls = v.querySelectorAll(
        "ALLLEDGERENTRIES\\.LIST, LEDGERENTRIES\\.LIST"
      );

      // If no ledger entries use the direct AMOUNT tag
      const ledgerEntries: TallyImportedVoucher["ledgerEntries"] = [];
      let totalDr = 0;

      if (ledgerEls.length > 0) {
        ledgerEls.forEach((le) => {
          const name = le.querySelector("LEDGERNAME")?.textContent?.trim() || "";
          const rawAmt = le.querySelector("AMOUNT")?.textContent?.trim() || "0";
          const amt = Math.abs(parseFloat(rawAmt) || 0);
          const isDeemedPos =
            le.querySelector("ISDEEMEDPOSITIVE")?.textContent?.trim().toLowerCase() === "yes";
          const isDr = isDeemedPos;
          if (isDr) totalDr += amt;
          ledgerEntries.push({ ledgerName: name, amount: amt, isDr });
        });
      } else {
        // Fallback: use AMOUNT directly (Tally Day Book format)
        const rawAmt = get("AMOUNT");
        const amt = Math.abs(parseFloat(rawAmt) || 0);
        totalDr = amt;
        ledgerEntries.push({ ledgerName: partyName, amount: amt, isDr: true });
        ledgerEntries.push({ ledgerName: "Sales Account", amount: amt, isDr: false });
      }

      vouchers.push({
        voucherNumber,
        date,
        voucherType,
        partyName,
        narration,
        totalAmount: totalDr,
        ledgerEntries,
      });
    } catch (e: any) {
      errors.push(`Voucher ${idx + 1}: ${e.message}`);
    }
  });

  return { vouchers, companyName, errors };
}

/**
 * Convert Tally date "YYYYMMDD" → "YYYY-MM-DD"
 */
function formatTallyDate(raw: string): string {
  const s = raw.replace(/\D/g, "");
  if (s.length === 8) {
    return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
  }
  return raw || new Date().toISOString().split("T")[0];
}

/**
 * Read a File object as text (browser only).
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file, "utf-8");
  });
}

