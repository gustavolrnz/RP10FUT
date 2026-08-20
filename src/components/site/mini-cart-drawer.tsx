"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart/cart-context";
import { unitPrice, cartSubtotal } from "@/lib/cart/types";
import { fmtBRL } from "@/lib/constants";

export function MiniCartDrawer() {
  const { items, drawerOpen, closeDrawer, updateQty, removeItem } = useCart();
  const subtotal = cartSubtotal(items);

  return (
    <>
      <div
        className="fixed inset-0 z-[200] bg-black/65 transition-opacity duration-300"
        style={{ opacity: drawerOpen ? 1 : 0, pointerEvents: drawerOpen ? "auto" : "none" }}
        onClick={closeDrawer}
      />
      <div
        className="fixed right-0 top-0 bottom-0 z-[201] flex w-[min(440px,92vw)] flex-col border-l border-white/10 bg-[#0A0A0A] transition-transform duration-[350ms]"
        style={{ transform: drawerOpen ? "translateX(0)" : "translateX(100%)" }}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-[22px]">
          <div className="font-anton text-xl tracking-wide text-white">SEU CARRINHO</div>
          <button onClick={closeDrawer} className="cursor-pointer border-none bg-transparent p-1 text-[22px] leading-none text-[#9CA3AF] hover:text-white">
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="py-16 text-center text-sm text-[#9CA3AF]">Seu carrinho está vazio.</div>
          ) : (
            items.map((item, index) => (
              <div key={index} className="flex gap-3.5 border-b border-white/7 py-4">
                <div className="flex h-[76px] w-16 shrink-0 items-center justify-center overflow-hidden stripe-placeholder-light text-center font-mono text-[8px] text-[#5a5a5a]">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} width={64} height={76} unoptimized className="h-full w-full object-cover" />
                  ) : (
                    "IMG"
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-semibold leading-tight text-white">{item.name}</div>
                  <div className="mt-1 text-[11px] text-[#9CA3AF]">
                    Tam {item.size} {(item.customName || item.customNumber) && `· ${item.customName} ${item.customNumber}`}
                  </div>
                  <div className="mt-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2 rounded border border-white/15">
                      <button onClick={() => updateQty(index, item.qty - 1)} className="h-6 w-6 cursor-pointer border-none bg-transparent text-sm text-white">
                        −
                      </button>
                      <span className="min-w-[14px] text-center text-xs text-white">{item.qty}</span>
                      <button onClick={() => updateQty(index, item.qty + 1)} className="h-6 w-6 cursor-pointer border-none bg-transparent text-sm text-white">
                        +
                      </button>
                    </div>
                    <div className="text-[13px] font-bold text-admin-blue">{fmtBRL(unitPrice(item) * item.qty)}</div>
                  </div>
                </div>
                <button onClick={() => removeItem(index)} className="self-start cursor-pointer border-none bg-transparent text-base text-[#6b6b6b] hover:text-[#9CA3AF]">
                  &times;
                </button>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-white/10 px-6 pb-6 pt-5">
          <div className="mb-4 flex justify-between text-sm text-white">
            <span className="text-[#9CA3AF]">Subtotal</span>
            <span className="font-bold">{fmtBRL(subtotal)}</span>
          </div>
          <Link
            href="/cart"
            onClick={closeDrawer}
            className="mb-2.5 block rounded-[2px] border border-white/20 py-3.5 text-center text-[13px] font-semibold text-white no-underline hover:border-white"
          >
            VER CARRINHO
          </Link>
          <Link
            href="/checkout"
            onClick={closeDrawer}
            className="block rounded-[2px] bg-admin-blue py-3.5 text-center text-[13px] font-bold text-white no-underline hover:bg-admin-blue-hover"
          >
            FINALIZAR COMPRA
          </Link>
        </div>
      </div>
    </>
  );
}
