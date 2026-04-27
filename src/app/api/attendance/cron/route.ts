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
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET || 'secret'}`) {
       if (process.env.NODE_ENV === "production") {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
       }
    }

    const todayDate = getISTDateMidnight();
    const tokens = await (db as any).employeeToken.findMany();
    
    let absentCount = 0;

    for (const token of tokens) {
      const existingRecord = await (db as any).attendanceRecord.findUnique({
        where: {
          employeeId_date: {
            employeeId: token.employeeId,
            date: todayDate
          }
        }
      });

      if (!existingRecord) {
        await (db as any).attendanceRecord.create({
          data: {
            employeeId: token.employeeId,
            date: todayDate,
            status: "Absent"
          }
        });
        absentCount++;
      }
    }

    return NextResponse.json({ success: true, markedAbsent: absentCount });
  } catch (error) {
    console.error("[ATTENDANCE_CRON_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
