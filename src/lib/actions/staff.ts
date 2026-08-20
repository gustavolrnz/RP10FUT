"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/require-staff";

const staffSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome."),
  email: z.string().trim().email("Informe um e-mail válido.").transform((s) => s.toLowerCase()),
  password: z.string().min(6, "A senha provisória precisa ter ao menos 6 caracteres."),
  role: z.enum(["general_admin", "operational"]),
});

export type StaffInput = z.infer<typeof staffSchema>;

export async function addStaff(input: StaffInput) {
  await requireStaff("general_admin");
  const data = staffSchema.parse(input);
  const existing = await prisma.staffUser.findUnique({ where: { email: data.email } });
  if (existing) return { ok: false as const, error: "Já existe um membro com esse e-mail." };

  const passwordHash = await bcrypt.hash(data.password, 12);
  await prisma.staffUser.create({
    data: { name: data.name, email: data.email, passwordHash, role: data.role },
  });
  revalidatePath("/admin/users");
  return { ok: true as const };
}

export async function removeStaff(id: string) {
  const me = await requireStaff("general_admin");
  const target = await prisma.staffUser.findUniqueOrThrow({ where: { id } });
  if (target.email.toLowerCase() === me.email?.toLowerCase()) {
    return { ok: false as const, error: "Você não pode remover seu próprio acesso." };
  }
  await prisma.staffUser.delete({ where: { id } });
  revalidatePath("/admin/users");
  return { ok: true as const };
}
