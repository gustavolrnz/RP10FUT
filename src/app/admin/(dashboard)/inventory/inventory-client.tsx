"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import type { ProductDTO } from "@/lib/data/products";
import { adjustStock } from "@/lib/actions/products";
import { SIZES } from "@/lib/constants";

export function InventoryClient({ products, threshold }: { products: ProductDTO[]; threshold: number }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [local, setLocal] = useState<Record<string, Record<string, string>>>(() =>
    Object.fromEntries(products.map((p) => [p.id, Object.fromEntries(SIZES.map((sz) => [sz, String(p.stock[sz])]))])),
  );
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  function onChange(productId: string, size: (typeof SIZES)[number], value: string) {
    setLocal((s) => ({ ...s, [productId]: { ...s[productId], [size]: value } }));
    const key = `${productId}:${size}`;
    if (timers.current[key]) clearTimeout(timers.current[key]);
    timers.current[key] = setTimeout(async () => {
      await adjustStock(productId, size, Number(value) || 0);
      startTransition(() => router.refresh());
    }, 500);
  }

  return (
    <div>
      <h1 className="mb-2 text-[22px] font-bold text-white">Estoque</h1>
      <p className="mb-6 text-[13px] text-admin-text3">
        Linhas destacadas indicam estoque abaixo de {threshold} unidades em algum tamanho.
      </p>
      <div className="overflow-hidden rounded-lg border border-admin-border bg-admin-panel">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-admin-panel-alt text-left text-[11px] tracking-wide text-admin-text3">
              <th className="px-4 py-3 font-semibold">PRODUTO</th>
              {SIZES.map((sz) => (
                <th key={sz} className="p-3 text-center font-semibold">
                  {sz}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className={`border-t border-white/6 ${p.lowStock ? "bg-[rgba(250,204,21,0.06)]" : ""}`}>
                <td className="px-4 py-3.5 text-[13px] font-semibold text-white">{p.name}</td>
                {SIZES.map((sz) => {
                  const low = Number(local[p.id][sz]) < threshold;
                  return (
                    <td key={sz} className="px-3 py-2.5 text-center">
                      <input
                        type="number"
                        min={0}
                        value={local[p.id][sz]}
                        onChange={(e) => onChange(p.id, sz, e.target.value)}
                        className={`w-14 rounded border bg-admin-input px-1.5 py-[7px] text-center text-[12.5px] text-white outline-none ${
                          low ? "border-[rgba(250,204,21,0.5)]" : "border-white/10"
                        }`}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
