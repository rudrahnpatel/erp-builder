import Link from "next/link";
import { SplineScene } from "@/components/ui/SplineScene";
import { Button } from "@/components/ui/button";
import {
  Building2,
  ArrowRight,
  Blocks,
  Puzzle,
  Database,
  LayoutDashboard,
  CheckCircle2,
} from "lucide-react";

const features = [
  {
    icon: Blocks,
    eyebrow: "01 · Modules",
    title: "A marketplace, not a template dump",
    desc: "Inventory, CRM, HR & payroll, finance — each pack ships with schemas, pages and sensible defaults. Install in one click, then bend it to your business.",
    accentVar: "--accent-blue",
    span: "lg:col-span-7",
  },
  {
    icon: Database,
    eyebrow: "02 · Schema",
    title: "Schema designer that respects your data",
    desc: "Tables, relations, validations — visually. No hand-written migrations, no re-deploys, no downtime.",
    accentVar: "--accent-emerald",
    span: "lg:col-span-5",
  },
  {
    icon: LayoutDashboard,
    eyebrow: "03 · Pages",
    title: "Compose pages like Lego, not Photoshop",
    desc: "Drop in tables, kanban boards, charts and forms. Wire them to schemas with a click. Ship the view your team actually uses.",
    accentVar: "--accent-amber",
    span: "lg:col-span-5",
  },
  {
    icon: Puzzle,
    eyebrow: "04 · Plugins",
    title: "WhatsApp, GST, Razorpay — already wired",
    desc: "Send invoices over WhatsApp. Generate GST-compliant PDFs. Accept payments on Razorpay. Zero code, zero glue.",
    accentVar: "--accent-violet",
    span: "lg:col-span-7",
  },
];

const stats = [
  { value: "4", label: "module packs" },
  { value: "6", label: "plugins" },
  { value: "50+", label: "field types" },
  { value: "INR", label: "native currency" },
];

const steps = [
  {
    step: "01",
    title: "Pick your modules",
    desc: "Browse the marketplace. Install Inventory, CRM, HR — whichever packs your business runs on.",
  },
  {
    step: "02",
    title: "Bend it to your shape",
    desc: "Tweak schemas, wire up pages with drag-drop, drop in plugins like WhatsApp or Razorpay.",
  },
  {
    step: "03",
    title: "Ship to your team",
    desc: "Claim a subdomain or point your own. Your ERP is live for your team in under a minute.",
  },
];

