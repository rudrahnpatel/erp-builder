import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getWorkspace } from "@/lib/get-workspace";
import { Prisma } from "@prisma/client";

// GET /api/tables/[id]/records : list records with optional filter/sort/search
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
  const sortDir = url.searchParams.get("sortDir") === "desc" ? "DESC" : "ASC";
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = parseInt(url.searchParams.get("limit") || "50", 10);
  const skip = (page - 1) * limit;

  const filters: Record<string, string> = {};
  for (const [key, value] of url.searchParams.entries()) {
    if (key.startsWith("filter.")) {
      filters[key.replace("filter.", "")] = value;
    }
  }

  try {
    const whereConditions: Prisma.Sql[] = [Prisma.sql`"tableId" = ${id}`];

    if (search) {
      const textFields = table.fields
        .filter((f) => ["TEXT", "EMAIL", "PHONE"].includes(f.type))
        .map((f) => f.id);
        
      if (textFields.length > 0) {
        const searchPattern = `%${search}%`;
        const searchConditions = textFields.map(
          (fid) => Prisma.sql`"data"->>${fid} ILIKE ${searchPattern}`
        );
        whereConditions.push(Prisma.sql`(${Prisma.join(searchConditions, ' OR ')})`);
      } else {
        whereConditions.push(Prisma.sql`FALSE`);
      }
    }

    for (const [key, value] of Object.entries(filters)) {
      whereConditions.push(Prisma.sql`"data"->>${key} = ${value}`);
    }

    const whereClause = Prisma.sql`WHERE ${Prisma.join(whereConditions, ' AND ')}`;
    
    let orderByClause = Prisma.sql`ORDER BY "createdAt" DESC`;
    if (sortField) {
      if (sortDir === "DESC") {
        orderByClause = Prisma.sql`ORDER BY "data"->>${sortField} DESC NULLS LAST`;
      } else {
        orderByClause = Prisma.sql`ORDER BY "data"->>${sortField} ASC NULLS LAST`;
      }
    }

    const records = await db.$queryRaw<any[]>`
      SELECT id, "tableId", data, "createdAt", "updatedAt"
      FROM "Record"
      ${whereClause}
      ${orderByClause}
      LIMIT ${limit} OFFSET ${skip}
    `;

    const countRes = await db.$queryRaw<{count: bigint}[]>`
      SELECT COUNT(*) as count
      FROM "Record"
      ${whereClause}
    `;
    const total = Number(countRes[0]?.count || 0);

    return NextResponse.json({
      records,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("[RECORDS_GET_ERROR]", error);
    return NextResponse.json({ error: "Failed to fetch records" }, { status: 500 });
  }
}

// POST /api/tables/[id]/records : create a record
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

  // Update GlobalSearchIndex
  const stringValues = Object.values(data as object).filter(v => typeof v === "string" && v.length > 0);
  const displayTitle = stringValues.length > 0 ? String(stringValues[0]) : "Record";
  const keywords = stringValues.join(" ").substring(0, 1000);

  try {
    await db.globalSearchIndex.create({
      data: {
        title: `${displayTitle} (${table.name})`,
        type: "record",
        url: `/apps/${workspace.slug}/${id}#record-${record.id}`,
        keywords,
        category: "Data Records",
        workspaceId: workspace.id,
      }
    });
  } catch (err) {
    console.error("Failed to create search index for record", err);
  }

  return NextResponse.json(record, { status: 201 });
}
