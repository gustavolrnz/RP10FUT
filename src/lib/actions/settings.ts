"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/require-staff";

const feeSchema = z.coerce.number().min(0, "Informe um valor válido.");

export async function updateCustomizationFee(value: number) {
  await requireStaff("general_admin");
  const fee = feeSchema.parse(value);
  await prisma.settings.upsert({
    where: { id: 1 },
    update: { customizationFee: fee },
    create: { id: 1, customizationFee: fee },
  });
  revalidatePath("/admin/settings");
  return { ok: true as const };
}
