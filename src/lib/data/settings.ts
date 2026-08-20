import "server-only";
import { prisma } from "@/lib/prisma";
import { toNum } from "@/lib/serialize";

export async function getSettings() {
  const s = await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, customizationFee: 25.0 },
  });
  return { customizationFee: toNum(s.customizationFee) };
}

export async function getAllMedia(): Promise<Record<string, string>> {
  const rows = await prisma.siteMedia.findMany();
  return Object.fromEntries(rows.map((r) => [r.key, r.url]));
}

export async function listStaff() {
  const staff = await prisma.staffUser.findMany({ orderBy: { createdAt: "asc" } });
  return staff.map((s) => ({ id: s.id, name: s.name, email: s.email, role: s.role }));
}
