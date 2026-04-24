"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { mutate } from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  ArrowRight,
  ArrowLeft,
  Package,
  Users,
  Briefcase,
  IndianRupee,
  Blocks,
  Sparkles,
  Check,
  Globe,
  Rocket,
  ChevronRight,
  Puzzle,
  Zap,
} from "lucide-react";

/* ─── Presets ─── */
const presets = [
  {
    id: "inventory",
    name: "Inventory & Warehouse",
    desc: "Track stock, suppliers, godowns. Perfect for distributors.",
    icon: Package,
    color: "bg-blue-50 text-blue-600 border-blue-200",
    modules: ["Inventory", "Suppliers", "Stock Movements"],
    plugins: ["WhatsApp Notifications", "GST Invoice Generator"],
  },
  {
    id: "crm",
    name: "Sales CRM",
    desc: "Manage leads, deals, and sales pipelines for your team.",
    icon: Users,
    color: "bg-emerald-50 text-emerald-600 border-emerald-200",
    modules: ["CRM & Sales", "Contacts", "Deals"],
    plugins: ["Email Campaigns", "Payment Gateway (Razorpay)"],
  },
  {
    id: "hr",
    name: "HR & Attendance",
    desc: "Employee management, attendance tracking, leave management.",
    icon: Briefcase,
    color: "bg-amber-50 text-amber-600 border-amber-200",
    modules: ["HR & Payroll", "Attendance", "Leave Management"],
    plugins: ["Employee Attendance", "Leave Management"],
  },
  {
    id: "finance",
    name: "Finance & Billing",
    desc: "Invoicing, GST, expenses. Generate P&L statements instantly.",
    icon: IndianRupee,
    color: "bg-violet-50 text-violet-600 border-violet-200",
    modules: ["Finance", "Invoices", "Expenses"],
    plugins: ["GST Invoice Generator", "Payment Gateway (Razorpay)"],
  },
];

