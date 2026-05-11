/**
 * PDF Invoice Generator — uses jsPDF (already in project) to generate
 * a professional GST-compliant invoice PDF.
 *
 * Runs entirely client-side. Call generateInvoicePDF() with company + invoice
 * data and it returns the jsPDF instance for preview/download.
 */

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface CompanyInfo {
  name: string;
  tagline?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  gstin?: string;
  pan?: string;
  logo?: string;
  bankDetails?: string;
}

export interface InvoiceItem {
  name: string;
  hsnCode?: string;
  qty: number;
  rate: number;
  gstRate: number; // percentage, e.g. 18
}

export interface InvoiceData {
  invoiceNo: string;
  date: string;
  dueDate?: string;
  customer: {
    name: string;
    address?: string;
    gstin?: string;
    phone?: string;
    email?: string;
    state?: string;
  };
  items: InvoiceItem[];
  notes?: string;
  isSameState?: boolean; // true = CGST+SGST, false = IGST
}

export function generateInvoicePDF(
  company: CompanyInfo,
  invoice: InvoiceData,
  options?: { template?: string }
): jsPDF {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const template = options?.template || "Modern";

  // ── Theme Variables ──
  let primary = [0, 91, 191] as [number, number, number];
  let dark = [30, 30, 35] as [number, number, number];
  let muted = [120, 120, 130] as [number, number, number];
  let light = [245, 245, 250] as [number, number, number];
  let fontName = "helvetica";
  let headerStyle = "band"; // band, classic, minimal, corporate, creative, retail

  switch (template) {
    case "Classic":
      primary = [50, 50, 50];
      light = [255, 255, 255];
      headerStyle = "classic";
      fontName = "times";
      break;
    case "Minimalist":
      primary = [0, 0, 0];
      light = [255, 255, 255];
      headerStyle = "minimal";
      break;
    case "Corporate":
      primary = [20, 50, 80];
      light = [240, 245, 250];
      headerStyle = "corporate";
      break;
    case "Creative":
      primary = [230, 57, 70];
      light = [255, 240, 245];
      headerStyle = "creative";
      break;
    case "Retail":
      primary = [42, 157, 143];
      light = [240, 255, 250];
      headerStyle = "retail";
      break;
    case "Modern":
    default:
      break;
  }

  // Helper function for consistent font setting
  const setFont = (weight: "normal" | "bold") => {
    doc.setFont(fontName, weight);
  };

  // ── Header ──
  if (headerStyle === "band" || headerStyle === "corporate") {
    doc.setFillColor(...primary);
    doc.rect(0, 0, pageWidth, 38, "F");

    setFont("bold");
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text(company.name || "Company Name", margin, 16);

    if (company.tagline) {
      setFont("normal");
      doc.setFontSize(9);
      doc.setTextColor(220, 230, 255);
      doc.text(company.tagline, margin, 23);
    }

    if (company.gstin) {
      setFont("normal");
      doc.setFontSize(9);
      doc.setTextColor(200, 215, 240);
      doc.text(`GSTIN: ${company.gstin}`, margin, company.tagline ? 30 : 23);
    }

    setFont("bold");
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text("INVOICE", pageWidth - margin, 20, { align: "right" });
    y = 46;
  } else if (headerStyle === "classic" || headerStyle === "minimal") {
    setFont("bold");
    doc.setFontSize(22);
    doc.setTextColor(...dark);
    doc.text(company.name || "Company Name", margin, 20);

    setFont("normal");
    doc.setFontSize(10);
    doc.setTextColor(...muted);
    let cy = 26;
    if (company.address) { doc.text(company.address, margin, cy); cy += 5; }
    if (company.gstin) { doc.text(`GSTIN: ${company.gstin}`, margin, cy); cy += 5; }

    setFont("bold");
    doc.setFontSize(24);
    doc.setTextColor(...primary);
    doc.text("INVOICE", pageWidth - margin, 20, { align: "right" });
    
    doc.setDrawColor(...primary);
    doc.line(margin, cy, pageWidth - margin, cy);
    y = cy + 10;
  } else if (headerStyle === "creative") {
    doc.setFillColor(...primary);
    doc.roundedRect(margin, margin, contentWidth, 30, 3, 3, "F");

    setFont("bold");
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text(company.name || "Company Name", margin + 6, margin + 12);

    if (company.gstin) {
      setFont("normal");
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text(`GSTIN: ${company.gstin}`, margin + 6, margin + 20);
    }

    setFont("bold");
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text("INVOICE", pageWidth - margin - 6, margin + 18, { align: "right" });
    y = margin + 40;
  } else if (headerStyle === "retail") {
    setFont("bold");
    doc.setFontSize(20);
    doc.setTextColor(...primary);
    doc.text(company.name || "Company Name", pageWidth / 2, 20, { align: "center" });

    setFont("normal");
    doc.setFontSize(9);
    doc.setTextColor(...muted);
    if (company.address) {
      doc.text(company.address, pageWidth / 2, 26, { align: "center" });
    }
    if (company.gstin) {
      doc.text(`GSTIN: ${company.gstin}`, pageWidth / 2, 31, { align: "center" });
    }

    doc.setDrawColor(...muted);
    doc.setLineDashPattern([2, 2], 0);
    doc.line(margin, 36, pageWidth - margin, 36);
    doc.setLineDashPattern([], 0);

    y = 44;
  }

  // ── Invoice details row ──
  doc.setFontSize(9);
  doc.setTextColor(...muted);
  setFont("normal");

  const leftCol = margin;

  doc.text("INVOICE NO", leftCol, y);
  doc.setTextColor(...dark);
  setFont("bold");
  doc.setFontSize(11);
  doc.text(invoice.invoiceNo, leftCol, y + 5);

  setFont("normal");
  doc.setFontSize(9);
  doc.setTextColor(...muted);
  doc.text("DATE", leftCol + 60, y);
  doc.setTextColor(...dark);
  setFont("bold");
  doc.setFontSize(10);
  doc.text(invoice.date, leftCol + 60, y + 5);

  if (invoice.dueDate) {
    setFont("normal");
    doc.setFontSize(9);
    doc.setTextColor(...muted);
    doc.text("DUE DATE", leftCol + 110, y);
    doc.setTextColor(...dark);
    setFont("bold");
    doc.setFontSize(10);
    doc.text(invoice.dueDate, leftCol + 110, y + 5);
  }

  y += 16;

  // ── Bill To / Company Address ──
  if (headerStyle === "band" || headerStyle === "corporate" || headerStyle === "creative") {
    doc.setFillColor(...light);
    doc.roundedRect(margin, y, contentWidth / 2 - 4, 32, 2, 2, "F");
    doc.roundedRect(margin + contentWidth / 2 + 4, y, contentWidth / 2 - 4, 32, 2, 2, "F");
  } else if (headerStyle === "retail") {
    doc.setDrawColor(...muted);
    doc.setLineDashPattern([1, 1], 0);
    doc.line(margin, y - 4, pageWidth - margin, y - 4);
    doc.setLineDashPattern([], 0);
  }

  // Bill To
  doc.setFontSize(8);
  doc.setTextColor(...muted);
  setFont("bold");
  doc.text("BILL TO", margin + (headerStyle !== "minimal" && headerStyle !== "classic" && headerStyle !== "retail" ? 4 : 0), y + 6);

  setFont("bold");
  doc.setFontSize(10);
  doc.setTextColor(...dark);
  doc.text(invoice.customer.name, margin + (headerStyle !== "minimal" && headerStyle !== "classic" && headerStyle !== "retail" ? 4 : 0), y + 12);

  setFont("normal");
  doc.setFontSize(8);
  doc.setTextColor(...muted);
  let cy = y + 17;
  const billX = margin + (headerStyle !== "minimal" && headerStyle !== "classic" && headerStyle !== "retail" ? 4 : 0);
  if (invoice.customer.address) { doc.text(invoice.customer.address, billX, cy); cy += 4; }
  if (invoice.customer.gstin) { doc.text(`GSTIN: ${invoice.customer.gstin}`, billX, cy); cy += 4; }
  if (invoice.customer.phone) { doc.text(`Ph: ${invoice.customer.phone}`, billX, cy); }

  // From (Company)
  const fromX = margin + contentWidth / 2 + 8;
  if (headerStyle !== "retail") {
    doc.setFontSize(8);
    doc.setTextColor(...muted);
    setFont("bold");
    doc.text("FROM", fromX, y + 6);

    setFont("bold");
    doc.setFontSize(10);
    doc.setTextColor(...dark);
    doc.text(company.name || "", fromX, y + 12);

    setFont("normal");
    doc.setFontSize(8);
    doc.setTextColor(...muted);
    let fy = y + 17;
    if (company.address) { doc.text(company.address, fromX, fy); fy += 4; }
    if (company.phone) { doc.text(`Ph: ${company.phone}`, fromX, fy); fy += 4; }
    if (company.email) { doc.text(company.email, fromX, fy); }
  }

  y += 40;
  if (headerStyle === "retail") y -= 10;

  // ── Items Table ──
  const isSameState = invoice.isSameState !== false;
  const tableHead = isSameState
    ? [["#", "Item", "HSN", "Qty", "Rate (₹)", "CGST", "SGST", "Amount (₹)"]]
    : [["#", "Item", "HSN", "Qty", "Rate (₹)", "IGST", "Amount (₹)"]];

  let subtotal = 0;
  let totalTax = 0;

  const tableBody = invoice.items.map((item, idx) => {
    const lineTotal = item.qty * item.rate;
    const taxAmount = lineTotal * (item.gstRate / 100);
    subtotal += lineTotal;
    totalTax += taxAmount;

    if (isSameState) {
      const halfTax = taxAmount / 2;
      return [
        String(idx + 1),
        item.name,
        item.hsnCode || "-",
        String(item.qty),
        formatINR(item.rate),
        `${(item.gstRate / 2).toFixed(1)}% (${formatINR(halfTax)})`,
        `${(item.gstRate / 2).toFixed(1)}% (${formatINR(halfTax)})`,
        formatINR(lineTotal + taxAmount),
      ];
    } else {
      return [
        String(idx + 1),
        item.name,
        item.hsnCode || "-",
        String(item.qty),
        formatINR(item.rate),
        `${item.gstRate}% (${formatINR(taxAmount)})`,
        formatINR(lineTotal + taxAmount),
      ];
    }
  });

  autoTable(doc, {
    startY: y,
    head: tableHead,
    body: tableBody,
    margin: { left: margin, right: margin },
    styles: {
      font: fontName,
      fontSize: 8.5,
      cellPadding: 3,
      textColor: dark,
      lineColor: headerStyle === "minimal" ? [200, 200, 200] : [220, 220, 225],
      lineWidth: headerStyle === "minimal" ? { bottom: 0.2 } as any : 0.3,
    },
    headStyles: {
      fillColor: headerStyle === "minimal" ? [240, 240, 240] : headerStyle === "classic" ? [200, 200, 200] : primary,
      textColor: headerStyle === "minimal" || headerStyle === "classic" ? dark : [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: headerStyle === "minimal" ? [255, 255, 255] : [250, 250, 255],
    },
    columnStyles: isSameState
      ? {
          0: { cellWidth: 8, halign: "center" },
          1: { cellWidth: "auto" },
          2: { cellWidth: 18 },
          3: { cellWidth: 14, halign: "center" },
          4: { cellWidth: 22, halign: "right" },
          5: { cellWidth: 28, halign: "right" },
          6: { cellWidth: 28, halign: "right" },
          7: { cellWidth: 26, halign: "right" },
        }
      : {
          0: { cellWidth: 8, halign: "center" },
          1: { cellWidth: "auto" },
          2: { cellWidth: 18 },
          3: { cellWidth: 14, halign: "center" },
          4: { cellWidth: 24, halign: "right" },
          5: { cellWidth: 32, halign: "right" },
          6: { cellWidth: 28, halign: "right" },
        },
  });

  // @ts-expect-error autoTable adds lastAutoTable to doc
  y = doc.lastAutoTable.finalY + 6;

  // ── Totals ──
  const totalsX = pageWidth - margin - 70;
  const grandTotal = subtotal + totalTax;

  if (headerStyle === "band" || headerStyle === "corporate" || headerStyle === "creative") {
    doc.setFillColor(...light);
    doc.roundedRect(totalsX - 4, y, 74, isSameState ? 34 : 28, 2, 2, "F");
  }

  setFont("normal");
  doc.setFontSize(9);
  doc.setTextColor(...muted);

  let ty = y + 6;
  doc.text("Subtotal", totalsX, ty);
  doc.setTextColor(...dark);
  doc.text(formatINR(subtotal), pageWidth - margin, ty, { align: "right" });
  ty += 6;

  if (isSameState) {
    doc.setTextColor(...muted);
    doc.text("CGST", totalsX, ty);
    doc.setTextColor(...dark);
    doc.text(formatINR(totalTax / 2), pageWidth - margin, ty, { align: "right" });
    ty += 6;

    doc.setTextColor(...muted);
    doc.text("SGST", totalsX, ty);
    doc.setTextColor(...dark);
    doc.text(formatINR(totalTax / 2), pageWidth - margin, ty, { align: "right" });
    ty += 6;
  } else {
    doc.setTextColor(...muted);
    doc.text("IGST", totalsX, ty);
    doc.setTextColor(...dark);
    doc.text(formatINR(totalTax), pageWidth - margin, ty, { align: "right" });
    ty += 6;
  }

  // Grand total
  if (headerStyle === "band" || headerStyle === "corporate" || headerStyle === "creative") {
    doc.setFillColor(...primary);
    doc.roundedRect(totalsX - 4, ty - 1, 74, 10, 2, 2, "F");
    setFont("bold");
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text("TOTAL", totalsX, ty + 5);
    doc.text(`₹ ${formatINR(grandTotal)}`, pageWidth - margin, ty + 5, { align: "right" });
  } else {
    doc.setDrawColor(...primary);
    doc.line(totalsX - 4, ty - 1, pageWidth - margin, ty - 1);
    setFont("bold");
    doc.setFontSize(11);
    doc.setTextColor(...primary);
    doc.text("TOTAL", totalsX, ty + 5);
    doc.text(`₹ ${formatINR(grandTotal)}`, pageWidth - margin, ty + 5, { align: "right" });
    doc.line(totalsX - 4, ty + 7, pageWidth - margin, ty + 7);
  }

  y = ty + 18;

  // ── Amount in Words ──
  setFont("normal");
  doc.setFontSize(8);
  doc.setTextColor(...muted);
  doc.text("Amount in words:", margin, y);
  setFont("bold");
  doc.setTextColor(...dark);
  doc.text(numberToWords(grandTotal) + " Only", margin, y + 5);

  y += 14;

  // ── Notes ──
  if (invoice.notes) {
    setFont("normal");
    doc.setFontSize(8);
    doc.setTextColor(...muted);
    doc.text("Notes:", margin, y);
    doc.setTextColor(...dark);
    doc.text(invoice.notes, margin, y + 4);
    y += 12;
  }

  // ── Bank Details ──
  if (company.bankDetails) {
    setFont("bold");
    doc.setFontSize(8);
    doc.setTextColor(...muted);
    doc.text("BANK DETAILS", margin, y);
    setFont("normal");
    doc.setTextColor(...dark);
    const bankLines = doc.splitTextToSize(company.bankDetails, contentWidth);
    doc.text(bankLines, margin, y + 5);
  }

  // ── Footer ──
  const footerY = doc.internal.pageSize.getHeight() - 12;
  doc.setDrawColor(220, 220, 225);
  if (headerStyle !== "retail") {
    doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);
  } else {
    doc.setLineDashPattern([2, 2], 0);
    doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);
    doc.setLineDashPattern([], 0);
  }
  
  setFont("normal");
  doc.setFontSize(7);
  doc.setTextColor(...muted);
  doc.text(
    "This is a computer-generated invoice. No signature required.",
    pageWidth / 2,
    footerY,
    { align: "center" }
  );

  return doc;
}

