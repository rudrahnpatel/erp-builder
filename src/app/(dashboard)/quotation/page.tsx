"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RiFileTextLine, RiSearchLine, RiAddLine, RiEyeLine, RiShareLine, RiDeleteBinLine, RiCheckDoubleLine } from "react-icons/ri";
import { RiFileCopyLine, RiEdit2Line, RiCloseCircleLine } from "react-icons/ri";
import { buildShareSlug } from "@/lib/shareSlug";

interface Quotation {
  id: string;
  quotationNo: string;
  clientName: string;
  totalAmount: number;
  date: string;
  status: string;
  publicId: string;
  data: {
    subject?: string;
  };
}

export default function QuotationsPage({ createUrl }: { createUrl?: string }) {
  const router = useRouter();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const finalCreateUrl = createUrl || "/quotation/create";

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/quotations");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setQuotations(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this quotation?")) return;
    try {
      const res = await fetch(`/api/quotations/${id}`, { method: "DELETE" });
      if (res.ok) {
        setQuotations(prev => prev.filter(q => q.id !== id));
      } else {
        alert("Failed to delete");
      }
    } catch (error) {
      console.error(error);
      alert("Error deleting quotation");
    }
  };

  const handleUpdateStatus = async (quotation: Quotation, newStatus: string) => {
    try {
      const payload = {
        ...quotation,
        status: newStatus
      };
      
      const res = await fetch(`/api/quotations/${quotation.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setQuotations(prev => prev.map(q => q.id === quotation.id ? { ...q, status: newStatus } : q));
      } else {
        alert("Failed to update status");
      }
    } catch (error) {
      console.error(error);
      alert("Error updating status");
    }
  };

  const handleShare = async (q: Quotation) => {
    if (!q.publicId) {
      alert("This quotation does not have a public link.");
      return;
    }
    const slug = buildShareSlug(q.clientName || "client", q.quotationNo, q.publicId);
    const shareUrl = `${window.location.origin}/quotation/${slug}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("Share link copied!\n\n" + shareUrl);
    } catch (err) {
      console.error("Failed to copy: ", err);
      alert("Failed to copy link. RiFileCopyLine manually:\n" + shareUrl);
    }
  };

  const filteredQuotations = quotations.filter(q => {
    const searchLower = searchQuery.toLowerCase();
    return (
      (q.quotationNo || "").toLowerCase().includes(searchLower) ||
      (q.clientName || "").toLowerCase().includes(searchLower) ||
      (q.data?.subject || "").toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto min-h-screen bg-white">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <RiFileTextLine className="w-6 h-6 text-blue-600" />
            Quotations
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage and track your official quotations.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <RiSearchLine className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search quotations..."
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Link
            href={finalCreateUrl}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm whitespace-nowrap"
          >
            <RiAddLine className="w-4 h-4" />
            Create Quotation
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">QUOTATION NO</th>
                <th className="px-6 py-4">CLIENT</th>
                <th className="px-6 py-4">SUBJECT</th>
                <th className="px-6 py-4">DATE</th>
                <th className="px-6 py-4 text-right">TOTAL AMOUNT</th>
                <th className="px-6 py-4 text-center">STATUS</th>
                <th className="px-6 py-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Loading quotations...
                  </td>
                </tr>
              ) : filteredQuotations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No quotations found.
                  </td>
                </tr>
              ) : (
                filteredQuotations.map((q) => {
                  const dateObj = new Date(q.date);
                  const formattedDate = !isNaN(dateObj.getTime()) 
                    ? dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                    : q.date;
                    
                  const formattedAmount = new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    maximumFractionDigits: 0
                  }).format(q.totalAmount || 0);

                  const statusStr = (q.status || "PENDING").toUpperCase();
                  const isActive = statusStr === "ACTIVE" || statusStr === "ACCEPTED";
                  
                  return (
                    <tr key={q.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-700 whitespace-nowrap">
                        {q.quotationNo}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {q.clientName || "-"}
                      </td>
                      <td className="px-6 py-4 text-gray-600 max-w-[200px] truncate" title={q.data?.subject}>
                        {q.data?.subject || "-"}
                      </td>
                      <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                        {formattedDate}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-700 text-right whitespace-nowrap">
                        {formattedAmount}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-md border ${
                          isActive 
                            ? "bg-blue-50 text-blue-600 border-blue-200" 
                            : "bg-gray-50 text-gray-600 border-gray-200"
                        }`}>
                          {statusStr}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1.5 text-gray-400">
                          <button 
                            onClick={() => handleUpdateStatus(q, "Active")}
                            className="p-1 hover:text-green-600 transition-colors" 
                            title="Mark Active"
                          >
                            <RiCheckDoubleLine className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(q, "Pending")}
                            className="p-1 hover:text-gray-600 transition-colors" 
                            title="Mark Pending"
                          >
                            <RiCloseCircleLine className="w-4 h-4" />
                          </button>
                          
                          <div className="w-px h-4 bg-gray-200 mx-1"></div>
                          
                          <Link 
                            href={`/quotation/${q.publicId || q.id}`}
                            className="p-1 hover:text-blue-600 transition-colors"
                            title="View Preview"
                          >
                            <RiEyeLine className="w-4 h-4" />
                          </Link>
                          <Link 
                            href={`${finalCreateUrl}?cloneId=${q.id}`}
                            className="p-1 hover:text-blue-600 transition-colors"
                            title="Clone"
                          >
                            <RiFileCopyLine className="w-4 h-4" />
                          </Link>
                          <Link 
                            href={`${finalCreateUrl}?id=${q.id}`}
                            className="p-1 hover:text-blue-600 transition-colors"
                            title="RiEdit2Line"
                          >
                            <RiEdit2Line className="w-4 h-4" />
                          </Link>
                          <button 
                            onClick={() => handleShare(q)}
                            className="p-1 hover:text-blue-600 transition-colors"
                            title="Share"
                          >
                            <RiShareLine className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(q.id)}
                            className="p-1 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <RiDeleteBinLine className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}