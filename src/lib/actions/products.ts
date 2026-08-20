"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/require-staff";
import { SIZES } from "@/lib/constants";

const stockSchema = z.object({
  P: z.coerce.number().int().min(0),
  M: z.coerce.number().int().min(0),
  G: z.coerce.number().int().min(0),
  GG: z.coerce.number().int().min(0),
  XG: z.coerce.number().int().min(0),
});

const productSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do produto."),
  team: z.string().trim().min(1, "Informe o time."),
  competitionId: z.string().min(1),
  price: z.coerce.number().positive("Informe um preço válido."),
  salePrice: z.union([z.coerce.number().positive(), z.null()]),
  imageAltText: z.string().trim(),
  images: z.array(z.string()).default([]),
  active: z.boolean(),
  stock: stockSchema,
});

export type ProductInput = z.infer<typeof productSchema>;

function slugify(name: string) {
  return (
    name
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // strip diacritics (after NFD split)
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") +
    "-" +
    Math.floor(Math.random() * 9000 + 1000)
  );
}

export async function createProduct(input: ProductInput) {
  await requireStaff();
  const data = productSchema.parse(input);
  const product = await prisma.product.create({
    data: {
      slug: slugify(data.name),
      name: data.name,
      team: data.team,
      competitionId: data.competitionId,
      price: data.price,
      salePrice: data.salePrice,
      imageAltText: data.imageAltText || data.name,
      images: data.images,
      active: data.active,
      stockP: data.stock.P,
      stockM: data.stock.M,
      stockG: data.stock.G,
      stockGG: data.stock.GG,
      stockXG: data.stock.XG,
    },
  });
  revalidatePath("/admin/products");
  revalidatePath("/admin/inventory");
  revalidatePath("/admin");
  return { ok: true as const, id: product.id };
}

export async function updateProduct(id: string, input: ProductInput) {
  await requireStaff();
  const data = productSchema.parse(input);
  await prisma.product.update({
    where: { id },
    data: {
      name: data.name,
      team: data.team,
      competitionId: data.competitionId,
      price: data.price,
      salePrice: data.salePrice,
      imageAltText: data.imageAltText || data.name,
      images: data.images,
      active: data.active,
      stockP: data.stock.P,
      stockM: data.stock.M,
      stockG: data.stock.G,
      stockGG: data.stock.GG,
      stockXG: data.stock.XG,
    },
  });
  revalidatePath("/admin/products");
  revalidatePath("/admin/inventory");
  revalidatePath("/admin");
  return { ok: true as const };
}

export async function deleteProduct(id: string) {
  await requireStaff();
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/products");
  revalidatePath("/admin/inventory");
  return { ok: true as const };
}

export async function toggleProductActive(id: string) {
  await requireStaff();
  const p = await prisma.product.findUniqueOrThrow({ where: { id } });
  await prisma.product.update({ where: { id }, data: { active: !p.active } });
  revalidatePath("/admin/products");
  return { ok: true as const };
}

export async function adjustStock(id: string, size: (typeof SIZES)[number], value: number) {
  await requireStaff();
  const qty = Math.max(0, Math.floor(value) || 0);
  const field = ("stock" + size) as "stockP" | "stockM" | "stockG" | "stockGG" | "stockXG";
  await prisma.product.update({ where: { id }, data: { [field]: qty } });
  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
  return { ok: true as const };
}