export default function LandingPage() {
  return (
    <div
      id="main-content"
      className="relative min-h-[100dvh]"
      style={{ background: "var(--background)" }}
    >
      {/* Noise overlay — breaks the digital-flat feel */}
      <div className="noise-overlay" aria-hidden="true" />

      {/* ─── Navbar ─── */}
      <header
        className="sticky top-0 z-50 glass"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <nav
          aria-label="Primary"
          className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between"
        >
          <Link href="/" className="flex items-center gap-2.5 group">
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center"
              style={{
                background: "var(--primary)",
                boxShadow: "inset 0 1px 0 oklch(1 0 0 / 0.15)",
              }}
            >
              <Building2 className="h-4 w-4 text-white" aria-hidden="true" />
            </div>
            <span
              className="font-semibold tracking-tight"
              style={{ color: "var(--foreground)" }}
            >
              The Ledger
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/workspace">
              <Button
                variant="ghost"
                size="sm"
                className="text-sm hidden sm:inline-flex"
              >
                Dashboard
              </Button>
            </Link>
            <Link href="/onboarding">
              <Button size="sm" className="gap-1.5 text-sm font-medium">
                Start building <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* ─── Hero — deliberately asymmetric ─── */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 sm:pt-28 pb-20">
          <div className="grid lg:grid-cols-12 gap-x-8 gap-y-10 items-start">
            <div className="lg:col-span-8">
              <div
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-medium mb-6 mono"
                style={{
                  background: "color-mix(in oklch, var(--primary), transparent 92%)",
                  color: "var(--primary)",
                  border:
                    "1px solid color-mix(in oklch, var(--primary), transparent 80%)",
                }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: "var(--primary)" }}
                />
                built for indian SMEs · v0.1
              </div>

              <h1
                className="text-4xl sm:text-5xl lg:text-[5.5rem] font-semibold leading-[0.95]"
                style={{ color: "var(--foreground)" }}
              >
                Build the ERP{" "}
                <span style={{ color: "var(--foreground-muted)" }}>
                  your business
                </span>{" "}
                actually needs.
              </h1>

              <p
                className="text-base sm:text-lg mt-7 max-w-xl leading-relaxed"
                style={{ color: "var(--foreground-muted)" }}
              >
                Install module packs, configure schemas, compose pages — deploy
                a custom ERP tailored to your business. No consultants. No
                quarter-long implementations. No code.
              </p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-9">
                <Link href="/onboarding">
                  <Button
                    size="lg"
                    className="gap-2 text-base px-7 h-12 w-full sm:w-auto font-medium"
                  >
                    Start building, free <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/workspace">
                  <Button
                    variant="outline"
                    size="lg"
                    className="gap-2 text-base px-7 h-12 w-full sm:w-auto"
                  >
                    See the demo workspace
                  </Button>
                </Link>
              </div>

              {/* Stats row — offset left, tabular nums, no fake trends */}
              <dl className="flex items-end gap-8 sm:gap-12 mt-16 flex-wrap">
                {stats.map((s) => (
                  <div key={s.label} className="flex flex-col">
                    <dt
                      className="text-[10px] uppercase tracking-[0.12em] mb-1.5"
                      style={{ color: "var(--foreground-dimmed)" }}
                    >
                      {s.label}
                    </dt>
                    <dd
                      className="text-2xl sm:text-3xl font-semibold tabular-nums"
                      style={{ color: "var(--foreground)" }}
                    >
                      {s.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Right column — floating code-ish visual, not centered */}
            <aside
              className="lg:col-span-4 lg:mt-6 hidden lg:block"
              aria-hidden="true"
            >
              <div
                className="rounded-xl p-5 relative overflow-hidden"
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border-subtle)",
                  boxShadow: "var(--shadow-lg)",
                }}
              >
                <div className="flex items-center gap-1.5 mb-4">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: "oklch(0.60 0.18 25)" }}
                  />
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: "oklch(0.75 0.16 75)" }}
                  />
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: "oklch(0.68 0.17 155)" }}
                  />
                  <span
                    className="ml-auto text-[10px] mono"
                    style={{ color: "var(--foreground-dimmed)" }}
                  >
                    schemas / products.json
                  </span>
                </div>
                <pre
                  className="mono text-[11px] leading-[1.65] whitespace-pre-wrap"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  <span style={{ color: "var(--foreground-dimmed)" }}>
                    {"// auto-generated"}
                  </span>
                  {"\n"}
                  <span style={{ color: "var(--primary)" }}>table</span>{" "}
                  <span style={{ color: "var(--foreground)" }}>products</span>{" "}
                  {"{"}
                  {"\n  "}
                  <span style={{ color: "var(--foreground)" }}>sku</span>{" "}
                  <span style={{ color: "var(--accent-emerald)" }}>text</span>{" "}
                  <span style={{ color: "var(--foreground-dimmed)" }}>
                    @unique
                  </span>
                  {"\n  "}
                  <span style={{ color: "var(--foreground)" }}>price</span>{" "}
                  <span style={{ color: "var(--accent-emerald)" }}>decimal</span>{" "}
                  <span style={{ color: "var(--foreground-dimmed)" }}>
                    @GST(18%)
                  </span>
                  {"\n  "}
                  <span style={{ color: "var(--foreground)" }}>stock</span>{" "}
                  <span style={{ color: "var(--accent-emerald)" }}>int</span>{" "}
                  <span style={{ color: "var(--foreground-dimmed)" }}>
                    @min(0)
                  </span>
                  {"\n  "}
                  <span style={{ color: "var(--foreground)" }}>supplier</span>{" "}
                  <span style={{ color: "var(--accent-violet)" }}>
                    → suppliers
                  </span>
                  {"\n"}
                  {"}"}
                </pre>
              </div>
              <div
                className="mt-3 rounded-xl p-4"
                style={{
                  background: "var(--surface-1)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span
                    className="mono"
                    style={{ color: "var(--foreground-dimmed)" }}
                  >
                    products · 1,284 rows
                  </span>
                  <span
                    className="flex items-center gap-1.5"
                    style={{ color: "var(--success)" }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: "var(--success)" }}
                    />
                    synced
                  </span>
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* Vibrant 3D Spline Interactive Element */}
        <div
          className="absolute top-0 right-[-10%] w-[1200px] h-[800px] -z-10 opacity-70 pointer-events-none"
          style={{ maskImage: "radial-gradient(ellipse at center, black 40%, transparent 70%)", WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 70%)" }}
        >
          <SplineScene
            scene="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode"
            className="w-full h-full"
          />
        </div>
      </section>

      {/* ─── Features — asymmetric 12-col zig-zag ─── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="mb-14 max-w-2xl">
          <p
            className="text-[11px] uppercase tracking-[0.14em] mb-3 mono"
            style={{ color: "var(--foreground-dimmed)" }}
          >
            / what you get
          </p>
          <h2
            className="text-3xl sm:text-4xl font-semibold"
            style={{ color: "var(--foreground)" }}
          >
            Four pieces. One ERP that fits.
          </h2>
        </div>

        <div className="grid lg:grid-cols-12 gap-5">
          {features.map((f) => (
            <article
              key={f.title}
              className={`group rounded-2xl p-7 sm:p-8 card-interactive spotlight relative ${f.span}`}
              style={{
                background: "var(--card)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div className="flex items-start justify-between mb-6">
                <div
                  className="h-11 w-11 rounded-xl flex items-center justify-center"
                  style={{
                    background: `color-mix(in oklch, var(${f.accentVar}), transparent 88%)`,
                    color: `var(${f.accentVar})`,
                  }}
                >
                  <f.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <span
                  className="text-[10px] uppercase tracking-[0.14em] mono"
                  style={{ color: "var(--foreground-dimmed)" }}
                >
                  {f.eyebrow}
                </span>
              </div>
              <h3
                className="text-xl font-semibold mb-2.5 leading-snug"
                style={{ color: "var(--foreground)" }}
              >
                {f.title}
              </h3>
              <p
                className="text-sm leading-relaxed max-w-[52ch]"
                style={{ color: "var(--foreground-muted)" }}
              >
                {f.desc}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section
        style={{
          borderTop: "1px solid var(--border-subtle)",
          borderBottom: "1px solid var(--border-subtle)",
          background: "var(--surface-1)",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
          <div className="mb-14 max-w-2xl">
            <p
              className="text-[11px] uppercase tracking-[0.14em] mb-3 mono"
              style={{ color: "var(--foreground-dimmed)" }}
            >
              / workflow
            </p>
            <h2
              className="text-3xl sm:text-4xl font-semibold"
              style={{ color: "var(--foreground)" }}
            >
              From empty workspace to live ERP in three steps.
            </h2>
          </div>

          <ol className="grid gap-0 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            {steps.map((item, i) => (
              <li
                key={item.step}
                className="p-6 md:p-8 first:pl-0 last:pr-0"
                style={{
                  borderColor: "var(--border-subtle)",
                }}
              >
                <div
                  className="text-[11px] mono mb-4"
                  style={{ color: "var(--foreground-dimmed)" }}
                >
                  step {item.step}
                </div>
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: "var(--foreground)" }}
                >
                  {item.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  {item.desc}
                </p>
                {i < steps.length - 1 && (
                  <ArrowRight
                    className="h-4 w-4 mt-6 hidden md:block"
                    style={{ color: "var(--foreground-dimmed)" }}
                    aria-hidden="true"
                  />
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ─── CTA — single solid accent, no animated rainbow ─── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-24">
        <div
          className="relative overflow-hidden rounded-3xl px-8 sm:px-14 py-14 sm:py-20"
          style={{
            background:
              "linear-gradient(180deg, var(--surface-2), var(--surface-1))",
            border: "1px solid var(--border-subtle)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          <div className="grid lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8">
              <h2
                className="text-3xl sm:text-4xl font-semibold"
                style={{ color: "var(--foreground)" }}
              >
                Ready to stop fighting your ERP?
              </h2>
              <p
                className="text-base mt-4 max-w-xl leading-relaxed"
                style={{ color: "var(--foreground-muted)" }}
              >
                Start with one module. Add the rest when your team asks for
                them. Nothing to migrate, nothing to throw away.
              </p>
            </div>
            <div className="lg:col-span-4 lg:text-right">
              <Link href="/onboarding">
                <Button
                  size="lg"
                  className="gap-2 text-base h-12 px-8 font-medium"
                >
                  Get started <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <div
                className="flex lg:justify-end items-center gap-4 mt-5 text-xs flex-wrap"
                style={{ color: "var(--foreground-dimmed)" }}
              >
                {[
                  "No credit card",
                  "Free tier",
                  "Made in India",
                ].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3" aria-hidden="true" />{" "}
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* subtle ambient accent — not the full rainbow banner */}
          <div
            className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full blur-3xl -z-0 pointer-events-none"
            style={{ background: "var(--primary-glow)" }}
            aria-hidden="true"
          />
        </div>
      </section>

      {/* ─── Footer — real links, no cursor-pointer spans ─── */}
      <footer
        style={{
          borderTop: "1px solid var(--border-subtle)",
          background: "var(--surface-1)",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div
                className="h-7 w-7 rounded-lg flex items-center justify-center"
                style={{ background: "var(--primary)" }}
              >
                <Building2
                  className="h-3.5 w-3.5 text-white"
                  aria-hidden="true"
                />
              </div>
              <span
                className="text-sm font-medium"
                style={{ color: "var(--foreground-muted)" }}
              >
                The Ledger
              </span>
              <span
                className="text-xs mono ml-2"
                style={{ color: "var(--foreground-dimmed)" }}
              >
                © 2026
              </span>
            </div>

            <nav
              aria-label="Footer"
              className="flex items-center gap-6 text-xs"
              style={{ color: "var(--foreground-dimmed)" }}
            >
              <Link
                href="/docs"
                className="transition-colors hover:text-[var(--foreground)]"
              >
                Documentation
              </Link>
              <Link
                href="/docs/api"
                className="transition-colors hover:text-[var(--foreground)]"
              >
                API reference
              </Link>
              <Link
                href="/legal/privacy"
                className="transition-colors hover:text-[var(--foreground)]"
              >
                Privacy
              </Link>
              <Link
                href="/legal/terms"
                className="transition-colors hover:text-[var(--foreground)]"
              >
                Terms
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
