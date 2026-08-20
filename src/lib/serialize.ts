import type { Prisma } from "@prisma/client";

/** Prisma Decimal -> plain number, for passing query results to Client Components. */
export function toNum(v: Prisma.Decimal | number | null | undefined): number {
  if (v === null || v === undefined) return 0;
  return typeof v === "number" ? v : v.toNumber();
}
