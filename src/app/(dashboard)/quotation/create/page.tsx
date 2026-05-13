"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import QuotationForm from "@/components/QuotationForm";
import QuotationPreview from "@/components/QuotationPreview";
import { buildShareSlug } from "@/lib/shareSlug";
import { useWorkspace } from "@/hooks/use-workspace";
import { type LayoutSection } from "@/components/QuotationLayoutEditor";

function CreateQuotationContent({ listUrl }: { listUrl?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cloneId = searchParams.get("cloneId");

  // Fetch existing or clone
  const id = searchParams.get("id");
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const { workspace } = useWorkspace();

  const [data, setData] = useState<{
    template?: string;
    quotationNo: string;
    type: string;
    fixedType: boolean;
    date: string;
    validTill: string;
    subject: string;
    gstNo: string;
    showImages: boolean;
    showHSN: boolean;
    publicId?: string;
    sender: {
      name: string;
      address: string;
      phone: string;
      email: string;
      pan: string;
      signatory: string;
      logo?: string;
      tagline?: string;
      website?: string;
    };
    receiver: { name: string; company: string; address: string; phone: string };
    items: Array<{
      description: string;
      image: string;
      make: string;
      qty: number;
      price: number;
      gst: number;
      hsn?: string;
    }>;
    terms: string;
  }>({
    quotationNo: `CSS/${new Date().toLocaleString("en-US", { month: "short" }).toUpperCase()}/${new Date().getFullYear()}/`,
    type: "Quotation",
    fixedType: true, // Hides toggle
    date: new Date().toISOString().split("T")[0],
    validTill: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    subject: "Quotation For Matrix 5MP IP/ Network camera",
    gstNo: "27AHXPD7350C1Z8",
    showImages: true,
    showHSN: true,
    sender: {
      name: "Your Company Name",
      address: "123 Business Road, City, Country",
      phone: "+1 234 567 8900",
      email: "contact@yourcompany.com",
      pan: "",
      signatory: "Authorized Signatory",
      logo: "",
      tagline: "",
      website: "",
    },
    receiver: {
      name: "",
      company: "",
      address: "",
      phone: "",
    },
    items: [
      {
        description: "",
        image: "",
        make: "",
        qty: 1,
        price: 0,
        gst: 18,
      },
    ],
    terms: `1. Goods once sold will not be taken back or exchanged.
2. Seller is not responsible for any loss or damage of goods in transit.
3. 100% Advance payment required.
4. Interest will be charged @ 20% p.a. if bill not paid within due date.
5. Damage and repair are not covered under warranty.`,
  });

  useEffect(() => {
    const targetId = id || cloneId;
    if (targetId) {
      setLoading(true);
      fetch(`/api/quotations/${targetId}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch");
          return res.json();
        })
        .then((quotation) => {
          if (quotation.data) {
            const loadedData = {
              ...quotation.data,
              type: "Quotation",
              fixedType: true,
              publicId: quotation.publicId, // Capture Public ID
            };

            if (cloneId) {
              // If cloning, reset specific fields to make it a "new" entry
              // We still want to generate a NEW number for the clone, not use the old one
              fetch("/api/quotations?limit=1")
                .then((res) => res.json())
                .then((latest) => {
                  let nextNum = 261;
                  if (latest && latest.length > 0) {
                    const lastNo = latest[0].quotationNo;
                    const parts = lastNo.split("/");
                    const lastNumStr = parts[parts.length - 1];
                    const parsedDetails = parseInt(lastNumStr);
                    if (!isNaN(parsedDetails)) {
                      nextNum = parsedDetails + 1;
                    }
                  }
                  loadedData.quotationNo = `QTN/${new Date().toLocaleString("en-US", { month: "short" }).toUpperCase()}/${new Date().getFullYear()}/${nextNum}`;
                  loadedData.date = new Date().toISOString().split("T")[0];
                  loadedData.validTill = new Date(
                    Date.now() + 7 * 24 * 60 * 60 * 1000,
                  )
                    .toISOString()
                    .split("T")[0];
                  delete loadedData.publicId; // Clone shouldn't have old publicId
                  setData(loadedData);
                })
                .catch((err) => {
                  console.error("Error fetching latest for clone:", err);
                  // Fallback
                  loadedData.quotationNo = `QTN/${new Date().toLocaleString("en-US", { month: "short" }).toUpperCase()}/${new Date().getFullYear()}/1`;
                  loadedData.date = new Date().toISOString().split("T")[0];
                  loadedData.validTill = new Date(
                    Date.now() + 7 * 24 * 60 * 60 * 1000,
                  )
                    .toISOString()
                    .split("T")[0];
                  delete loadedData.publicId;
                  setData(loadedData);
                });
            } else {
              setData(loadedData);
            }
          }
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    } else {
      // New Quotation: Load Defaults from workspace settings, then fetch latest ID
      setLoading(true);
      const companyProfile = workspace?.settings?.companyProfile || {};

      fetch("/api/quotations?limit=1")
        .then((res) => res.json())
        .then((latest) => {
          let nextNum = 1;
          if (latest && latest.length > 0) {
            const lastNo = latest[0].quotationNo;
            const parts = lastNo.split("/");
            const lastNumStr = parts[parts.length - 1];
            const parsedDetails = parseInt(lastNumStr);
            if (!isNaN(parsedDetails)) {
              nextNum = parsedDetails + 1;
            }
          }

          const prefix = (companyProfile.name || workspace?.name) ? (companyProfile.name || workspace?.name).substring(0, 3).toUpperCase() : "QTN";
          const newNo = `${prefix}/${new Date().toLocaleString("en-US", { month: "short" }).toUpperCase()}/${new Date().getFullYear()}/${nextNum}`;

          setData((prev) => ({
            ...prev,
            quotationNo: newNo,
            sender: {
              ...prev.sender,
              name: companyProfile.name || workspace?.name || prev.sender.name,
              address: companyProfile.address || prev.sender.address,
              phone: companyProfile.phone || prev.sender.phone,
              email: companyProfile.email || prev.sender.email,
              pan: companyProfile.pan || prev.sender.pan,
              logo: companyProfile.logo || prev.sender.logo,
              tagline: companyProfile.tagline || prev.sender.tagline,
              website: companyProfile.website || prev.sender.website,
            },
          }));
        })
        .catch((err) => {
          console.error("Error generating new number:", err);
          const prefix = (companyProfile.name || workspace?.name) ? (companyProfile.name || workspace?.name).substring(0, 3).toUpperCase() : "QTN";
          const newNo = `${prefix}/${new Date().toLocaleString("en-US", { month: "short" }).toUpperCase()}/${new Date().getFullYear()}/1`;
          setData((prev) => ({
            ...prev,
            quotationNo: newNo,
            sender: {
              ...prev.sender,
              name: companyProfile.name || workspace?.name || prev.sender.name,
              address: companyProfile.address || prev.sender.address,
              phone: companyProfile.phone || prev.sender.phone,
              email: companyProfile.email || prev.sender.email,
              pan: companyProfile.pan || prev.sender.pan,
              logo: companyProfile.logo || prev.sender.logo,
              tagline: companyProfile.tagline || prev.sender.tagline,
              website: companyProfile.website || prev.sender.website,
            },
          }));
        })
        .finally(() => setLoading(false));
    }
  }, [id, cloneId, workspace]);

  // Update document title for PDF filename
  useEffect(() => {
    if (data.subject || data.receiver.name || data.receiver.company) {
      const client = data.receiver.name || data.receiver.company || "Client";
      const subject = data.subject || "Quotation";
      document.title = `${subject}: ${client}`;
    } else {
      document.title = "New Quotation";
    }
  }, [data.subject, data.receiver.name, data.receiver.company]);

  const handleDeepChange = (section: string, field: string, value: unknown) => {
    if (section === "meta") {
      setData((prev) => ({ ...prev, [field]: value }));
    } else {
      setData((prev) => ({
        ...prev,
        [section]: {
          ...((prev as Record<string, unknown>)[section] as object),
          [field]: value,
        },
      }));
    }
  };

  const handleItemChange = (index: number, field: string, value: unknown) => {
    const newItems = [...data.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setData((prev) => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          description: "",
          make: "",
          qty: 1,
          price: 0,
          gst: 18,
          image: "",
          hsn: "",
        },
      ],
    }));
  };

  const removeItem = (index: number) => {
    setData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleReorderItems = (newItems: typeof data.items) => {
    setData((prev) => ({ ...prev, items: newItems }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const totalAmount = data.items.reduce((sum, item) => {
        const itemTotal = item.qty * item.price;
        const tax = itemTotal * (item.gst / 100);
        return sum + itemTotal + tax;
      }, 0);

      const payload = {
        quotationNo: data.quotationNo,
        clientName: data.receiver.name || data.receiver.company,
        totalAmount: Math.round(totalAmount),
        date: data.date,
        data: data,
        status: "Active",
      };

      let response;
      const baseUrl = `/api/quotations`;

      if (id) {
        response = await fetch(`${baseUrl}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(baseUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (response.ok) {
        router.push(listUrl || "/quotation"); // Redirect to quotation list
      } else {
        alert("Failed to save quotation");
      }
    } catch (error) {
      console.error("Error saving:", error);
      alert("Error saving quotation");
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    if (!data.publicId) {
      alert("Please save the quotation first to generate a shareable link.");
      return;
    }
    const client = data.receiver?.name || data.receiver?.company || "client";
    const slug = buildShareSlug(client, data.quotationNo, data.publicId);
    const shareUrl = `${window.location.origin}/quotation/${slug}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("Share link copied!\n\n" + shareUrl);
    } catch (err) {
      console.error("Failed to copy: ", err);
      alert("Failed to copy link. RiFileCopyLine manually:\n" + shareUrl);
    }
  };

  const [sidebarWidth, setSidebarWidth] = useState(600);
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = React.useCallback(
    (mouseDownEvent: React.MouseEvent) => {
      setIsResizing(true);
    },
    [],
  );

  const stopResizing = React.useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = React.useCallback(
    (mouseMoveEvent: MouseEvent) => {
      if (isResizing) {
        const newWidth = mouseMoveEvent.clientX;
        if (newWidth > 300 && newWidth < window.innerWidth - 400) {
          setSidebarWidth(newWidth);
        }
      }
    },
    [isResizing],
  );

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading Quotation...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col lg:flex-row lg:h-screen lg:overflow-hidden select-none print:min-h-0 print:h-auto print:overflow-visible print:block print:bg-white">
      <div className="fixed top-4 left-4 z-50 flex gap-2 print:hidden">
        <button
          onClick={() => router.push(listUrl || "/quotation")}
          className="p-2 bg-white text-slate-600 rounded-lg shadow-md border border-slate-200 hover:text-blue-600 hover:border-blue-400 transition-all flex items-center gap-2"
          title="Back to List"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span className="hidden md:inline font-medium text-sm">
            Back to List
          </span>
        </button>
      </div>

      <div
        className="w-full lg:h-full overflow-y-auto flex-shrink-0 relative bg-white border-r border-gray-200 z-10 print:hidden pt-16 lg:pt-0"
        style={{
          width:
            typeof window !== "undefined" && window.innerWidth >= 1024
              ? sidebarWidth
              : "100%",
        }}
      >
        <QuotationForm
          data={data}
          onChange={handleDeepChange}
          onAddItem={addItem}
          onRemoveItem={removeItem}
          onReorderItems={handleReorderItems}
          onItemChange={handleItemChange}
          onSave={handleSave}
          isSaving={isSaving}
          isEditMode={!!id}
          onShare={handleShare}
          onTemplateChange={(template) => setData((prev) => ({ ...prev, template }))}
        />
      </div>

      <div
        className="hidden lg:flex w-4 h-full cursor-col-resize hover:bg-blue-500/10 bg-gray-50 transition-colors z-50 items-center justify-center group flex-shrink-0 -ml-2"
        onMouseDown={startResizing}
      >
        <div className="w-1 h-12 bg-gray-300 group-hover:bg-blue-500 rounded-full transition-all"></div>
      </div>

      <div className="flex-1 h-full overflow-y-auto overflow-x-auto bg-gray-200 p-4 md:p-8 flex justify-center relative print:w-full print:h-auto print:overflow-visible print:p-0 print:m-0 print:bg-white print:block print:static pt-20 md:pt-8">
        <div className="transform scale-[0.45] sm:scale-[0.6] md:scale-[0.75] lg:scale-100 origin-top transition-transform duration-300 ease-out">
          <QuotationPreview data={{ ...data, layout: (workspace?.settings as Record<string, unknown> & { quotationLayout?: { sections: LayoutSection[] } } | null)?.quotationLayout?.sections }} />
        </div>
      </div>
    </main>
  );
}

export default function CreateQuotation({ listUrl }: { listUrl?: string }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <CreateQuotationContent listUrl={listUrl} />
    </Suspense>
  );
}
