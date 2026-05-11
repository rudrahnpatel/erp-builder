"use client";

import { useEffect, useState } from "react";
import { RiSecurePaymentLine, RiQrCodeLine, RiSmartphoneLine, RiShieldCheckFill } from "react-icons/ri";

interface PaymentUIProps {
  pa: string | null;
  pn: string | null;
  am?: string | null;
  tn?: string | null;
}

export function PaymentUI({ pa, pn, am, tn }: PaymentUIProps) {
  const [qrUrl, setQrUrl] = useState<string | null>(null);

  const rawUpiLink = `upi://pay?pa=${pa}&pn=${pn}${am ? `&am=${am}` : ""}${tn ? `&tn=${tn}` : ""}&cu=INR`;

  useEffect(() => {
    if (pa && pn) {
      import("qrcode").then((QRCode) => {
        QRCode.toDataURL(rawUpiLink, { width: 300, margin: 1, color: { dark: "#0f172a", light: "#ffffff" } })
          .then(setQrUrl)
          .catch(console.error);
      });
    }
  }, [pa, pn, am, tn, rawUpiLink]);

  if (!pa || !pn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <RiSecurePaymentLine className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h1 className="text-xl font-semibold mb-2">Invalid Payment Link</h1>
        <p className="text-muted-foreground text-sm">This link is missing required payment details.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 selection:bg-primary/20">
      <div className="w-full max-w-md bg-white rounded-[24px] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="bg-slate-900 px-8 pt-10 pb-12 text-center relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="h-16 w-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 border border-white/20 shadow-inner">
              <RiSecurePaymentLine className="h-8 w-8 text-white" />
            </div>
            <p className="text-slate-400 text-sm font-medium uppercase tracking-widest mb-1">Paying To</p>
            <h1 className="text-white text-2xl font-semibold tracking-tight">{pn}</h1>
            {pa && <p className="text-slate-400 text-xs mt-1">{pa}</p>}
          </div>
        </div>

        {/* Amount & Details */}
        <div className="px-8 -mt-6 relative z-20">
          <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 p-6 border border-slate-100 text-center">
            <p className="text-sm text-slate-500 font-medium mb-1">Amount to Pay</p>
            <div className="flex items-center justify-center gap-1">
              <span className="text-3xl font-light text-slate-400">₹</span>
              <span className="text-5xl font-semibold tracking-tight text-slate-800">
                {am ? Number(am).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : "0.00"}
              </span>
            </div>
            {tn && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">For</p>
                <p className="text-sm font-medium text-slate-700">{tn}</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Area */}
        <div className="px-8 pt-8 pb-8 space-y-6">
          
          {/* Mobile Button */}
          <a 
            href={rawUpiLink}
            className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-4 text-sm font-semibold text-white transition-all hover:bg-slate-800 hover:shadow-md active:scale-[0.98]"
          >
            <RiSmartphoneLine className="h-5 w-5 opacity-70 group-hover:opacity-100 transition-opacity" />
            <span>Pay via UPI App</span>
          </a>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs font-medium text-slate-400 uppercase tracking-widest">Or scan on desktop</span>
            </div>
          </div>

          {/* Desktop QR */}
          <div className="flex flex-col items-center justify-center">
            {qrUrl ? (
              <div className="p-2 bg-white border-2 border-slate-100 rounded-2xl shadow-sm">
                <img src={qrUrl} alt="UPI QR Code" className="w-40 h-40 rounded-xl" />
              </div>
            ) : (
              <div className="w-40 h-40 bg-slate-50 rounded-2xl border-2 border-slate-100 animate-pulse"></div>
            )}
            <p className="text-xs text-slate-500 mt-3 flex items-center gap-1.5">
              <RiQrCodeLine className="h-3.5 w-3.5" /> Scan with any UPI app
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 flex items-center justify-center gap-2">
          <RiShieldCheckFill className="h-4 w-4 text-emerald-500" />
          <p className="text-xs font-medium text-slate-500">Secure UPI Payment Gateway</p>
        </div>
        
      </div>
    </div>
  );
}
