import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getWorkspace } from "@/lib/get-workspace";

export async function GET(request: Request) {
  try {
    const workspace = await getWorkspace();
    if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    if (!query) {
      const indices = await db.globalSearchIndex.findMany({
        where: { workspaceId: workspace.id },
        orderBy: { createdAt: "desc" },
        take: 100,
      });
      return NextResponse.json(indices);
    }

    // Dynamic Universal Search — all queries fire in parallel for speed
    const [pages, tables, modules, customIndices] = await Promise.all([
      // 1. Pages
      db.page.findMany({
        where: {
          workspaceId: workspace.id,
          title: { contains: query, mode: "insensitive" },
        },
        take: 10,
      }),

      // 2. Tables
      db.table.findMany({
        where: {
          workspaceId: workspace.id,
          name: { contains: query, mode: "insensitive" },
        },
        take: 10,
      }),

      // 3. Modules
      db.moduleDefinition.findMany({
        where: {
          workspaceId: workspace.id,
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 10,
      }),

      // 4. Custom Indices (Now includes indexed Records)
      db.globalSearchIndex.findMany({
        where: {
          workspaceId: workspace.id,
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { keywords: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 15,
      }),
    ]);

    // Map everything to a unified search result format
    const results = [
      ...pages.map(p => ({
        id: `page-${p.id}`,
        title: p.title,
        href: `/apps/${workspace.slug}/pages/${p.id}`, // Runtime path!
        icon: "FileText",
        keywords: ["page", "custom", p.title.toLowerCase()],
        category: "User Pages",
      })),
      ...tables.map(t => ({
        id: `table-${t.id}`,
        title: t.name,
        href: `/apps/${workspace.slug}/${t.id}`, // Runtime path!
        icon: "Database",
        keywords: ["table", "data", t.name.toLowerCase()],
        category: "User Tables",
      })),
      ...modules.map(m => ({
        id: `module-${m.id}`,
        title: m.name,
        href: `/modules/${m.packId}`,
        icon: "Package",
        keywords: ["module", "custom", m.name.toLowerCase()],
        category: "Marketplace Modules",
      })),
      ...customIndices.map(c => ({
        id: `custom-${c.id}`,
        title: c.title,
        href: c.url,
        icon: c.type === "record" ? "FilePlus" : "Search",
        keywords: (c.keywords || "").split(/[ ,]+/),
        category: c.category || "Custom Content",
      }))
    ];

    return NextResponse.json(results);
  } catch (error) {
    console.error("[SEARCH_INDEX_GET_ERROR]", error);
    return NextResponse.json({ error: "Database unavailable." }, { status: 503 });
  }
}
