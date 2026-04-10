"use client";

import { useState } from "react";
import { PluginCard } from "@/components/marketplace/PluginCard";
import { allPlugins } from "@/lib/plugins/registry";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ArrowRight, Phone } from "lucide-react";

const categories = ["All", "Communication", "HR", "Operations", "Finance"];

export default function PluginsPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredPlugins = allPlugins.filter((plugin) => {
    const matchesSearch =
      plugin.name.toLowerCase().includes(search.toLowerCase()) ||
      plugin.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      activeCategory === "All" || plugin.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] px-8 py-10 text-white">
        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-300 mb-2">
            Marketplace
          </p>
          <h1 className="text-3xl font-bold mb-2">Architect Plugins</h1>
          <p className="text-white/70 text-sm max-w-lg leading-relaxed">
            Extend your enterprise capabilities with our curated library of
            high-performance integrations. Managed, secure, and ready for
            deployment.
          </p>
        </div>
        <div className="absolute right-10 top-1/2 -translate-y-1/2 opacity-10">
          <div className="h-32 w-32 rounded-full border-4 border-white" />
        </div>
        <div className="absolute -right-6 -bottom-6 h-28 w-28 rounded-full bg-blue-500/20" />
      </div>

      {/* Category Tabs + Search */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                activeCategory === cat
                  ? "bg-primary text-white"
                  : "text-[#64748b] hover:bg-[#f1f4f6]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#64748b]" />
          <Input
            type="search"
            placeholder="Search plugins..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white border-[#e2e8f0]"
          />
        </div>
      </div>

      {/* Plugin Cards Grid */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filteredPlugins.map((plugin) => (
          <PluginCard key={plugin.id} plugin={plugin} />
        ))}
      </div>

      {/* CTA */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-8 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#2b3437] mb-1">
            Custom Integration Requirements?
          </h2>
          <p className="text-sm text-[#64748b]">
            Need a specialized plugin for your specific business workflow? Our
            enterprise support team can assist with custom API development.
          </p>
        </div>
        <Button className="gap-2 shrink-0 ml-6">
          <Phone className="h-4 w-4" /> Contact Support
        </Button>
      </div>
    </div>
  );
}
