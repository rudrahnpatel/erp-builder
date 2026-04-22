import Link from "next/link";
import { notFound } from "next/navigation";
import { Database, LayoutTemplate, ArrowRight, Zap, ArrowUpRight } from "lucide-react";
import { db } from "@/lib/db";
import { getWorkspaceBySlug } from "@/lib/get-workspace";

/**
 * Home of a tenant's runtime ERP. Not the builder dashboard — this is what
 * end users (staff of the merchant) see when they open the app.
 */
export default async function TenantHome({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const workspace = await getWorkspaceBySlug(slug);
  if (!workspace) notFound();

  const [tables, pages] = await Promise.all([
    db.table.findMany({
      where: { workspaceId: workspace.id },
      include: { _count: { select: { records: true } } },
      orderBy: { createdAt: "asc" },
    }),
    db.page.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { order: "asc" },
    }),
  ]);

  return (
    <div className="relative min-h-[100dvh]">
      {/* Gradient mesh backdrop instead of heavy 3D Spline */}
      <div 
        className="absolute top-0 left-0 w-full h-[300px] -z-20 opacity-40 pointer-events-none gradient-mesh" 
        style={{ maskImage: "linear-gradient(to bottom, black 30%, transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, black 30%, transparent 100%)" }}
      />

      <div className="relative z-10 p-4 sm:p-6 lg:p-10 space-y-10 max-w-6xl mx-auto animate-fade-in-up">
        {/* Header Section */}
        <header className="mb-8 pt-6">
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg mb-4 text-[11px] font-semibold tracking-wide uppercase mono"
            style={{
              background: "color-mix(in oklch, var(--primary), transparent 88%)",
              color: "var(--primary)",
              border: "1px solid color-mix(in oklch, var(--primary), transparent 75%)",
            }}
          >
            <Zap className="h-3 w-3" /> Live Runtime
          </div>
          <h1
            className="text-3xl sm:text-4xl font-bold tracking-tight mb-2"
            style={{ color: "var(--foreground)" }}
          >
            {workspace.name}
          </h1>
          <p className="text-sm" style={{ color: "var(--foreground-muted)", maxWidth: "42ch", lineHeight: "1.6" }}>
            Your business operations cockpit. Access databases, execute workflows, and view custom dashboards.
          </p>
        </header>

        <section className="space-y-5">
          <div className="flex items-center gap-3 border-b pb-3" style={{ borderColor: "var(--border-subtle)" }}>
            <div
              className="p-2 rounded-lg"
              style={{
                background: "color-mix(in oklch, var(--primary), transparent 85%)",
                color: "var(--primary)",
              }}
            >
              <Database className="h-4.5 w-4.5" />
            </div>
            <h2
              className="text-sm font-semibold"
              style={{ color: "var(--foreground)" }}
            >
              Databases
            </h2>
            <span className="text-xs ml-auto" style={{ color: "var(--foreground-dimmed)" }}>
              {tables.length} {tables.length === 1 ? "table" : "tables"}
            </span>
          </div>
          
          {tables.length === 0 ? (
            <div
              className="p-8 text-center rounded-xl border-2 border-dashed text-sm"
              style={{ borderColor: "var(--border-subtle)", color: "var(--foreground-muted)", background: "var(--surface-1)" }}
            >
              No tables installed. Head to the builder to construct your schema.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
              {tables.map((table) => (
                <Link
                  key={table.id}
                  href={`/apps/${slug}/${table.id}`}
                  className="group p-5 rounded-xl transition-all duration-200 flex flex-col gap-4 relative overflow-hidden card-interactive"
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  {/* Subtle top accent */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[2px]"
                    style={{ background: "var(--primary)" }}
                  />
                  <div className="flex items-start justify-between relative z-10">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-9 w-9 rounded-lg flex items-center justify-center"
                        style={{
                          background: "color-mix(in oklch, var(--primary), transparent 85%)",
                          color: "var(--primary)",
                        }}
                      >
                        <Database className="h-4 w-4" />
                      </div>
                      <h3
                        className="font-semibold text-[15px]"
                        style={{ color: "var(--foreground)" }}
                      >
                        {table.name}
                      </h3>
                    </div>
                    <ArrowUpRight
                      className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0"
                      style={{ color: "var(--primary)" }}
                    />
                  </div>
                  <div className="relative z-10 flex items-center justify-between pt-3 border-t" style={{ borderColor: "var(--border-subtle)" }}>
                    <p
                      className="text-xs tracking-wide mono uppercase"
                      style={{ color: "var(--foreground-dimmed)" }}
                    >
                      Records
                    </p>
                    <p
                      className="text-lg font-bold tabular-nums"
                      style={{ color: "var(--primary)" }}
                    >
                      {table._count.records}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-5 pt-2">
          <div className="flex items-center gap-3 border-b pb-3" style={{ borderColor: "var(--border-subtle)" }}>
            <div
              className="p-2 rounded-lg"
              style={{
                background: "color-mix(in oklch, var(--accent-amber), transparent 85%)",
                color: "var(--accent-amber)",
              }}
            >
              <LayoutTemplate className="h-4.5 w-4.5" />
            </div>
            <h2
              className="text-sm font-semibold"
              style={{ color: "var(--foreground)" }}
            >
              Custom Pages
            </h2>
            <span className="text-xs ml-auto" style={{ color: "var(--foreground-dimmed)" }}>
              {pages.length} {pages.length === 1 ? "page" : "pages"}
            </span>
          </div>
          
          {pages.length === 0 ? (
            <div
              className="p-8 text-center rounded-xl border-2 border-dashed text-sm"
              style={{ borderColor: "var(--border-subtle)", color: "var(--foreground-muted)", background: "var(--surface-1)" }}
            >
              No custom dashboards built yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
              {pages.map((page) => (
                <Link
                  key={page.id}
                  href={`/apps/${slug}/pages/${page.id}`}
                  className="group p-5 rounded-xl transition-all duration-200 flex flex-col gap-4 relative overflow-hidden card-interactive"
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  {/* Subtle top accent */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[2px]"
                    style={{ background: "var(--accent-amber)" }}
                  />
                  <div className="flex items-start justify-between relative z-10">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-9 w-9 rounded-lg flex items-center justify-center"
                        style={{
                          background: "color-mix(in oklch, var(--accent-amber), transparent 85%)",
                          color: "var(--accent-amber)",
                        }}
                      >
                        <LayoutTemplate className="h-4 w-4" />
                      </div>
                      <h3
                        className="font-semibold text-[15px]"
                        style={{ color: "var(--foreground)" }}
                      >
                        {page.title}
                      </h3>
                    </div>
                    <ArrowUpRight
                      className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0"
                      style={{ color: "var(--accent-amber)" }}
                    />
                  </div>
                  <div className="relative z-10 pt-3 border-t" style={{ borderColor: "var(--border-subtle)" }}>
                    <span
                      className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded-md"
                      style={{
                        background: "var(--surface-3)",
                        color: "var(--foreground-dimmed)",
                      }}
                    >
                      Dashboard View
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
