"use client";

import { PluginDefinition } from "@/types/plugin";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  Fingerprint,
  FileCheck,
  Mail,
  CalendarOff,
  CreditCard,
  Download,
  Eye,
} from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  "message-circle": <MessageCircle className="h-6 w-6" />,
  fingerprint: <Fingerprint className="h-6 w-6" />,
  "file-check": <FileCheck className="h-6 w-6" />,
  mail: <Mail className="h-6 w-6" />,
  "calendar-off": <CalendarOff className="h-6 w-6" />,
  "credit-card": <CreditCard className="h-6 w-6" />,
};

const colorMap: Record<string, string> = {
  "message-circle": "bg-green-50 text-green-600",
  fingerprint: "bg-blue-50 text-blue-600",
  "file-check": "bg-orange-50 text-orange-600",
  mail: "bg-purple-50 text-purple-600",
  "calendar-off": "bg-teal-50 text-teal-600",
  "credit-card": "bg-rose-50 text-rose-600",
};

export function PluginCard({
  plugin,
  onViewDetails,
}: {
  plugin: PluginDefinition;
  onViewDetails?: (pluginId: string) => void;
}) {
  return (
    <div className="group relative bg-white rounded-xl border border-[#e2e8f0] p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300 flex flex-col">
      {/* Icon + Badge */}
      <div className="flex items-start justify-between mb-4">
        <div
          className={`h-12 w-12 rounded-xl flex items-center justify-center ${
            colorMap[plugin.icon] || "bg-gray-100 text-gray-600"
          }`}
        >
          {iconMap[plugin.icon] || <MessageCircle className="h-6 w-6" />}
        </div>
        <Badge
          variant={plugin.badge === "Free" ? "secondary" : "default"}
          className={
            plugin.badge === "Pro"
              ? "bg-primary/10 text-primary border-0 font-medium"
              : "bg-emerald-50 text-emerald-700 border-0 font-medium"
          }
        >
          {plugin.badge}
        </Badge>
      </div>

      {/* Title + Description */}
      <h3 className="text-base font-semibold text-[#2b3437] mb-1.5">
        {plugin.name}
      </h3>
      <p className="text-sm text-[#64748b] leading-relaxed mb-5 flex-1">
        {plugin.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-[#f1f4f6]">
        <div className="flex items-center gap-1.5 text-xs text-[#64748b]">
          <Download className="h-3.5 w-3.5" />
          <span>{plugin.installs.toLocaleString()} installs</span>
        </div>
        <button
          onClick={() => onViewDetails?.(plugin.id)}
          className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
        >
          <Eye className="h-3.5 w-3.5" />
          View Details
        </button>
      </div>
    </div>
  );
}
