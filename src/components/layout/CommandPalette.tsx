"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import Fuse from "fuse.js";
import {
  LayoutDashboard,
  Blocks,
  FileText,
  Database,
  Puzzle,
  Settings,
  Search,
  Network,
  CalendarDays,
  User,
  ShieldAlert,
  Globe,
  Package,
  Trash2,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { useWorkspace } from "@/hooks/use-workspace";
import useSWR from "swr";

import { allPlugins } from "@/lib/plugins/registry";
import { getAllPacks } from "@/lib/packs/index";

// Base static navigation items (Pre-suggestions shown when query is empty)
const baseNavigationData = [
  { id: "dashboard", title: "Dashboard", href: "/workspace", icon: LayoutDashboard, keywords: ["home", "main", "start", "overview", "index", "dash"], category: "Navigation" },
  { id: "marketplace", title: "Marketplace", href: "/modules", icon: Blocks, keywords: ["apps", "modules", "install", "store", "plugins", "directory", "market"], category: "Navigation" },
  { id: "pages", title: "Manage Pages", href: "/pages", icon: FileText, keywords: ["ui", "views", "screens", "frontend", "design", "layout", "web", "page"], category: "Navigation" },
  { id: "tables", title: "Manage Tables", href: "/tables", icon: Database, keywords: ["data", "schema", "database", "models", "backend", "records", "rows", "sql", "table"], category: "Navigation" },
  { id: "schema", title: "Schema Designer", href: "/schema", icon: Network, keywords: ["relations", "diagram", "architecture", "data model", "visualize"], category: "Navigation" },
  { id: "attendance", title: "Attendance Log", href: "/attendance-log", icon: CalendarDays, keywords: ["employees", "time", "clock", "punch", "tracker", "shift"], category: "Navigation" },
  { id: "plugins", title: "Plugins", href: "/plugins", icon: Puzzle, keywords: ["extensions", "addons", "integrations", "tools", "connectors", "plugin"], category: "Navigation" },
  { id: "settings", title: "Settings", href: "/settings", icon: Settings, keywords: ["preferences", "configuration", "account", "profile", "options", "setting"], category: "Navigation" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { t } = useLanguage();
  const { workspace } = useWorkspace();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch dynamic results from the universal backend search
  const { data: searchResults = [] } = useSWR(
    open && debouncedQuery ? `/api/search?q=${encodeURIComponent(debouncedQuery)}` : null,
    (url) => fetch(url).then((r) => r.json())
  );
  // Combine static and dynamic data for the full deep search index
  const deepSearchData = useMemo(() => {
    // 1. Navigation items
    const data = [...baseNavigationData];

    // 2. Settings Sections
    data.push(
      { id: "settings-account", title: "Account Settings", href: "/settings", icon: User, keywords: ["name", "email", "profile", "user"], category: "Settings" },
      { id: "settings-workspace", title: "Workspace Domain", href: "/settings", icon: Globe, keywords: ["subdomain", "url", "link", "address", "slug"], category: "Settings" },
      { id: "settings-admin", title: "Admin Credentials", href: "/settings", icon: ShieldAlert, keywords: ["password", "login", "auth", "security", "tenant"], category: "Settings" },
      { id: "settings-delete", title: "Delete Account", href: "/settings", icon: Trash2, keywords: ["remove", "wipe", "danger", "trash", "erase"], category: "Settings" }
    );

    // 3. All Plugins available in the platform
    allPlugins.forEach(plugin => {
      data.push({
        id: `plugin-${plugin.id}`,
        title: plugin.name,
        href: `/plugins`,
        icon: Puzzle,
        keywords: [plugin.id, plugin.category.toLowerCase(), ...(plugin.description?.toLowerCase().split(" ") || [])],
        category: "Plugins"
      });
    });

    // 4. All Packs (Modules) available in the Marketplace
    getAllPacks().forEach(pack => {
      data.push({
        id: `pack-${pack.id}`,
        title: pack.name,
        href: `/modules/${pack.id}`,
        icon: Package,
        keywords: [pack.id, pack.category.toLowerCase(), ...(pack.description?.toLowerCase().split(" ") || [])],
        category: "Marketplace Modules"
      });
    });

    return data;
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape" && open) {
        e.preventDefault();
        close();
      }
    };

    const handleCustomOpen = () => setOpen(true);

    document.addEventListener("keydown", down);
    window.addEventListener("open-command-palette", handleCustomOpen);
    return () => {
      document.removeEventListener("keydown", down);
      window.removeEventListener("open-command-palette", handleCustomOpen);
    };
  }, [open, close]);

  // Auto-focus the input when opened
  useEffect(() => {
    if (open) {
      // Small delay to let the expansion animation start before focusing
      const timer = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Click outside to close
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    };
    // Use a slight delay so the opening click doesn't immediately close it
    const timer = setTimeout(() => document.addEventListener("mousedown", handleClick), 10);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [open, close]);

  const fuse = useMemo(() => {
    if (!open) return null;
    return new Fuse(deepSearchData, {
      keys: ["title", "keywords", "category"],
      threshold: 0.3,
      ignoreLocation: true,
    });
  }, [deepSearchData, open]);

  const results = useMemo(() => {
    if (!query) return baseNavigationData;
    
    // 1. Local results (Navigation + Settings + Plugins + Packs)
    const localResults = fuse ? fuse.search(query).map((r) => r.item) : [];
    
    // 2. Backend results (Pages, Tables, Modules, Records, Custom Indices)
    const backendResults = searchResults.map((res: any) => ({
      ...res,
      icon: res.icon === "FileText" ? FileText :
            res.icon === "Database" ? Database :
            res.icon === "Package" ? Package :
            res.icon === "Search" ? Search :
            res.icon === "FilePlus" ? FileText : 
            Search
    }));

    // Combine them, ensuring no duplicates
    const seenIds = new Set(localResults.map(r => r.id));
    const merged = [...localResults];
    
    backendResults.forEach((b: any) => {
      if (!seenIds.has(b.id)) {
        merged.push(b);
      }
    });

    return merged;
  }, [query, fuse, searchResults]);

  // Group results by category
  const groupedResults = useMemo(() => {
    const groups: Record<string, typeof baseNavigationData> = {};
    results.forEach(item => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [results]);

  const onSelect = (href: string) => {
    close();
    router.push(href);
  };

  return (
    <>
      {/* Backdrop overlay — fades in when open */}
      <div
        className="fixed inset-0 z-[98] transition-all duration-700 ease-out"
        style={{
          background: "oklch(0.08 0.02 260 / 0.45)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
        }}
        onClick={close}
        aria-hidden="true"
      />

      {/* Single morphing container */}
      <div
        ref={containerRef}
        className="fixed z-[99] left-1/2"
        style={{
          /* Both states use `bottom` so CSS can smoothly interpolate */
          bottom: open ? "50%" : "24px",
          transform: open
            ? "translate(-50%, 50%)"
            : "translateX(-50%)",
          /* Width morphs from pill to full palette */
          width: open ? "min(580px, calc(100vw - 2rem))" : "auto",
          /* Smooth everything */
          transition: "all 700ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <div
          className="overflow-hidden"
          style={{
            background: "var(--surface-1)",
            border: "1px solid var(--border)",
            borderRadius: open ? "16px" : "20px",
            boxShadow: open
              ? "0 24px 80px rgba(0,0,0,0.25), 0 8px 32px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.05)"
              : "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
            transition: "border-radius 700ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 700ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <Command
            shouldFilter={false}
            loop
          >
            {/* Search input row — always visible */}
            <div
              className="flex items-center gap-3 px-4 cursor-text"
              onClick={() => {
                if (!open) setOpen(true);
                else inputRef.current?.focus();
              }}
              style={{
                height: open ? "52px" : "44px",
                borderBottom: open ? "1px solid var(--border-subtle)" : "none",
                transition: "height 700ms cubic-bezier(0.22, 1, 0.36, 1), border-bottom 400ms ease",
              }}
            >
              <Search
                className="shrink-0 transition-all duration-700"
                style={{
                  width: open ? "16px" : "15px",
                  height: open ? "16px" : "15px",
                  color: "var(--foreground-muted)",
                }}
              />

              {/* When collapsed: show placeholder text. When open: show real input */}
              {!open ? (
                <span
                  className="text-sm font-medium whitespace-nowrap select-none"
                  style={{ color: "var(--foreground-dimmed)" }}
                >
                  Search pages...
                </span>
              ) : (
                <Command.Input
                  ref={inputRef}
                  placeholder={t("common.search") + "..."}
                  value={query}
                  onValueChange={setQuery}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--foreground-muted)] text-[var(--foreground)]"
                  style={{ height: "100%" }}
                />
              )}

              <kbd
                className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold tracking-wider shrink-0"
                style={{
                  background: "var(--surface-2)",
                  color: "var(--foreground-muted)",
                  transition: "opacity 300ms ease",
                  opacity: open ? 0 : 1,
                  width: open ? 0 : "auto",
                  overflow: "hidden",
                  padding: open ? 0 : undefined,
                }}
              >
                CTRL <span className="text-[9px]">K</span>
              </kbd>

              {open && (
                <kbd
                  className="flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-medium shrink-0"
                  style={{
                    borderColor: "var(--border-subtle)",
                    color: "var(--foreground-dimmed)",
                    backgroundColor: "var(--surface-2)",
                    animation: "fade-in 200ms ease forwards",
                  }}
                >
                  ESC
                </kbd>
              )}
            </div>

            {/* Results list — only renders when open. Uses max-height animation for smooth expand */}
            <div
              style={{
                maxHeight: open ? "400px" : "0px",
                opacity: open ? 1 : 0,
                transition: "max-height 700ms cubic-bezier(0.22, 1, 0.36, 1), opacity 600ms cubic-bezier(0.22, 1, 0.36, 1)",
                overflow: "hidden",
              }}
            >
              <Command.List className="max-h-[350px] overflow-y-auto overflow-x-hidden p-2 text-[var(--foreground)] custom-scrollbar">
                {results.length === 0 && (
                  <Command.Empty className="py-6 text-center text-sm" style={{ color: 'var(--foreground-muted)' }}>
                    No results found for &ldquo;{query}&rdquo;.
                  </Command.Empty>
                )}

                {Object.entries(groupedResults).map(([category, items]) => (
                  <Command.Group
                    key={category}
                    heading={category}
                    className="overflow-hidden p-1 text-[var(--foreground)] [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-[var(--foreground-muted)]"
                  >
                    {items.map((item) => (
                      <Command.Item
                        key={item.id}
                        value={item.id}
                        onSelect={() => onSelect(item.href)}
                        className="relative flex cursor-pointer select-none items-center gap-3 rounded-md px-3 py-2.5 text-sm outline-none aria-selected:bg-[var(--surface-2)] aria-selected:text-[var(--foreground)] data-[disabled]:pointer-events-none data-[disabled]:opacity-50 transition-colors duration-150"
                      >
                        <item.icon className="h-4 w-4 text-[var(--foreground-muted)]" />
                        <div className="flex flex-col min-w-0">
                          <span className="truncate">{item.title}</span>
                        </div>
                      </Command.Item>
                    ))}
                  </Command.Group>
                ))}
              </Command.List>
            </div>
          </Command>
        </div>
      </div>
    </>
  );
}
