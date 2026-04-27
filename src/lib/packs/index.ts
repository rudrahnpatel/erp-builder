import { PackDefinition } from "@/types/pack";
import { inventoryPack, crmPack, hrPack, financePack } from "./registry";

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
};

export function getPackById(packId: string): PackDefinition | undefined {
  return packRegistry[packId];
}

export function getAllPacks(): PackDefinition[] {
  return Object.values(packRegistry);
}
