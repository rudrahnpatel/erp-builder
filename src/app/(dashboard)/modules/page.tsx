"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PackCard } from "@/components/marketplace/PackCard";
import { Search, ArrowRight, PackageSearch, Sparkles, ShoppingCart, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const categories = [
  "All Modules",
  "Operations",
  "Sales",
  "Finance",
  "HR & Payroll",
];

const COMING_SOON: Record<string, { title: string; blurb: string; icon: any; eta: string }> = {
  Sales: {
    title: "CRM & Sales — coming soon",
    blurb:
      "Lead pipelines, deal kanbans, field-agent tracking, and quote-to-invoice flows tuned for Indian SMEs.",
    icon: ShoppingCart,
    eta: "Q3 2026",
  },
  "HR & Payroll": {
    title: "HR & Payroll — coming soon",
    blurb:
      "Attendance, EPF/ESI payroll sheets, leave requests, and compliance filings. Built for 10–200 person teams.",
    icon: Users,
    eta: "Q4 2026",
  },
};

import { useWorkspace } from "@/hooks/use-workspace";

export default function ModulesPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Modules");
  const [waitlisted, setWaitlisted] = useState<Record<string, boolean>>({});
  const { workspace, refetch } = useWorkspace();
  
  const { data: packsData, isLoading } = useSWR("/api/packs", fetcher);
  const allPacks: any[] = packsData || [];

  // Show installed packs visually if workspace is loaded, else empty fallback
  const installedPacks = workspace?.installedPacks || [];
  const installedPackDetails = workspace?.installedPackDetails || [];
  const installedVersionByPack: Record<string, string> = Object.fromEntries(
    installedPackDetails.map((p) => [p.packId, p.packVersion])
  );

  const filteredPacks = allPacks.filter((pack) => {
    const matchesSearch =
      pack.name.toLowerCase().includes(search.toLowerCase()) ||
      pack.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      activeCategory === "All Modules" || pack.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleInstall = async (packId: string) => {
    const pack = allPacks.find((p) => p.id === packId);
    const label = pack?.name || "module";
    const pending = toast.loading(`Installing ${label}…`);
    try {
      const res = await fetch("/api/packs/install", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId }),
      });
      if (res.ok) {
        await refetch();
        toast.success(`${label} installed`, {
          id: pending,
          description: "Schemas and pages are ready in your workspace.",
        });
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(`Couldn't install ${label}`, {
          id: pending,
          description: data.error || "The server rejected the request.",
        });
      }
    } catch (err) {
      toast.error(`Couldn't install ${label}`, {
        id: pending,
        description: "Network error. Check your connection and try again.",
      });
    }
  };

  const handleUpdate = async (packId: string) => {
    const pack = allPacks.find((p) => p.id === packId);
    const label = pack?.name || "module";
    const pending = toast.loading(`Updating ${label}…`);
    try {
      const res = await fetch("/api/packs/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        await refetch();
        const parts: string[] = [];
        if (data.added?.tables?.length) parts.push(`${data.added.tables.length} table(s)`);
        if (data.added?.fields?.length) parts.push(`${data.added.fields.length} field(s)`);
        if (data.added?.pages?.length) parts.push(`${data.added.pages.length} page(s)`);
        const summary = parts.length
          ? `Added: ${parts.join(", ")}`
          : "No additions needed — version stamped.";
        toast.success(`${label} updated to v${data.toVersion ?? pack?.version}`, {
          id: pending,
          description: summary,
        });
      } else {
        toast.error(`Couldn't update ${label}`, {
          id: pending,
          description: data.error || "The server rejected the request.",
        });
      }
    } catch (err) {
      toast.error(`Couldn't update ${label}`, {
        id: pending,
        description: "Network error. Check your connection and try again.",
      });
    }
  };

  const handleUninstall = async (packId: string) => {
    const pack = allPacks.find((p) => p.id === packId);
    const label = pack?.name || "module";

    if (!confirm(`Uninstall ${label}? This will permanently delete all tables, records, and pages from this module.`)) {
      return;
    }

    const pending = toast.loading(`Uninstalling ${label}…`);
    try {
      const res = await fetch("/api/packs/uninstall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId }),
      });
      if (res.ok) {
        await refetch();
        toast.success(`${label} uninstalled`, {
          id: pending,
          description: "All tables, records, and pages have been removed.",
        });
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(`Couldn't uninstall ${label}`, {
          id: pending,
          description: data.error || "The server rejected the request.",
        });
      }
    } catch (err) {
      toast.error(`Couldn't uninstall ${label}`, {
        id: pending,
        description: "Network error. Check your connection and try again.",
      });
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-fade-in-up">
      {/* Header */}
      <header>
        <p
          className="text-[11px] font-medium uppercase tracking-[0.14em] mb-2 mono"
          style={{ color: "var(--foreground-dimmed)" }}
        >
          / ecosystem · modules
        </p>
        <h1
          className="text-3xl sm:text-4xl font-semibold"
          style={{ color: "var(--foreground)" }}
        >
          Module marketplace
        </h1>
        <p
          className="mt-2 max-w-2xl text-sm sm:text-base leading-relaxed"
          style={{ color: "var(--foreground-muted)" }}
        >
          Pre-configured modules for inventory, CRM, HR and finance. Each pack
          ships with schemas, pages and plugins already wired — install one,
          bend it to your workflow.
        </p>
      </header>

      {/* Search + Categories */}
      <div className="space-y-4">
        <div className="relative max-w-md">
          <Search
            className="absolute left-3 top-2.5 h-4 w-4"
            style={{ color: "var(--foreground-dimmed)" }}
          />
          <input
            type="search"
            placeholder="Search modules, templates, or integrations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg transition-all duration-200 outline-none"
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border-subtle)",
              color: "var(--foreground)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--primary)";
              e.currentTarget.style.boxShadow = "0 0 0 3px var(--primary-glow)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--border-subtle)";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-200"
              style={{
                background:
                  activeCategory === cat
                    ? "var(--primary)"
                    : "transparent",
                color:
                  activeCategory === cat
                    ? "var(--primary-foreground)"
                    : "var(--foreground-muted)",
              }}
              onMouseEnter={(e) => {
                if (activeCategory !== cat) {
                  e.currentTarget.style.background = "var(--surface-3)";
                }
              }}
              onMouseLeave={(e) => {
                if (activeCategory !== cat) {
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Module Cards Grid */}
      {isLoading ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4 stagger-children">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl p-5 border h-64 flex flex-col" style={{ background: "var(--card)", borderColor: "var(--border-subtle)" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="skeleton h-10 w-10 rounded-xl" />
                <div className="flex-1">
                  <div className="skeleton h-4 w-24 rounded-md mb-1.5" />
                  <div className="skeleton h-3 w-16 rounded-md" />
                </div>
              </div>
              <div className="skeleton h-4 w-full rounded-md mb-2" />
              <div className="skeleton h-4 w-3/4 rounded-md mb-4" />
              <div className="mt-auto">
                <div className="skeleton h-9 w-full rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredPacks.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4 stagger-children">
          {filteredPacks.map((pack) => (
            <PackCard
              key={pack.id}
              pack={pack}
              installed={installedPacks.includes(pack.id)}
              installedVersion={installedVersionByPack[pack.id]}
              onInstall={handleInstall}
              onUninstall={handleUninstall}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      ) : search === "" && COMING_SOON[activeCategory] ? (
        // Empty because the category itself hasn't shipped yet → show a
        // category-specific "coming soon" waitlist card instead of a generic
        // "no results" state.
        (() => {
          const info = COMING_SOON[activeCategory];
          const Icon = info.icon;
          const joined = !!waitlisted[activeCategory];
          return (
            <div
              className="rounded-2xl p-10 sm:p-12 text-center relative overflow-hidden"
              style={{
                background: "var(--surface-1)",
                border: "1px dashed var(--border)",
              }}
            >
              <div
                className="absolute -right-24 -top-24 h-64 w-64 rounded-full blur-3xl pointer-events-none"
                style={{ background: "var(--primary-glow)" }}
                aria-hidden="true"
              />
              <div className="relative z-10">
                <div
                  className="h-14 w-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{
                    background:
                      "color-mix(in oklch, var(--primary), transparent 88%)",
                    color: "var(--primary)",
                  }}
                >
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium mono mb-3"
                  style={{
                    background:
                      "color-mix(in oklch, var(--accent-amber), transparent 85%)",
                    color: "var(--accent-amber)",
                    border:
                      "1px solid color-mix(in oklch, var(--accent-amber), transparent 70%)",
                  }}
                >
                  <Sparkles className="h-3 w-3" aria-hidden="true" />
                  ETA {info.eta}
                </span>
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: "var(--foreground)" }}
                >
                  {info.title}
                </h3>
                <p
                  className="text-sm mb-6 max-w-md mx-auto leading-relaxed"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  {info.blurb}
                </p>
                <Button
                  variant={joined ? "outline" : "default"}
                  size="sm"
                  disabled={joined}
                  onClick={() => {
                    setWaitlisted((w) => ({ ...w, [activeCategory]: true }));
                    toast.success(
                      `You're on the ${activeCategory} waitlist`,
                      { description: "We'll email when the module is ready." }
                    );
                  }}
                >
                  {joined ? "On the waitlist ✓" : "Notify me when available"}
                </Button>
              </div>
            </div>
          );
        })()
      ) : (
        <div
          className="rounded-2xl p-12 text-center"
          style={{
            background: "var(--surface-1)",
            border: "1px dashed var(--border)",
          }}
        >
          <div
            className="h-14 w-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{
              background: "var(--surface-2)",
              color: "var(--foreground-muted)",
            }}
          >
            <PackageSearch className="h-6 w-6" aria-hidden="true" />
          </div>
          <h3
            className="text-base font-semibold mb-1"
            style={{ color: "var(--foreground)" }}
          >
            No modules match that search
          </h3>
          <p
            className="text-sm mb-5 max-w-sm mx-auto"
            style={{ color: "var(--foreground-muted)" }}
          >
            Try a different keyword, or clear the filters and browse the full
            catalogue.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearch("");
              setActiveCategory("All Modules");
            }}
          >
            Clear filters
          </Button>
        </div>
      )}

      {/* CTA — panel style, single primary glow, no rainbow */}
      <aside
        className="relative overflow-hidden rounded-2xl p-8 sm:p-10"
        style={{
          background:
            "linear-gradient(180deg, var(--surface-2), var(--surface-1))",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <div className="relative z-10 grid sm:grid-cols-[1fr_auto] gap-6 items-center">
          <div className="max-w-xl">
            <p
              className="text-[11px] uppercase tracking-[0.14em] mb-2 mono"
              style={{ color: "var(--primary)" }}
            >
              / bespoke
            </p>
            <h2
              className="text-xl sm:text-2xl font-semibold mb-2"
              style={{ color: "var(--foreground)" }}
            >
              Need something this catalogue doesn't cover?
            </h2>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--foreground-muted)" }}
            >
              We build custom modules for specialised logistics, industry-specific
              tax flows, and integrations with legacy systems. Book a 30-minute
              call — no sales deck.
            </p>
          </div>
          <Button className="gap-2 font-medium shrink-0">
            Book a call <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        {/* single-color ambient glow */}
        <div
          className="absolute -right-24 -top-24 h-64 w-64 rounded-full blur-3xl pointer-events-none"
          style={{ background: "var(--primary-glow)" }}
          aria-hidden="true"
        />
      </aside>
    </div>
  );
}
