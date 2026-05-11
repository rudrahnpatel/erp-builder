import { Button } from "@/components/ui/button";

export function TableViewActions({ tableRef, recordId }: { tableRef: string; recordId: string }) {
  const copyAttendanceLink = async (employeeId: string) => {
    try {
      const res = await fetch("/api/attendance/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId }),
      });
      const data = await res.json();
      if (data.checkInUrl) {
        await navigator.clipboard.writeText(data.checkInUrl);
        alert("Attendance link copied to clipboard!");
      } else {
        alert(data.error || "Failed to generate link");
      }
    } catch (e) {
      alert("Network error");
    }
  };

  if (tableRef === "Employees") {
    return (
      <Button
        variant="outline"
        size="sm"
        className="h-9 px-4 text-xs font-bold rounded-xl border-2 hover:bg-primary hover:text-white transition-all"
        style={{ borderColor: "var(--primary)", color: "var(--primary)" }}
        onClick={(e) => {
          e.stopPropagation();
          copyAttendanceLink(recordId);
        }}
      >
        Copy Link
      </Button>
    );
  }

  return null;
}
