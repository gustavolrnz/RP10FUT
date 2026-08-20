"use client";

import Image from "next/image";
import Link from "next/link";
import { useReveal, revealStyle } from "./reveal";

const TICKER = [
  "NOVO: SELEÇÃO BRASILEIRA 2026",
  "ALTA EM ALTA: PREMIER LEAGUE",
  "PAGAMENTO SEGURO",
  "QUALIDADE PREMIUM",
  "SUPORTE VIA WHATSAPP",
  "PERSONALIZE NOME E NÚMERO",
];

export function Ticker() {
  const { ref, revealed } = useReveal<HTMLDivElement>();
  const doubled = [...TICKER, ...TICKER];
  return (
    <section
      ref={ref}
      style={revealStyle(revealed)}
      className="overflow-hidden border-y border-white/8 bg-[#111111] py-4"
    >
      <div className="animate-marquee flex w-max">
        {doubled.map((t, i) => (
          <span key={i} className="whitespace-nowrap border-r border-white/12 px-7 text-[13px] font-semibold tracking-[0.5px] text-[#9CA3AF]">
            {t}
          </span>
        ))}
      </div>
    </section>
  );
}

export function CompetitionsGrid({ competitions }: { competitions: { id: string; label: string }[] }) {
  const { ref, revealed } = useReveal<HTMLDivElement>();
  return (
    <section ref={ref} className="mx-auto max-w-[1440px] px-5 pb-[130px] pt-[100px] sm:px-12">
      <div className="mb-14 flex items-baseline justify-between">
        <h2 className="font-anton text-[clamp(32px,4.2vw,52px)] tracking-wide text-white">NAVEGUE POR COMPETIÇÃO</h2>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {competitions.map((c, i) => (
          <Link
            key={c.id}
            href={`/catalog?competition=${c.id}`}
            style={revealStyle(revealed, i * 0.08)}
            className="stripe-placeholder-light group relative flex aspect-[4/5] items-end overflow-hidden no-underline transition-transform duration-[250ms] ease-out hover:scale-[1.035] hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent from-40% to-black/85" />
            <div className="relative flex w-full items-center justify-between p-5">
              <span className="font-anton text-[19px] tracking-wide text-white">{c.label}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2E7CF6" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

const TESTIMONIALS = [
  { quote: "A camisa chegou impecável, e o número personalizado ficou perfeito. Pareço um jogador de verdade.", name: "Rafael M.", team: "Flamengo", key: "testimonial1" },
  { quote: "Comprei para presentear meu pai. A qualidade do tecido surpreendeu todo mundo.", name: "Camila S.", team: "Seleção Brasileira", key: "testimonial2" },
  { quote: "Atendimento pelo WhatsApp resolveu tudo rápido. Já é a terceira camisa que compro.", name: "Bruno T.", team: "Real Madrid", key: "testimonial3" },
];

export function SocialProof({ media }: { media: Record<string, string> }) {
  const { ref, revealed } = useReveal<HTMLDivElement>();
  return (
    <section ref={ref} className="border-t border-white/8 bg-[#111111] px-5 py-[130px] sm:px-12">
      <div className="mx-auto max-w-[1440px]">
        <h2 className="font-anton mb-14 text-[clamp(32px,4.2vw,52px)] tracking-wide text-white">VESTIDO POR QUEM VIVE O JOGO</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {TESTIMONIALS.map((tm, i) => (
            <div key={tm.key} style={revealStyle(revealed, i * 0.12)} className="border border-white/8 bg-[#141414] p-7">
              <div className="stripe-placeholder mb-5 flex aspect-square w-full items-center justify-center overflow-hidden font-mono text-[10px] text-[#4a4a4a]">
                {media[tm.key] ? (
                  <Image src={media[tm.key]} alt={tm.name} width={300} height={300} unoptimized className="h-full w-full object-cover" />
                ) : (
                  "[ FOTO DO CLIENTE ]"
                )}
              </div>
              <p className="mb-4 text-[15px] leading-relaxed text-[#e5e5e5]">&ldquo;{tm.quote}&rdquo;</p>
              <div className="text-[13px] font-semibold tracking-[0.3px] text-[#9CA3AF]">
                {tm.name} · {tm.team}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalCta() {
  const { ref, revealed } = useReveal<HTMLDivElement>();
  return (
    <section ref={ref} style={revealStyle(revealed)} className="px-5 py-40 text-center sm:px-12">
      <h2 className="font-anton mb-10 text-[clamp(36px,5.2vw,68px)] tracking-wide text-white">
        PRONTO PARA VESTIR
        <br />
        SUA CAMISA?
      </h2>
      <div className="flex flex-wrap justify-center gap-4">
        <Link
          href="/catalog"
          className="inline-block rounded-[2px] bg-admin-blue px-10 py-[18px] text-sm font-bold tracking-[1.2px] text-white no-underline hover:bg-admin-blue-hover"
        >
          VER CATÁLOGO
        </Link>
        <a
          href="https://wa.me/5511943950780"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2.5 rounded-[2px] border border-[#22C55E] px-8 py-[18px] text-sm font-bold tracking-[1px] text-[#22C55E] no-underline hover:bg-[#22C55E]/12"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.79.47 3.48 1.32 4.94L2 22l5.28-1.39a9.9 9.9 0 0 0 4.76 1.21h.01c5.46 0 9.9-4.45 9.9-9.91S17.5 2 12.04 2zm0 18.14c-1.48 0-2.93-.4-4.19-1.15l-.3-.18-3.13.82.84-3.05-.2-.31a8.18 8.18 0 0 1-1.26-4.36c0-4.53 3.69-8.22 8.24-8.22 4.54 0 8.23 3.69 8.23 8.22 0 4.54-3.69 8.23-8.23 8.23z" />
          </svg>
          FALAR NO WHATSAPP
        </a>
      </div>
    </section>
  );
}
