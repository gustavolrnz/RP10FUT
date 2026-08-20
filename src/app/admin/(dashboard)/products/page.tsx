import { listProducts, listCompetitions } from "@/lib/data/products";
import { ProductsClient } from "./products-client";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; competition?: string; stock?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const [{ rows, page, pageCount }, competitions] = await Promise.all([
    listProducts({
      search: sp.q,
      competitionId: sp.competition,
      stockFilter: (sp.stock as "all" | "low" | "out") || "all",
      page: sp.page ? Number(sp.page) : 1,
    }),
    listCompetitions(),
  ]);

  return (
    <ProductsClient
      rows={rows}
      page={page}
      pageCount={pageCount}
      competitions={competitions}
      filters={{ q: sp.q || "", competition: sp.competition || "all", stock: sp.stock || "all" }}
    />
  );
}
