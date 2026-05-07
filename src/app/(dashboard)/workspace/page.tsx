"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Package,
  Puzzle,
  Database,
  FileText,
  ArrowRight,
  TrendingUp,
  Activity,
  Zap,
  LayoutDashboard,
  CheckCircle2,
  Clock,
  ArrowUpRight,
} from "lucide-react";

const recentActivity = [
  {
    action: "Inventory module installed",
    time: "2 minutes ago",
    type: "module",
    icon: CheckCircle2,
    href: "/modules",
  },
  {
    action: "Product Table schema updated",
    time: "15 minutes ago",
    type: "schema",
    icon: Database,
    href: "/tables",
  },
  {
    action: "WhatsApp plugin configured",
    time: "1 hour ago",
    type: "plugin",
    icon: Puzzle,
    href: "/plugins",
  },
  {
    action: "Attendance Module deployed",
    time: "3 hours ago",
    type: "module",
    icon: Zap,
    href: "/modules",
  },
];

const moduleTopology = [
  { name: "Products", connections: ["Suppliers", "Stock Movements"], color: "var(--accent-blue)" },
  { name: "Suppliers", connections: ["Products"], color: "var(--accent-emerald)" },
  { name: "Stock Movements", connections: ["Products"], color: "var(--accent-amber)" },
  { name: "Contacts", connections: ["Deals"], color: "var(--accent-violet)" },
  { name: "Deals", connections: ["Contacts", "Products"], color: "var(--accent-rose)" },
];

const quickActions = [
  {
    href: "/modules",
    icon: Package,
    label: "Browse Modules",
    description: "Explore marketplace for new capabilities",
    iconColor: "var(--accent-blue)",
    iconBg: "color-mix(in oklch, var(--accent-blue), transparent 85%)",
  },
  {
    href: "/plugins",
    icon: Puzzle,
    label: "Browse Plugins",
    description: "Add integrations like WhatsApp, Razorpay",
    iconColor: "var(--accent-violet)",
    iconBg: "color-mix(in oklch, var(--accent-violet), transparent 85%)",
  },
  {
    href: "/schema/products",
    icon: Database,
    label: "Schema Designer",
    description: "Design your data tables and fields",
    iconColor: "var(--accent-emerald)",
    iconBg: "color-mix(in oklch, var(--accent-emerald), transparent 85%)",
  },
  {
    href: "/pages",
    icon: LayoutDashboard,
    label: "Manage Pages",
    description: "Build and manage pages visually",
    iconColor: "var(--accent-amber)",
    iconBg: "color-mix(in oklch, var(--accent-amber), transparent 85%)",
  },
];

import { useWorkspace } from "@/hooks/use-workspace";
import { WorkspaceSkeleton } from "@/components/workspace/WorkspaceSkeleton";

