"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/require-staff";

const couponSchema = z.object({
  code: z.string().trim().min(1, "Informe o código do cupom.").transform((s) => s.toUpperCase()),
  type: z.enum(["percentage", "fixed"]),
  value: z.coerce.number().positive("Informe um valor válido."),
  expiresAt: z.string().min(1, "Informe a data de expiração."),
  usageLimit: z.coerce.number().int().positive("Informe um limite de usos válido."),
});

export type CouponInput = z.infer<typeof couponSchema>;

export async function createCoupon(input: CouponInput) {
  await requireStaff("general_admin");
  const data = couponSchema.parse(input);
  const existing = await prisma.coupon.findUnique({ where: { code: data.code } });
  if (existing) return { ok: false as const, error: "Já existe um cupom com esse código." };
  await prisma.coupon.create({
    data: {
      code: data.code,
      type: data.type,
      value: data.value,
      expiresAt: new Date(data.expiresAt),
      usageLimit: data.usageLimit,
    },
  });
  revalidatePath("/admin/coupons");
  return { ok: true as const };
}

export async function updateCoupon(id: string, input: CouponInput) {
  await requireStaff("general_admin");
  const data = couponSchema.parse(input);
  await prisma.coupon.update({
    where: { id },
    data: {
      code: data.code,
      type: data.type,
      value: data.value,
      expiresAt: new Date(data.expiresAt),
      usageLimit: data.usageLimit,
    },
  });
  revalidatePath("/admin/coupons");
  return { ok: true as const };
}

export async function toggleCouponActive(id: string) {
  await requireStaff("general_admin");
  const c = await prisma.coupon.findUniqueOrThrow({ where: { id } });
  await prisma.coupon.update({ where: { id }, data: { active: !c.active } });
  revalidatePath("/admin/coupons");
  return { ok: true as const };
}
