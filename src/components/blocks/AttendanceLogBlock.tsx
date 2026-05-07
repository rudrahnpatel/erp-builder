"use client";

import { useState } from "react";
import useSWR from "swr";
import { Download, MapPin, Loader2, X, Calendar as CalendarIcon, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function AttendanceLogBlock({ config }: { config?: any }) {
  const [mounted, setMounted] = useState(false);
  const [employeeFilter, setEmployeeFilter] = useState("all");
  
  // Initialize with empty strings to match server, then set in useEffect
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

  if (error) return <div className="p-6 text-destructive font-medium bg-destructive/10 rounded-xl border border-destructive/20">⚠️ Failed to load attendance records</div>;

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Filter Section - Integrated look, not a separate card if possible */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Users className="h-3 w-3" /> Employee
          </label>
          <select 
            className="w-full bg-surface-2 text-foreground rounded-xl h-11 px-4 border border-border/60 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer appearance-none shadow-sm"
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
            style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center' }}
          >
            <option value="all">All Employees</option>
            {data?.employees?.map((emp: any) => (
              <option key={emp.id} value={emp.id} className="bg-card text-foreground">{emp.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <CalendarIcon className="h-3 w-3" /> Start Date
          </label>
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-11 rounded-xl bg-surface-2 border-border/60 text-foreground focus:ring-primary/20" />
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <CalendarIcon className="h-3 w-3" /> End Date
          </label>
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-11 rounded-xl bg-surface-2 border-border/60 text-foreground focus:ring-primary/20" />
        </div>

        <div className="pb-0.5">
          <Button onClick={exportCSV} className="w-full h-11 rounded-xl font-bold gap-2 shadow-md hover:shadow-lg transition-all pressable bg-surface-1 text-foreground border border-border/60 hover:bg-surface-3" variant="outline">
            <Download className="h-4 w-4" /> Export Report
          </Button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-card rounded-2xl border border-border/40 shadow-xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm tabular-nums">
            <thead>
              <tr className="bg-muted/30 border-b border-border/40">
                <th className="px-6 py-5 text-left font-bold text-muted-foreground text-[10px] uppercase tracking-widest">Date</th>
                <th className="px-6 py-5 text-left font-bold text-muted-foreground text-[10px] uppercase tracking-widest">Employee</th>
                <th className="px-6 py-5 text-left font-bold text-muted-foreground text-[10px] uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-5 text-left font-bold text-muted-foreground text-[10px] uppercase tracking-widest">In Time</th>
                <th className="px-6 py-5 text-left font-bold text-muted-foreground text-[10px] uppercase tracking-widest">Out Time</th>
                <th className="px-6 py-5 text-left font-bold text-muted-foreground text-[10px] uppercase tracking-widest">Duration</th>
                <th className="px-6 py-5 text-right font-bold text-muted-foreground text-[10px] uppercase tracking-widest">GPS Log</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary opacity-50" />
                    <p className="text-muted-foreground font-medium animate-pulse">Syncing attendance records...</p>
                  </td>
                </tr>
              ) : data?.records?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center text-muted-foreground">
                    <div className="h-12 w-12 rounded-full bg-muted/20 flex items-center justify-center mx-auto mb-4">
                      <CalendarIcon className="h-6 w-6 opacity-40" />
                    </div>
                    <p className="font-medium">No records found</p>
                    <p className="text-xs opacity-60">Adjust your date filters or select another employee.</p>
                  </td>
                </tr>
              ) : (
                data?.records?.map((record: any) => (
                  <tr key={record.id} className="hover:bg-muted/10 transition-colors group">
                    <td className="px-6 py-4 font-semibold text-foreground" suppressHydrationWarning>{mounted ? new Date(record.date).toLocaleDateString("en-IN", { day: '2-digit', month: 'short' }) : "—"}</td>
                    <td className="px-6 py-4 font-medium text-foreground">{record.employeeName}</td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant={record.status === "Working" ? "secondary" : record.status === "Completed" ? "default" : "destructive"} className="rounded-md font-bold text-[10px] px-2 py-0.5 shadow-sm">
                        {record.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-foreground/80 font-medium" suppressHydrationWarning>{mounted && record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString("en-IN", {hour: '2-digit', minute:'2-digit', hour12: true}) : "—"}</td>
                    <td className="px-6 py-4 text-foreground/80 font-medium" suppressHydrationWarning>{mounted && record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString("en-IN", {hour: '2-digit', minute:'2-digit', hour12: true}) : "—"}</td>
                    <td className="px-6 py-4 font-bold text-foreground/70">{record.durationMinutes ? `${Math.floor(record.durationMinutes / 60)}h ${record.durationMinutes % 60}m` : "—"}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-1 justify-end">
                        {record.checkInLat && (
                          <Button size="sm" variant="ghost" className="h-8 px-2 text-[10px] font-bold text-primary hover:bg-primary/10 rounded-lg transition-all" onClick={() => setMapModal({ isOpen: true, lat: record.checkInLat, lng: record.checkInLng, type: "Check-in" })}>
                            <MapPin className="h-3 w-3 mr-1" /> IN
                          </Button>
                        )}
                        {record.checkOutLat && (
                          <Button size="sm" variant="ghost" className="h-8 px-2 text-[10px] font-bold text-warning hover:bg-warning/10 rounded-lg transition-all" onClick={() => setMapModal({ isOpen: true, lat: record.checkOutLat, lng: record.checkOutLng, type: "Check-out" })}>
                            <MapPin className="h-3 w-3 mr-1" /> OUT
                          </Button>
                        )}
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
        <div className="fixed inset-0 bg-background/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-card rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-300 border border-border/50">
            <div className="flex items-center justify-between px-8 py-5 border-b border-border/40 bg-surface-1">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                   <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground">{mapModal.type} Location</h3>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold opacity-60">Geolocation Verification</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setMapModal(null)} className="rounded-full h-10 w-10 hover:bg-muted text-muted-foreground transition-all active:scale-90">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-0 bg-muted/20 h-[500px] relative">
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                src={`https://maps.google.com/maps?q=${mapModal.lat},${mapModal.lng}&z=16&output=embed`}
                allowFullScreen
                className="dark:invert dark:hue-rotate-180 opacity-90"
              ></iframe>
              <div className="absolute bottom-4 right-4 bg-card/80 backdrop-blur px-3 py-1.5 rounded-lg border border-border/40 text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                {mapModal.lat.toFixed(6)}, {mapModal.lng.toFixed(6)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