export default function WorkspacePage() {
  const { workspace, isLoading, isError } = useWorkspace();

  if (isLoading) {
    return <WorkspaceSkeleton />;
  }

  if (isError || !workspace) {
    return (
      <div className="p-8 mt-12 max-w-md mx-auto text-center space-y-4 animate-in fade-in slide-in-from-bottom-4">
        <div className="h-12 w-12 rounded-xl mx-auto flex items-center justify-center bg-red-50 text-red-600 border border-red-100">
          <Database className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
          Database Offline
        </h2>
        <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
          Your dashboard couldn't be loaded because the database server is asleep or unreachable. Please wait a moment and try refreshing.
        </p>
      </div>
    );
  }

  const stats = [
    {
      label: "Installed Modules",
      value: workspace.stats.installedPacks.toString(),
      icon: Package,
      detail: "Total active",
      accentVar: "--accent-blue",
      href: "/modules",
    },
    {
      label: "Active Plugins",
      value: workspace.stats.installedPlugins.toString(),
      icon: Puzzle,
      detail: "Total active",
      accentVar: "--accent-violet",
      href: "/plugins",
    },
    {
      label: "Tables Created",
      value: workspace.stats.tables.toString(),
      icon: Database,
      detail: `${workspace.stats.totalRecords} total records`,
      accentVar: "--accent-emerald",
      href: "/tables",
    },
    {
      label: "Custom Pages",
      value: workspace.stats.pages.toString(),
      icon: FileText,
      detail: "Total pages",
      accentVar: "--accent-amber",
      href: "/pages",
    }
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-fade-in-up">
      {/* ── Hero / Welcome ── */}
      <section
        className="relative overflow-hidden rounded-2xl p-6 sm:p-8"
        style={{
          background: "linear-gradient(135deg, var(--surface-2), var(--surface-1) 60%, color-mix(in oklch, var(--primary), transparent 92%))",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span
              className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-medium mono"
              style={{
                background: "color-mix(in oklch, var(--success), transparent 88%)",
                color: "var(--success)",
                border: "1px solid color-mix(in oklch, var(--success), transparent 70%)",
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full animate-status-pulse"
                style={{
                  background: "var(--success)",
                  boxShadow: "0 0 6px var(--success)",
                }}
                aria-hidden="true"
              />
              all systems operational
            </span>
          </div>
          <h1
            className="text-3xl sm:text-4xl font-bold tracking-tight"
            style={{ color: "var(--foreground)" }}
          >
            Welcome back
          </h1>
          <p
            className="mt-2 text-sm sm:text-base max-w-lg"
            style={{ color: "var(--foreground-muted)", lineHeight: "1.6" }}
          >
            {workspace.name} — your ERP builder workspace.
          </p>
          {workspace.slug && (
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link
                href={`/apps/${workspace.slug}`}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all pressable focus-ring"
                style={{
                  background: "linear-gradient(135deg, var(--primary), var(--primary-hover))",
                  color: "var(--primary-foreground)",
                  boxShadow: "0 2px 12px color-mix(in oklch, var(--primary), transparent 60%), inset 0 1px 0 oklch(1 0 0 / 0.12)",
                }}
              >
                <ArrowUpRight className="h-4 w-4" />
                Open my ERP
              </Link>
              <span
                className="text-xs mono"
                style={{ color: "var(--foreground-dimmed)" }}
              >
                {workspace.slug}.erpbuilder.app
              </span>
            </div>
          )}
        </div>

        {/* Ambient glow */}
        <div
          className="absolute -right-32 -top-32 h-80 w-80 rounded-full blur-3xl pointer-events-none"
          style={{ background: "var(--primary-glow)" }}
          aria-hidden="true"
        />
      </section>

      {/* ── Stats Grid ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group rounded-xl p-5 transition-all duration-300 card-interactive relative overflow-hidden focus-ring cursor-pointer"
            style={{
              background: "var(--card)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            {/* Top accent line */}
            <div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{ background: `var(${stat.accentVar})` }}
            />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium flex items-center gap-1.5" style={{ color: "var(--foreground-muted)" }}>
                {stat.label}
                <ArrowUpRight
                  className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all duration-200 -translate-x-0.5 group-hover:translate-x-0"
                  style={{ color: `var(${stat.accentVar})` }}
                />
              </span>
              <div
                className="h-9 w-9 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                style={{
                  background: `color-mix(in oklch, var(${stat.accentVar}), transparent 85%)`,
                  color: `var(${stat.accentVar})`,
                }}
              >
                <stat.icon className="h-4.5 w-4.5" />
              </div>
            </div>
            <div
              className="text-3xl font-bold tabular-nums"
              style={{ color: "var(--foreground)" }}
            >
              {stat.value}
            </div>
            <p className="text-xs mt-1.5" style={{ color: "var(--foreground-dimmed)" }}>
              {stat.detail}
            </p>
          </Link>
        ))}
      </div>

      {/* ── Quick Actions ── */}
      <div>
        <h2
          className="text-sm font-semibold mb-4"
          style={{ color: "var(--foreground)" }}
        >
          Quick Actions
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <div
                className="group h-full rounded-xl p-5 transition-all duration-300 card-interactive cursor-pointer"
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div
                  className="h-11 w-11 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-2"
                  style={{
                    background: action.iconBg,
                    color: action.iconColor,
                  }}
                >
                  <action.icon className="h-5 w-5" />
                </div>
                <h3
                  className="text-sm font-semibold mb-1 flex items-center gap-1.5"
                  style={{ color: "var(--foreground)" }}
                >
                  {action.label}
                  <ArrowUpRight
                    className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-all duration-200 -translate-x-1 group-hover:translate-x-0"
                    style={{ color: "var(--primary)" }}
                  />
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: "var(--foreground-dimmed)" }}>
                  {action.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Installed Module Quick Access ── */}
      {workspace.installedPacks?.includes("quotation") && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
              Quotations &amp; Invoicing
            </h2>
            <span
              className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{
                background: "color-mix(in oklch, var(--success), transparent 85%)",
                color: "var(--success)",
                border: "1px solid color-mix(in oklch, var(--success), transparent 70%)",
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: "var(--success)" }} />
              Installed
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link href="/quotation">
              <div
                className="group relative overflow-hidden rounded-xl p-6 transition-all duration-300 card-interactive cursor-pointer"
                style={{ background: "var(--card)", border: "1px solid var(--border-subtle)" }}
              >
                <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "var(--accent-blue)" }} />
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="h-12 w-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background: "color-mix(in oklch, var(--accent-blue), transparent 85%)",
                      color: "var(--accent-blue)",
                    }}
                  >
                    <FileText className="h-6 w-6" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all duration-200" style={{ color: "var(--accent-blue)" }} />
                </div>
                <h3 className="text-base font-bold mb-1" style={{ color: "var(--foreground)" }}>Quotations</h3>
                <p className="text-xs leading-relaxed" style={{ color: "var(--foreground-dimmed)" }}>
                  Create and manage professional quotations &amp; proforma invoices with PDF export.
                </p>
                <div className="mt-4 flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <Link
                    href="/quotation/create"
                    className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all pressable"
                    style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-hover))", color: "var(--primary-foreground)" }}
                  >
                    + New Quotation
                  </Link>
                  <Link
                    href="/quotation"
                    className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover-bg-subtle"
                    style={{ color: "var(--foreground-muted)", border: "1px solid var(--border-subtle)" }}
                  >
                    View All
                  </Link>
                </div>
              </div>
            </Link>

            <Link href="/estimated">
              <div
                className="group relative overflow-hidden rounded-xl p-6 transition-all duration-300 card-interactive cursor-pointer"
                style={{ background: "var(--card)", border: "1px solid var(--border-subtle)" }}
              >
                <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "var(--accent-amber)" }} />
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="h-12 w-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background: "color-mix(in oklch, var(--accent-amber), transparent 85%)",
                      color: "var(--accent-amber)",
                    }}
                  >
                    <FileText className="h-6 w-6" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all duration-200" style={{ color: "var(--accent-amber)" }} />
                </div>
                <h3 className="text-base font-bold mb-1" style={{ color: "var(--foreground)" }}>Estimates</h3>
                <p className="text-xs leading-relaxed" style={{ color: "var(--foreground-dimmed)" }}>
                  Generate detailed cost estimates and service bills with GST calculation support.
                </p>
                <div className="mt-4 flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <Link
                    href="/estimated/create"
                    className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all pressable"
                    style={{ background: "linear-gradient(135deg, var(--accent-amber), color-mix(in oklch, var(--accent-amber), var(--primary) 30%))", color: "#fff" }}
                  >
                    + New Estimate
                  </Link>
                  <Link
                    href="/estimated"
                    className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover-bg-subtle"
                    style={{ color: "var(--foreground-muted)", border: "1px solid var(--border-subtle)" }}
                  >
                    View All
                  </Link>
                </div>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* ── Bottom Section: Activity + Module Topology ── */}
      <div className="grid gap-5 lg:grid-cols-5">
        {/* Activity Timeline */}
        <div className="lg:col-span-3">
          <div className="flex items-end justify-between mb-4">
            <h2
              className="text-sm font-semibold"
              style={{ color: "var(--foreground)" }}
            >
              Recent Activity
            </h2>
            <Link
              href="/modules"
              className="inline-flex items-center gap-1 text-xs font-medium transition-colors hover:underline focus-ring rounded"
              style={{ color: "var(--primary)" }}
            >
              View all
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div
            className="rounded-xl overflow-hidden"
            style={{
              background: "var(--card)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            {recentActivity.map((item, i) => (
              <Link
                key={i}
                href={item.href}
                className="flex items-center gap-4 px-5 py-4 hover-bg-subtle group focus-ring transition-colors"
                style={{
                  borderBottom:
                    i < recentActivity.length - 1
                      ? "1px solid var(--border-subtle)"
                      : "none",
                }}
              >
                {/* Timeline line + icon */}
                <div className="relative flex flex-col items-center">
                  <div
                    className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background:
                        item.type === "module"
                          ? "color-mix(in oklch, var(--accent-blue), transparent 85%)"
                          : item.type === "plugin"
                          ? "color-mix(in oklch, var(--accent-violet), transparent 85%)"
                          : "color-mix(in oklch, var(--success), transparent 85%)",
                      color:
                        item.type === "module"
                          ? "var(--accent-blue)"
                          : item.type === "plugin"
                          ? "var(--accent-violet)"
                          : "var(--success)",
                    }}
                  >
                    <item.icon className="h-4 w-4" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium flex items-center gap-1.5" style={{ color: "var(--foreground)" }}>
                    {item.action}
                    <ArrowUpRight
                      className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all duration-200 -translate-x-0.5 group-hover:translate-x-0"
                      style={{ color: "var(--primary)" }}
                    />
                  </span>
                </div>

                <div className="flex items-center gap-1.5" style={{ color: "var(--foreground-dimmed)" }}>
                  <Clock className="h-3 w-3" />
                  <span className="text-xs whitespace-nowrap">{item.time}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Module topology */}
        <div className="lg:col-span-2">
          <h2
            className="text-sm font-semibold mb-4"
            style={{ color: "var(--foreground)" }}
          >
            Module Graph
          </h2>
          <div
            className="rounded-xl p-5 h-[calc(100%-2rem)]"
            style={{
              background: "var(--card)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            {/* Simple node visualization */}
            <div className="space-y-4">
              {moduleTopology.map((module) => (
                <div key={module.name} className="flex items-center gap-3 group">
                  <div
                    className="h-3.5 w-3.5 rounded-full shrink-0 transition-transform duration-200 group-hover:scale-125"
                    style={{ background: module.color, boxShadow: `0 0 8px color-mix(in oklch, ${module.color}, transparent 60%)` }}
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                      {module.name}
                    </span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Activity className="h-3 w-3" style={{ color: "var(--foreground-dimmed)" }} />
                      <span className="text-[10px]" style={{ color: "var(--foreground-dimmed)" }}>
                        → {module.connections.join(", ")}
                      </span>
                    </div>
                  </div>
                  {/* Connection strength indicator */}
                  <div className="flex gap-0.5">
                    {module.connections.map((_, ci) => (
                      <div
                        key={ci}
                        className="h-1.5 w-5 rounded-full"
                        style={{ background: module.color, opacity: 1 - ci * 0.3 }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Total connections */}
            <div
              className="mt-5 pt-4 flex items-center justify-between text-xs"
              style={{ borderTop: "1px solid var(--border-subtle)" }}
            >
              <span style={{ color: "var(--foreground-dimmed)" }}>
                5 tables • 7 relations
              </span>
              <Link
                href="/schema/products"
                className="font-semibold flex items-center gap-1 transition-colors hover:opacity-80"
                style={{ color: "var(--primary)" }}
              >
                View schema <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
