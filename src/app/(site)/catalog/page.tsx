import { listAllActiveProducts } from "@/lib/data/storefront";
import { listCompetitions } from "@/lib/data/products";
import { CatalogClient } from "./catalog-client";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ competition?: string }>;
}) {
  const { competition } = await searchParams;
  const [products, competitions] = await Promise.all([listAllActiveProducts(), listCompetitions()]);

  return <CatalogClient products={products} competitions={competitions} initialCompetition={competition || "all"} />;
}
