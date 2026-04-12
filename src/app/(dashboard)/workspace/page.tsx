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

const stats = [
  {
    label: "Installed Modules",
    value: "4",
    icon: Package,
    trend: "+2 this week",
    accentVar: "--accent-blue",
    subtleVar: "--primary-subtle",
  },
  {
    label: "Active Plugins",
    value: "3",
    icon: Puzzle,
    trend: "+1 today",
    accentVar: "--accent-violet",
    subtleVar: "--accent-violet",
  },
  {
    label: "Tables Created",
    value: "12",
    icon: Database,
    trend: "8 with records",
    accentVar: "--accent-emerald",
    subtleVar: "--accent-emerald",
  },
  {
    label: "Pages",
    value: "6",
    icon: FileText,
    trend: "2 draft",
    accentVar: "--accent-amber",
    subtleVar: "--accent-amber",
  },
];

const quickActions = [
  {
    href: "/modules",
    icon: Package,
    label: "Browse Modules",
    description: "Explore marketplace for new capabilities",
    gradient: "linear-gradient(135deg, oklch(0.65 0.20 250 / 0.15), oklch(0.55 0.22 280 / 0.08))",
    iconColor: "var(--accent-blue)",
  },
  {
    href: "/plugins",
    icon: Puzzle,
    label: "Browse Plugins",
    description: "Add integrations like WhatsApp, Razorpay",
    gradient: "linear-gradient(135deg, oklch(0.60 0.20 290 / 0.15), oklch(0.65 0.18 250 / 0.08))",
    iconColor: "var(--accent-violet)",
  },
  {
    href: "/schema/products",
    icon: Database,
    label: "Schema Designer",
    description: "Design your data tables and fields",
    gradient: "linear-gradient(135deg, oklch(0.68 0.17 155 / 0.15), oklch(0.72 0.12 200 / 0.08))",
    iconColor: "var(--accent-emerald)",
  },
  {
    href: "/pages",
    icon: LayoutDashboard,
    label: "Manage Pages",
    description: "Manage and build pages visually",
    gradient: "linear-gradient(135deg, oklch(0.78 0.16 75 / 0.15), oklch(0.75 0.14 55 / 0.08))",
    iconColor: "var(--accent-amber)",
  },
];

const recentActivity = [
  {
    action: "Inventory module installed",
    time: "2 minutes ago",
    type: "module",
    icon: CheckCircle2,
  },
  {
    action: "Product Table schema updated",
    time: "15 minutes ago",
    type: "schema",
    icon: Database,
  },
  {
    action: "WhatsApp plugin configured",
    time: "1 hour ago",
    type: "plugin",
    icon: Puzzle,
  },
  {
    action: "Attendance Module deployed",
    time: "3 hours ago",
    type: "module",
    icon: Zap,
  },
];

const moduleTopology = [
  { name: "Products", connections: ["Suppliers", "Stock Movements"], color: "var(--accent-blue)" },
  { name: "Suppliers", connections: ["Products"], color: "var(--accent-emerald)" },
  { name: "Stock Movements", connections: ["Products"], color: "var(--accent-amber)" },
  { name: "Contacts", connections: ["Deals"], color: "var(--accent-violet)" },
  { name: "Deals", connections: ["Contacts", "Products"], color: "var(--accent-rose)" },
];

import { useWorkspace } from "@/hooks/use-workspace";

