import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getWorkspace } from "@/lib/get-workspace";
import { TableView } from "@/components/blocks/TableView";
import { KanbanView } from "@/components/blocks/KanbanView";
import { FilterBar } from "@/components/blocks/FilterBar";

export default async function DynamicPageRenderer({ params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params;
  const workspace = await getWorkspace();
  if (!workspace) return notFound();

  const page = await db.page.findUnique({
    where: { id: pageId, workspaceId: workspace.id },
  });

  if (!page) return notFound();

  const blocks = (page.blocks as any[]) || [];

  const workspaceTables = await db.table.findMany({
    where: { workspaceId: workspace.id },
    select: { id: true, packTableKey: true, name: true }
  });

  const resolveTableId = (ref?: string) => {
    if (!ref) return undefined;
    const tbl = workspaceTables.find(t => t.packTableKey === ref || t.name === ref);
    return tbl?.id;
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 bg-background">
      <div className="max-w-6xl mx-auto space-y-8">
        {blocks.map((block, i) => {
          if (block.type === "TEXT") {
            const level = block.config?.level || "h2";
            const content = block.config?.content || "";
            if (level === "h1") return <h1 key={i} className="text-3xl font-bold tracking-tight text-foreground">{content}</h1>;
            if (level === "h2") return <h2 key={i} className="text-2xl font-bold tracking-tight text-foreground">{content}</h2>;
            return <p key={i} className="text-base text-muted-foreground">{content}</p>;
          }

          if (block.type === "FILTER_BAR") {
            const tableId = resolveTableId(block.config?.tableRef);
            return <FilterBar key={i} config={block.config} tableId={tableId} />;
          }

          if (block.type === "TABLE_VIEW") {
            const tableId = resolveTableId(block.config?.tableRef);
            return <TableView key={i} config={block.config} tableId={tableId} />;
          }

          if (block.type === "KANBAN_VIEW") {
            const tableId = resolveTableId(block.config?.tableRef);
            return <KanbanView key={i} config={block.config} tableId={tableId} />;
          }

          return <div key={i} className="p-4 border border-dashed rounded-lg text-muted-foreground text-sm flex items-center justify-center bg-secondary/20">Unknown Block Type: {block.type}</div>;
        })}
      </div>
    </div>
  );
}
