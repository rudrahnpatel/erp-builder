"use client";

import {
  Building2,
  ChevronDown,
  Search,
  Bell,
  LayoutDashboard,
  Blocks,
  FileText,
  Database,
  Network,
  Puzzle,
  Settings,
  Zap,
  Plus,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  Package,
  Command,
} from "lucide-react";

export function DashboardPreview() {
  return (
    <div className="w-full select-none pointer-events-none text-[11px]">
      {/* Frosted glass wrapper */}
      <div
        className="rounded-2xl overflow-hidden p-3 md:p-4"
        style={{
          background: "var(--hero-glass-bg)",
          border: "1px solid var(--hero-glass-border)",
          boxShadow: "var(--shadow-dashboard)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Inner dashboard shell */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: "var(--surface-1)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          {/* ── Top Bar ── */}
          <div
            className="flex items-center justify-between px-3 py-2"
            style={{ borderBottom: "1px solid var(--border-subtle)" }}
          >
            <div className="flex items-center gap-2">
              <div
                className="h-6 w-6 rounded-md flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, var(--primary), var(--primary-hover))",
                }}
              >
                <Building2 className="h-3 w-3 text-white" />
              </div>
              <span
                className="font-semibold text-[11px]"
                style={{ color: "var(--foreground)" }}
              >
                The Ledger
              </span>
              <ChevronDown
                className="h-2.5 w-2.5"
                style={{ color: "var(--foreground-dimmed)" }}
              />
              <div
                className="h-3 w-px mx-1"
                style={{ background: "var(--border)" }}
              />
              {/* Search bar */}
              <div
                className="flex items-center gap-1.5 rounded-md px-2 py-1"
                style={{
                  background: "var(--surface-sunken)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <Search
                  className="h-2.5 w-2.5"
                  style={{ color: "var(--foreground-dimmed)" }}
                />
                <span style={{ color: "var(--foreground-dimmed)" }}>
                  Search...
                </span>
                <kbd
                  className="ml-3 text-[8px] px-1 rounded"
                  style={{
                    background: "var(--surface-2)",
                    color: "var(--foreground-dimmed)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <span className="inline-flex items-center gap-0.5">
                    <Command className="h-2 w-2" />K
                  </span>
                </kbd>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Bell
                className="h-3 w-3"
                style={{ color: "var(--foreground-dimmed)" }}
              />
              <div
                className="h-5 w-5 rounded-md flex items-center justify-center text-[8px] font-semibold text-white"
                style={{
                  background:
                    "linear-gradient(135deg, var(--primary), var(--primary-hover))",
                }}
              >
                RP
              </div>
            </div>
          </div>

          {/* ── Body: Sidebar + Main ── */}
          <div className="flex">
            {/* Sidebar */}
            <div
              className="w-36 shrink-0 py-2 hidden md:block"
              style={{ borderRight: "1px solid var(--border-subtle)" }}
            >
              {/* Section: Builder */}
              <div className="px-2 mb-1.5">
                <span
                  className="text-[8px] font-semibold uppercase tracking-wider px-2"
                  style={{ color: "var(--foreground-dimmed)" }}
                >
                  Builder
                </span>
              </div>
              {[
                {
                  icon: LayoutDashboard,
                  label: "Dashboard",
                  active: true,
                },
                { icon: Blocks, label: "Marketplace" },
                { icon: Puzzle, label: "Plugins" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2 px-2 py-1.5 mx-1.5 rounded-md relative"
                  style={{
                    background: item.active
                      ? "var(--sidebar-accent)"
                      : "transparent",
                    color: item.active
                      ? "var(--primary)"
                      : "var(--foreground-muted)",
                    fontWeight: item.active ? 600 : 400,
                  }}
                >
                  {item.active && (
                    <span
                      className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-[2px] h-4 rounded-r-full"
                      style={{ background: "var(--primary)" }}
                    />
                  )}
                  <item.icon className="h-3 w-3" />
                  <span>{item.label}</span>
                </div>
              ))}

              {/* Section: Developer */}
              <div className="px-2 mt-3 mb-1.5 flex items-center gap-1">
                <span
                  className="text-[8px] font-semibold uppercase tracking-wider px-2"
                  style={{ color: "var(--foreground-dimmed)" }}
                >
                  Developer
                </span>
                <span
                  className="text-[7px] uppercase tracking-wider font-bold px-1 py-[1px] rounded-full"
                  style={{
                    background: "var(--accent-emerald)",
                    color: "#fff",
                  }}
                >
                  DEV
                </span>
              </div>
              {[
                { icon: FileText, label: "Pages" },
                { icon: Database, label: "Tables" },
                { icon: Network, label: "Schema" },
                { icon: Package, label: "My Modules" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2 px-2 py-1.5 mx-1.5 rounded-md"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  <item.icon className="h-3 w-3" />
                  <span>{item.label}</span>
                </div>
              ))}

              {/* Section: bottom items */}
              <div
                className="mt-3 pt-2 mx-2"
                style={{ borderTop: "1px solid var(--border-subtle)" }}
              >
                <div
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  <Settings className="h-3 w-3" />
                  <span>Settings</span>
                </div>
              </div>
            </div>

            {/* ── Main Content ── */}
            <div
              className="flex-1 min-w-0 p-3 md:p-4"
              style={{ background: "var(--surface-sunken)" }}
            >
              {/* Greeting */}
              <div className="mb-3">
                <span
                  className="text-sm font-semibold"
                  style={{ color: "var(--foreground)" }}
                >
                  Welcome, Builder
                </span>
                <p
                  className="text-[10px] mt-0.5"
                  style={{ color: "var(--foreground-dimmed)" }}
                >
                  Here&apos;s your workspace overview
                </p>
              </div>

              {/* Action buttons row */}
              <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                {[
                  {
                    label: "New Module",
                    primary: true,
                    icon: Plus,
                  },
                  { label: "New Table", icon: Database },
                  { label: "New Page", icon: FileText },
                  { label: "Schema View", icon: Network },
                  { label: "Deploy", icon: Zap },
                ].map((btn) => (
                  <span
                    key={btn.label}
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px]"
                    style={
                      btn.primary
                        ? {
                            background: "var(--primary)",
                            color: "var(--primary-foreground)",
                            fontWeight: 500,
                          }
                        : {
                            background: "var(--surface-2)",
                            color: "var(--foreground-muted)",
                            border: "1px solid var(--border-subtle)",
                          }
                    }
                  >
                    <btn.icon className="h-2.5 w-2.5" />
                    {btn.label}
                  </span>
                ))}
              </div>

              {/* Two cards side by side */}
              <div className="flex gap-3 mb-3">
                {/* Workspace Stats Card */}
                <div
                  className="flex-1 basis-0 rounded-lg p-3"
                  style={{
                    background: "var(--card)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="font-semibold text-[11px]"
                        style={{ color: "var(--foreground)" }}
                      >
                        Workspace Stats
                      </span>
                      <CheckCircle2
                        className="h-2.5 w-2.5"
                        style={{ color: "var(--success)" }}
                      />
                    </div>
                  </div>
                  {/* Big stat */}
                  <div className="mb-1">
                    <span
                      className="text-xl font-semibold tabular-nums"
                      style={{ color: "var(--foreground)" }}
                    >
                      12
                    </span>
                    <span
                      className="text-xs ml-1"
                      style={{ color: "var(--foreground-dimmed)" }}
                    >
                      modules installed
                    </span>
                  </div>
                  {/* Mini stats */}
                  <div className="flex gap-4 text-[10px] mb-2">
                    <span>
                      <span style={{ color: "var(--foreground-dimmed)" }}>
                        Tables{" "}
                      </span>
                      <span
                        className="font-medium"
                        style={{ color: "var(--accent-emerald)" }}
                      >
                        48
                      </span>
                    </span>
                    <span>
                      <span style={{ color: "var(--foreground-dimmed)" }}>
                        Records{" "}
                      </span>
                      <span
                        className="font-medium"
                        style={{ color: "var(--primary)" }}
                      >
                        12.4K
                      </span>
                    </span>
                    <span>
                      <span style={{ color: "var(--foreground-dimmed)" }}>
                        Pages{" "}
                      </span>
                      <span
                        className="font-medium"
                        style={{ color: "var(--accent-violet)" }}
                      >
                        24
                      </span>
                    </span>
                  </div>
                  {/* SVG Area Chart */}
                  <div className="h-16">
                    <svg
                      viewBox="0 0 280 60"
                      className="w-full h-full"
                      preserveAspectRatio="none"
                    >
                      <defs>
                        <linearGradient
                          id="chartGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="var(--primary)"
                            stopOpacity="0.2"
                          />
                          <stop
                            offset="100%"
                            stopColor="var(--primary)"
                            stopOpacity="0"
                          />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0,45 C20,42 40,38 70,30 C100,22 120,28 150,18 C180,8 200,15 220,10 C240,5 260,12 280,8 L280,60 L0,60 Z"
                        fill="url(#chartGrad)"
                      />
                      <path
                        d="M0,45 C20,42 40,38 70,30 C100,22 120,28 150,18 C180,8 200,15 220,10 C240,5 260,12 280,8"
                        fill="none"
                        stroke="var(--primary)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>

                {/* Installed Modules Card */}
                <div
                  className="flex-1 basis-0 rounded-lg p-3 hidden sm:block"
                  style={{
                    background: "var(--card)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="font-semibold text-[11px]"
                      style={{ color: "var(--foreground)" }}
                    >
                      Installed Modules
                    </span>
                    <div className="flex items-center gap-1">
                      <Plus
                        className="h-2.5 w-2.5"
                        style={{ color: "var(--foreground-dimmed)" }}
                      />
                      <MoreHorizontal
                        className="h-2.5 w-2.5"
                        style={{ color: "var(--foreground-dimmed)" }}
                      />
                    </div>
                  </div>
                  {[
                    {
                      name: "Inventory & Stock",
                      tables: "8 tables",
                      color: "var(--accent-blue)",
                    },
                    {
                      name: "HR & Payroll",
                      tables: "12 tables",
                      color: "var(--accent-emerald)",
                    },
                    {
                      name: "Finance & GST",
                      tables: "6 tables",
                      color: "var(--accent-amber)",
                    },
                    {
                      name: "CRM & Sales",
                      tables: "10 tables",
                      color: "var(--accent-violet)",
                    },
                  ].map((mod, i) => (
                    <div
                      key={mod.name}
                      className="flex items-center justify-between py-2"
                      style={
                        i > 0
                          ? {
                              borderTop: "1px solid var(--border-subtle)",
                            }
                          : undefined
                      }
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ background: mod.color }}
                        />
                        <span style={{ color: "var(--foreground)" }}>
                          {mod.name}
                        </span>
                      </div>
                      <span style={{ color: "var(--foreground-dimmed)" }}>
                        {mod.tables}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity Table */}
              <div
                className="rounded-lg p-3"
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <span
                  className="font-semibold text-[11px] block mb-2"
                  style={{ color: "var(--foreground)" }}
                >
                  Recent Activity
                </span>
                <table className="w-full text-[10px]">
                  <thead>
                    <tr style={{ color: "var(--foreground-dimmed)" }}>
                      <th className="text-left font-medium pb-1.5">Date</th>
                      <th className="text-left font-medium pb-1.5">Action</th>
                      <th className="text-left font-medium pb-1.5">Module</th>
                      <th className="text-right font-medium pb-1.5">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        date: "May 5",
                        action: "Schema updated",
                        module: "Inventory",
                        status: "Synced",
                        statusColor: "var(--success)",
                      },
                      {
                        date: "May 5",
                        action: "Page created",
                        module: "HR & Payroll",
                        status: "Draft",
                        statusColor: "var(--warning)",
                      },
                      {
                        date: "May 4",
                        action: "Module installed",
                        module: "Finance",
                        status: "Active",
                        statusColor: "var(--success)",
                      },
                      {
                        date: "May 4",
                        action: "Table added",
                        module: "CRM",
                        status: "Synced",
                        statusColor: "var(--success)",
                      },
                    ].map((row, i) => (
                      <tr
                        key={i}
                        style={
                          i > 0
                            ? {
                                borderTop:
                                  "1px solid var(--border-subtle)",
                              }
                            : undefined
                        }
                      >
                        <td
                          className="py-1.5"
                          style={{ color: "var(--foreground-dimmed)" }}
                        >
                          {row.date}
                        </td>
                        <td
                          className="py-1.5"
                          style={{ color: "var(--foreground)" }}
                        >
                          {row.action}
                        </td>
                        <td
                          className="py-1.5"
                          style={{ color: "var(--foreground-muted)" }}
                        >
                          {row.module}
                        </td>
                        <td className="py-1.5 text-right">
                          <span
                            className="inline-flex items-center gap-1"
                            style={{ color: row.statusColor }}
                          >
                            {row.status === "Draft" ? (
                              <Clock className="h-2 w-2" />
                            ) : (
                              <CheckCircle2 className="h-2 w-2" />
                            )}
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
