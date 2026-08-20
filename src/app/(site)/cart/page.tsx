"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart/cart-context";
import { unitPrice, cartSubtotal } from "@/lib/cart/types";
import { fmtBRL } from "@/lib/constants";

export default function CartPage() {
  const { items, updateQty, removeItem } = useCart();
  const subtotal = cartSubtotal(items);

  return (
    <section className="mx-auto max-w-[1100px] px-5 pb-24 pt-14 sm:px-12">
      <h1 className="font-anton mb-10 text-[clamp(30px,4vw,48px)] tracking-wide text-white">SEU CARRINHO</h1>

      {items.length === 0 ? (
        <div className="py-20 text-center">
          <p className="mb-6 text-[15px] text-[#9CA3AF]">Seu carrinho está vazio.</p>
          <Link
            href="/catalog"
            className="inline-block rounded-[2px] bg-admin-blue px-9 py-4 text-[13px] font-bold tracking-[1px] text-white no-underline hover:bg-admin-blue-hover"
          >
            VER CATÁLOGO
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1fr_340px]">
          <div>
            {items.map((item, index) => (
              <div key={index} className="flex gap-5 border-b border-white/8 py-6">
                <div className="stripe-placeholder-light flex h-[120px] w-[100px] shrink-0 items-center justify-center overflow-hidden text-center font-mono text-[8px] text-[#4a4a4a]">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} width={100} height={120} unoptimized className="h-full w-full object-cover" />
                  ) : (
                    "IMG"
                  )}
                </div>
                <div className="flex-1">
                  <div className="mb-1.5 text-base font-semibold text-white">{item.name}</div>
                  <div className="mb-4 text-[13px] text-[#9CA3AF]">
                    Tamanho {item.size}
                    {(item.customName || item.customNumber) && ` · ${item.customName} ${item.customNumber}`}
                    {item.customFee > 0 && ` · personalização +${fmtBRL(item.customFee)}`}
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="flex items-center gap-3 rounded-[2px] border border-white/15 px-2 py-1">
                      <button onClick={() => updateQty(index, item.qty - 1)} className="h-[22px] w-[22px] cursor-pointer border-none bg-transparent text-[15px] text-white">
                        −
                      </button>
                      <span className="min-w-4 text-center text-[13px] text-white">{item.qty}</span>
                      <button onClick={() => updateQty(index, item.qty + 1)} className="h-[22px] w-[22px] cursor-pointer border-none bg-transparent text-[15px] text-white">
                        +
                      </button>
                    </div>
                    <button onClick={() => removeItem(index)} className="cursor-pointer border-none bg-transparent p-0 text-[12.5px] text-[#9CA3AF] underline hover:text-white">
                      Remover
                    </button>
                  </div>
                </div>
                <div className="whitespace-nowrap text-base font-bold text-white">{fmtBRL(unitPrice(item) * item.qty)}</div>
              </div>
            ))}
          </div>

          <div className="sticky top-[104px] border border-white/8 bg-[#141414] p-7">
            <div className="mb-5 text-[13px] font-bold tracking-[0.6px] text-white">RESUMO DO PEDIDO</div>
            <div className="mb-3 flex justify-between text-[13px] text-[#9CA3AF]">
              <span>Subtotal</span>
              <span className="text-white">{fmtBRL(subtotal)}</span>
            </div>
            <div className="mb-5 text-xs text-[#8a8f99]">Frete e cupom disponíveis no checkout.</div>
            <div className="mb-6 flex justify-between border-t border-white/10 pt-4">
              <span className="text-sm font-bold text-white">Total</span>
              <span className="text-lg font-bold text-white">{fmtBRL(subtotal)}</span>
            </div>
            <Link
              href="/checkout"
              className="block rounded-[2px] bg-admin-blue py-4 text-center text-[13px] font-bold tracking-[1px] text-white no-underline hover:bg-admin-blue-hover"
            >
              IR PARA O CHECKOUT
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
