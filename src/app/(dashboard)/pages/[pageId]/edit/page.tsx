"use client";

import { useState, use, useEffect } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table2,
  Kanban,
  Type,
  Filter,
  BarChart3,
  FileText,
  Plus,
  GripVertical,
  Trash2,
  Eye,
  Save,
  MoreHorizontal,
  ChevronRight,
  PenLine,
  Settings2,
  Code,
  Search,
} from "lucide-react";

interface PlacedBlock {
  id: string;
  type: string;
  label: string;
  icon: React.ReactNode;
}

const blockPalette = [
  { type: "TABLE_VIEW", label: "Table View", icon: <Table2 className="h-4 w-4" /> },
  { type: "KANBAN_VIEW", label: "Kanban Board", icon: <Kanban className="h-4 w-4" /> },
  { type: "TEXT", label: "Text/Heading", icon: <Type className="h-4 w-4" /> },
  { type: "FILTER_BAR", label: "Filter Bar", icon: <Filter className="h-4 w-4" /> },
  { type: "CHART", label: "Chart", icon: <BarChart3 className="h-4 w-4" /> },
  { type: "FORM", label: "Form", icon: <FileText className="h-4 w-4" /> },
];

const sampleTableData = [
  { name: "Precision Lathe X-10", sku: "LAT-2023-001", price: "₹4,250.00", stock: "12 Units", status: "In Stock" },
  { name: "Hydraulic Press S0T", sku: "HYD-93-A", price: "₹8,900.00", stock: "3 Units", status: "Low Stock" },
  { name: "Industrial Safety Mask", sku: "SAF-MASK-8", price: "₹75.50", stock: "450 Units", status: "In Stock" },
];

