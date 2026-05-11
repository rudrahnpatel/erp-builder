"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { allPlugins } from "@/lib/plugins/registry";
import { PluginDefinition } from "@/types/plugin";
import { useWorkspace } from "@/hooks/use-workspace";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { RiMessage3Line, RiFingerprintLine, RiFileCheckLine, RiCalendarCloseLine, RiBankCardLine, RiErrorWarningLine, RiSearchLine, RiDeleteBinLine, RiToggleLine, RiToggleFill } from "react-icons/ri";
import { toast } from "sonner";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ManagePluginsPage() {
  const [search, setSearch] = useState("");
  const { workspace } = useWorkspace();

  const { data: plugins, mutate, isLoading } = useSWR<PluginDefinition[]>("/api/plugins", fetcher);

  const installedPlugins = (plugins || []).filter((p) => (p as any).installed);

  const filteredPlugins = installedPlugins.filter((p) => {
    return p.name.toLowerCase().includes(search.toLowerCase()) ||
           p.description.toLowerCase().includes(search.toLowerCase());
  });

  const togglePlugin = async (pluginId: string) => {
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

  const uninstallPlugin = async (pluginId: string) => {
    if (!confirm("Uninstall this plugin? Your saved configuration will be lost.")) return;
    mutate(
      (current) => current?.map((p) => p.id === pluginId ? { ...p, installed: false, enabled: false } : p),
      false
    );
    await fetch("/api/plugins/uninstall", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pluginId }),
    });
    mutate();
    toast.success("Plugin uninstalled");
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fade-in-up py-6 px-4">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] mono" style={{ color: "var(--foreground-dimmed)" }}>
            / manage app · plugins
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold" style={{ color: "var(--foreground)" }}>
            Manage Plugins
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed mt-0.5" style={{ color: "var(--foreground-muted)" }}>
            Configure and manage the integrations you have active in your workspace.
          </p>
        </div>
      </header>

      <div className="relative w-full max-w-md group">
        <RiSearchLine className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
        <input
          type="search"
          placeholder="Search installed plugins..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-2.5 text-sm bg-surface-2 border border-border/60 rounded-xl text-foreground placeholder:text-muted-foreground/70 transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4 stagger-children">
        {isLoading && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-muted-foreground">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-sm font-medium">Loading plugins...</p>
          </div>
        )}

        {!isLoading && installedPlugins.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-center border-2 border-dashed rounded-3xl" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-1)" }}>
            <div className="h-16 w-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "var(--surface-2)", color: "var(--foreground-muted)" }}>
              <RiErrorWarningLine className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-medium mb-1">No Plugins Installed</h3>
            <p className="text-sm max-w-sm mb-6" style={{ color: "var(--foreground-muted)" }}>
              You haven't installed any plugins yet. Head over to the Marketplace to browse available tools.
            </p>
            <Link href="/plugins">
              <Button variant="default">Browse Plugins</Button>
            </Link>
          </div>
        )}
        
        {filteredPlugins.map((plugin: any) => {
          const isEnabled = plugin.enabled;
          const accentColor = `var(--accent-primary)`;

          return (
            <div
              key={plugin.id}
              className="group flex flex-col p-6 gap-5 rounded-2xl transition-all duration-300 bg-card border border-border/40 hover:border-border/80 shadow-sm hover:shadow-md relative overflow-hidden"
            >
              <div 
                className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
                style={{ background: accentColor }}
              />

              <div className="flex items-start justify-between gap-4 relative z-10">
                <div className="flex items-center gap-4">
                  <div 
                    className="h-12 w-12 rounded-xl flex items-center justify-center shadow-inner"
                    style={{ background: `color-mix(in oklch, ${accentColor}, transparent 85%)`, color: accentColor }}
                  >
                    <DynamicIcon name={plugin.icon} className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-base leading-tight tracking-tight">
                        {plugin.name}
                      </h3>
                      {!isEnabled && (
                        <Badge variant="secondary" className="h-5 text-[10px] uppercase font-bold tracking-wider px-1.5 opacity-80" style={{ background: "var(--surface-3)", color: "var(--foreground-muted)" }}>Disabled</Badge>
                      )}
                    </div>
                    <Badge variant="outline" className="h-5 text-[10px] font-medium px-2 rounded-md" style={{ borderColor: "var(--border-subtle)", color: "var(--foreground-dimmed)" }}>
                      v{plugin.version}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex-1 relative z-10">
                <p className="text-[13px] leading-relaxed line-clamp-3" style={{ color: "var(--foreground-muted)" }}>
                  {plugin.description}
                </p>
              </div>

              <div className="flex items-center gap-2 mt-auto pt-4 border-t relative z-10" style={{ borderColor: "var(--border-subtle)" }}>
                <Link href={`/plugins/manage/${plugin.id}`} className="flex-1">
                  <Button variant="default" className="w-full text-xs h-9">
                    Configure
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-9 w-9 shrink-0"
                  onClick={() => togglePlugin(plugin.id)}
                  title={isEnabled ? "Disable plugin" : "Enable plugin"}
                  style={{ color: isEnabled ? "var(--foreground)" : "var(--foreground-muted)" }}
                >
                  {isEnabled ? <RiToggleFill className="h-5 w-5" style={{ color: "var(--primary)" }} /> : <RiToggleLine className="h-5 w-5" />}
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-9 w-9 shrink-0 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                  onClick={() => uninstallPlugin(plugin.id)}
                  title="Uninstall plugin"
                >
                  <RiDeleteBinLine className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
