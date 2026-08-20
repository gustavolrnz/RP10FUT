"use client";

import { useState } from "react";
import { searchOrdersByEmail } from "@/lib/actions/orders";
import type { OrderDetailDTO } from "@/lib/data/orders";
import { ORDER_STATUSES, fmtBRL } from "@/lib/constants";

export default function MyOrdersPage() {
  const [email, setEmail] = useState("");
  const [results, setResults] = useState<OrderDetailDTO[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function search() {
    setLoading(true);
    try {
      setResults(await searchOrdersByEmail(email));
    } finally {
      setLoading(false);
    }
  }

  const stageIndex = (status: string) => ORDER_STATUSES.indexOf(status as (typeof ORDER_STATUSES)[number]);

  return (
    <section className="mx-auto max-w-[900px] px-5 pb-24 pt-10 sm:px-5">
      <h1 className="font-anton mb-4 text-[clamp(30px,4vw,48px)] tracking-wide text-white">MEUS PEDIDOS</h1>
      <p className="mb-8 text-sm text-[#9CA3AF]">Consulte o status do seu pedido informando o e-mail usado na compra.</p>

      <div className="mb-12 grid grid-cols-[1fr_auto] gap-3">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder="seu@email.com"
          className="box-border rounded-[2px] border border-white/15 bg-[#141414] px-4 py-3.5 text-sm text-white outline-none"
        />
        <button
          onClick={search}
          disabled={loading}
          className="cursor-pointer whitespace-nowrap rounded-[2px] border-none bg-admin-blue px-8 text-[13px] font-bold tracking-[0.8px] text-white hover:bg-admin-blue-hover disabled:opacity-60"
        >
          BUSCAR
        </button>
      </div>

      {results !== null && results.length === 0 && (
        <div className="py-10 text-sm text-[#9CA3AF]">Nenhum pedido encontrado para este e-mail.</div>
      )}

      {results !== null && results.length > 0 && (
        <div className="flex flex-col gap-6">
          {results.map((order) => {
            const current = stageIndex(order.status);
            return (
              <div key={order.orderNumber} className="border border-white/8 bg-[#141414] p-7">
                <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <div className="font-mono text-base font-bold text-white">{order.orderNumber}</div>
                    <div className="mt-1 text-xs text-[#8a8f99]">{order.date}</div>
                  </div>
                  <div className="text-sm font-bold text-admin-blue">{fmtBRL(order.total)}</div>
                </div>

                <div className="mb-7 flex items-center">
                  {ORDER_STATUSES.map((label, i) => {
                    const done = i <= current;
                    return (
                      <div key={label} className="flex flex-1 items-center">
                        <div className="flex flex-col items-center gap-2">
                          <div
                            className="h-3.5 w-3.5 rounded-full border-2"
                            style={{ background: done ? "#2E7CF6" : "#2a2a2a", borderColor: done ? "#2E7CF6" : "#3a3a3a" }}
                          />
                          <span className="whitespace-nowrap text-[11px] font-semibold" style={{ color: done ? "#fff" : "#8a8f99" }}>
                            {label}
                          </span>
                        </div>
                        {i < ORDER_STATUSES.length - 1 && (
                          <div
                            className="h-0.5 flex-1"
                            style={{ background: i < current ? "#2E7CF6" : "#2a2a2a", margin: "0 4px", transform: "translateY(-14px)" }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-col gap-2.5 border-t border-white/8 pt-4">
                  {order.items.map((it, i) => (
                    <div key={i} className="flex justify-between text-[13px] text-[#e5e5e5]">
                      <span>
                        {it.name} · Tam {it.size}
                        {(it.customName || it.customNumber) && ` · ${it.customName} ${it.customNumber}`}{" "}
                        <span className="text-[#8a8f99]">×{it.qty}</span>
                      </span>
                      <span className="text-[#9CA3AF]">{fmtBRL(it.unitPrice * it.qty)}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
