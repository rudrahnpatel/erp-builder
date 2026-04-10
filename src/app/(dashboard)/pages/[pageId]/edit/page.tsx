"use client";

import { useState, use } from "react";
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
  Settings2,
  Save,
  MoreHorizontal,
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
  const [blocks, setBlocks] = useState<PlacedBlock[]>([
    { id: "b1", type: "TEXT", label: "Inventory Overview", icon: <Type className="h-4 w-4" /> },
    { id: "b2", type: "FILTER_BAR", label: "Search & Filter", icon: <Filter className="h-4 w-4" /> },
    { id: "b3", type: "TABLE_VIEW", label: "Products Master List", icon: <Table2 className="h-4 w-4" /> },
  ]);
  const [selectedBlock, setSelectedBlock] = useState<string | null>("b3");
  const [preview, setPreview] = useState(false);

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
    <div className="h-[calc(100vh-3.5rem)] flex flex-col -m-4 sm:-m-6">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[#e2e8f0] bg-white">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <span className="text-sm font-bold text-[#2b3437]">ERP Composer</span>
          <span className="hidden sm:inline text-[#cbd5e1]">/</span>
          <span className="hidden sm:inline text-sm text-[#64748b] truncate">Page: Inventory Dashboard</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={preview ? "default" : "outline"}
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => setPreview(!preview)}
          >
            <Eye className="h-3.5 w-3.5" /> {preview ? "Edit" : "Preview"}
          </Button>
          <Button size="sm" className="gap-1.5 text-xs">
            Publish
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* Left: Block Palette */}
        {!preview && (
          <div className="w-full lg:w-[200px] border-b lg:border-b-0 lg:border-r border-[#e2e8f0] bg-white overflow-y-auto max-h-[30vh] lg:max-h-none">
            <div className="p-4 border-b border-[#f1f4f6]">
              <h3 className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                Block Palette
              </h3>
              <p className="text-[10px] text-[#94a3b8] mt-0.5">
                Drop components onto canvas
              </p>
            </div>
            <div className="p-3 flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible">
              {blockPalette.map((block) => (
                <button
                  key={block.type}
                  onClick={() => addBlock(block.type, block.label, block.icon)}
                  className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-[#2b3437] rounded-lg hover:bg-primary/5 hover:text-primary border border-transparent hover:border-primary/20 transition-all whitespace-nowrap lg:w-full shrink-0"
                >
                  {block.icon}
                  {block.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Center: Canvas */}
        <div className="flex-1 bg-[#f8f9fa] overflow-y-auto p-4 sm:p-8">
          <div className="max-w-3xl mx-auto space-y-4">
            {blocks.map((block) => (
              <div
                key={block.id}
                onClick={() => !preview && setSelectedBlock(block.id)}
                className={`group relative bg-white rounded-xl border transition-all ${
                  selectedBlock === block.id && !preview
                    ? "border-primary shadow-md ring-2 ring-primary/10"
                    : "border-[#e2e8f0] hover:border-[#cbd5e1]"
                }`}
              >
                {/* Block toolbar */}
                {!preview && (
                  <div className="absolute -top-3 left-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-1 bg-white border border-[#e2e8f0] rounded-md px-2 py-0.5 shadow-sm">
                      <GripVertical className="h-3 w-3 text-[#cbd5e1] cursor-grab" />
                      <span className="text-[10px] font-medium text-[#64748b]">
                        {block.type.replace("_", " ")}
                      </span>
                      <button onClick={() => removeBlock(block.id)}>
                        <Trash2 className="h-3 w-3 text-[#ef4444] ml-1" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Render block content */}
                <div className="p-5">
                  {block.type === "TEXT" && (
                    <div>
                      <h1 className="text-2xl font-bold text-[#2b3437]">
                        Inventory Overview
                      </h1>
                      <p className="text-sm text-[#64748b] mt-1">
                        Real-time stock levels and asset distribution.
                      </p>
                    </div>
                  )}

                  {block.type === "FILTER_BAR" && (
                    <div className="flex items-center gap-3">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          placeholder="Search products..."
                          className="w-full px-4 py-2 text-sm bg-[#f8f9fa] border border-[#e2e8f0] rounded-lg"
                          readOnly
                        />
                      </div>
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <Filter className="h-3.5 w-3.5" /> Filter
                      </Button>
                    </div>
                  )}

                  {block.type === "TABLE_VIEW" && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Table2 className="h-4 w-4 text-[#64748b]" />
                          <span className="text-sm font-semibold text-[#2b3437]">
                            Products Master List
                          </span>
                        </div>
                        <MoreHorizontal className="h-4 w-4 text-[#cbd5e1]" />
                      </div>
                      <div className="overflow-x-auto">
                      <table className="w-full text-sm min-w-[500px]">
                        <thead>
                          <tr className="border-b border-[#f1f4f6]">
                            {["Name", "SKU", "Price", "Stock", "Status"].map(
                              (h) => (
                                <th
                                  key={h}
                                  className="text-left px-3 py-2.5 text-xs font-semibold text-[#64748b] uppercase tracking-wider"
                                >
                                  {h}
                                </th>
                              )
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {sampleTableData.map((row, i) => (
                            <tr
                              key={i}
                              className="border-b last:border-0 border-[#f1f4f6]"
                            >
                              <td className="px-3 py-3 font-medium text-[#2b3437]">
                                {row.name}
                              </td>
                              <td className="px-3 py-3 text-[#64748b] font-mono text-xs">
                                {row.sku}
                              </td>
                              <td className="px-3 py-3 text-[#2b3437]">
                                {row.price}
                              </td>
                              <td className="px-3 py-3 text-[#2b3437]">
                                {row.stock}
                              </td>
                              <td className="px-3 py-3">
                                <Badge
                                  className={`text-[10px] font-medium border-0 ${
                                    row.status === "In Stock"
                                      ? "bg-emerald-50 text-emerald-700"
                                      : "bg-red-50 text-red-700"
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
                    <div className="flex gap-4">
                      {["To Do", "In Progress", "Done"].map((col) => (
                        <div
                          key={col}
                          className="flex-1 bg-[#f8f9fa] rounded-lg p-3"
                        >
                          <h4 className="text-xs font-semibold text-[#64748b] uppercase mb-2">
                            {col}
                          </h4>
                          <div className="space-y-2">
                            <div className="bg-white rounded-md p-3 border border-[#e2e8f0] text-sm text-[#2b3437]">
                              Sample item
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {block.type === "CHART" && (
                    <div className="h-48 bg-[#f8f9fa] rounded-lg flex items-center justify-center text-[#94a3b8] text-sm">
                      <BarChart3 className="h-8 w-8 mr-2" /> Chart Preview
                    </div>
                  )}

                  {block.type === "FORM" && (
                    <div className="space-y-3 max-w-sm">
                      <div>
                        <label className="text-xs font-medium text-[#64748b] block mb-1">
                          Product Name
                        </label>
                        <input
                          className="w-full text-sm px-3 py-2 bg-[#f8f9fa] border border-[#e2e8f0] rounded-lg"
                          readOnly
                          placeholder="Enter product name"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-[#64748b] block mb-1">
                          SKU
                        </label>
                        <input
                          className="w-full text-sm px-3 py-2 bg-[#f8f9fa] border border-[#e2e8f0] rounded-lg"
                          readOnly
                          placeholder="Enter SKU"
                        />
                      </div>
                      <Button size="sm">Submit</Button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Drop zone hint */}
            {!preview && (
              <div className="border-2 border-dashed border-[#cbd5e1] rounded-xl p-8 text-center text-[#94a3b8] text-sm">
                <Plus className="h-5 w-5 mx-auto mb-2 opacity-50" />
                Drag or click to add new block
              </div>
            )}
          </div>
        </div>

        {/* Right: Properties Panel */}
        {!preview && selectedBlock && (
          <div className="hidden xl:block w-[280px] border-l border-[#e2e8f0] bg-white overflow-y-auto">
            <div className="p-4 border-b border-[#f1f4f6] flex items-center justify-between">
              <h3 className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                Properties
              </h3>
              <Badge variant="outline" className="text-[10px]">
                {blocks.find((b) => b.id === selectedBlock)?.type.replace("_", " ")}
              </Badge>
            </div>

            <div className="p-4 space-y-4">
              {/* Data Source */}
              <div>
                <label className="text-xs font-medium text-[#64748b] block mb-1.5">
                  Data Source
                </label>
                <select className="w-full text-sm px-3 py-2 bg-[#f8f9fa] border border-[#e2e8f0] rounded-lg">
                  <option>Products</option>
                  <option>Suppliers</option>
                  <option>Stock Movements</option>
                </select>
              </div>

              {/* Visible columns */}
              <div>
                <label className="text-xs font-medium text-[#64748b] block mb-1.5">
                  Visible Columns
                </label>
                <div className="space-y-1.5">
                  {["Name", "SKU", "Price", "Stock", "Updated At"].map(
                    (col, i) => (
                      <label
                        key={col}
                        className="flex items-center gap-2 text-sm text-[#2b3437]"
                      >
                        <input
                          type="checkbox"
                          defaultChecked={i < 4}
                          className="rounded border-[#e2e8f0] text-primary focus:ring-primary"
                        />
                        {col}
                      </label>
                    )
                  )}
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <label className="text-xs font-medium text-[#64748b] block mb-1.5">
                  Sort Options
                </label>
                <select className="w-full text-sm px-3 py-2 bg-[#f8f9fa] border border-[#e2e8f0] rounded-lg mb-2">
                  <option>Stock (Ascending)</option>
                  <option>Name (A-Z)</option>
                  <option>Price (Low to High)</option>
                </select>
                <button className="text-xs text-primary font-medium hover:text-primary/80">
                  + Add sort rule
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
