"use client";

import { Bell, Search, UserCircle, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";

export function Topbar({ onMenuToggle }: { onMenuToggle?: () => void }) {
  return (
    <div className="h-14 border-b border-[#e2e8f0] bg-white flex items-center justify-between px-4 sm:px-6 shrink-0">
      <div className="flex items-center gap-3 flex-1">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-1.5 rounded-md hover:bg-[#f1f4f6] text-[#64748b]"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Search */}
        <div className="hidden sm:flex relative max-w-md flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[#64748b]" />
          <Input
            type="search"
            placeholder="Search across all modules..."
            className="pl-9 bg-[#f8f9fa] border-transparent focus-visible:ring-1 focus-visible:ring-primary shadow-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <button className="text-[#64748b] hover:text-[#2b3437] transition-colors relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 h-2 w-2 bg-[#ef4444] rounded-full border border-white" />
        </button>
        <div className="h-8 w-8 rounded-full bg-[#f1f4f6] border border-[#e2e8f0] flex items-center justify-center cursor-pointer">
          <UserCircle className="h-5 w-5 text-[#64748b]" />
        </div>
      </div>
    </div>
  );
}
