import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getWorkspace } from "@/lib/get-workspace";

export async function GET(req: Request) {
  try {
    const workspace = await getWorkspace();
    if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const employeeId = searchParams.get("employeeId");

    const filters: any = {};
    if (startDateParam && endDateParam) {
      filters.date = {
        gte: new Date(startDateParam),
        lte: new Date(endDateParam)
      };
    }
    if (employeeId && employeeId !== "all") {
      filters.employeeId = employeeId;
    }

    const attendanceRecords = await (db as any).attendanceRecord.findMany({
      where: filters,
      orderBy: { date: "desc" }
    });

    const employeesTable = await db.table.findFirst({
      where: { workspaceId: workspace.id, name: "Employees" },
      include: { fields: true }
    });

    const employeeRecords = employeesTable 
      ? await db.record.findMany({ where: { tableId: employeesTable.id } })
      : [];

    // Find the field ID that corresponds to "Employee Name"
    const nameField = employeesTable?.fields.find(f => 
      f.name.toLowerCase().replace(/\s/g, '') === "employeename" ||
      f.name.toLowerCase() === "name"
    );

    const getEmployeeNameFromRecord = (emp: any) => {
      const data = emp.data as any;
      // 1. Try by field ID from schema
      if (nameField && data[nameField.id]) return data[nameField.id];
      // 2. Try common keys in JSON
      const nameKey = Object.keys(data).find(k => 
        k.toLowerCase().replace(/\s/g, '') === "employeename" || 
        k.toLowerCase() === "name"
      );
      if (nameKey) return data[nameKey];
      // 3. Last resort fallbacks
      return data["Employee Name"] || data["name"] || "Unknown";
    };

    const employeeMap = new Map();
    employeeRecords.forEach(emp => {
      employeeMap.set(emp.id, getEmployeeNameFromRecord(emp));
    });

    const data = attendanceRecords.map((r: any) => ({
      ...r,
      employeeName: employeeMap.get(r.employeeId) || "Unknown",
    }));

    return NextResponse.json({ 
      records: data, 
      employees: employeeRecords.map(e => ({
        id: e.id,
        name: getEmployeeNameFromRecord(e)
      })) 
    });
  } catch (error) {
    console.error("[ATTENDANCE_RECORDS_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