export default function PageComposerPage({ params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = use(params);

  const { data: page, mutate: refreshPage } = useSWR(`/api/pages/${pageId}`, (url: string) => fetch(url).then(r => r.json()));

  const [blocks, setBlocks] = useState<PlacedBlock[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [propertiesTab, setPropertiesTab] = useState<"data" | "style" | "advanced">("data");

  // Sync state when page fetches
  useEffect(() => {
    if (page?.blocks && Array.isArray(page.blocks) && blocks.length === 0) {
      setBlocks(page.blocks as PlacedBlock[]);
    } else if (page && !page.blocks && blocks.length === 0) {
      // Default initial state for a new page
      setBlocks([
        { id: "b1", type: "TEXT", label: "Inventory Overview", icon: <Type className="h-4 w-4" /> },
        { id: "b2", type: "FILTER_BAR", label: "Search & Filter", icon: <Filter className="h-4 w-4" /> },
        { id: "b3", type: "TABLE_VIEW", label: "Products Master List", icon: <Table2 className="h-4 w-4" /> },
      ]);
    }
  }, [page]);

  const addBlock = (type: string, label: string, icon: React.ReactNode) => {
    const newBlock: PlacedBlock = {
      id: `b${Date.now()}`,
      type,
      label,
      icon,
    };
    setBlocks((prev) => [...prev, newBlock]);
    setSelectedBlock(newBlock.id);
  };

  const removeBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    if (selectedBlock === id) setSelectedBlock(null);
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col -m-4 sm:-m-6 bg-background text-foreground">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border/50 shrink-0 glass shadow-sm z-10 relative">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
          <span className="opacity-80">Builder</span>
          <ChevronRight className="h-3.5 w-3.5 opacity-50" />
          <span className="text-foreground">ERP Composer</span>
          <ChevronRight className="h-3.5 w-3.5 opacity-50" />
          <span className="px-2 py-0.5 rounded-md bg-secondary text-foreground truncate max-w-[150px]">
            {page ? page.title : "Loading..."}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant={preview ? "default" : "outline"}
            size="sm"
            className="gap-2 text-xs font-semibold h-8 rounded-lg"
            onClick={() => setPreview(!preview)}
          >
            <Eye className="h-3.5 w-3.5" /> {preview ? "Edit Mode" : "Preview"}
          </Button>
          <Button
            size="sm"
            disabled={isSaving}
            onClick={async () => {
              setIsSaving(true);
              const saveableBlocks = blocks.map(b => ({ ...b, icon: undefined }));
              await fetch(`/api/pages/${pageId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ blocks: saveableBlocks }),
              });
              await refreshPage();
              setIsSaving(false);
            }}
            className="gap-2 text-xs font-semibold h-8 rounded-lg shadow-sm transition-all active:scale-95"
          >
            <Save className="h-3.5 w-3.5" />
            {isSaving ? "Saving..." : "Publish Page"}
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* Block Palette */}
        {!preview && (
          <div className="w-full lg:w-[240px] border-b lg:border-b-0 lg:border-r border-border/40 overflow-y-auto max-h-[30vh] lg:max-h-none bg-surface-1 shadow-[inset_-10px_0_20px_-20px_rgba(0,0,0,0.1)] flex flex-col">
            <div className="p-5 border-b border-border/40 sticky top-0 bg-surface-1/95 backdrop-blur z-10">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                Components
              </h3>
              <p className="text-xs text-muted-foreground/70">
                Drag or click to add blocks.
              </p>
            </div>
            
            <div className="p-4 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible">
              {blockPalette.map((block) => (
                <button
                  key={block.type}
                  onClick={() => addBlock(block.type, block.label, block.icon)}
                  className="group flex items-center gap-3 px-3.5 py-3 text-sm rounded-xl transition-all duration-200 whitespace-nowrap lg:w-full shrink-0 border border-transparent hover:border-primary/20 hover:bg-primary/5 hover:text-primary hover:shadow-sm text-foreground/80 font-medium"
                >
                  <div className="p-1.5 rounded-md bg-secondary/60 group-hover:bg-primary/10 group-hover:text-primary transition-colors text-muted-foreground">
                    {block.icon}
                  </div>
                  {block.label}
                  <Plus className="h-3.5 w-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 dotted-grid relative bg-background">
          <div className="max-w-4xl mx-auto space-y-6 stagger-children pb-20">
            {blocks.map((block, index) => (
              <div
                key={block.id || `block-${index}`}
                onClick={() => !preview && setSelectedBlock(block.id)}
                className={`group relative rounded-2xl transition-all duration-300 ${
                  !preview ? "cursor-pointer" : ""
                } bg-card border ${
                  selectedBlock === block.id && !preview
                    ? "border-primary ring-4 ring-primary/10 shadow-lg scale-[1.01]"
                    : "border-border/40 hover:border-border/80 shadow-sm hover:shadow-md"
                }`}
              >
                {/* Block toolbar */}
                {!preview && (
                  <div className="absolute -top-3 left-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-2 border border-border shadow-md backdrop-blur-sm">
                      <GripVertical className="h-3.5 w-3.5 cursor-grab text-muted-foreground hover:text-foreground" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground pr-2 border-r border-border/50">
                        {block.type.replace("_", " ")}
                      </span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          removeBlock(block.id);
                        }}
                        className="pl-1 text-muted-foreground hover:text-destructive transition-colors p-0.5 rounded-md"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Block content */}
                <div className="p-6">
                  {block.type === "TEXT" && (
                    <div className="space-y-1">
                      <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Inventory Overview
                      </h1>
                      <p className="text-base text-muted-foreground">
                        Real-time stock levels and asset distribution.
                      </p>
                    </div>
                  )}

                  {block.type === "FILTER_BAR" && (
                    <div className="flex items-center gap-3">
                      <div className="flex-1 relative group w-full">
                        <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                          type="text"
                          placeholder="Search products, SKUs, or categories..."
                          className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-secondary/30 border border-border/60 text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/60"
                          readOnly={!preview}
                        />
                      </div>
                      <Button variant="outline" className="gap-2 shrink-0 h-10 rounded-xl bg-background border-border/60 hover:bg-secondary/50">
                        <Filter className="h-4 w-4" /> Filter
                      </Button>
                    </div>
                  )}

                  {block.type === "TABLE_VIEW" && (
                    <div>
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-md bg-secondary text-muted-foreground">
                            <Table2 className="h-4 w-4" />
                          </div>
                          <span className="text-base font-semibold text-foreground">
                            Products Master List
                          </span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-secondary rounded-lg">
                          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                      
                      <div className="overflow-x-auto rounded-xl border border-border/40 bg-surface-1">
                        <table className="w-full text-sm min-w-[600px]">
                          <thead>
                            <tr className="border-b border-border/40 bg-secondary/20">
                              {["Name", "SKU", "Price", "Stock", "Status"].map((h) => (
                                <th
                                  key={h}
                                  className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap"
                                >
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/30">
                            {sampleTableData.map((row, i) => (
                              <tr key={i} className="hover:bg-secondary/20 transition-colors">
                                <td className="px-4 py-3.5 font-medium text-foreground whitespace-nowrap">
                                  {row.name}
                                </td>
                                <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground">
                                  <Badge variant="outline" className="font-mono bg-background border-border/60 text-muted-foreground text-[10px]">
                                    {row.sku}
                                  </Badge>
                                </td>
                                <td className="px-4 py-3.5 text-foreground tabular-nums">
                                  {row.price}
                                </td>
                                <td className="px-4 py-3.5 text-foreground">
                                  {row.stock}
                                </td>
                                <td className="px-4 py-3.5">
                                  <Badge
                                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border-0 ${
                                      row.status === "In Stock"
                                        ? "bg-success/15 text-success hover:bg-success/25"
                                        : "bg-destructive/10 text-destructive hover:bg-destructive/20"
                                    }`}
                                  >
                                    {row.status}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {block.type === "KANBAN_VIEW" && (
                    <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
                      {["To Do", "In Progress", "Done"].map((col) => (
                        <div
                          key={col}
                          className="flex-1 rounded-xl p-3 min-w-[220px] bg-secondary/30 border border-border/30 snap-start"
                        >
                          <div className="flex items-center justify-between mb-3 px-1">
                            <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                              {col}
                            </h4>
                            <span className="text-[10px] font-medium bg-background px-1.5 py-0.5 rounded text-muted-foreground border border-border/50">1</span>
                          </div>
                          <div className="space-y-2">
                            <div className="rounded-lg p-3 text-sm bg-card border border-border/40 text-foreground shadow-sm hover:border-border/80 transition-colors cursor-grab">
                              <p className="font-medium mb-2 text-[13px]">Wireframe Dashboard Interface</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="secondary" className="text-[9px] h-4 px-1.5">Design</Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {block.type === "CHART" && (
                    <div className="h-64 rounded-xl flex flex-col items-center justify-center text-sm bg-secondary/20 border border-border/40 text-muted-foreground/80 relative overflow-hidden group/chart cursor-pointer">
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover/chart:opacity-100 transition-opacity" />
                      <BarChart3 className="h-10 w-10 mb-3 opacity-50" /> 
                      <span className="font-medium">Chart Visualization Wrapper</span>
                      <span className="text-xs mt-1 opacity-70">Requires data source connection</span>
                    </div>
                  )}

                  {block.type === "FORM" && (
                    <div className="space-y-4 max-w-lg p-2">
                      <div className="space-y-1.5 mb-2">
                        <h3 className="text-lg font-bold text-foreground">New Entry Form</h3>
                        <p className="text-xs text-muted-foreground">Automatically generated from the selected table schema.</p>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {["Product Name", "SKU Number"].map((label) => (
                          <div key={label} className="space-y-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                              {label}
                            </label>
                            <input
                              className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-secondary/30 border border-border/60 text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                              readOnly={!preview}
                              placeholder={`Enter ${label.toLowerCase()}...`}
                            />
                          </div>
                        ))}
                      </div>
                      
                      <div className="pt-2 flex justify-end gap-2 border-t border-border/40 mt-6 pt-4">
                        <Button variant="ghost" className="h-9 rounded-lg">Cancel</Button>
                        <Button className="h-9 rounded-lg px-6 font-medium shadow-sm active:scale-95 transition-transform">
                          Submit Record
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Drop zone */}
            {!preview && (
              <div
                className="rounded-2xl p-10 text-center transition-all duration-300 border-2 border-dashed border-border/60 bg-transparent text-muted-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary cursor-pointer group"
              >
                <div className="bg-secondary/80 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/10 transition-colors">
                  <Plus className="h-5 w-5 opacity-70" />
                </div>
                <p className="text-sm font-medium">Drag components here or click to add a new block</p>
                <p className="text-xs opacity-60 mt-1">Supports Tables, Kanban, Forms and visual elements</p>
              </div>
            )}
          </div>
        </div>

        {/* Properties Panel */}
        {!preview && selectedBlock && (
          <div className="hidden xl:flex w-[320px] border-l border-border/40 flex-col bg-surface-1 shadow-[inset_10px_0_20px_-20px_rgba(0,0,0,0.1)]">
            <div className="p-5 border-b border-border/40 shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  Properties
                </h3>
                <Badge variant="outline" className="text-[10px] font-mono bg-background border-border/60">
                  {blocks.find((b) => b.id === selectedBlock)?.id}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-secondary/50 border border-border/40">
                <div className="p-1.5 rounded-md bg-background text-primary border border-border/30">
                  {blocks.find((b) => b.id === selectedBlock)?.icon}
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {blocks.find((b) => b.id === selectedBlock)?.type.replace("_", " ")} Block
                </span>
              </div>
            </div>

            {/* Tabbed Navigation */}
            <div className="flex border-b border-border/40 shrink-0 bg-surface-1">
              {(["data", "style", "advanced"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setPropertiesTab(tab)}
                  className={`flex-1 px-3 py-3 text-xs font-semibold capitalize transition-all duration-200 relative ${
                    propertiesTab === tab ? "text-primary bg-primary/5" : "text-muted-foreground hover:text-foreground hover:bg-secondary/30"
                  }`}
                >
                  {tab}
                  {propertiesTab === tab && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full shadow-[0_-2px_8px_rgba(var(--primary),0.5)]" />
                  )}
                </button>
              ))}
            </div>

            <div className="p-5 space-y-6 overflow-y-auto flex-1">
              {/* Data Source */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex justify-between">
                  <span>Data Source</span>
                  <Settings2 className="w-3.5 h-3.5" />
                </label>
                <select className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-card border border-border/60 text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm hover:border-border/80 transition-colors">
                  <option>Table: Products</option>
                  <option>Table: Suppliers</option>
                  <option>Query: Low Stock Alerts</option>
                </select>
                <p className="text-[10px] text-muted-foreground/70 tracking-wide mt-1">Connect this block to an existing Postgres table.</p>
              </div>

              <hr className="border-border/30" />

              {/* Visible columns */}
              <div className="space-y-3">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Column Visibility
                </label>
                <div className="bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm">
                  {["Name", "SKU", "Price", "Stock", "Updated At"].map((col, i) => (
                    <label
                      key={col}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm cursor-pointer hover:bg-secondary/30 border-b border-border/30 last:border-0 transition-colors"
                    >
                      <input
                        type="checkbox"
                        defaultChecked={i < 4}
                        className="rounded border-border/60 w-4 h-4 text-primary focus:ring-primary/20 focus:ring-offset-0 bg-background"
                      />
                      <span className="text-foreground font-medium">{col}</span>
                      <GripVertical className="h-3 w-3 ml-auto text-muted-foreground/40" />
                    </label>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div className="space-y-3 pt-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Default Sorting
                </label>
                <div className="space-y-2">
                  <select className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-card border border-border/60 text-foreground outline-none focus:ring-2 focus:ring-primary/20 shadow-sm">
                    <option>Sort by: Stock (Ascending)</option>
                    <option>Sort by: Name (A-Z)</option>
                    <option>Sort by: Price (Highest First)</option>
                  </select>
                  <Button variant="outline" className="w-full text-xs h-9 rounded-lg border-dashed border-border/80 pt-1 text-muted-foreground hover:text-primary hover:border-primary/50 bg-transparent">
                    + Add secondary sort rule
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
