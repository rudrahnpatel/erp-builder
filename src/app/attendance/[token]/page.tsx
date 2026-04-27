import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import AttendanceClient from "./AttendanceClient";

function getISTDateMidnight() {
  const now = new Date();
  const istDateString = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
  const istDate = new Date(istDateString);
  return new Date(Date.UTC(istDate.getFullYear(), istDate.getMonth(), istDate.getDate()));
}

export default async function AttendancePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const employeeToken = await (db as any).employeeToken.findUnique({
    where: { token },
  });

  if (!employeeToken) {
    notFound();
  }

  // Get employee name
  const employeeRecord = await db.record.findUnique({
    where: { id: employeeToken.employeeId },
  });

  if (!employeeRecord) {
    notFound();
  }

  const empData = employeeRecord.data as any;
  const nameKey = Object.keys(empData).find(k => k.toLowerCase().replace(/\s/g, '') === "employeename");
  const employeeName = nameKey ? empData[nameKey] : (empData["Employee Name"] || empData["name"] || "Employee");

  // Check today's status
  const todayDate = getISTDateMidnight();
  const attendanceRecord = await (db as any).attendanceRecord.findUnique({
    where: {
      employeeId_date: {
        employeeId: employeeToken.employeeId,
        date: todayDate,
      },
    },
  });

  let status: "PENDING" | "WORKING" | "COMPLETED" = "PENDING";
  let checkInTime: string | null = null;
  if (attendanceRecord) {
    if (attendanceRecord.checkOutTime) {
      status = "COMPLETED";
    } else if (attendanceRecord.checkInTime) {
      status = "WORKING";
      checkInTime = new Date(attendanceRecord.checkInTime).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour12: true });
    }
  }

  return <AttendanceClient token={token} employeeName={employeeName} initialStatus={status} checkInTime={checkInTime} />;
}
