import { auth } from "@/auth";
import { NextResponse } from "next/server";

const GENERAL_ADMIN_ONLY_PREFIXES = [
  "/admin/coupons",
  "/admin/media",
  "/admin/settings",
  "/admin/users",
];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  if (!req.auth || req.auth.user?.kind !== "staff") {
    const loginUrl = new URL("/admin/login", req.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }

  const role = req.auth.user?.role;
  const isGeneralAdminOnly =
    pathname === "/admin" || GENERAL_ADMIN_ONLY_PREFIXES.some((p) => pathname.startsWith(p));
  if (isGeneralAdminOnly && role !== "general_admin") {
    const productsUrl = new URL("/admin/products", req.nextUrl.origin);
    return NextResponse.redirect(productsUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
