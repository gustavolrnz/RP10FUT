import "server-only";
import { prisma } from "@/lib/prisma";
import { toNum } from "@/lib/serialize";

export type CouponDTO = {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  expiresAt: string;
  usageLimit: number;
  usedCount: number;
  active: boolean;
};

export async function listCoupons(): Promise<CouponDTO[]> {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return coupons.map((c) => ({
    id: c.id,
    code: c.code,
    type: c.type,
    value: toNum(c.value),
    expiresAt: c.expiresAt.toISOString().slice(0, 10),
    usageLimit: c.usageLimit,
    usedCount: c.usedCount,
    active: c.active,
  }));
}
