"use client";

import { useState } from "react";
import useSWR from "swr";
import { Download, MapPin, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AttendanceLogClient() {
  const [mounted, setMounted] = useState(false);
  const [employeeFilter, setEmployeeFilter] = useState("all");
  
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [mapModal, setMapModal] = useState<{ isOpen: boolean; lat?: number; lng?: number; type?: string } | null>(null);

  useEffect(() => {
    setMounted(true);
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    setStartDate(firstDay);
    setEndDate(lastDay);
  }, []);

  const { data, error, isLoading } = useSWR(
    `/api/attendance/records?startDate=${startDate}&endDate=${endDate}&employeeId=${employeeFilter}`,
    fetcher
  );

  const exportCSV = () => {
    if (!data?.records) return;
    const headers = ["Date", "Employee Name", "Status", "Check-in Time", "Check-out Time", "Duration (mins)", "Remark"];
    const rows = data.records.map((r: any) => [
      new Date(r.date).toLocaleDateString(),
      r.employeeName,
      r.status,
      r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString() : "-",
      r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString() : "-",
      r.durationMinutes || "0",
      r.remark || ""
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row: any) => row.map((cell: any) => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `attendance_export_${startDate}_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (error) return <div className="p-6 text-red-500">Failed to load attendance records</div>;

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div 
        className="flex flex-col sm:flex-row gap-4 items-end p-5 rounded-xl shadow-sm border"
        style={{ background: "var(--card)", borderColor: "var(--border-subtle)" }}
      >
        <div className="w-full sm:w-1/3">
          <label className="text-sm font-semibold mb-1.5 block" style={{ color: "var(--foreground-muted)" }}>Employee</label>
          <select 
            className="w-full rounded-lg h-10 px-3 border outline-none transition-colors"
            style={{ 
              background: "var(--surface-sunken)", 
              color: "var(--foreground)",
              borderColor: "var(--border)"
            }}
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
          >
            <option value="all">All Employees</option>
            {data?.employees?.map((emp: any) => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
        </div>
        <div className="w-full sm:w-1/3">
          <label className="text-sm font-semibold mb-1.5 block" style={{ color: "var(--foreground-muted)" }}>Start Date</label>
          <Input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)} 
            className="border-border"
            style={{ background: "var(--surface-sunken)", color: "var(--foreground)" }}
          />
        </div>
        <div className="w-full sm:w-1/3">
          <label className="text-sm font-semibold mb-1.5 block" style={{ color: "var(--foreground-muted)" }}>End Date</label>
          <Input 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)} 
            className="border-border"
            style={{ background: "var(--surface-sunken)", color: "var(--foreground)" }}
          />
        </div>
        <div>
          <Button onClick={exportCSV} className="h-10 px-6 font-semibold shadow-sm" variant="outline">
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Table */}
      <div 
        className="rounded-xl shadow-sm border overflow-hidden"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ background: "var(--surface-1)", borderColor: "var(--border)" }}>
                <th className="px-6 py-4 text-left font-bold text-[11px] uppercase tracking-wider" style={{ color: "var(--foreground-dimmed)" }}>Date</th>
                <th className="px-6 py-4 text-left font-bold text-[11px] uppercase tracking-wider" style={{ color: "var(--foreground-dimmed)" }}>Employee</th>
                <th className="px-6 py-4 text-left font-bold text-[11px] uppercase tracking-wider" style={{ color: "var(--foreground-dimmed)" }}>Status</th>
                <th className="px-6 py-4 text-left font-bold text-[11px] uppercase tracking-wider" style={{ color: "var(--foreground-dimmed)" }}>In Time</th>
                <th className="px-6 py-4 text-left font-bold text-[11px] uppercase tracking-wider" style={{ color: "var(--foreground-dimmed)" }}>Out Time</th>
                <th className="px-6 py-4 text-left font-bold text-[11px] uppercase tracking-wider" style={{ color: "var(--foreground-dimmed)" }}>Duration</th>
                <th className="px-6 py-4 text-left font-bold text-[11px] uppercase tracking-wider" style={{ color: "var(--foreground-dimmed)" }}>Location</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center" style={{ color: "var(--foreground-muted)" }}>
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-3" />
                    Loading records...
                  </td>
                </tr>
              ) : data?.records?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center" style={{ color: "var(--foreground-muted)" }}>
                    No attendance records found for this period.
                  </td>
                </tr>
              ) : (
                data?.records?.map((record: any) => (
                  <tr key={record.id} className="table-row-hover transition-colors">
                    <td className="px-6 py-4 font-semibold" style={{ color: "var(--foreground)" }} suppressHydrationWarning>{mounted ? new Date(record.date).toLocaleDateString() : "—"}</td>
                    <td className="px-6 py-4 font-semibold" style={{ color: "var(--foreground)" }}>{record.employeeName}</td>
                    <td className="px-6 py-4">
                      <Badge variant={record.status === "Working" ? "secondary" : record.status === "Completed" ? "default" : "destructive"}>
                        {record.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4" style={{ color: "var(--foreground-muted)" }} suppressHydrationWarning>{mounted && record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "—"}</td>
                    <td className="px-6 py-4" style={{ color: "var(--foreground-muted)" }} suppressHydrationWarning>{mounted && record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "—"}</td>
                    <td className="px-6 py-4 font-mono font-bold" style={{ color: "var(--foreground)" }}>{record.durationMinutes ? `${Math.floor(record.durationMinutes / 60)}h ${record.durationMinutes % 60}m` : "—"}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {record.checkInLat && (
                          <Button size="sm" variant="ghost" className="h-8 px-2.5 text-xs font-bold text-primary hover:bg-primary/10 rounded-md" onClick={() => setMapModal({ isOpen: true, lat: record.checkInLat, lng: record.checkInLng, type: "Check-in" })}>
                            <MapPin className="h-3.5 w-3.5 mr-1" /> In
                          </Button>
                        )}
                        {record.checkOutLat && (
                          <Button size="sm" variant="ghost" className="h-8 px-2.5 text-xs font-bold text-orange-500 hover:bg-orange-500/10 rounded-md" onClick={() => setMapModal({ isOpen: true, lat: record.checkOutLat, lng: record.checkOutLng, type: "Check-out" })}>
                            <MapPin className="h-3.5 w-3.5 mr-1" /> Out
                          </Button>
                        )}
                        {!record.checkInLat && !record.checkOutLat && <span className="opacity-30 pl-2">—</span>}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Map Modal */}
      {mapModal?.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div 
            className="rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "var(--border)" }}>
              <h3 className="font-bold text-lg" style={{ color: "var(--foreground)" }}>{mapModal.type} Location</h3>
              <Button variant="ghost" size="icon" onClick={() => setMapModal(null)} className="rounded-full h-8 w-8 hover:bg-white/10">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-0 h-[450px]" style={{ background: "var(--surface-sunken)" }}>
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                src={`https://maps.google.com/maps?q=${mapModal.lat},${mapModal.lng}&z=16&output=embed`}
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
