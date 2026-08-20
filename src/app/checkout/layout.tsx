import Image from "next/image";
import Link from "next/link";
import { getAllMedia } from "@/lib/data/settings";

// Reads live Postgres data (logo) -- don't let Next try to prerender this at
// build time. See (site)/layout.tsx for why.
export const dynamic = "force-dynamic";

export default async function CheckoutLayout({ children }: { children: React.ReactNode }) {
  const media = await getAllMedia();
  const logoSrc = media.logo || "/assets/rp10fut-logo.png";

  return (
    <div className="min-h-screen bg-[#0A0A0A] font-sans">
      <header className="border-b border-white/8 bg-[#0A0A0A]">
        <div className="mx-auto flex h-[84px] max-w-[1440px] items-center justify-between gap-3 px-5 sm:px-12">
          <Link href="/" className="flex items-center no-underline">
            <Image src={logoSrc} alt="RP10FUT" height={58} width={150} unoptimized className="h-[58px] w-auto" />
          </Link>
          <div className="whitespace-nowrap text-[11px] font-semibold tracking-[0.5px] text-[#9CA3AF]">COMPRA 100% SEGURA</div>
        </div>
      </header>
      {children}
    </div>
  );
}
