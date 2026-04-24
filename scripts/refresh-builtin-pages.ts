import { PrismaClient, Prisma } from "@prisma/client";
import {
  BUILTIN_PAGE_SOURCE,
  DEFAULT_WORKSPACE_PAGES,
} from "../src/lib/default-pages";

const db = new PrismaClient();

/**
 * Refresh the blocks of every built-in page on every workspace so they match the
 * latest DEFAULT_WORKSPACE_PAGES definition. Safe to re-run — only touches pages
 * tagged with packSource=builtin. Missing built-in pages are created.
 */
async function main() {
  const workspaces = await db.workspace.findMany({ select: { id: true, slug: true, name: true } });
  console.log(`Refreshing ${workspaces.length} workspace(s) …`);

  for (const w of workspaces) {
    const existing = await db.page.findMany({
      where: { workspaceId: w.id, packSource: BUILTIN_PAGE_SOURCE },
      select: { id: true, packPageKey: true, order: true },
    });
    const byKey = new Map(existing.map((p) => [p.packPageKey, p]));

    const last = await db.page.findFirst({
      where: { workspaceId: w.id },
      orderBy: { order: "desc" },
      select: { order: true },
    });
    let nextOrder = (last?.order ?? -1) + 1;

    for (const def of DEFAULT_WORKSPACE_PAGES) {
      const match = byKey.get(def.key);
      if (match) {
        await db.page.update({
          where: { id: match.id },
          data: {
            title: def.title,
            icon: def.icon,
            blocks: def.blocks,
          },
        });
      } else {
        await db.page.create({
          data: {
            title: def.title,
            icon: def.icon,
            blocks: def.blocks as Prisma.InputJsonValue,
            workspaceId: w.id,
            packSource: BUILTIN_PAGE_SOURCE,
            packPageKey: def.key,
            order: nextOrder++,
          },
        });
      }
    }
    console.log(`  ✓ ${w.slug} (${w.name})`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
