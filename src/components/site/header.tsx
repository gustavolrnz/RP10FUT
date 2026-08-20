"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/lib/cart/cart-context";
import { cartCount } from "@/lib/cart/types";

const NAV = [
  { href: "/", label: "INÍCIO" },
  { href: "/catalog", label: "CATÁLOGO" },
  { href: "/contact", label: "CONTATO" },
  { href: "/orders", label: "MEUS PEDIDOS" },
];

const SearchIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const AccountIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const CartIcon = () => (
  <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

function iconsForPath(pathname: string): "full" | "shop" | "none" {
  if (pathname === "/") return "full";
  if (pathname.startsWith("/catalog") || pathname.startsWith("/product")) return "shop";
  return "none";
}

export function Header({ logoSrc }: { logoSrc: string }) {
  const pathname = usePathname();
  const { items, openDrawer } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const count = cartCount(items);
  const icons = iconsForPath(pathname);

  return (
    <header className="sticky top-0 z-[100] border-b border-white/8 bg-[#0A0A0A]">
      <div className="mx-auto flex h-[84px] max-w-[1440px] items-center justify-between px-5 sm:px-12">
        <Link href="/" className="flex items-center no-underline">
          <Image src={logoSrc} alt="RP10FUT" height={58} width={150} unoptimized className="h-[58px] w-auto" />
        </Link>

        <nav className="hidden items-center gap-6 sm:flex lg:gap-10">
          {NAV.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-[13px] font-semibold tracking-[1px] no-underline ${
                  active ? "text-white" : "text-[#9CA3AF] hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-6">
          {icons !== "none" && (
            <>
              {icons === "full" && (
                <Link href="/catalog" aria-label="Buscar" className="hidden text-[#9CA3AF] no-underline hover:text-white sm:flex">
                  <SearchIcon />
                </Link>
              )}
              <Link href="/account" aria-label="Minha conta" className="hidden text-[#9CA3AF] no-underline hover:text-white sm:flex">
                <AccountIcon />
              </Link>
              <button
                onClick={openDrawer}
                aria-label="Carrinho"
                className="relative flex cursor-pointer border-none bg-transparent p-0 text-white"
              >
                <CartIcon />
                {count > 0 && (
                  <span className="absolute -right-[9px] -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-admin-blue text-[10px] font-bold text-white">
                    {count}
                  </span>
                )}
              </button>
            </>
          )}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Abrir menu"
            className="flex cursor-pointer border-none bg-transparent p-0 text-white sm:hidden"
          >
            <MenuIcon />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="flex flex-col border-t border-white/8 px-6 pb-5 pt-2 sm:hidden">
          {NAV.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`py-3 text-sm font-semibold no-underline ${active ? "text-white" : "text-[#9CA3AF]"}`}
              >
                {item.label}
              </Link>
            );
          })}
          {icons !== "none" && (
            <Link href="/account" onClick={() => setMobileOpen(false)} className="py-3 text-sm font-semibold text-[#9CA3AF] no-underline">
              MINHA CONTA
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
