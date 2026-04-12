"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PackCard } from "@/components/marketplace/PackCard";
import {
  inventoryPack,
  crmPack,
  hrPack,
  financePack,
} from "@/lib/packs/registry";
import { Search, ArrowRight, PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";

const allPacks = [inventoryPack, crmPack, hrPack, financePack];

const categories = [
  "All Modules",
  "Operations",
  "Sales",
  "Finance",
  "HR & Payroll",
];

import { useWorkspace } from "@/hooks/use-workspace";

export default function ModulesPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Modules");
  const { workspace, refetch } = useWorkspace();

  // Show installed packs visually if workspace is loaded, else empty fallback
  const installedPacks = workspace?.installedPacks || [];

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
      {filteredPacks.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4 stagger-children">
          {filteredPacks.map((pack) => (
            <PackCard
              key={pack.id}
              pack={pack}
              installed={installedPacks.includes(pack.id)}
              onInstall={handleInstall}
            />
          ))}
        </div>
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
