import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getWorkspace } from "@/lib/get-workspace";

// GET /api/tables/[id]/records — list records with optional filter/sort/search
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const workspace = await getWorkspace();
  if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const table = await db.table.findFirst({
    where: { id, workspaceId: workspace.id },
    include: { fields: { orderBy: { order: "asc" } } },
  });
  if (!table) return NextResponse.json({ error: "Table not found" }, { status: 404 });

  const url = new URL(req.url);
  const search = url.searchParams.get("search");
  const sortField = url.searchParams.get("sortField");
  const sortDir = url.searchParams.get("sortDir") || "asc";
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "50");

  // Build base query
  let records = await db.record.findMany({
    where: { tableId: id },
    orderBy: { createdAt: "desc" },
  });

  // Client-side filtering on JSONB data (Prisma has limited JSONB query support)
  if (search) {
    const searchLower = search.toLowerCase();
    const textFields = table.fields
      .filter((f) => ["TEXT", "EMAIL", "PHONE"].includes(f.type))
      .map((f) => f.id);

    records = records.filter((r) => {
      const data = r.data as Record<string, unknown>;
      return textFields.some((fid) => {
        const val = data[fid];
        return typeof val === "string" && val.toLowerCase().includes(searchLower);
      });
    });
  }

  // Filter by field values: ?filter.FIELD_ID=value
  for (const [key, value] of url.searchParams.entries()) {
    if (key.startsWith("filter.")) {
      const fieldId = key.replace("filter.", "");
      records = records.filter((r) => {
        const data = r.data as Record<string, unknown>;
        return String(data[fieldId]) === value;
      });
    }
  }

  // Sort by field value
  if (sortField) {
    records.sort((a, b) => {
      const dataA = a.data as Record<string, unknown>;
      const dataB = b.data as Record<string, unknown>;
      const valA = dataA[sortField] ?? "";
      const valB = dataB[sortField] ?? "";
      const cmp = String(valA).localeCompare(String(valB), undefined, { numeric: true });
      return sortDir === "desc" ? -cmp : cmp;
    });
  }

  // Pagination
  const total = records.length;
  const paginated = records.slice((page - 1) * limit, page * limit);

  return NextResponse.json({
    records: paginated,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}

// POST /api/tables/[id]/records — create a record
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const workspace = await getWorkspace();
  if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const table = await db.table.findFirst({
    where: { id, workspaceId: workspace.id },
    include: { fields: true },
  });
  if (!table) return NextResponse.json({ error: "Table not found" }, { status: 404 });

  const { data } = await req.json();
  if (!data || typeof data !== "object") {
    return NextResponse.json({ error: "Record data is required" }, { status: 400 });
  }

  // Validate required fields
  const requiredFields = table.fields.filter((f) => f.required);
  for (const field of requiredFields) {
    if (data[field.id] === undefined || data[field.id] === null || data[field.id] === "") {
      return NextResponse.json(
        { error: `Field "${field.name}" is required` },
        { status: 400 }
      );
    }
  }

  const record = await db.record.create({
    data: { data, tableId: id },
  });

  return NextResponse.json(record, { status: 201 });
}
