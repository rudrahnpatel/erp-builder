'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import EstimatedPreview from '@/components/EstimatedPreview';
import { RiMenuLine, RiAddLine, RiDeleteBinLine, RiPrinterLine, RiSaveLine, RiToggleLine, RiToggleFill, RiShareLine, RiArrowLeftLine } from "react-icons/ri";
import { buildShareSlug } from '@/lib/shareSlug';
import { useReactToPrint } from 'react-to-print';
import { useWorkspace } from '@/hooks/use-workspace';

interface EstimateItem {
  description: string;
  make: string;
  sn: string;
  qty: number;
  rate: number;
  gst?: number;
}

interface FormData {
  id: string;
  billTo: string;
  billNo: string;
  billDate: string;
  paidAmount: number;
  items: EstimateItem[];
  paymentInstructions: string;
  terms: string;
  publicId?: string;
  showGst?: boolean;
  totalAmount?: number;
  sender?: { name?: string; address?: string; phone?: string; email?: string; pan?: string; logo?: string; tagline?: string; website?: string };
}

function CreateEstimateForm({ listUrl }: { listUrl?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');
  const { workspace } = useWorkspace();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showGst, setShowGst] = useState(false); // Default OFF
  const [saveStatus, setSaveStatus] = useState(''); // '', 'saving', 'saved'
  
  // Form State
  const [formData, setFormData] = useState<FormData>({
    id: '', // Initial empty, will be set on client or ignored if new
    billTo: '',
    billNo: `EST/${new Date().getFullYear()}/`,
    // Store as YYYY-MM-DD for input, format for display later
    billDate: '', // Initial empty to match server
    paidAmount: 0,
    items: [
      { description: '', make: '', sn: '', qty: 1, rate: 0 },
    ],
    paymentInstructions: '',
    terms: `1. Good once sold Will not be taken back or exchanged
2. Seller is not responsible for any loss or damaged of good in transit
3. 100% Advance payment
4. Interest will be charged @ 20% p.a. if bill not paid within due date
5. Damage And Repair Not Cover In Warranty`,
    sender: {}
  });

  // Initialize date on client and load company profile from workspace settings
  useEffect(() => {
    if (!formData.billDate && !editId) {
      const companyProfile = workspace?.settings?.companyProfile || {};
      const prefix = companyProfile.name ? companyProfile.name.substring(0, 3).toUpperCase() : 'EST';
      setFormData(prev => ({
        ...prev,
        id: Date.now().toString(),
        billDate: new Date().toISOString().slice(0, 10),
        billNo: `${prefix}/${new Date().getFullYear()}/`,
        sender: {
          ...prev.sender,
          name: companyProfile.name || '',
          address: companyProfile.address || '',
          phone: companyProfile.phone || '',
          email: companyProfile.email || '',
          pan: companyProfile.pan || '',
          logo: companyProfile.logo || '',
          tagline: companyProfile.tagline || '',
          website: companyProfile.website || '',
        },
      }));
    }
  }, [workspace]);

  // Load Data for RiEdit2Line
  // Load Data for RiEdit2Line
  useEffect(() => {
    if (editId) {
      fetchEstimate(editId);
    }
  }, [editId]);

  const fetchEstimate = async (id: string) => {
    try {
      const res = await fetch(`/api/estimates/${id}`);
      if (res.ok) {
        const data = await res.json();
        setFormData(data);
        setShowGst(data.showGst || false);
      } else {
        console.error('Failed to fetch estimate');
      }
    } catch (error) {
       console.error('Error fetching estimate:', error);
    }
  };

  // Handlers
  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...formData.items];
    (newItems[index] as unknown as Record<string, string | number>)[field] = value;
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', make: '', sn: '', qty: 1, rate: 0 }]
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  // Print Logic
  const componentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Estimated_${formData.billNo.replace(/\//g, '-')}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 0;
      }
      body {
        margin: 0;
        padding: 0;
      }
      /* Ensure text colors are printed correctly */
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    `,
  });

  const saveEstimate = async () => {
    try {
      setSaveStatus('saving');
      
      // Calculate totals for quick list view
      const subTotal = formData.items.reduce((acc, item) => acc + ((Number(item.qty) || 0) * (Number(item.rate) || 0)), 0);
      const gstTotal = formData.items.reduce((acc, item) => acc + ((Number(item.qty) || 0) * (Number(item.rate) || 0) * ((item.gst || 0) / 100)), 0);
      const total = showGst ? (subTotal + gstTotal) : subTotal;

      const payload = {
        ...formData,
        showGst, // Save toggle state
        totalAmount: total,
        updatedAt: new Date().toISOString()
      };

      let res;
      if (editId) {
          // Update existing
           res = await fetch(`/api/estimates/${editId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
           });
      } else {
          // Create new
          // Remove ID so DB generates it (or keep generic ID logic if prefer, but DB serial is better usually, 
          // but here we are using serial in DB but might have a string ID in state. 
          // Let's stick to the form state ID if we want, OR better let's let backend handle ID if possible.
          // However, the current state uses Date.now() string. 
          // Schema has Serial ID. So we should probably strip ID for new or let backend ignore it.
          // The API route currently returns the new object with DB ID.
           const { id, ...newPayload } = payload; // Remove client-side ID for new creation to let DB handle it
           res = await fetch('/api/estimates', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newPayload)
           });
      }

      if (res.ok) {
           setSaveStatus('saved');
           setTimeout(() => setSaveStatus(''), 2000);
           const result = await res.json();
           if (!editId) {
               // If created new, update ID using current pathname to keep user in module
               router.push(`${pathname}?id=${result.id}`);
           }
      } else {
          throw new Error('Failed to save');
      }

    } catch (err) {
      console.error("Save failed", err);
      alert("Failed to save estimate");
      setSaveStatus('');
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Mobile RiMenuLine Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-white rounded-lg shadow-md border border-slate-200 text-slate-600 hover:text-blue-600"
        >
          <RiMenuLine className="w-6 h-6" />
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 overflow-hidden flex flex-col h-screen">
        
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm shrink-0">
            <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push(listUrl || "/estimated")}
                  className="p-2 bg-slate-50 text-slate-600 rounded-lg border border-slate-200 hover:text-blue-600 hover:border-blue-400 transition-all flex items-center gap-2"
                  title="Back to List"
                >
                  <RiArrowLeftLine className="w-5 h-5" />
                  <span className="hidden md:inline font-medium text-sm">Back</span>
                </button>
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Estimated Generation</h1>
                    <p className="text-xs text-slate-500">Create EST documents</p>
                </div>
            </div>
            <div className="flex gap-4 items-center">
                {/* GST Toggle */}
                <div className="flex items-center gap-2 mr-4">
                  <span className={`text-sm font-medium ${showGst ? 'text-blue-700' : 'text-slate-500'}`}>GST</span>
                  <button onClick={() => setShowGst(!showGst)} className="focus:outline-none">
                    {showGst ? 
                      <RiToggleFill className="w-8 h-8 text-blue-600" /> : 
                      <RiToggleLine className="w-8 h-8 text-slate-300" />
                    }
                  </button>
                </div>

                <div className="flex gap-2">
                  <button 
                      onClick={saveEstimate} 
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20"
                  >
                      <RiSaveLine className="w-4 h-4" />
                      <span className="text-sm font-medium">{saveStatus === 'saved' ? 'Saved!' : 'Save'}</span>
                  </button>

                  <button 
                      onClick={() => {
                          if (!formData.publicId) {
                              alert('Please save the estimate first to generate a shareable link.');
                              return;
                          }
                          const slug = buildShareSlug(formData.billTo, formData.billNo, formData.publicId);
                          const shareUrl = `${window.location.origin}/estimate/${slug}`;
                          navigator.clipboard.writeText(shareUrl)
                              .then(() => alert('Share link copied!\n\n' + shareUrl))
                              .catch(() => alert('Failed to copy link. RiFileCopyLine manually:\n' + shareUrl));
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg shadow-green-900/20"
                  >
                      <RiShareLine className="w-4 h-4" />
                      <span className="text-sm font-medium hidden md:inline">Share</span>
                  </button>

                  <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors shadow-lg shadow-slate-900/20">
                      <RiPrinterLine className="w-4 h-4" />
                      <span className="text-sm font-medium">Print / PDF</span>
                  </button>
                </div>
            </div>
        </div>

        {/* Content Split: Form vs Preview */}
        <div className="flex flex-col xl:flex-row gap-6 h-full overflow-hidden">
            
            {/* LEFT: Form */}
            <div className="w-full xl:w-5/12 overflow-y-auto pr-2 pb-20 space-y-6">
                
                {/* Bill Details */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h2 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Bill Details</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-black mb-1">Bill To</label>
                            <textarea 
                                value={formData.billTo}
                                onChange={(e) => handleInputChange('billTo', e.target.value)}
                                className="w-full p-2 border border-slate-200 rounded-lg text-sm h-24 focus:ring-2 focus:ring-blue-500 focus:outline-none text-black placeholder:text-black"
                                placeholder="Client Name & Address..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-black mb-1">Bill No</label>
                                <input 
                                    type="text" 
                                    value={formData.billNo}
                                    onChange={(e) => handleInputChange('billNo', e.target.value)}
                                    className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-black"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-black mb-1">Bill Date</label>
                                <input 
                                    type="date" 
                                    value={formData.billDate}
                                    onChange={(e) => handleInputChange('billDate', e.target.value)}
                                    className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-black"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-semibold text-black mb-1">Paid Amount (₹)</label>
                                <input 
                                    type="number" 
                                    value={formData.paidAmount}
                                    onChange={(e) => handleInputChange('paidAmount', e.target.value)}
                                    className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-black"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Items */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Items</h2>
                        <button onClick={addItem} className="p-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors">
                            <RiAddLine className="w-4 h-4" />
                        </button>
                    </div>
                    
                    <div className="space-y-4">
                        {formData.items.map((item, index) => (
                            <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-100 relative group">
                                <button 
                                    onClick={() => removeItem(index)}
                                    className="absolute top-2 right-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <RiDeleteBinLine className="w-4 h-4" />
                                </button>

                                <div className="space-y-3">
                                    <input 
                                        type="text"
                                        placeholder="Description"
                                        value={item.description}
                                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                        className="w-full p-2 bg-white border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-500 text-black placeholder:text-gray-500"
                                    />
                                    <div className="grid grid-cols-2 gap-2">
                                        <input 
                                            type="text"
                                            placeholder="Make"
                                            value={item.make}
                                            onChange={(e) => handleItemChange(index, 'make', e.target.value)}
                                            className="w-full p-2 bg-white border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-500 text-black placeholder:text-gray-500"
                                        />
                                        <textarea 
                                            placeholder="SN.no (one per line)"
                                            value={item.sn}
                                            onChange={(e) => handleItemChange(index, 'sn', e.target.value)}
                                            className="w-full p-2 bg-white border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-500 h-10 min-h-[40px] text-black placeholder:text-gray-500"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="relative">
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-black font-semibold">Qty</span>
                                            <input 
                                                type="number"
                                                value={item.qty}
                                                onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                                                className="w-full pl-8 p-2 bg-white border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-500 text-black"
                                            />
                                        </div>
                                        <div className="relative">
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-black font-semibold">Rate</span>
                                            <input 
                                                type="number"
                                                value={item.rate}
                                                onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                                                className="w-full pl-10 p-2 bg-white border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-500 text-black"
                                            />
                                        </div>
                                    </div>
                                    {showGst && (
                                      <div className="relative">
                                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-black font-semibold">GST %</span>
                                          <input 
                                              type="number"
                                              value={item.gst || 0}
                                              onChange={(e) => handleItemChange(index, 'gst', e.target.value)}
                                              className="w-full pl-12 p-2 bg-white border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-500 text-black"
                                              placeholder="18"
                                          />
                                      </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Terms */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h2 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Terms & Payment</h2>
                    <div className="space-y-4">
                        <div>
                             <label className="block text-xs font-semibold text-black mb-1">Payment Instructions</label>
                             <textarea 
                                value={formData.paymentInstructions}
                                onChange={(e) => handleInputChange('paymentInstructions', e.target.value)}
                                className="w-full p-2 border border-slate-200 rounded-lg text-sm h-16 focus:ring-2 focus:ring-blue-500 focus:outline-none text-black"
                            />
                        </div>
                        <div>
                             <label className="block text-xs font-semibold text-black mb-1">Terms & Conditions</label>
                             <textarea 
                                value={formData.terms}
                                onChange={(e) => handleInputChange('terms', e.target.value)}
                                className="w-full p-2 border border-slate-200 rounded-lg text-sm h-32 focus:ring-2 focus:ring-blue-500 focus:outline-none text-black"
                            />
                        </div>
                    </div>
                </div>

            </div>

            {/* RIGHT: Preview */}
            <div className="w-full xl:w-7/12 bg-slate-200/50 rounded-xl overflow-y-auto mb-20 md:mb-0 flex justify-center p-8 border border-slate-200/60 shadow-inner">
                <div ref={componentRef} className="origin-top scale-[0.85] md:scale-100 transition-transform">
                    <EstimatedPreview data={formData} showGst={showGst} />
                </div>
            </div>

        </div>
      </main>
    </div>
  );
}

export default function EstimatedPage({ listUrl }: { listUrl?: string }) {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <CreateEstimateForm listUrl={listUrl} />
    </Suspense>
  );
}
