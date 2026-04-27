"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, LogIn, LogOut, CheckCircle2 } from "lucide-react";

export default function AttendanceClient({ 
  token, 
  employeeName, 
  initialStatus,
  checkInTime: initialCheckInTime,
}: { 
  token: string, 
  employeeName: string, 
  initialStatus: "PENDING" | "WORKING" | "COMPLETED";
  checkInTime?: string | null;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [checkInTime, setCheckInTime] = useState<string | null>(initialCheckInTime ?? null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLocationAction = (actionType: "check-in" | "check-out") => {
    setLoading(true);
    setMessage(null);

    if (!navigator.geolocation) {
      setMessage("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`/api/attendance/${actionType}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, lat: latitude, lng: longitude }),
          });
          const data = await res.json();
          if (data.error) {
            setMessage(data.error);
          } else {
            if (actionType === "check-in") {
              setStatus("WORKING");
              setCheckInTime(new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour12: true }));
              setMessage("Checked in successfully! Don't forget to check out later.");
            } else {
              setStatus("COMPLETED");
              setMessage(null);
            }
          }
        } catch (error) {
          setMessage("Network error, please try again.");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setMessage("⚠️ Location permission denied. Please enable location and try again.");
        setLoading(false);
      },
      { timeout: 10000 }
    );
  };

  const statusConfig = {
    PENDING: { label: "Not Checked In", dot: "bg-muted-foreground" },
    WORKING: { label: "Currently Working", dot: "bg-success animate-pulse" },
    COMPLETED: { label: "Shift Complete", dot: "bg-info" },
  };

  const s = statusConfig[status];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 selection:bg-primary/20">
      <div className="max-w-md w-full bg-card rounded-[2rem] shadow-2xl overflow-hidden border border-border/50 transition-all duration-500 hover:shadow-primary/5">
        {/* Header */}
        <div className="bg-gradient-to-br from-surface-1 to-surface-2 px-8 py-8 text-center border-b border-border/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
          <div className="relative z-10">
            <div className="text-5xl font-mono font-bold text-foreground tracking-tighter tabular-nums drop-shadow-sm">
              {currentTime ? currentTime.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour12: true }) : "--:--:-- --"}
            </div>
            <div className="text-muted-foreground text-sm mt-2 font-medium uppercase tracking-widest opacity-80">
              {currentTime ? currentTime.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", weekday: "long", day: "numeric", month: "long" }) : ""}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-8 space-y-8">
          {/* Greeting */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Hello, {employeeName} 👋</h1>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 border border-border/50">
              <span className={`h-2 w-2 rounded-full ${s.dot}`} />
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{s.label}</span>
            </div>
          </div>

          {/* Check-in time while working */}
          {status === "WORKING" && checkInTime && (
            <div className="flex items-center gap-4 bg-success/10 border border-success/20 rounded-2xl px-5 py-4 animate-in fade-in slide-in-from-top-2 duration-500">
              <div className="h-10 w-10 rounded-xl bg-success/20 flex items-center justify-center shrink-0">
                <LogIn className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-[10px] text-success font-bold uppercase tracking-widest">Shift Started</p>
                <p className="text-lg font-bold text-foreground tabular-nums">{checkInTime}</p>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="space-y-4">
            {status === "PENDING" && (
              <Button
                size="lg"
                className="w-full h-20 text-lg font-bold rounded-2xl bg-success hover:bg-success/90 shadow-lg shadow-success/20 transition-all active:scale-[0.98] text-success-foreground gap-4 group"
                onClick={() => handleLocationAction("check-in")}
                disabled={loading}
              >
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <LogIn className="h-6 w-6 group-hover:translate-x-1 transition-transform" />}
                {loading ? "Verifying..." : "Clock In Now"}
              </Button>
            )}

            {status === "WORKING" && (
              <Button
                size="lg"
                className="w-full h-20 text-lg font-bold rounded-2xl bg-destructive hover:bg-destructive/90 shadow-lg shadow-destructive/20 transition-all active:scale-[0.98] text-destructive-foreground gap-4 group"
                onClick={() => handleLocationAction("check-out")}
                disabled={loading}
              >
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <LogOut className="h-6 w-6 group-hover:translate-x-1 transition-transform" />}
                {loading ? "Verifying..." : "Clock Out Now"}
              </Button>
            )}

            {status === "COMPLETED" && (
              <div className="flex flex-col items-center gap-4 py-6 bg-muted/20 rounded-3xl border border-dashed border-border animate-in zoom-in-95 duration-500">
                <div className="h-16 w-16 rounded-full bg-info/10 flex items-center justify-center">
                  <CheckCircle2 className="h-10 w-10 text-info" />
                </div>
                <div className="text-center">
                  <p className="text-foreground font-bold text-xl">Shift Complete!</p>
                  <p className="text-muted-foreground text-sm mt-1 max-w-[200px] mx-auto">Your attendance for today is recorded. Have a great evening!</p>
                </div>
              </div>
            )}
          </div>

          {/* Status message */}
          {message && (
            <div className={`text-sm font-medium rounded-2xl px-5 py-4 text-center animate-in fade-in slide-in-from-bottom-2 duration-300 ${
              message.includes("⚠️") || message.includes("error") || message.includes("denied") 
              ? "bg-destructive/10 text-destructive border border-destructive/20" 
              : "bg-primary/10 text-primary border border-primary/20"
            }`}>
              {message}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-muted/30 px-8 py-5 text-center border-t border-border/50">
          <div className="flex items-center justify-center gap-2 text-muted-foreground opacity-60">
            <MapPin className="h-3 w-3" />
            <p className="text-[10px] font-medium tracking-tight">Location verified via Secure GPS Tunnel</p>
          </div>
        </div>
      </div>
    </div>
  );
}
