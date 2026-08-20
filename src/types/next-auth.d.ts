import { DefaultSession } from "next-auth";

export type StaffRole = "general_admin" | "operational";
export type SessionKind = "staff" | "customer";

declare module "next-auth" {
  interface Session {
    user: {
      role?: StaffRole;
      kind: SessionKind;
    } & DefaultSession["user"];
  }

  interface User {
    role?: StaffRole;
    kind: SessionKind;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: StaffRole;
    kind: SessionKind;
  }
}
