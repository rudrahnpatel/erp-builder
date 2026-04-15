import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getWorkspace } from "@/lib/get-workspace";
import * as LucideIcons from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function ModuleLandingPage({ params }: { params: Promise<{ packId: string }> }) {
  const { packId } = await params;
  const workspace = await getWorkspace();
  if (!workspace) return notFound();

  const installedPack = await db.installedPack.findFirst({
    where: { workspaceId: workspace.id, packId },
  });

  if (!installedPack) return notFound();

  const pages = await db.page.findMany({
    where: { workspaceId: workspace.id, packSource: packId },
    orderBy: { order: "asc" },
  });

  // Capitalize packId for title
  const moduleName = packId.charAt(0).toUpperCase() + packId.slice(1);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 bg-background">
      {/* Header */}
      <div className="max-w-6xl mx-auto flex flex-col gap-2 border-b border-border/50 pb-6">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            {moduleName} Module
          </Badge>
          <span className="text-xs text-muted-foreground font-mono">v{installedPack.packVersion}</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground mt-2">
          {moduleName} Dashboard
        </h1>
        <p className="text-base text-muted-foreground max-w-2xl mt-1">
          Access all your {moduleName} applications, reports, and master data in one place.
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        <h2 className="text-lg font-bold text-foreground mb-4">Module Applications</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pages.map((page) => {
            // @ts-ignore dynamic icon
            const Icon = (page.icon && (LucideIcons as any)[
              page.icon.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join("")
            ]) || LucideIcons.LayoutTemplate;

            return (
              <Link 
                key={page.id} 
                href={`/pages/${page.id}`}
                className="group p-5 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md hover:border-primary/40 transition-all flex items-start gap-4"
              >
                <div className="p-2.5 rounded-xl bg-secondary/80 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {page.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    Open the {page.title.toLowerCase()} view.
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  );
}
