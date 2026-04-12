import { ReactNode } from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getWorkspaceBySlug } from "@/lib/get-workspace";
import { AppShell } from "@/components/app-runtime/AppShell";

/**
 * Runtime layout for a tenant's ERP.
 *
 * Resolves the workspace from the URL slug server-side, 404s if unknown, and
 * prefetches the table/page list for the nav so the first paint has everything
 * it needs without a client round-trip.
 */
export default async function TenantAppLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const workspace = await getWorkspaceBySlug(slug);
  if (!workspace) notFound();

  const [tables, pages] = await Promise.all([
    db.table.findMany({
      where: { workspaceId: workspace.id },
      select: { id: true, name: true },
      orderBy: { createdAt: "asc" },
    }),
    db.page.findMany({
      where: { workspaceId: workspace.id },
      select: { id: true, title: true },
      orderBy: { order: "asc" },
    }),
  ]);

  return (
    <AppShell
      workspace={{
        name: workspace.name,
        slug: workspace.slug,
        tables,
        pages,
      }}
    >
      {children}
    </AppShell>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const workspace = await getWorkspaceBySlug(slug);
  return {
    title: workspace ? workspace.name : "ERP",
  };
}
