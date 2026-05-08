import { PackDefinition } from "@/types/pack";
import { inventoryPack, crmPack, hrPack, financePack, quotationPack } from "./registry";
import { db } from "@/lib/db";

// Central pack registry — add new packs here
export const packRegistry: Record<string, PackDefinition> = {
  [inventoryPack.id]: inventoryPack,
  // Finance pack is what the Razorpay plugin reconciles payments into.
  // Shipped in beta so payment-gateway flows have a real Invoices table to
  // attach to instead of dead-ending on the plugin configure page.
  [financePack.id]: financePack,
  // CRM and HR remain hidden behind "coming soon" until they get the same
  // schema-update treatment as Inventory.
  // [crmPack.id]: crmPack,
  [hrPack.id]: hrPack,
  [quotationPack.id]: quotationPack,
};

// ── Synchronous lookups (built-in packs only) ───────────────────────────

export function getPackById(packId: string): PackDefinition | undefined {
  return packRegistry[packId];
}

export function getAllPacks(): PackDefinition[] {
  return Object.values(packRegistry);
}

// ── Async lookups (built-in + DB-authored modules) ──────────────────────
// Used by install/update APIs so they can resolve both hardcoded packs AND
// developer-authored modules stored in the ModuleDefinition table.

/** Convert a ModuleDefinition DB row into a PackDefinition shape */
function moduleRowToPack(row: {
  packId: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  version: string;
  tables: unknown;
  pages: unknown;
}): PackDefinition {
  return {
    id: row.packId,
    name: row.name,
    description: row.description,
    icon: row.icon,
    category: row.category,
    badge: "Free",
    version: row.version,
    tables: (row.tables as any[]) || [],
    pageDefinitions: (row.pages as any[]) || [],
  };
}

/** Look up a pack by ID — checks built-in registry first, then DB */
export async function getPackByIdAsync(packId: string): Promise<PackDefinition | undefined> {
  // DB-authored module overrides built-in if published
  const row = await db.moduleDefinition.findUnique({ where: { packId } });
  if (row && row.published) return moduleRowToPack(row);

  // Fallback: built-in pack
  const builtin = packRegistry[packId];
  if (builtin) return builtin;
  
  return undefined;
}

/** Return all packs — built-in + published DB modules */
export async function getAllPacksAsync(): Promise<PackDefinition[]> {
  const builtins = Object.values(packRegistry);
  const dbModules = await db.moduleDefinition.findMany({
    where: { published: true },
  });
  
  const map = new Map<string, PackDefinition>();
  // 1. Add built-ins
  for (const b of builtins) map.set(b.id, b);
  // 2. Overwrite with published DB modules
  for (const m of dbModules) map.set(m.packId, moduleRowToPack(m));
  
  return Array.from(map.values());
}