function formatINR(n: number): string {
  return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function numberToWords(n: number): string {
  if (n === 0) return "Zero";

  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen",
  ];
  const tens = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy",
    "Eighty", "Ninety",
  ];

  const intPart = Math.floor(n);
  const parts: string[] = [];

  if (intPart >= 10000000) {
    parts.push(ones[Math.floor(intPart / 10000000)] + " Crore");
  }
  const lakh = Math.floor((intPart % 10000000) / 100000);
  if (lakh > 0) {
    parts.push(convertTwoDigits(lakh, ones, tens) + " Lakh");
  }
  const thousand = Math.floor((intPart % 100000) / 1000);
  if (thousand > 0) {
    parts.push(convertTwoDigits(thousand, ones, tens) + " Thousand");
  }
  const hundred = Math.floor((intPart % 1000) / 100);
  if (hundred > 0) {
    parts.push(ones[hundred] + " Hundred");
  }
  const remainder = intPart % 100;
  if (remainder > 0) {
    parts.push(convertTwoDigits(remainder, ones, tens));
  }

  let result = "Rupees " + parts.join(" ");

  const decimal = Math.round((n - intPart) * 100);
  if (decimal > 0) {
    result += " and " + convertTwoDigits(decimal, ones, tens) + " Paise";
  }

  return result;
}

function convertTwoDigits(n: number, ones: string[], tens: string[]): string {
  if (n < 20) return ones[n];
  return tens[Math.floor(n / 10)] + (n % 10 > 0 ? " " + ones[n % 10] : "");
}
