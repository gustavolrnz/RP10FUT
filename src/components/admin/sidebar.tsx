"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/actions/auth";
import type { StaffRole } from "@/types/next-auth";

const ALL_NAV = [
  { href: "/admin", label: "Dashboard", generalAdminOnly: true },
  { href: "/admin/products", label: "Produtos", generalAdminOnly: false },
  { href: "/admin/orders", label: "Pedidos", generalAdminOnly: false },
  { href: "/admin/inventory", label: "Estoque", generalAdminOnly: false },
  { href: "/admin/coupons", label: "Cupons", generalAdminOnly: true },
  { href: "/admin/media", label: "Mídia", generalAdminOnly: true },
  { href: "/admin/settings", label: "Ajustes", generalAdminOnly: true },
  { href: "/admin/users", label: "Usuários", generalAdminOnly: true },
];

export function Sidebar({
  userName,
  role,
  logoUrl,
}: {
  userName: string;
  role: StaffRole;
  logoUrl: string;
}) {
  const pathname = usePathname();
  const isGeneralAdmin = role === "general_admin";
  const navItems = ALL_NAV.filter((n) => !n.generalAdminOnly || isGeneralAdmin);

  return (
    <aside className="flex w-[230px] flex-col border-r border-white/6 bg-admin-panel p-4 py-6">
      <div className="mb-5 flex items-center gap-2.5 border-b border-white/6 px-2 pb-7">
        <Image src={logoUrl} alt="RP10FUT" height={36} width={90} unoptimized className="h-9 w-auto" />
        <span className="text-[10.5px] font-bold tracking-wide text-admin-text3">ADMIN</span>
      </div>
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-md px-3.5 py-[11px] text-left text-[13px] font-semibold no-underline ${
                active ? "bg-[rgba(46,124,246,0.15)] text-admin-lightblue" : "text-admin-text2 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="flex-1" />
      <div className="border-t border-white/6 pt-4">
        <div className="text-[13px] font-semibold text-admin-text">{userName}</div>
        <div className="mb-3 mt-0.5 text-[11.5px] text-admin-text3">
          {isGeneralAdmin ? "Admin geral" : "Equipe operacional"}
        </div>
        <Link href="/" className="mb-2 block text-xs text-admin-text3 hover:text-admin-text no-underline">
          Ver site
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="w-full cursor-pointer rounded border border-white/12 bg-transparent py-[9px] text-xs font-semibold text-admin-text2 hover:border-white/30 hover:text-white"
          >
            Sair
          </button>
        </form>
      </div>
    </aside>
  );
}
