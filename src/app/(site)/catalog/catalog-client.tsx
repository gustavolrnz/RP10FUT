"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { ProductDTO } from "@/lib/data/products";
import { fmtBRL } from "@/lib/constants";

export function CatalogClient({
  products,
  competitions,
  initialCompetition,
}: {
  products: ProductDTO[];
  competitions: { id: string; label: string }[];
  initialCompetition: string;
}) {
  const [activeCompetition, setActiveCompetition] = useState(
    competitions.some((c) => c.id === initialCompetition) ? initialCompetition : "all",
  );
  const [search, setSearch] = useState("");

  const q = search.trim().toLowerCase();
  const filtered = products.filter((p) => {
    const matchComp = activeCompetition === "all" || p.competitionId === activeCompetition;
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.team.toLowerCase().includes(q);
    return matchComp && matchSearch;
  });

  return (
    <>
      <div className="border-b border-admin-blue/30 bg-[#141b2e] px-5 py-2.5 text-center sm:px-12">
        <span className="text-[12.5px] font-semibold text-white">
          FRETE GRÁTIS A PARTIR DE R$ 299 &nbsp;·&nbsp; USE O CUPOM <span className="text-admin-blue">RP10</span> E GANHE 10% OFF NO
          CHECKOUT
        </span>
      </div>

      <section className="mx-auto max-w-[1440px] px-5 pb-6 pt-14 sm:px-12">
        <h1 className="font-anton mb-8 text-[clamp(34px,5vw,56px)] tracking-wide text-white">CATÁLOGO</h1>

        <div className="mb-9 flex flex-wrap items-center justify-between gap-6">
          <div className="flex flex-wrap gap-2">
            {[{ id: "all", label: "Todos" }, ...competitions].map((tab) => {
              const active = tab.id === activeCompetition;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveCompetition(tab.id)}
                  className={`cursor-pointer rounded-[2px] px-[18px] py-[9px] text-[12.5px] font-semibold tracking-[0.3px] ${
                    active ? "border border-admin-blue bg-admin-blue text-white font-bold" : "border border-white/15 bg-transparent text-[#9CA3AF]"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
          <div className="relative min-w-[260px]">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8a8f99" strokeWidth="2" className="absolute left-3.5 top-1/2 -translate-y-1/2">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar time ou nome..."
              className="w-full box-border rounded-[2px] border border-white/12 bg-[#141414] py-3 pl-[38px] pr-3.5 text-[13px] text-white outline-none"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 pb-24 sm:px-12">
        {filtered.length === 0 ? (
          <div className="py-20 text-center text-[15px] text-[#9CA3AF]">Nenhum produto encontrado para essa busca.</div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
            {filtered.map((p) => (
              <Link key={p.id} href={`/product/${p.id}`} className="block no-underline">
                <div className="stripe-placeholder relative mb-3.5 flex aspect-[4/5] items-center justify-center overflow-hidden">
                  {p.images.length > 0 ? (
                    <Image src={p.images[0]} alt={p.name} width={400} height={500} unoptimized className="h-full w-full object-cover" />
                  ) : (
                    <span className="px-5 text-center font-mono text-[10px] text-[#4a4a4a]">{p.imageAltText}</span>
                  )}
                  {p.salePrice && (
                    <span className="absolute left-3 top-3 bg-admin-blue px-2.5 py-[5px] text-[11px] font-bold tracking-[0.3px] text-white">
                      OFERTA
                    </span>
                  )}
                </div>
                <div className="mb-1.5 text-[11px] font-semibold tracking-[0.5px] text-[#9CA3AF]">{p.competitionLabel}</div>
                <div className="mb-2 text-[14.5px] font-semibold leading-tight text-white">{p.name}</div>
                <div className="flex items-center gap-2.5">
                  {p.salePrice ? (
                    <>
                      <span className="text-[13px] text-[#8a8f99] line-through">{fmtBRL(p.price)}</span>
                      <span className="text-base font-bold text-admin-blue">{fmtBRL(p.salePrice)}</span>
                    </>
                  ) : (
                    <span className="text-base font-bold text-white">{fmtBRL(p.price)}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
