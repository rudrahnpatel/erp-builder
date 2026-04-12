"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { allPlugins } from "@/lib/plugins/registry";
import { PluginDefinition } from "@/types/plugin";
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
} from "lucide-react";
import useSWR from "swr";

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
  
  const { data: plugins, mutate, isLoading } = useSWR<PluginDefinition[]>("/api/plugins", fetcher);

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
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
              className="group flex flex-col sm:flex-row p-5 gap-5 rounded-2xl transition-all duration-300 bg-card border border-border/40 hover:border-border/80 shadow-sm hover:shadow-md relative overflow-hidden"
            >
              {/* Subtle background glow effect on hover */}
              <div 
                className="absolute -right-20 -top-20 w-40 h-40 blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none rounded-full"
                style={{ background: accentColor }}
              />

              {/* Icon */}
              <div
                className="h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-105 shadow-sm border border-black/5 dark:border-white/5"
                style={{
                  background: `color-mix(in oklch, ${accentColor}, transparent 88%)`,
                  color: accentColor,
                }}
              >
                {iconMap[plugin.icon] || <Settings2 className="h-6 w-6" />}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <h3 className="text-base font-semibold text-foreground tracking-tight">
                    {plugin.name}
                  </h3>
                  <Badge
                    variant={plugin.badge === "Pro" ? "default" : "secondary"}
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border-0 ${
                      plugin.badge === "Pro" ? "bg-primary/10 text-primary" : "bg-success/10 text-success"
                    }`}
                  >
                    {plugin.badge}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-snug mb-3 pr-2">
                  {plugin.description}
                </p>
                
                <div className="flex items-center gap-4 text-[11px] font-medium text-muted-foreground/80 lowercase mt-auto">
                  <span className="flex items-center gap-1.5 bg-secondary/40 px-2 py-1 rounded-md">
                    <Users className="h-3 w-3" /> {plugin.installs.toLocaleString()} users
                  </span>
                  <span className="flex items-center gap-1.5 bg-secondary/40 px-2 py-1 rounded-md">
                    <Settings2 className="h-3 w-3" /> {plugin.configFields.length} options
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex sm:flex-col items-center justify-center gap-3 shrink-0 sm:border-l sm:border-border/40 sm:pl-5">
                {isInstalled ? (
                  <>
                    <button
                      onClick={() => togglePlugin(plugin.id)}
                      className="transition-transform duration-200 hover:scale-110 active:scale-95"
                      style={{ color: isEnabled ? accentColor : "var(--muted-foreground)" }}
                      title={isEnabled ? "Disable Plugin" : "Enable Plugin"}
                    >
                      {isEnabled ? <ToggleRight className="h-8 w-8" /> : <ToggleLeft className="h-8 w-8" />}
                    </button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs font-medium w-full text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                    >
                      Configure
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    className="w-full h-9 rounded-lg font-semibold shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
                    onClick={() => installPlugin(plugin.id)}
                  >
                    <Download className="h-4 w-4 mr-1.5" /> Install
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
