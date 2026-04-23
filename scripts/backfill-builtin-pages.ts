import { PrismaClient } from "@prisma/client";
import { ensureBuiltinPages } from "../src/lib/default-pages";

const db = new PrismaClient();

async function main() {
  const workspaces = await db.workspace.findMany({ select: { id: true, slug: true, name: true } });
  console.log(`Found ${workspaces.length} workspaces`);
  for (const w of workspaces) {
    await db.$transaction(async (tx) => {
      await ensureBuiltinPages(tx, w.id);
    });
    console.log(`  - seeded: ${w.slug} (${w.name})`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
