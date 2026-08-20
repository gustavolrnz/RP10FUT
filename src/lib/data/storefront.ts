import "server-only";
import { prisma } from "@/lib/prisma";
import { getProduct, listCompetitions, toDTO, type ProductDTO } from "@/lib/data/products";

export { listCompetitions };

/** Active products only, no pagination -- Catalog filters by competition/search client-side. */
export async function listAllActiveProducts(): Promise<ProductDTO[]> {
  const all = await prisma.product.findMany({
    where: { active: true },
    include: { competition: true },
    orderBy: { createdAt: "desc" },
  });
  return all.map(toDTO);
}

export async function getPublicProduct(id: string): Promise<ProductDTO | null> {
  const product = await getProduct(id);
  if (!product || !product.active) return null;
  return product;
}

export async function listRelatedProducts(product: ProductDTO, count = 4): Promise<ProductDTO[]> {
  const all = await listAllActiveProducts();
  return all.filter((p) => p.competitionId === product.competitionId && p.id !== product.id).slice(0, count);
}
