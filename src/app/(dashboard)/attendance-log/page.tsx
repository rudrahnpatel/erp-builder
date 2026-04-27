import { Metadata } from "next";
import AttendanceLogClient from "./AttendanceLogClient";

export const metadata: Metadata = {
  title: "Attendance Log",
};

export default function AttendanceLogPage() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Attendance Log</h1>
        <p className="text-muted-foreground mt-2">
          Monitor employee check-ins, calculate duration, and export monthly reports.
        </p>
      </div>
      <AttendanceLogClient />
    </div>
  );
}
