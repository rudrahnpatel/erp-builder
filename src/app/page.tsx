import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Building2,
  ArrowRight,
  Blocks,
  Puzzle,
  Database,
  LayoutDashboard,
  Sparkles,
  Shield,
  Zap,
  Globe,
  CheckCircle2,
} from "lucide-react";

const features = [
  {
    icon: Blocks,
    title: "Module Marketplace",
    desc: "Pre-built modules for Inventory, CRM, HR & Payroll, Finance — install in one click.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Database,
    title: "Schema Designer",
    desc: "Design your data tables visually. Add fields, relations, validations — see live preview instantly.",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: LayoutDashboard,
    title: "Page Composer",
    desc: "Drag-drop tables, kanban boards, charts, and forms to build custom dashboards.",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: Puzzle,
    title: "Plugin System",
    desc: "Add WhatsApp notifications, GST invoicing, Razorpay payments with zero code.",
    color: "bg-violet-50 text-violet-600",
  },
];

const stats = [
  { value: "4", label: "Module Packs" },
  { value: "6", label: "Plugins" },
  { value: "50+", label: "Field Types" },
  { value: "INR", label: "Native Currency" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* ─── Navbar ─── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-[#e2e8f0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-[#2b3437]">ERP Builder</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/workspace">
              <Button variant="ghost" size="sm" className="text-sm hidden sm:inline-flex">
                Dashboard
              </Button>
            </Link>
            <Link href="/onboarding">
              <Button size="sm" className="gap-1.5 text-sm">
                Get Started <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/5 border border-primary/10 rounded-full px-4 py-1.5 text-xs font-medium text-primary mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            Built for Indian SMEs
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-[#2b3437] tracking-tight leading-tight max-w-3xl mx-auto">
            Build your own ERP.
            <br />
            <span className="text-primary">No code required.</span>
          </h1>

          <p className="text-base sm:text-lg text-[#64748b] mt-5 max-w-xl mx-auto leading-relaxed">
            Install module packs, configure schemas, compose pages — deploy a
            fully custom ERP tailored to your business in minutes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <Link href="/onboarding">
              <Button size="lg" className="gap-2 text-base px-8 h-12 w-full sm:w-auto">
                <Zap className="h-5 w-5" /> Start Building — Free
              </Button>
            </Link>
            <Link href="/workspace">
              <Button
                variant="outline"
                size="lg"
                className="gap-2 text-base px-8 h-12 w-full sm:w-auto"
              >
                View Demo
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-6 sm:gap-10 mt-12 flex-wrap">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-[#2b3437]">{s.value}</div>
                <div className="text-xs text-[#94a3b8] mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-primary/5 to-transparent rounded-full blur-3xl -z-10" />
      </section>

      {/* ─── Features ─── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#2b3437]">
            Everything you need to build an ERP
          </h2>
          <p className="text-[#64748b] mt-2 max-w-lg mx-auto text-sm sm:text-base">
            A complete toolkit designed for Indian businesses — from inventory
            to invoicing.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-2xl border border-[#e2e8f0] p-6 hover:shadow-lg hover:border-primary/20 transition-all group"
            >
              <div
                className={`h-12 w-12 rounded-xl flex items-center justify-center mb-4 ${f.color}`}
              >
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-[#2b3437] mb-1.5">
                {f.title}
              </h3>
              <p className="text-sm text-[#64748b] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section className="bg-white border-y border-[#e2e8f0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#2b3437]">
              Up and running in 3 steps
            </h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "1",
                title: "Choose your modules",
                desc: "Browse the marketplace. Install Inventory, CRM, HR — whichever packs your business needs.",
              },
              {
                step: "2",
                title: "Configure & customize",
                desc: "Tweak schemas, design pages with drag-drop, add plugins like WhatsApp or Razorpay.",
              },
              {
                step: "3",
                title: "Deploy on your domain",
                desc: "Claim a subdomain or point your own. Your ERP is live for your team in seconds.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="h-10 w-10 rounded-full bg-primary text-white text-lg font-bold flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-base font-semibold text-[#2b3437] mb-1.5">
                  {item.title}
                </h3>
                <p className="text-sm text-[#64748b] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#005bbf] via-[#0066d6] to-[#1a73e8] p-8 sm:p-14 text-center text-white">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            Ready to build your ERP?
          </h2>
          <p className="text-white/70 text-sm sm:text-base max-w-md mx-auto mb-8">
            Join hundreds of Indian businesses who&apos;ve built custom ERP
            systems without writing a single line of code.
          </p>
          <Link href="/onboarding">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 gap-2 text-base h-12 px-8"
            >
              Get Started Free <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>

          <div className="flex items-center justify-center gap-6 mt-8 text-xs text-white/60 flex-wrap">
            {["No credit card required", "Free tier available", "Made in India"].map(
              (t) => (
                <span key={t} className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> {t}
                </span>
              )
            )}
          </div>

          {/* Decoration */}
          <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -left-5 -top-5 h-24 w-24 rounded-full bg-white/5" />
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-[#e2e8f0] bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#94a3b8]">
          <p>© 2026 ERP Builder. Built for Indian SMEs.</p>
          <div className="flex gap-4">
            <span className="hover:text-[#64748b] cursor-pointer">Documentation</span>
            <span className="hover:text-[#64748b] cursor-pointer">API Reference</span>
            <span className="hover:text-[#64748b] cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
