"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { ProductDTO } from "@/lib/data/products";
import { SIZES, fmtBRL } from "@/lib/constants";
import { useCart } from "@/lib/cart/cart-context";

export function ProductClient({
  product,
  related,
  customizationFee,
}: {
  product: ProductDTO;
  related: ProductDTO[];
  customizationFee: number;
}) {
  const { addToCart, openDrawer } = useCart();
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [customName, setCustomName] = useState("");
  const [customNumber, setCustomNumber] = useState("");
  const [needsSize, setNeedsSize] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const hasPhotos = product.images.length > 0;
  const images = hasPhotos ? product.images : [1, 2, 3, 4];
  const hasCustomization = !!(customName.trim() || customNumber.trim());
  const feeApplied = customizationFee > 0 && hasCustomization;
  const unitBase = product.salePrice ?? product.price;

  function onAddToCart() {
    if (!selectedSize) {
      setNeedsSize(true);
      return;
    }
    if (product.stock[selectedSize as keyof typeof product.stock] === 0) return;

    addToCart({
      productId: product.id,
      name: product.name,
      image: hasPhotos ? product.images[0] : null,
      price: product.price,
      salePrice: product.salePrice,
      customFee: hasCustomization ? customizationFee : 0,
      size: selectedSize,
      customName,
      customNumber,
      qty: 1,
    });
    setJustAdded(true);
    openDrawer();
    setTimeout(() => setJustAdded(false), 1800);
  }

  return (
    <>
      <div className="mx-auto max-w-[1440px] px-5 pt-6 text-xs text-[#8a8f99] sm:px-12">
        <Link href="/catalog" className="text-[#8a8f99] no-underline hover:text-[#9CA3AF]">
          Catálogo
        </Link>{" "}
        / <span className="text-[#9CA3AF]">{product.competitionLabel}</span> / <span className="text-[#9CA3AF]">{product.name}</span>
      </div>

      <section className="mx-auto grid max-w-[1440px] grid-cols-1 gap-5 px-5 py-8 sm:px-12 lg:grid-cols-[80px_1fr_440px] xl:grid-cols-[80px_1fr_440px]">
        <div className="order-2 flex flex-row gap-2.5 overflow-x-auto lg:order-1 lg:flex-col">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveImage(i)}
              className="stripe-placeholder-light flex h-24 w-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden border p-0"
              style={{ borderColor: i === activeImage ? "#2E7CF6" : "rgba(255,255,255,0.1)" }}
            >
              {hasPhotos ? (
                <Image src={images[i] as string} alt="" width={80} height={96} unoptimized className="h-full w-full object-cover" />
              ) : (
                <span className="font-mono text-[8px] text-[#4a4a4a]">{i + 1}</span>
              )}
            </button>
          ))}
        </div>

        <div className="stripe-placeholder relative order-1 flex aspect-[4/5] items-center justify-center overflow-hidden lg:order-2">
          {hasPhotos ? (
            <Image src={images[activeImage] as string} alt={product.name} width={800} height={1000} unoptimized className="h-full w-full object-cover" />
          ) : (
            <span className="px-10 text-center font-mono text-xs text-[#4a4a4a]">
              {product.imageAltText}, foto {activeImage + 1}
            </span>
          )}
          {product.salePrice && (
            <span className="absolute left-4 top-4 bg-admin-blue px-3 py-1.5 text-xs font-bold tracking-[0.3px] text-white">OFERTA</span>
          )}
          <button
            onClick={() => setActiveImage((i) => (i + images.length - 1) % images.length)}
            className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-none bg-black/50 text-white"
          >
            ‹
          </button>
          <button
            onClick={() => setActiveImage((i) => (i + 1) % images.length)}
            className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-none bg-black/50 text-white"
          >
            ›
          </button>
        </div>

        <div className="order-3">
          <div className="mb-2.5 text-xs font-semibold tracking-[0.8px] text-[#9CA3AF]">{product.competitionLabel}</div>
          <h1 className="font-anton mb-4 text-[30px] leading-[1.1] tracking-[0.3px] text-white">{product.name}</h1>
          <div className="mb-8 flex items-center gap-3">
            {product.salePrice ? (
              <>
                <span className="text-base text-[#8a8f99] line-through">{fmtBRL(product.price)}</span>
                <span className="text-[26px] font-bold text-admin-blue">{fmtBRL(product.salePrice)}</span>
              </>
            ) : (
              <span className="text-[26px] font-bold text-white">{fmtBRL(product.price)}</span>
            )}
          </div>

          <div className="mb-7">
            <div className="mb-3 text-xs font-bold tracking-[0.8px] text-white">TAMANHO</div>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((sz) => {
                const outOfStock = product.stock[sz] === 0;
                const selected = sz === selectedSize;
                return (
                  <button
                    key={sz}
                    disabled={outOfStock}
                    onClick={() => {
                      setSelectedSize(sz);
                      setNeedsSize(false);
                    }}
                    className={`min-w-12 rounded-[2px] px-3.5 py-2.5 text-[13px] font-semibold ${
                      outOfStock
                        ? "cursor-not-allowed border border-white/8 text-[#4a4a4a] line-through"
                        : selected
                          ? "cursor-pointer border border-admin-blue bg-admin-blue text-white"
                          : "cursor-pointer border border-white/20 bg-transparent text-white"
                    }`}
                  >
                    {sz}
                    {outOfStock ? " (esgotado)" : ""}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-7 border border-white/8 bg-[#141414] p-5">
            <div className="mb-3.5 flex items-baseline justify-between gap-3">
              <div className="text-xs font-bold tracking-[0.8px] text-white">PERSONALIZAÇÃO</div>
              {customizationFee > 0 && <div className="text-xs font-bold text-admin-blue">+ {fmtBRL(customizationFee)}</div>}
            </div>
            <div className="grid grid-cols-[2fr_1fr] gap-3">
              <div>
                <label className="mb-1.5 block text-[11px] text-[#9CA3AF]">NOME (opcional)</label>
                <input
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value.toUpperCase())}
                  maxLength={12}
                  placeholder="EX: SILVA"
                  className="w-full box-border rounded-[2px] border border-white/15 bg-[#0A0A0A] px-3 py-[11px] text-sm uppercase text-white outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] text-[#9CA3AF]">NÚMERO</label>
                <input
                  value={customNumber}
                  onChange={(e) => setCustomNumber(e.target.value.replace(/[^0-9]/g, "").slice(0, 2))}
                  maxLength={2}
                  placeholder="10"
                  className="w-full box-border rounded-[2px] border border-white/15 bg-[#0A0A0A] px-3 py-[11px] text-sm text-white outline-none"
                />
              </div>
            </div>
          </div>

          {feeApplied && (
            <div className="mb-3.5 flex items-baseline justify-between border-b border-white/8 pb-3.5">
              <span className="text-[12.5px] text-[#9CA3AF]">Com personalização</span>
              <span className="text-lg font-bold text-white">{fmtBRL(unitBase + customizationFee)}</span>
            </div>
          )}

          <button
            onClick={onAddToCart}
            className="w-full cursor-pointer rounded-[2px] border-none bg-admin-blue py-[18px] text-sm font-bold tracking-[1px] text-white hover:bg-admin-blue-hover"
          >
            {justAdded ? "ADICIONADO ✓" : "ADICIONAR AO CARRINHO"}
          </button>
          {needsSize && <div className="mt-2.5 text-xs text-[#f87171]">Selecione um tamanho para continuar.</div>}

          <div className="mt-7 flex flex-col gap-2.5 text-[12.5px] text-[#9CA3AF]">
            <div>Envio rastreado para todo o Brasil</div>
            <div>Tecido premium, alta durabilidade</div>
            <div>Dúvidas? Fale conosco pelo WhatsApp</div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="mx-auto max-w-[1440px] border-t border-white/8 px-5 pb-24 pt-16 sm:px-12">
          <h2 className="font-anton mb-8 text-[28px] tracking-[0.3px] text-white">VOCÊ TAMBÉM VAI GOSTAR</h2>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <Link key={p.id} href={`/product/${p.id}`} className="block no-underline">
                <div className="stripe-placeholder mb-3.5 flex aspect-[4/5] items-center justify-center overflow-hidden">
                  {p.images.length > 0 ? (
                    <Image src={p.images[0]} alt={p.name} width={400} height={500} unoptimized className="h-full w-full object-cover" />
                  ) : (
                    <span className="px-5 text-center font-mono text-[10px] text-[#4a4a4a]">{p.imageAltText}</span>
                  )}
                </div>
                <div className="mb-1.5 text-sm font-semibold text-white">{p.name}</div>
                <div className="text-[15px] font-bold text-white">{fmtBRL(p.salePrice ?? p.price)}</div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
