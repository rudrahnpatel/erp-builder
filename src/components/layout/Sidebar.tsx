"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  LayoutDashboard,
  Blocks,
  Settings,
  Puzzle,
  LogOut,
  HelpCircle,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const mainNavItems = [
  { href: "/workspace", label: "Dashboard", icon: LayoutDashboard },
  { href: "/modules", label: "Marketplace", icon: Blocks },
  { href: "/plugins", label: "Plugins", icon: Puzzle },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-[220px] border-r border-[#e2e8f0] bg-white h-full flex flex-col">
      {/* Logo */}
      <div className="h-14 flex items-center px-5 border-b border-[#e2e8f0]">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center mr-2.5">
          <Building2 className="h-4 w-4 text-white" />
        </div>
        <div>
          <span className="font-bold text-[#2b3437] text-sm block leading-tight">
            The Ledger
          </span>
          <span className="text-[10px] text-[#94a3b8] uppercase tracking-wider">
            Enterprise Suite
          </span>
        </div>
      </div>

      {/* Main nav */}
      <div className="flex-1 overflow-y-auto py-3">
        <nav className="space-y-0.5 px-3">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-all ${
                  isActive
                    ? "bg-primary text-white font-medium"
                    : "text-[#64748b] hover:bg-[#f1f4f6] hover:text-[#2b3437]"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}

          {/* Quick links */}
          <div className="pt-4 mt-4 border-t border-[#f1f4f6]">
            <p className="px-3 text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider mb-2">
              Quick Access
            </p>
            <Link
              href="/schema/products"
              className={`flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-all ${
                pathname.startsWith("/schema")
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-[#64748b] hover:bg-[#f1f4f6] hover:text-[#2b3437]"
              }`}
            >
              <Settings className="h-4 w-4" />
              Schema Designer
            </Link>
            <Link
              href="/pages/inventory/edit"
              className={`flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-all ${
                pathname.startsWith("/pages")
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-[#64748b] hover:bg-[#f1f4f6] hover:text-[#2b3437]"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Page Composer
            </Link>
            <Link
              href="/modules/attendance/configure"
              className={`flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-all text-[#64748b] hover:bg-[#f1f4f6] hover:text-[#2b3437]`}
            >
              <Blocks className="h-4 w-4" />
              Module Builder
            </Link>
          </div>
        </nav>
      </div>

      {/* Create module button */}
      <div className="px-3 py-2">
        <Button className="w-full gap-2 text-sm" size="sm">
          <Plus className="h-4 w-4" /> Create Module
        </Button>
      </div>

      {/* Bottom */}
      <div className="px-3 py-3 border-t border-[#e2e8f0] space-y-0.5">
        <Link
          href="#"
          className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg text-[#64748b] hover:bg-[#f1f4f6] hover:text-[#2b3437] transition-all"
        >
          <HelpCircle className="h-4 w-4" />
          Help
        </Link>
        <button className="flex w-full items-center gap-2.5 px-3 py-2 text-sm rounded-lg text-[#ef4444] hover:bg-red-50 transition-all">
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );
}
