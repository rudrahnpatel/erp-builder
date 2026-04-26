import type { Prisma } from "@prisma/client";

// Marker used on built-in pages so we can detect + dedupe without relying on title
// (which the user can rename). Read `packSource = BUILTIN_PAGE_SOURCE` to find them.
export const BUILTIN_PAGE_SOURCE = "builtin";

export interface DefaultPageSeed {
  key: string; // stable identifier stored in packPageKey
  title: string;
  icon: string;
  blocks: Prisma.InputJsonValue;
}

export const DEFAULT_WORKSPACE_PAGES: DefaultPageSeed[] = [
  {
    key: "dashboard",
    title: "Dashboard",
    icon: "layout-dashboard",
    blocks: [
      {
        type: "TEXT",
        config: {
          content: "Dashboard",
          level: "h1",
          description:
            "Overview of your app. Drop in charts and table views from the composer to bring this space to life.",
        },
      },
    ],
  },
  {
    key: "settings",
    title: "Settings",
    icon: "settings",
    blocks: [],
  },
];

/**
 * Seed any missing built-in pages into a workspace. Safe to call repeatedly —
 * only creates pages whose `packPageKey` isn't already present for this workspace.
 * New pages are appended after the current max page order.
 */
export async function ensureBuiltinPages(
  tx: Prisma.TransactionClient,
  workspaceId: string
): Promise<void> {
  const existing = await tx.page.findMany({
    where: { workspaceId, packSource: BUILTIN_PAGE_SOURCE },
    select: { packPageKey: true },
  });
  const haveKeys = new Set(existing.map((p) => p.packPageKey));
  const missing = DEFAULT_WORKSPACE_PAGES.filter((p) => !haveKeys.has(p.key));
  if (missing.length === 0) return;

  const last = await tx.page.findFirst({
    where: { workspaceId },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  let nextOrder = (last?.order ?? -1) + 1;

  for (const page of missing) {
    await tx.page.create({
      data: {
        title: page.title,
        icon: page.icon,
        blocks: page.blocks,
        workspaceId,
        packSource: BUILTIN_PAGE_SOURCE,
        packPageKey: page.key,
        order: nextOrder++,
      },
    });
  }
}
