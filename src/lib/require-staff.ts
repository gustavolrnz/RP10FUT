import "server-only";
import { auth } from "@/auth";
import type { StaffRole } from "@/types/next-auth";

export class UnauthorizedError extends Error {
  constructor(message = "Não autorizado.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/** Every Server Action re-checks the session itself -- middleware only guards page navigation. */
export async function requireStaff(minRole?: StaffRole) {
  const session = await auth();
  if (!session?.user || session.user.kind !== "staff") throw new UnauthorizedError();
  if (minRole === "general_admin" && session.user.role !== "general_admin") {
    throw new UnauthorizedError("Apenas o admin geral pode fazer isso.");
  }
  return session.user;
}
