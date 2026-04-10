import { PackDefinition } from "@/types/pack";
import { inventoryPack, crmPack, hrPack, financePack } from "./registry";

// Central pack registry — add new packs here
export const packRegistry: Record<string, PackDefinition> = {
  [inventoryPack.id]: inventoryPack,
  [crmPack.id]: crmPack,
  [hrPack.id]: hrPack,
  [financePack.id]: financePack,
};

export function getPackById(packId: string): PackDefinition | undefined {
  return packRegistry[packId];
}

export function getAllPacks(): PackDefinition[] {
  return Object.values(packRegistry);
}
