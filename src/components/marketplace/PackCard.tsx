"use client";

import { PackDefinition } from "@/types/pack";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Package,
  Users,
  Briefcase,
  IndianRupee,
  Download,
  Check,
} from "lucide-react";
import { useState } from "react";

const iconMap: Record<string, React.ReactNode> = {
  package: <Package className="h-6 w-6" />,
  users: <Users className="h-6 w-6" />,
  briefcase: <Briefcase className="h-6 w-6" />,
  "indian-rupee": <IndianRupee className="h-6 w-6" />,
};

const colorMap: Record<string, string> = {
  package: "bg-blue-50 text-blue-600",
  users: "bg-emerald-50 text-emerald-600",
  briefcase: "bg-amber-50 text-amber-600",
  "indian-rupee": "bg-violet-50 text-violet-600",
};

export function PackCard({
  pack,
  installed = false,
  onInstall,
}: {
  pack: PackDefinition;
  installed?: boolean;
  onInstall?: (packId: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleInstall = async () => {
    if (installed || loading) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    onInstall?.(pack.id);
    setLoading(false);
  };

  return (
    <div className="group relative bg-white rounded-xl border border-[#e2e8f0] p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300 flex flex-col">
      {/* Icon + Badge */}
      <div className="flex items-start justify-between mb-4">
        <div
          className={`h-12 w-12 rounded-xl flex items-center justify-center ${
            colorMap[pack.icon] || "bg-gray-100 text-gray-600"
          }`}
        >
          {iconMap[pack.icon] || <Package className="h-6 w-6" />}
        </div>
        <Badge
          variant={pack.badge === "Free" ? "secondary" : "default"}
          className={
            pack.badge === "Pro"
              ? "bg-primary/10 text-primary border-0 font-medium"
              : "bg-emerald-50 text-emerald-700 border-0 font-medium"
          }
        >
          {pack.badge}
        </Badge>
      </div>

      {/* Title + Description */}
      <h3 className="text-base font-semibold text-[#2b3437] mb-1.5">
        {pack.name}
      </h3>
      <p className="text-sm text-[#64748b] leading-relaxed mb-5 flex-1">
        {pack.description}
      </p>

      {/* Stats */}
      <div className="flex items-center gap-6 mb-5 text-xs text-[#64748b]">
        <div>
          <span className="block text-sm font-semibold text-[#2b3437]">
            {pack.fields}
          </span>
          <span className="uppercase tracking-wider">Fields</span>
        </div>
        <div>
          <span className="block text-sm font-semibold text-[#2b3437]">
            {pack.pages}
          </span>
          <span className="uppercase tracking-wider">Pages</span>
        </div>
      </div>

      {/* Install Button */}
      <Button
        onClick={handleInstall}
        disabled={installed || loading}
        className={`w-full gap-2 font-medium transition-all ${
          installed
            ? "bg-emerald-600 hover:bg-emerald-600 text-white"
            : "bg-primary hover:bg-primary/90"
        }`}
      >
        {installed ? (
          <>
            <Check className="h-4 w-4" /> Installed
          </>
        ) : loading ? (
          <>
            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Installing...
          </>
        ) : (
          <>
            <Download className="h-4 w-4" /> Install
          </>
        )}
      </Button>
    </div>
  );
}
