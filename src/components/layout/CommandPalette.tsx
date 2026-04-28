"use client";

import { useEffect, useState, useMemo } from "react";
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
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useWorkspace } from "@/hooks/use-workspace";

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

    // 3. User Workspace Data (Dynamic Pages, Tables, Modules)
    if (workspace) {
      workspace.pages.forEach(page => {
        data.push({
          id: `page-${page.id}`,
          title: page.title || "Untitled Page",
          href: `/pages/${page.id}`,
          icon: FileText,
          keywords: ["page", "custom", "ui", page.title?.toLowerCase() || ""],
          category: "User Pages"
        });
      });

      workspace.tables.forEach(table => {
        data.push({
          id: `table-${table.id}`,
          title: table.name || "Untitled Table",
          href: `/schema/${table.id}`,
          icon: Database,
          keywords: ["table", "schema", "data", table.name?.toLowerCase() || ""],
          category: "User Tables"
        });
      });
    }

    // 4. All Plugins available in the platform
    allPlugins.forEach(plugin => {
      data.push({
        id: `plugin-${plugin.id}`,
        title: plugin.name,
        href: `/plugins`, // or `/plugins/${plugin.id}` if a specific route exists
        icon: Puzzle,
        keywords: [plugin.id, plugin.category.toLowerCase(), ...(plugin.description?.toLowerCase().split(" ") || [])],
        category: "Plugins"
      });
    });

    // 5. All Packs (Modules) available in the Marketplace
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
  }, [workspace]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    
    const handleCustomOpen = () => setOpen(true);

    document.addEventListener("keydown", down);
    window.addEventListener("open-command-palette", handleCustomOpen);
    return () => {
      document.removeEventListener("keydown", down);
      window.removeEventListener("open-command-palette", handleCustomOpen);
    };
  }, []);

  const fuse = useMemo(
    () =>
      new Fuse(deepSearchData, {
        keys: ["title", "keywords", "category"],
        threshold: 0.3,
        ignoreLocation: true,
      }),
    [deepSearchData]
  );

  const results = useMemo(() => {
    // If no query is typed, ONLY show the base navigation pre-suggestions!
    if (!query) return baseNavigationData;
    
    // Otherwise, do a deep search across everything
    return fuse.search(query).map((result) => result.item);
  }, [query, fuse]);

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
    setOpen(false);
    setQuery("");
    router.push(href);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent showCloseButton={false} className="p-0 overflow-hidden border-0 bg-transparent shadow-none sm:max-w-xl">
        <Command 
          className="flex h-full w-full flex-col overflow-hidden rounded-xl border shadow-2xl bg-[var(--surface-1)] text-[var(--foreground)]"
          style={{ borderColor: 'var(--border)' }}
          shouldFilter={false} // We are using fuse.js for filtering!
          loop
        >
          <div className="flex items-center border-b px-3" style={{ borderColor: 'var(--border-subtle)' }}>
            <Search className="mr-2 h-4 w-4 shrink-0" style={{ color: 'var(--foreground-muted)' }} />
            <Command.Input
              autoFocus
              placeholder={t("common.search") + "..."}
              value={query}
              onValueChange={setQuery}
              className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-[var(--foreground-muted)] disabled:cursor-not-allowed disabled:opacity-50 text-[var(--foreground)]"
            />
            <kbd 
              className="hidden sm:inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-medium" 
              style={{ borderColor: 'var(--border-subtle)', color: 'var(--foreground-dimmed)', backgroundColor: 'var(--surface-2)' }}
            >
              ESC
            </kbd>
          </div>

          <Command.List className="max-h-[350px] overflow-y-auto overflow-x-hidden p-2 text-[var(--foreground)] custom-scrollbar">
            {results.length === 0 && (
              <Command.Empty className="py-6 text-center text-sm" style={{ color: 'var(--foreground-muted)' }}>
                No results found for "{query}".
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
        </Command>
      </DialogContent>
    </Dialog>
  );
}
