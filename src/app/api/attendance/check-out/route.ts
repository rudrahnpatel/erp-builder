import { NextResponse } from "next/server";
import { db } from "@/lib/db";

function getISTDateMidnight() {
  const now = new Date();
  const istDateString = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
  const istDate = new Date(istDateString);
  return new Date(Date.UTC(istDate.getFullYear(), istDate.getMonth(), istDate.getDate()));
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, lat, lng } = body;

    if (!token) return NextResponse.json({ error: "Token is required" }, { status: 400 });

    const employeeToken = await (db as any).employeeToken.findUnique({
      where: { token }
    });

    if (!employeeToken) return NextResponse.json({ error: "Invalid token" }, { status: 404 });

    const todayDate = getISTDateMidnight();

    let record = await (db as any).attendanceRecord.findUnique({
      where: {
        employeeId_date: {
          employeeId: employeeToken.employeeId,
          date: todayDate,
        }
      }
    });

    if (!record || !record.checkInTime) {
      return NextResponse.json({ error: "No check-in found for today" }, { status: 400 });
    }

    if (record.checkOutTime) {
      return NextResponse.json({ error: "Already checked out today" }, { status: 400 });
    }

    const checkOutTime = new Date();
    // Calculate duration in minutes
    const diffMs = checkOutTime.getTime() - record.checkInTime.getTime();
    const durationMinutes = Math.floor(diffMs / 60000);

    record = await (db as any).attendanceRecord.update({
      where: { id: record.id },
      data: {
        checkOutTime,
        checkOutLat: lat,
        checkOutLng: lng,
        durationMinutes,
        status: "Completed"
      }
    });

    return NextResponse.json({ success: true, record });
  } catch (error) {
    console.error("[ATTENDANCE_CHECK_OUT_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
