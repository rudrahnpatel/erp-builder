"use client";

import { useState } from "react";
import { PackCard } from "@/components/marketplace/PackCard";
import {
  inventoryPack,
  crmPack,
  hrPack,
  financePack,
} from "@/lib/packs/registry";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const allPacks = [inventoryPack, crmPack, hrPack, financePack];

const categories = [
  "All Modules",
  "Operations",
  "Sales",
  "Finance",
  "HR & Payroll",
];

const recentIntegrations = [
  {
    name: "Razorpay Checkout",
    category: "Payments",
    rating: 4.8,
  },
  {
    name: "Delhivery Tracking",
    category: "Logistics",
    rating: 4.6,
  },
];

export default function ModulesPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Modules");
  const [installedPacks, setInstalledPacks] = useState<string[]>([]);

  const filteredPacks = allPacks.filter((pack) => {
    const matchesSearch =
      pack.name.toLowerCase().includes(search.toLowerCase()) ||
      pack.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      activeCategory === "All Modules" || pack.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleInstall = (packId: string) => {
    setInstalledPacks((prev) => [...prev, packId]);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <p className="text-xs font-medium text-[#64748b] uppercase tracking-wider mb-1">
          Ecosystem / Modules
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-[#2b3437]">
          Module Marketplace
        </h1>
        <p className="text-[#64748b] mt-1">
          Extend your enterprise capabilities with pre-configured modules
          designed for the unique challenges of Indian SMEs.
        </p>
      </div>

      {/* Search + Categories */}
      <div className="space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#64748b]" />
          <Input
            type="search"
            placeholder="Search modules, templates, or integrations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white border-[#e2e8f0]"
          />
        </div>
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
      </div>

      {/* Module Cards Grid */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {filteredPacks.map((pack) => (
          <PackCard
            key={pack.id}
            pack={pack}
            installed={installedPacks.includes(pack.id)}
            onInstall={handleInstall}
          />
        ))}
      </div>

      {/* CTA Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#005bbf] via-[#0066d6] to-[#1a73e8] p-8 text-white">
        <div className="relative z-10 max-w-lg">
          <h2 className="text-xl font-bold mb-2">Need a custom workflow?</h2>
          <p className="text-white/80 text-sm leading-relaxed mb-5">
            Our engineering team can build bespoke modules for your specific
            industry requirements. From specialized logistics to complex tax
            structures.
          </p>
          <Button
            variant="secondary"
            className="bg-white text-primary hover:bg-white/90 font-medium gap-2"
          >
            Schedule a Consultation <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        {/* Decorative circles */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-20">
          <Sparkles className="h-32 w-32" />
        </div>
        <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute -right-5 -top-5 h-24 w-24 rounded-full bg-white/5" />
      </div>

      {/* Recently Added Integrations */}
      <div>
        <h2 className="text-sm font-semibold text-[#2b3437] uppercase tracking-wider mb-4">
          Recently Added Integrations
        </h2>
        <div className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#f1f4f6] text-[#64748b]">
                <th className="text-left px-6 py-3 font-medium">Provider</th>
                <th className="text-left px-6 py-3 font-medium">Category</th>
                <th className="text-left px-6 py-3 font-medium">Rating</th>
                <th className="text-right px-6 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentIntegrations.map((item) => (
                <tr
                  key={item.name}
                  className="border-b last:border-0 border-[#f1f4f6] hover:bg-[#f8f9fa] transition-colors"
                >
                  <td className="px-6 py-3.5 font-medium text-[#2b3437]">
                    {item.name}
                  </td>
                  <td className="px-6 py-3.5 text-[#64748b]">
                    {item.category}
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="text-amber-500">
                      {"★".repeat(Math.floor(item.rating))}
                    </span>{" "}
                    <span className="text-[#64748b]">{item.rating}</span>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <button className="text-primary hover:text-primary/80 font-medium text-sm">
                      View Integration
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
