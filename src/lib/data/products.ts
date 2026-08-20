import "server-only";
import { prisma } from "@/lib/prisma";
import { toNum } from "@/lib/serialize";
import { LOW_STOCK_THRESHOLD, PAGE_SIZE, SIZES } from "@/lib/constants";

export type ProductDTO = {
  id: string;
  slug: string;
  name: string;
  team: string;
  competitionId: string;
  competitionLabel: string;
  price: number;
  salePrice: number | null;
  imageAltText: string;
  images: string[];
  active: boolean;
  stock: Record<(typeof SIZES)[number], number>;
  totalStock: number;
  lowStock: boolean;
};

export function toDTO(
  p: {
    id: string;
    slug: string;
    name: string;
    team: string;
    competitionId: string;
    competition: { label: string };
    price: unknown;
    salePrice: unknown;
    imageAltText: string;
    images: string[];
    active: boolean;
    stockP: number;
    stockM: number;
    stockG: number;
    stockGG: number;
    stockXG: number;
  },
): ProductDTO {
  const stock = { P: p.stockP, M: p.stockM, G: p.stockG, GG: p.stockGG, XG: p.stockXG };
  const totalStock = SIZES.reduce((s, sz) => s + stock[sz], 0);
  const lowStock = SIZES.some((sz) => stock[sz] < LOW_STOCK_THRESHOLD);
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    team: p.team,
    competitionId: p.competitionId,
    competitionLabel: p.competition.label,
    price: toNum(p.price as never),
    salePrice: p.salePrice === null ? null : toNum(p.salePrice as never),
    imageAltText: p.imageAltText,
    images: p.images,
    active: p.active,
    stock,
    totalStock,
    lowStock,
  };
}

export async function listCompetitions() {
  return prisma.competition.findMany({ orderBy: { label: "asc" } });
}

export async function listProducts(params: {
  search?: string;
  competitionId?: string;
  stockFilter?: "all" | "low" | "out";
  page?: number;
}) {
  const search = (params.search || "").trim();
  const page = Math.max(1, params.page || 1);

  const where = {
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { team: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(params.competitionId && params.competitionId !== "all"
      ? { competitionId: params.competitionId }
      : {}),
  };

  const all = await prisma.product.findMany({
    where,
    include: { competition: true },
    orderBy: { createdAt: "desc" },
  });

  let dtos = all.map(toDTO);
  if (params.stockFilter === "low") dtos = dtos.filter((p) => p.lowStock && p.totalStock > 0);
  if (params.stockFilter === "out") dtos = dtos.filter((p) => p.totalStock === 0);

  const pageCount = Math.max(1, Math.ceil(dtos.length / PAGE_SIZE));
  const clampedPage = Math.min(page, pageCount);
  const rows = dtos.slice((clampedPage - 1) * PAGE_SIZE, clampedPage * PAGE_SIZE);

  return { rows, page: clampedPage, pageCount, total: dtos.length };
}

export async function getProduct(id: string): Promise<ProductDTO | null> {
  const p = await prisma.product.findUnique({ where: { id }, include: { competition: true } });
  return p ? toDTO(p) : null;
}

export async function listAllProductsForInventory(): Promise<ProductDTO[]> {
  const all = await prisma.product.findMany({ include: { competition: true }, orderBy: { name: "asc" } });
  return all.map(toDTO);
}
