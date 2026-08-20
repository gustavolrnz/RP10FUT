import Image from "next/image";
import Link from "next/link";

const COMPETITIONS_PREVIEW = [
  { id: "brasileirao", label: "Brasileirão" },
  { id: "selecoes", label: "Seleções" },
  { id: "premier-league", label: "Premier League" },
  { id: "la-liga", label: "La Liga" },
];

export function Footer({ logoSrc }: { logoSrc: string }) {
  return (
    <footer className="border-t border-white/8 px-5 pb-8 pt-16 sm:px-12">
      <div className="mx-auto mb-12 grid max-w-[1440px] grid-cols-1 gap-10 sm:grid-cols-3">
        <div>
          <Image src={logoSrc} alt="RP10FUT" height={52} width={130} unoptimized className="mb-4 h-[52px] w-auto" />
          <p className="max-w-[280px] text-[13px] leading-relaxed text-[#9CA3AF]">
            Camisas personalizadas que contam sua história no futebol.
          </p>
        </div>
        <div>
          <div className="mb-4 text-xs font-bold tracking-[1px] text-white">COMPRAR</div>
          <div className="flex flex-col gap-2.5">
            {COMPETITIONS_PREVIEW.map((c) => (
              <Link key={c.id} href={`/catalog?competition=${c.id}`} className="text-[13px] text-[#9CA3AF] no-underline hover:text-white">
                {c.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-4 text-xs font-bold tracking-[1px] text-white">SUPORTE</div>
          <div className="flex flex-col gap-2.5">
            <Link href="/orders" className="text-[13px] text-[#9CA3AF] no-underline hover:text-white">
              Meus Pedidos
            </Link>
            <a href="https://wa.me/5511943950780" target="_blank" rel="noreferrer" className="text-[13px] text-[#9CA3AF] no-underline hover:text-white">
              WhatsApp
            </a>
            <Link href="/contact" className="text-[13px] text-[#9CA3AF] no-underline hover:text-white">
              Contato
            </Link>
          </div>
        </div>
      </div>
      <div className="mx-auto flex max-w-[1440px] items-center justify-between border-t border-white/8 pt-6 text-xs text-[#8a8f99]">
        <span>© 2026 RP10FUT. Todos os direitos reservados.</span>
        <Link href="/admin/login" className="text-[11px] text-[#3a3a3a] no-underline hover:text-[#8a8f99]">
          Acesso interno
        </Link>
      </div>
    </footer>
  );
}