export default function WorkspacePage() {
  const { workspace, isLoading, isError } = useWorkspace();

  if (isLoading) {
    return <div className="p-8 text-center" style={{ color: "var(--foreground-muted)" }}>Loading workspace...</div>;
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
      trend: "Total active",
      accentVar: "--accent-blue",
      subtleVar: "--primary-subtle",
    },
    {
      label: "Active Plugins",
      value: workspace.stats.installedPlugins.toString(),
      icon: Puzzle,
      trend: "Total active",
      accentVar: "--accent-violet",
      subtleVar: "--accent-violet",
    },
    {
      label: "Tables Created",
      value: workspace.stats.tables.toString(),
      icon: Database,
      trend: `${workspace.stats.totalRecords} total records`,
      accentVar: "--accent-emerald",
      subtleVar: "--accent-emerald",
    },
    {
      label: "Pages",
      value: workspace.stats.pages.toString(),
      icon: FileText,
      trend: "Total pages",
      accentVar: "--accent-amber",
      subtleVar: "--accent-amber",
    }
  ];
  
  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in-up">
      {/* ── Hero / Welcome ── */}
      <section
        className="relative overflow-hidden rounded-2xl p-6 sm:p-8"
        style={{
          background:
            "linear-gradient(180deg, var(--surface-2), var(--surface-1))",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span
              className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-medium mono"
              style={{
                background:
                  "color-mix(in oklch, var(--success), transparent 88%)",
                color: "var(--success)",
                border:
                  "1px solid color-mix(in oklch, var(--success), transparent 70%)",
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
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
            className="text-3xl sm:text-4xl font-semibold"
            style={{ color: "var(--foreground)" }}
          >
            Welcome back
          </h1>
          <p
            className="mt-2 text-sm sm:text-base"
            style={{ color: "var(--foreground-muted)" }}
          >
            {workspace.name} — your ERP builder workspace.
          </p>
          {workspace.slug && (
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link
                href={`/apps/${workspace.slug}`}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: "var(--primary)",
                  color: "var(--primary-foreground)",
                  boxShadow: "0 1px 2px oklch(0 0 0 / 0.1)",
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

        {/* Offset ambient glow — not full-bleed mesh */}
        <div
          className="absolute -right-32 -top-32 h-80 w-80 rounded-full blur-3xl pointer-events-none"
          style={{ background: "var(--primary-glow)" }}
          aria-hidden="true"
        />
      </section>

      {/* ── Stats Grid ── */}
      <div className="grid gap-4 md:grid-cols-4 stagger-children">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="group rounded-xl p-4 transition-all duration-300 card-interactive"
            style={{
              background: "var(--card)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium" style={{ color: "var(--foreground-muted)" }}>
                {stat.label}
              </span>
              <div
                className="h-8 w-8 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                style={{
                  background: `color-mix(in oklch, var(${stat.accentVar}), transparent 85%)`,
                  color: `var(${stat.accentVar})`,
                }}
              >
                <stat.icon className="h-4 w-4" />
              </div>
            </div>
            <div
              className="text-2xl font-semibold tabular-nums"
              style={{ color: "var(--foreground)" }}
            >
              {stat.value}
            </div>
            <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "var(--foreground-dimmed)" }}>
              <TrendingUp className="h-3 w-3" style={{ color: "var(--success)" }} />
              {stat.trend}
            </p>
          </div>
        ))}
      </div>

      {/* ── Quick Actions ── */}
      <div>
        <h2
          className="text-[11px] uppercase tracking-[0.14em] mb-3 mono"
          style={{ color: "var(--foreground-dimmed)" }}
        >
          / quick actions
        </h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 stagger-children">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <div
                className="group h-full rounded-xl p-4 transition-all duration-300 card-interactive cursor-pointer"
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div
                  className="h-10 w-10 rounded-lg flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                  style={{
                    background: action.gradient,
                    color: action.iconColor,
                  }}
                >
                  <action.icon className="h-5 w-5" />
                </div>
                <h3
                  className="text-sm font-semibold mb-0.5 flex items-center gap-1 transition-colors"
                  style={{ color: "var(--foreground)" }}
                >
                  {action.label}
                  <ArrowUpRight
                    className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all duration-200 -translate-x-1 group-hover:translate-x-0"
                    style={{ color: "var(--primary)" }}
                  />
                </h3>
                <p className="text-xs" style={{ color: "var(--foreground-dimmed)" }}>
                  {action.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Bottom Section: Activity + Module Topology ── */}
      <div className="grid gap-4 lg:grid-cols-5">
        {/* Activity Timeline */}
        <div className="lg:col-span-3">
          <h2
            className="text-[11px] uppercase tracking-[0.14em] mb-3 mono"
            style={{ color: "var(--foreground-dimmed)" }}
          >
            / recent activity
          </h2>
          <div
            className="rounded-xl overflow-hidden"
            style={{
              background: "var(--card)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            {recentActivity.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-5 py-4 transition-colors duration-200 group"
                style={{
                  borderBottom:
                    i < recentActivity.length - 1
                      ? "1px solid var(--border-subtle)"
                      : "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--surface-3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {/* Timeline line + icon */}
                <div className="relative flex flex-col items-center">
                  <div
                    className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background:
                        item.type === "module"
                          ? "var(--primary-subtle)"
                          : item.type === "plugin"
                          ? "color-mix(in oklch, var(--accent-violet), transparent 85%)"
                          : "var(--success-subtle)",
                      color:
                        item.type === "module"
                          ? "var(--primary)"
                          : item.type === "plugin"
                          ? "var(--accent-violet)"
                          : "var(--success)",
                    }}
                  >
                    <item.icon className="h-4 w-4" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                    {item.action}
                  </span>
                </div>

                <div className="flex items-center gap-1" style={{ color: "var(--foreground-dimmed)" }}>
                  <Clock className="h-3 w-3" />
                  <span className="text-xs whitespace-nowrap">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Module topology */}
        <div className="lg:col-span-2">
          <h2
            className="text-[11px] uppercase tracking-[0.14em] mb-3 mono"
            style={{ color: "var(--foreground-dimmed)" }}
          >
            / module graph
          </h2>
          <div
            className="rounded-xl p-5 h-[calc(100%-2rem)]"
            style={{
              background: "var(--card)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            {/* Simple node visualization */}
            <div className="space-y-3">
              {moduleTopology.map((module) => (
                <div key={module.name} className="flex items-center gap-3 group">
                  <div
                    className="h-3 w-3 rounded-full shrink-0 transition-transform duration-200 group-hover:scale-125"
                    style={{ background: module.color }}
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
                        className="h-1.5 w-4 rounded-full"
                        style={{ background: module.color, opacity: 1 - ci * 0.3 }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Total connections */}
            <div
              className="mt-4 pt-4 flex items-center justify-between text-xs"
              style={{ borderTop: "1px solid var(--border-subtle)" }}
            >
              <span style={{ color: "var(--foreground-dimmed)" }}>
                5 tables • 7 relations
              </span>
              <Link
                href="/schema/products"
                className="font-medium flex items-center gap-1 transition-colors"
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
