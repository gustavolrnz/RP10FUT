import { listAllProductsForInventory } from "@/lib/data/products";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";
import { InventoryClient } from "./inventory-client";

export default async function InventoryPage() {
  const products = await listAllProductsForInventory();
  return <InventoryClient products={products} threshold={LOW_STOCK_THRESHOLD} />;
}
