import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getWorkspace } from "@/lib/get-workspace";

export async function POST(req: Request) {
  try {
    const workspace = await getWorkspace();
    if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { employeeId } = body;

    if (!employeeId) {
      return NextResponse.json({ error: "employeeId is required" }, { status: 400 });
    }

    // Verify employee exists in the workspace
    const employeeRecord = await db.record.findFirst({
      where: {
        id: employeeId,
        table: { workspaceId: workspace.id, name: "Employees" }
      }
    });

    if (!employeeRecord) {
      return NextResponse.json({ error: "Employee not found in workspace" }, { status: 404 });
    }

    // Use dynamic typing until Prisma Client regenerates
    let employeeToken = await (db as any).employeeToken.findUnique({
      where: { employeeId }
    });

    if (!employeeToken) {
      // Create new token
      // Generate random 16 character hex string as token
      const token = Array.from(crypto.getRandomValues(new Uint8Array(8)))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
        
      employeeToken = await (db as any).employeeToken.create({
        data: {
          employeeId,
          token
        }
      });
    }

    // Generate absolute URL based on the request origin
    const origin = new URL(req.url).origin;
    const checkInUrl = `${origin}/attendance/${employeeToken.token}`;

    return NextResponse.json({ checkInUrl, token: employeeToken.token });
  } catch (error) {
    console.error("[ATTENDANCE_TOKEN_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
