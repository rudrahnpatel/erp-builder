import Link from "next/link";
import { notFound } from "next/navigation";
import { Database, LayoutTemplate, ArrowRight, Zap } from "lucide-react";
import { db } from "@/lib/db";
import { getWorkspaceBySlug } from "@/lib/get-workspace";
import { SplineScene } from "@/components/ui/SplineScene";

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
      
      {/* 3D Spline Backdrop - clean, architectural, not glowing */}
      <div 
        className="absolute top-0 left-0 w-full h-[350px] -z-20 opacity-25 pointer-events-none" 
        style={{ maskImage: "linear-gradient(to bottom, black 40%, transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, black 40%, transparent 100%)" }}
      >
        <SplineScene
          scene="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode"
          className="w-full h-full"
        />
      </div>

      <div className="relative z-10 p-4 sm:p-6 lg:p-10 space-y-10 max-w-6xl mx-auto animate-fade-in-up">
        {/* Header Section */}
        <header className="mb-8 pt-8">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md mb-4 text-[11px] font-medium tracking-wide uppercase mono" style={{ background: "var(--primary-subtle)", color: "var(--primary)", border: "1px solid color-mix(in srgb, var(--primary), transparent 85%)" }}>
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
            <div className="p-1.5 rounded-md" style={{ background: "var(--primary-subtle)", color: "var(--primary)" }}>
                <Database className="h-4 w-4" />
            </div>
            <h2
                className="text-sm font-semibold tracking-wide"
                style={{ color: "var(--foreground)" }}
            >
                Databases
            </h2>
          </div>
          
          {tables.length === 0 ? (
            <div
              className="p-8 text-center rounded-xl border border-dashed text-sm"
              style={{ borderColor: "var(--border-subtle)", color: "var(--foreground-muted)", background: "var(--surface-1)" }}
            >
              No tables installed. Head to the builder to construct your schema.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tables.map((table) => (
                <Link
                  key={table.id}
                  href={`/apps/${slug}/${table.id}`}
                  className="group p-5 rounded-xl transition-all duration-200 flex flex-col gap-4 relative overflow-hidden hover:border-[var(--primary)] hover:bg-[var(--surface-2)]"
                  style={{
                    background: "var(--surface-1)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <div className="flex items-start justify-between relative z-10">
                    <h3
                      className="font-medium text-base mb-1"
                      style={{ color: "var(--foreground)" }}
                    >
                      {table.name}
                    </h3>
                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0" style={{ color: "var(--primary)" }} />
                  </div>
                  <div className="relative z-10 flex items-center justify-between mt-1 pt-4 border-t" style={{ borderColor: "var(--border-subtle)" }}>
                    <p
                      className="text-xs tracking-wide mono uppercase"
                      style={{ color: "var(--foreground-dimmed)" }}
                    >
                      Records
                    </p>
                    <p
                      className="text-sm font-semibold"
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

        <section className="space-y-5 pt-4">
          <div className="flex items-center gap-3 border-b pb-3" style={{ borderColor: "var(--border-subtle)" }}>
            <div className="p-1.5 rounded-md" style={{ background: "var(--surface-3)", color: "var(--foreground)" }}>
                <LayoutTemplate className="h-4 w-4" />
            </div>
            <h2
                className="text-sm font-semibold tracking-wide"
                style={{ color: "var(--foreground)" }}
            >
                Custom Pages
            </h2>
          </div>
          
          {pages.length === 0 ? (
            <div
              className="p-8 text-center rounded-xl border border-dashed text-sm"
              style={{ borderColor: "var(--border-subtle)", color: "var(--foreground-muted)", background: "var(--surface-1)" }}
            >
              No custom dashboards built yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pages.map((page) => (
                <Link
                  key={page.id}
                  href={`/apps/${slug}/pages/${page.id}`}
                  className="group p-5 rounded-xl transition-all duration-200 flex flex-col gap-4 relative overflow-hidden hover:border-[var(--foreground-muted)] hover:bg-[var(--surface-2)]"
                  style={{
                    background: "var(--surface-1)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <div className="flex items-start justify-between relative z-10">
                    <h3
                      className="font-medium text-base mb-1"
                      style={{ color: "var(--foreground)" }}
                    >
                      {page.title}
                    </h3>
                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0" style={{ color: "var(--foreground-muted)" }} />
                  </div>
                  <div className="relative z-10 mt-1 pt-4 border-t" style={{ borderColor: "var(--border-subtle)" }}>
                    <p
                      className="text-[10px] tracking-wide mono uppercase"
                      style={{ color: "var(--foreground-dimmed)" }}
                    >
                      Dashboard View
                    </p>
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