/* ─── Steps ─── */
const stepLabels = [
  { label: "Name Your App", icon: Building2 },
  { label: "Choose Template", icon: Blocks },
  { label: "Claim Domain", icon: Globe },
  { label: "Launch", icon: Rocket },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [appName, setAppName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [buildMode, setBuildMode] = useState<"preset" | "custom" | null>(null);
  const [subdomain, setSubdomain] = useState("");
  const [adminId, setAdminId] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [domainAvailable, setDomainAvailable] = useState<boolean | null>(null);
  const [domainReason, setDomainReason] = useState<string | null>(null);
  const [checkingDomain, setCheckingDomain] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [launchError, setLaunchError] = useState<string | null>(null);

  const checkDomain = async () => {
    if (!subdomain) return;
    setCheckingDomain(true);
    setDomainReason(null);
    try {
      const res = await fetch(
        `/api/workspace/check-slug?slug=${encodeURIComponent(subdomain)}`
      );
      const data = await res.json();
      setDomainAvailable(Boolean(data.available));
      setDomainReason(data.reason || null);
    } catch {
      setDomainAvailable(false);
      setDomainReason("Couldn't reach the server. Try again.");
    } finally {
      setCheckingDomain(false);
    }
  };

  const handleLaunch = async () => {
    setLaunching(true);
    setLaunchError(null);
    try {
      const res = await fetch("/api/onboarding/launch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appName,
          companyName,
          subdomain,
          presetId: selectedPreset,
          adminId,
          adminPassword,
        })
      });
      
      const data = await res.json().catch(() => ({}));
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to launch. Please try again.");
      }

      await mutate("/api/workspace");
      router.push("/workspace");
    } catch (e: any) {
      console.error(e);
      setLaunchError(e.message || "Failed to launch. Please try again.");
      setLaunching(false);
    }
  };


  const canProceed = () => {
    if (step === 0) return appName.trim().length >= 2;
    if (step === 1) return buildMode === "custom" || selectedPreset !== null;
    if (step === 2) return domainAvailable === true && adminId.trim().length >= 3 && adminPassword.length >= 6;
    return true;
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>
      {/* Top Bar */}
      <div className="h-14 border-b px-4 sm:px-6 flex items-center justify-between shrink-0 glass" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: "var(--primary-subtle)" }}>
            <Building2 className="h-4 w-4" style={{ color: "var(--primary)" }} />
          </div>
          <span className="font-bold text-sm" style={{ color: "var(--foreground)" }}>ERP Builder</span>
        </div>

        {/* Step indicator */}
        <div className="hidden sm:flex items-center gap-1">
          {stepLabels.map((s, i) => (
            <div key={s.label} className="flex items-center">
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  i === step
                    ? "bg-primary text-white"
                    : i < step
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-[#94a3b8]"
                }`}
              >
                {i < step ? <Check className="h-3 w-3" /> : <s.icon className="h-3 w-3" />}
                <span className="hidden md:inline">{s.label}</span>
              </div>
              {i < stepLabels.length - 1 && (
                <ChevronRight className="h-3 w-3 text-[#cbd5e1] mx-0.5" />
              )}
            </div>
          ))}
        </div>
        {/* Mobile step indicator */}
        <span className="sm:hidden text-xs text-[#64748b]">Step {step + 1} of 4</span>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-2xl">
          {/* ─── STEP 0: Name Your App ─── */}
          {step === 0 && (
            <form onSubmit={(e) => { e.preventDefault(); if(canProceed()) setStep(step + 1); }} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Building2 className="h-7 w-7 text-primary" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--foreground)" }}>
                  Let&apos;s build your ERP
                </h1>
                <p className="mt-2 text-sm sm:text-base" style={{ color: "var(--foreground-muted)" }}>
                  Start by naming your application and company
                </p>
              </div>

              <div className="rounded-2xl border p-5 sm:p-8 space-y-5" style={{ background: "var(--card)", borderColor: "var(--border-subtle)" }}>
                <div>
                  <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--foreground)" }}>
                    Application Name
                  </label>
                  <Input
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    placeholder="e.g. Acme ERP, My Business App"
                    className="h-11 text-base"
                    autoFocus
                  />
                  <p className="text-xs mt-1.5" style={{ color: "var(--foreground-muted)" }}>
                    This will be the display name of your ERP application
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--foreground)" }}>
                    Company Name
                  </label>
                  <Input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Acme Traders Pvt Ltd"
                    className="h-11 text-base"
                  />
                </div>
              </div>
            </form>
          )}

          {/* ─── STEP 1: Choose Template ─── */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center">
                <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--foreground)" }}>
                  How do you want to start?
                </h1>
                <p className="mt-2 text-sm sm:text-base" style={{ color: "var(--foreground-muted)" }}>
                  Pick a preset to get up and running instantly, or start from scratch
                </p>
              </div>

              {/* Build from scratch */}
              <button
                onClick={() => {
                  setBuildMode("custom");
                  setSelectedPreset(null);
                }}
                className={`w-full text-left rounded-2xl border-2 p-5 sm:p-6 transition-all group`}
                style={{
                  background: "var(--card)",
                  borderColor: buildMode === "custom" ? "var(--primary)" : "var(--border)",
                  boxShadow: buildMode === "custom" ? "0 10px 25px -5px var(--primary-subtle)" : "none"
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--primary-subtle)" }}>
                    <Sparkles className="h-6 w-6" style={{ color: "var(--primary)" }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>
                        Build from scratch
                      </h3>
                      <Badge className="border-0 text-[10px]" style={{ background: "var(--warning-subtle)", color: "var(--warning)" }}>
                        Advanced
                      </Badge>
                    </div>
                    <p className="text-sm mt-1" style={{ color: "var(--foreground-muted)" }}>
                      Start empty. Add modules, design schemas, compose pages
                      yourself using the full builder toolkit.
                    </p>
                  </div>
                  {buildMode === "custom" && (
                    <Check className="h-5 w-5 text-primary shrink-0 mt-1" />
                  )}
                </div>
              </button>

              {/* Presets */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--foreground-dimmed)" }}>
                  Or start with a preset
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {presets.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        setBuildMode("preset");
                        setSelectedPreset(preset.id);
                      }}
                      className={`text-left rounded-xl border-2 p-4 sm:p-5 transition-all`}
                      style={{
                        background: "var(--card)",
                        borderColor: selectedPreset === preset.id ? "var(--primary)" : "var(--border)",
                        boxShadow: selectedPreset === preset.id ? "0 10px 25px -5px var(--primary-subtle)" : "none"
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div
                          className={`h-10 w-10 rounded-lg flex items-center justify-center border`}
                          style={{ borderColor: "var(--border-subtle)", background: "var(--surface-2)", color: "var(--foreground)" }}
                        >
                          <preset.icon className="h-5 w-5" />
                        </div>
                        {selectedPreset === preset.id && (
                          <Check className="h-4 w-4" style={{ color: "var(--primary)" }} />
                        )}
                      </div>
                      <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--foreground)" }}>
                        {preset.name}
                      </h3>
                      <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--foreground-muted)" }}>
                        {preset.desc}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {preset.modules.slice(0, 2).map((m) => (
                          <Badge
                            key={m}
                            variant="secondary"
                            className="text-[10px] font-normal"
                          >
                            <Package className="h-2.5 w-2.5 mr-1" />
                            {m}
                          </Badge>
                        ))}
                        {preset.plugins.length > 0 && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] font-normal"
                          >
                            <Puzzle className="h-2.5 w-2.5 mr-1" />
                            +{preset.plugins.length} plugins
                          </Badge>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── STEP 2: Claim Domain ─── */}
          {step === 2 && (
            <form onSubmit={(e) => { e.preventDefault(); if(canProceed()) setStep(step + 1); }} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center">
                <div className="h-14 w-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "var(--primary-subtle)" }}>
                  <Globe className="h-7 w-7" style={{ color: "var(--primary)" }} />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--foreground)" }}>
                  Claim your domain
                </h1>
                <p className="mt-2 text-sm sm:text-base" style={{ color: "var(--foreground-muted)" }}>
                  Your ERP app will be accessible at this address
                </p>
              </div>

              <div className="rounded-2xl border p-5 sm:p-8 space-y-5" style={{ background: "var(--card)", borderColor: "var(--border-subtle)" }}>
                {/* Subdomain */}
                <div>
                  <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--foreground)" }}>
                    Choose a subdomain
                  </label>
                  <div className="flex items-center gap-0">
                    <Input
                      value={subdomain}
                      onChange={(e) => {
                        setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
                        setDomainAvailable(null);
                        setDomainReason(null);
                      }}
                      placeholder="acme-traders"
                      className="h-11 text-base rounded-r-none border-r-0"
                    />
                    <div className="h-11 px-4 border rounded-r-lg flex items-center text-sm font-mono whitespace-nowrap" style={{ background: "var(--surface-2)", borderColor: "var(--border-subtle)", color: "var(--foreground-muted)" }}>
                      .erpbuilder.app
                    </div>
                  </div>

                  {subdomain && (
                    <div className="mt-2">
                      {domainAvailable === null ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={checkDomain}
                          disabled={checkingDomain}
                          className="text-xs"
                        >
                          {checkingDomain ? "Checking…" : "Check Availability"}
                        </Button>
                      ) : domainAvailable ? (
                        <p className="text-sm text-emerald-600 flex items-center gap-1.5">
                          <Check className="h-4 w-4" />
                          <span className="font-mono font-medium">
                            {subdomain}.erpbuilder.app
                          </span>{" "}
                          is available!
                        </p>
                      ) : (
                        <p className="text-sm text-red-500">
                          {domainReason || "This subdomain isn't available."}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Custom domain */}
                <div className="pt-4 border-t" style={{ borderColor: "var(--border-subtle)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                      Custom Domain (optional)
                    </label>
                    <Badge className="border-0 text-[10px]" style={{ background: "var(--primary-subtle)", color: "var(--primary)" }}>
                      Pro
                    </Badge>
                  </div>
                  <Input
                    placeholder="erp.yourdomain.com"
                    className="h-11 text-base"
                    disabled
                  />
                  <p className="text-xs mt-1.5" style={{ color: "var(--foreground-muted)" }}>
                    Point your domain&apos;s CNAME to{" "}
                    <code className="px-1 py-0.5 rounded text-[10px]" style={{ background: "var(--surface-2)" }}>
                      cname.erpbuilder.app
                    </code>
                  </p>
                </div>

                {/* Admin Account Setup */}
                <div className="pt-4 border-t" style={{ borderColor: "var(--border-subtle)" }}>
                  <h3 className="text-sm font-medium mb-4" style={{ color: "var(--foreground)" }}>
                    Admin Account Setup
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--foreground)" }}>
                        Admin Username / ID
                      </label>
                      <Input
                        value={adminId}
                        onChange={(e) => setAdminId(e.target.value)}
                        placeholder="admin"
                        className="h-11 text-base"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--foreground)" }}>
                        Admin Password
                      </label>
                      <Input
                        type="password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="••••••••"
                        className="h-11 text-base"
                        required
                      />
                      <p className="text-xs mt-1.5" style={{ color: "var(--foreground-muted)" }}>
                        Must be at least 6 characters long
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* ─── STEP 3: Launch ─── */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center">
                <div className="h-14 w-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "var(--success-subtle)" }}>
                  <Rocket className="h-7 w-7" style={{ color: "var(--success)" }} />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--foreground)" }}>
                  Ready to launch!
                </h1>
                <p className="mt-2 text-sm sm:text-base" style={{ color: "var(--foreground-muted)" }}>
                  Review your configuration before deploying
                </p>
              </div>

              <div className="rounded-2xl border p-5 sm:p-8 space-y-4" style={{ background: "var(--card)", borderColor: "var(--border-subtle)" }}>
                {/* Summary */}
                {[
                  { label: "Application", value: appName || "Untitled" },
                  { label: "Company", value: companyName || "—" },
                  {
                    label: "Template",
                    value:
                      buildMode === "custom"
                        ? "Custom Build"
                        : presets.find((p) => p.id === selectedPreset)?.name || "—",
                  },
                  {
                    label: "Domain",
                    value: `${subdomain}.erpbuilder.app`,
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between py-3 border-b last:border-0" style={{ borderColor: "var(--border-subtle)" }}
                  >
                    <span className="text-sm" style={{ color: "var(--foreground-muted)" }}>{row.label}</span>
                    <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                      {row.value}
                    </span>
                  </div>
                ))}

                {/* Included modules for preset */}
                {buildMode === "preset" && selectedPreset && (
                  <div className="pt-2">
                    <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2">
                      Included modules & plugins
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {presets
                        .find((p) => p.id === selectedPreset)
                        ?.modules.map((m) => (
                          <Badge
                            key={m}
                            variant="secondary"
                            className="text-xs"
                          >
                            <Package className="h-3 w-3 mr-1" />
                            {m}
                          </Badge>
                        ))}
                      {presets
                        .find((p) => p.id === selectedPreset)
                        ?.plugins.map((p) => (
                          <Badge
                            key={p}
                            className="text-xs bg-primary/10 text-primary border-0"
                          >
                            <Puzzle className="h-3 w-3 mr-1" />
                            {p}
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {launchError && (
                <div className="p-3 bg-red-50/50 text-red-500 text-sm rounded-xl border border-red-200/50 text-center animate-in fade-in slide-in-from-bottom-2">
                  {launchError}
                </div>
              )}

              <Button
                onClick={handleLaunch}
                disabled={launching}
                className="w-full h-12 text-base font-semibold gap-2"
                size="lg"
              >
                {launching ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Deploying your ERP...
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5" /> Launch My ERP
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      {step < 3 && (
        <div className="sticky bottom-0 z-50 border-t px-4 sm:px-6 py-3 flex items-center justify-between glass" style={{ borderColor: "var(--border-subtle)" }}>
          <Button
            type="button"
            variant="ghost"
            disabled={step === 0}
            onClick={() => setStep(Math.max(0, step - 1))}
            className="gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <Button
            type="button"
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
            className="gap-1.5"
          >
            Continue <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
