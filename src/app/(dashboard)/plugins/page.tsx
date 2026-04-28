"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { allPlugins } from "@/lib/plugins/registry";
import { PluginDefinition } from "@/types/plugin";
import { useWorkspace } from "@/hooks/use-workspace";
import {
  MessageCircle,
  Fingerprint,
  FileCheck,
  Mail,
  CalendarOff,
  CreditCard,
  Search,
  Settings2,
  Download,
  Users,
  ToggleLeft,
  ToggleRight,
  Link2,
  AlertCircle,
} from "lucide-react";
import useSWR from "swr";

// Map a plugin id → which built-in module supplies the table(s) it reconciles
// with. Used to render a "Install <pack> to enable this flow" hint when the
// user installs a plugin without the supporting module. Keep this list in
// sync with packRegistry as new packs ship.
const PACK_FOR_PLUGIN: Record<string, { packId: string; packName: string }> = {
  "razorpay-payments": { packId: "finance", packName: "Finance" },
  "gst-invoice": { packId: "finance", packName: "Finance" },
};

const iconMap: Record<string, React.ReactNode> = {
  "message-circle": <MessageCircle className="h-5 w-5" />,
  fingerprint: <Fingerprint className="h-5 w-5" />,
  "file-check": <FileCheck className="h-5 w-5" />,
  mail: <Mail className="h-5 w-5" />,
  "calendar-off": <CalendarOff className="h-5 w-5" />,
  "credit-card": <CreditCard className="h-5 w-5" />,
};

