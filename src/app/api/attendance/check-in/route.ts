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

    // Check if record already exists for today
    let record = await (db as any).attendanceRecord.findUnique({
      where: {
        employeeId_date: {
          employeeId: employeeToken.employeeId,
          date: todayDate,
        }
      }
    });

    if (record) {
      if (record.checkInTime) {
        return NextResponse.json({ error: "Already checked in today" }, { status: 400 });
      } else {
        // Record exists (maybe created manually or via absent cron?), update it
        record = await (db as any).attendanceRecord.update({
          where: { id: record.id },
          data: {
            checkInTime: new Date(),
            checkInLat: lat,
            checkInLng: lng,
            status: "Working"
          }
        });
      }
    } else {
      // Create new check-in record
      record = await (db as any).attendanceRecord.create({
        data: {
          employeeId: employeeToken.employeeId,
          date: todayDate,
          checkInTime: new Date(), // Storing UTC, will display in IST on frontend
          checkInLat: lat,
          checkInLng: lng,
          status: "Working"
        }
      });
    }

    return NextResponse.json({ success: true, record });
  } catch (error) {
    console.error("[ATTENDANCE_CHECK_IN_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
