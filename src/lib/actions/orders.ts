"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/require-staff";
import { ORDER_STATUSES } from "@/lib/constants";
import { lookupOrdersByEmail } from "@/lib/data/orders";

const statusSchema = z.enum(ORDER_STATUSES);

/** Public lookup for the storefront's "My Orders" page -- no auth, matches the design's e-mail-only order tracking. */
export async function searchOrdersByEmail(email: string) {
  return lookupOrdersByEmail(email);
}

export async function updateOrderStatus(orderNumber: string, status: string) {
  await requireStaff();
  const parsed = statusSchema.parse(status);
  await prisma.order.update({ where: { orderNumber }, data: { status: parsed } });
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  return { ok: true as const };
}