// We will use Tailwind arbitrary values combining the CSS variables or map them specifically
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function PluginsPage() {
  const [search, setSearch] = useState("");
  const { workspace } = useWorkspace();

  const { data: plugins, mutate, isLoading } = useSWR<PluginDefinition[]>("/api/plugins", fetcher);

  const installedPackIds = new Set(workspace?.installedPacks || []);
  const tablesByName = new Map(
    (workspace?.tables || []).map((t) => [t.name, t])
  );

  const filteredPlugins = (plugins || allPlugins).filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
  );

  const togglePlugin = async (pluginId: string) => {
    // Optimistic update
    mutate(
      (current) => current?.map((p) => p.id === pluginId ? { ...p, enabled: !p.enabled } : p),
      false
    );
    await fetch("/api/plugins/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pluginId }),
    });
    mutate();
  };

  const installPlugin = async (pluginId: string) => {
    // Optimistic update
    mutate(
      (current) => current?.map((p) => p.id === pluginId ? { ...p, installed: true, enabled: true } : p),
      false
    );
    await fetch("/api/plugins/install", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pluginId }),
    });
    mutate();
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto animate-fade-in-up py-6 px-4">
      {/* Header */}
      <header className="flex flex-col gap-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium uppercase tracking-widest text-muted-foreground w-fit rounded-full bg-secondary/50 border border-border/50">
          <Settings2 className="w-3.5 h-3.5" />
          <span>Ecosystem &middot; Plugins</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mt-2">
          Plugins
        </h1>
        <p className="max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed mt-1">
          Drop-in integrations for your modules. Install the specific capabilities you need—from WhatsApp invoice delivery to Razorpay collections—in a single click.
        </p>
      </header>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full max-w-md group">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <input
            type="search"
            placeholder="Search plugins by name or features..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 text-sm bg-surface-2 border border-border/60 rounded-xl text-foreground placeholder:text-muted-foreground/70 transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
          />
        </div>
      </div>

      {/* Plugin list */}
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4 stagger-children">
        {isLoading && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-muted-foreground">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-sm font-medium">Loading ecosystem plugins...</p>
          </div>
        )}
        
        {filteredPlugins.map((plugin: any) => {
          const isInstalled = plugin.installed;
          const isEnabled = plugin.enabled;

          // Compute a dynamic inline style for the icon background using the accent map defined in KI.
          // Since it was inline previously, we'll keep it inline purely for the dynamic accent color,
          // but wrap everything else in standard Tailwind.
          const accentColor = `var(--accent-${
            plugin.icon === "message-circle" ? "emerald" :
            plugin.icon === "fingerprint" ? "blue" :
            plugin.icon === "file-check" ? "violet" :
            plugin.icon === "mail" ? "amber" :
            plugin.icon === "calendar-off" ? "rose" :
            plugin.icon === "credit-card" ? "cyan" : "primary"
          })`;

          return (
            <div
              key={plugin.id}
              className="group flex flex-col p-6 gap-5 rounded-2xl transition-all duration-300 bg-card border border-border/40 hover:border-border/80 shadow-sm hover:shadow-md relative overflow-hidden"
            >
              {/* Subtle background glow effect on hover */}
              <div 
                className="absolute -right-20 -top-20 w-40 h-40 blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none rounded-full"
                style={{ background: accentColor }}
              />

              {/* Header: Icon + Title + Badge */}
              <div className="flex items-start gap-4">
                <div
                  className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-105 shadow-sm border border-black/5 dark:border-white/5"
                  style={{
                    background: `color-mix(in oklch, ${accentColor}, transparent 88%)`,
                    color: accentColor,
                  }}
                >
                  {iconMap[plugin.icon] || <Settings2 className="h-5 w-5" />}
                </div>
                <div className="flex-1 min-w-0 pt-0.5 flex flex-col gap-1.5">
                  <h3 className="text-base font-semibold text-foreground tracking-tight truncate">
                    {plugin.name}
                  </h3>
                  <Badge
                    variant={plugin.badge === "Pro" ? "default" : "secondary"}
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border-0 w-fit ${
                      plugin.badge === "Pro" ? "bg-primary/10 text-primary" : "bg-success/10 text-success"
                    }`}
                  >
                    {plugin.badge}
                  </Badge>
                </div>
              </div>

              {/* Body: Description + Triggers */}
              <div className="flex-1 flex flex-col min-w-0">
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {plugin.description}
                </p>

                {/* Connected to */}
                {plugin.triggers && plugin.triggers.length > 0 && (() => {
                  const tableNames = Array.from(
                    new Set(plugin.triggers.map((t: any) => t.table).filter(Boolean))
                  ) as string[];
                  if (tableNames.length === 0) return null;
                  const requiredPack = PACK_FOR_PLUGIN[plugin.id];
                  const missingPack =
                    requiredPack && !installedPackIds.has(requiredPack.packId);
                  return (
                    <div className="flex flex-wrap items-center gap-1.5 mt-auto">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1">
                        <Link2 className="h-3 w-3 inline mr-1 -mt-0.5" />
                        Connected to
                      </span>
                      {tableNames.map((name) => {
                        const t = tablesByName.get(name);
                        return t ? (
                          <Link
                            key={name}
                            href={`/schema/${t.id}`}
                            className="text-[11px] font-medium px-2 py-0.5 rounded-md transition-colors hover:underline"
                            style={{
                              background: "color-mix(in oklch, var(--primary), transparent 88%)",
                              color: "var(--primary)",
                              border: "1px solid color-mix(in oklch, var(--primary), transparent 75%)",
                            }}
                          >
                            {name}
                          </Link>
                        ) : (
                          <span
                            key={name}
                            className="text-[11px] font-medium px-2 py-0.5 rounded-md"
                            style={{
                              background: "var(--surface-3)",
                              color: "var(--foreground-dimmed)",
                              border: "1px solid var(--border-subtle)",
                            }}
                            title="Table not present in this workspace"
                          >
                            {name}
                          </span>
                        );
                      })}
                      {missingPack && (
                        <Link
                          href="/modules"
                          className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md transition-colors hover:underline mt-1 w-fit"
                          style={{
                            background: "color-mix(in oklch, var(--accent-amber), transparent 88%)",
                            color: "var(--accent-amber)",
                            border: "1px solid color-mix(in oklch, var(--accent-amber), transparent 75%)",
                          }}
                          title={`Install the ${requiredPack.packName} module to enable this flow`}
                        >
                          <AlertCircle className="h-3 w-3" />
                          Install {requiredPack.packName}
                        </Link>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Footer: Meta + Actions */}
              <div className="flex items-center justify-between gap-4 pt-5 border-t border-border/40 mt-auto">
                <div className="flex items-center gap-3 text-[11px] font-medium text-muted-foreground/80 lowercase">
                  <span className="flex items-center gap-1.5" title={`${plugin.installs.toLocaleString()} users`}>
                    <Users className="h-3.5 w-3.5" /> {plugin.installs >= 1000 ? `${(plugin.installs/1000).toFixed(1)}k` : plugin.installs}
                  </span>
                  <span className="flex items-center gap-1.5" title={`${plugin.configFields.length} options`}>
                    <Settings2 className="h-3.5 w-3.5" /> {plugin.configFields.length}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isInstalled ? (
                    <>
                      <button
                        onClick={() => togglePlugin(plugin.id)}
                        className="transition-transform duration-200 hover:scale-110 active:scale-95 mr-1"
                        style={{ color: isEnabled ? accentColor : "var(--muted-foreground)" }}
                        title={isEnabled ? "Disable Plugin" : "Enable Plugin"}
                      >
                        {isEnabled ? <ToggleRight className="h-8 w-8" /> : <ToggleLeft className="h-8 w-8" />}
                      </button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-8 text-xs font-medium px-4"
                      >
                        Configure
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      className="h-8 rounded-lg font-medium shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 px-4"
                      onClick={() => installPlugin(plugin.id)}
                    >
                      <Download className="h-3.5 w-3.5 mr-1.5" /> Install
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
