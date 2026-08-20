import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getToken } from "next-auth/jwt";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { StaffRole, SessionKind } from "@/types/next-auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  // Self-hosted behind a reverse proxy (no platform like Vercel to auto-detect
  // the host) -- trust the Host header the proxy forwards. If this app is
  // ever exposed directly to the internet without a proxy in front, remove
  // this and validate the host at the proxy/load-balancer layer instead.
  trustHost: true,
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    Credentials({
      id: "credentials",
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const email = String(credentials?.email || "").trim().toLowerCase();
        const password = String(credentials?.password || "");
        if (!email || !password) return null;

        const staff = await prisma.staffUser.findUnique({ where: { email } });
        if (!staff) return null;

        const valid = await bcrypt.compare(password, staff.passwordHash);
        if (!valid) return null;

        return {
          id: staff.id,
          name: staff.name,
          email: staff.email,
          role: staff.role,
          kind: "staff",
        };
      },
    }),
    Credentials({
      id: "customer",
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const email = String(credentials?.email || "").trim().toLowerCase();
        const password = String(credentials?.password || "");
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          kind: "customer",
        };
      },
    }),
    // UI-only Google/Apple simulation, matching the design prototype exactly:
    // no real OAuth handshake (no client id/secret configured), just
    // create-or-find the account by the e-mail the user typed into the
    // prompt. Real OAuth is a follow-up once Google/Apple app credentials
    // exist -- see the summary notes.
    Credentials({
      id: "social-simulated",
      credentials: { provider: {}, name: {}, email: {} },
      authorize: async (credentials) => {
        const email = String(credentials?.email || "").trim().toLowerCase();
        const provider = String(credentials?.provider || "");
        if (!email || !provider) return null;
        const name = String(credentials?.name || email.split("@")[0]);

        const user = await prisma.user.upsert({
          where: { email },
          update: {},
          create: { email, name, provider },
        });

        return { id: user.id, name: user.name, email: user.email, kind: "customer" };
      },
    }),
    // No credentials of its own -- reads the CURRENT session's email (still
    // in the request cookies at this point) and, if it matches a StaffUser,
    // issues a staff session without asking for a password again. Mirrors
    // the prototype's "logged-in customer whose e-mail is on staff auto
    // gets admin access" behavior, entirely server-side.
    Credentials({
      id: "staff-bypass",
      credentials: {},
      authorize: async (_credentials, request) => {
        const token = await getToken({ req: request as unknown as Request, secret: process.env.AUTH_SECRET });
        if (!token?.email) return null;

        const staff = await prisma.staffUser.findUnique({ where: { email: token.email as string } });
        if (!staff) return null;

        return {
          id: staff.id,
          name: staff.name,
          email: staff.email,
          role: staff.role,
          kind: "staff",
        };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        const u = user as { role?: StaffRole; kind: SessionKind };
        token.role = u.role;
        token.kind = u.kind;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.role = token.role as "general_admin" | "operational" | undefined;
        session.user.kind = token.kind as "staff" | "customer";
      }
      return session;
    },
  },
});
