"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Package,
  Puzzle,
  Database,
  FileText,
  ArrowRight,
  TrendingUp,
  Users,
  Box,
  LayoutDashboard,
} from "lucide-react";

const quickActions = [
  {
    href: "/modules",
    icon: Package,
    label: "Browse Modules",
    description: "Explore marketplace for new capabilities",
    color: "bg-blue-50 text-blue-600",
  },
  {
    href: "/plugins",
    icon: Puzzle,
    label: "Browse Plugins",
    description: "Add integrations like WhatsApp, Razorpay",
    color: "bg-purple-50 text-purple-600",
  },
  {
    href: "/schema/products",
    icon: Database,
    label: "Schema Designer",
    description: "Design your data tables and fields",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    href: "/pages/inventory/edit",
    icon: LayoutDashboard,
    label: "Page Composer",
    description: "Build custom dashboard pages visually",
    color: "bg-amber-50 text-amber-600",
  },
];

const recentActivity = [
  { action: "Inventory module installed", time: "2 minutes ago", type: "module" },
  { action: "Product Table schema updated", time: "15 minutes ago", type: "schema" },
  { action: "WhatsApp plugin configured", time: "1 hour ago", type: "plugin" },
  { action: "Attendance Module deployed", time: "3 hours ago", type: "module" },
];

export default function WorkspacePage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#2b3437]">
          Welcome back
        </h1>
        <p className="text-[#64748b] mt-1">
          Acme Traders Pvt Ltd — Your ERP builder workspace
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Installed Modules", value: "4", icon: Package, trend: "+2 this week", color: "text-blue-600" },
          { label: "Active Plugins", value: "3", icon: Puzzle, trend: "+1 today", color: "text-purple-600" },
          { label: "Tables Created", value: "12", icon: Database, trend: "8 with records", color: "text-emerald-600" },
          { label: "Custom Pages", value: "6", icon: FileText, trend: "2 draft", color: "text-amber-600" },
        ].map((stat) => (
          <Card key={stat.label} className="hover:shadow-sm transition-shadow border-[#e2e8f0]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#64748b]">
                {stat.label}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2b3437]">
                {stat.value}
              </div>
              <p className="text-xs text-[#94a3b8] mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> {stat.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-[#2b3437] mb-3">
          Quick Actions
        </h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className="h-full hover:shadow-md hover:border-primary/20 transition-all cursor-pointer border-[#e2e8f0] group">
                <CardContent className="p-4">
                  <div
                    className={`h-10 w-10 rounded-lg flex items-center justify-center mb-3 ${action.color}`}
                  >
                    <action.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#2b3437] mb-0.5 group-hover:text-primary transition-colors">
                    {action.label}
                  </h3>
                  <p className="text-xs text-[#94a3b8]">{action.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-sm font-semibold text-[#2b3437] mb-3">
          Recent Activity
        </h2>
        <Card className="border-[#e2e8f0]">
          <CardContent className="p-0">
            {recentActivity.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-5 py-3.5 border-b last:border-0 border-[#f1f4f6]"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      item.type === "module"
                        ? "bg-blue-500"
                        : item.type === "plugin"
                        ? "bg-purple-500"
                        : "bg-emerald-500"
                    }`}
                  />
                  <span className="text-sm text-[#2b3437]">{item.action}</span>
                </div>
                <span className="text-xs text-[#94a3b8]">{item.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
