"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart/cart-context";
import { unitPrice, cartSubtotal } from "@/lib/cart/types";
import { fmtBRL } from "@/lib/constants";
import { createOrder, validateCoupon } from "@/lib/actions/checkout";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CEP_RE = /^\d{5}-?\d{3}$/;
const SHIPPING_PRICES = { standard: 24.9, express: 39.9 } as const;

const inputBase =
  "w-full box-border rounded-[2px] border bg-[#0A0A0A] px-3.5 py-3 text-[13.5px] text-white outline-none";

type Errors = Partial<Record<"email" | "fullName" | "cep" | "address" | "addressNumber" | "neighborhood" | "city" | "state", string>>;

export function CheckoutClient() {
  const { items, clearCart } = useCart();

  const [accountMode, setAccountMode] = useState<"guest" | "login">("guest");
  const [email, setEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [cep, setCep] = useState("");
  const [address, setAddress] = useState("");
  const [addressNumber, setAddressNumber] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [shippingCalculated, setShippingCalculated] = useState(false);
  const [shippingChoice, setShippingChoice] = useState<"standard" | "express">("standard");
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponInvalid, setCouponInvalid] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "card">("pix");
  const [errors, setErrors] = useState<Errors>({});
  const [placing, setPlacing] = useState(false);
  const [confirmation, setConfirmation] = useState<{ orderNumber: string; email: string } | null>(null);

  const cartItems = items.map((item) => ({
    ...item,
    lineTotal: unitPrice(item) * item.qty,
  }));
  const subtotal = cartSubtotal(items);
  const shipping = shippingCalculated ? SHIPPING_PRICES[shippingChoice] : 0;
  const discount = appliedCoupon?.discount ?? 0;
  const total = subtotal + shipping - discount;

  function calcShipping() {
    if (!CEP_RE.test(cep.trim())) {
      setErrors((e) => ({ ...e, cep: "CEP inválido. Use o formato 00000-000." }));
      return;
    }
    setShippingCalculated(true);
  }

  async function applyCoupon() {
    const result = await validateCoupon(couponInput, subtotal);
    if (result.ok) {
      setAppliedCoupon({ code: result.code, discount: result.discount });
      setCouponInvalid(false);
    } else {
      setAppliedCoupon(null);
      setCouponInvalid(true);
    }
  }

  async function placeOrder() {
    const newErrors: Errors = {};
    if (!email.trim()) newErrors.email = "Informe seu e-mail.";
    else if (!EMAIL_RE.test(email.trim())) newErrors.email = "Informe um e-mail válido.";
    if (!fullName.trim()) newErrors.fullName = "Campo obrigatório.";
    if (!cep.trim() || !CEP_RE.test(cep.trim())) newErrors.cep = "Informe um CEP válido.";
    if (!address.trim()) newErrors.address = "Campo obrigatório.";
    if (!addressNumber.trim()) newErrors.addressNumber = "Campo obrigatório.";
    if (!neighborhood.trim()) newErrors.neighborhood = "Campo obrigatório.";
    if (!city.trim()) newErrors.city = "Campo obrigatório.";
    if (!state.trim()) newErrors.state = "Campo obrigatório.";
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    setPlacing(true);
    try {
      const result = await createOrder({
        email,
        accountMode,
        loginPassword: accountMode === "login" ? loginPassword : undefined,
        fullName,
        cep,
        address,
        addressNumber,
        neighborhood,
        city,
        state,
        shippingChoice,
        couponCode: appliedCoupon?.code,
        paymentMethod: paymentMethod === "card" ? "credit_card" : "pix",
        items: items.map((i) => ({
          productId: i.productId,
          size: i.size,
          customName: i.customName,
          customNumber: i.customNumber,
          qty: i.qty,
        })),
      });
      if (!result.ok) {
        setErrors({ email: result.error });
        return;
      }
      clearCart();
      setConfirmation({ orderNumber: result.orderNumber, email });
    } finally {
      setPlacing(false);
    }
  }

  if (confirmation) {
    return (
      <section className="mx-auto max-w-[640px] px-5 py-24 text-center sm:px-12 sm:py-32">
        <div className="mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-full bg-admin-blue text-[28px] text-white">✓</div>
        <h1 className="font-anton mb-4 text-[32px] tracking-[0.3px] text-white">PEDIDO CONFIRMADO</h1>
        <p className="mb-2 text-sm text-[#9CA3AF]">Número do pedido</p>
        <p className="mb-8 font-mono text-2xl font-bold text-admin-blue">{confirmation.orderNumber}</p>
        <p className="mb-9 text-[13px] leading-relaxed text-[#9CA3AF]">
          Enviamos os detalhes para {confirmation.email}. Acompanhe o status a qualquer momento em Meus Pedidos.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/orders" className="rounded-[2px] bg-admin-blue px-8 py-4 text-[13px] font-bold tracking-[0.8px] text-white no-underline">
            MEUS PEDIDOS
          </Link>
          <Link href="/" className="rounded-[2px] border border-white/20 px-8 py-4 text-[13px] font-bold tracking-[0.8px] text-white no-underline">
            VOLTAR AO INÍCIO
          </Link>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-[640px] px-5 py-24 text-center sm:px-12 sm:py-32">
        <p className="mb-6 text-[15px] text-[#9CA3AF]">Seu carrinho está vazio.</p>
        <Link href="/catalog" className="inline-block rounded-[2px] bg-admin-blue px-9 py-4 text-[13px] font-bold tracking-[1px] text-white no-underline">
          VER CATÁLOGO
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto grid max-w-[1300px] grid-cols-1 gap-12 px-5 py-8 sm:px-12 sm:py-12 lg:grid-cols-[1fr_380px]">
      <div>
        <div className="mb-8 flex w-fit rounded-[2px] border border-white/15">
          <button
            onClick={() => setAccountMode("guest")}
            className={`cursor-pointer border-none px-[22px] py-3 text-xs font-bold tracking-[0.5px] ${
              accountMode === "guest" ? "bg-admin-blue text-white" : "bg-transparent text-[#9CA3AF]"
            }`}
          >
            CONTINUAR COMO VISITANTE
          </button>
          <button
            onClick={() => setAccountMode("login")}
            className={`cursor-pointer border-none px-[22px] py-3 text-xs font-bold tracking-[0.5px] ${
              accountMode === "login" ? "bg-admin-blue text-white" : "bg-transparent text-[#9CA3AF]"
            }`}
          >
            ENTRAR NA MINHA CONTA
          </button>
        </div>

        <div className="mb-9">
          <div className="mb-4 text-[13px] font-bold tracking-[0.6px] text-white">CONTATO</div>
          <div className={`grid gap-3 ${accountMode === "login" ? "sm:grid-cols-2" : "grid-cols-1"}`}>
            <div>
              <label htmlFor="checkout-email" className="sr-only">
                E-mail
              </label>
              <input
                id="checkout-email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors((er) => ({ ...er, email: undefined }));
                }}
                placeholder="Seu e-mail"
                aria-label="Seu e-mail"
                className={`${inputBase} ${errors.email ? "border-[#f87171]" : "border-white/15"}`}
              />
            </div>
            {accountMode === "login" && (
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Senha"
                aria-label="Senha"
                className={`${inputBase} border-white/15`}
              />
            )}
          </div>
          {errors.email && <div className="mt-2 text-xs text-[#f87171]">{errors.email}</div>}
        </div>

        <div className="mb-9">
          <div className="mb-4 text-[13px] font-bold tracking-[0.6px] text-white">ENDEREÇO DE ENTREGA</div>
          <div className="mb-3">
            <input
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setErrors((er) => ({ ...er, fullName: undefined }));
              }}
              placeholder="Nome completo"
              aria-label="Nome completo"
              className={`${inputBase} ${errors.fullName ? "border-[#f87171]" : "border-white/15"}`}
            />
          </div>
          <div className="mb-1 grid grid-cols-[1fr_auto] gap-3">
            <input
              value={cep}
              onChange={(e) => {
                setCep(e.target.value);
                setErrors((er) => ({ ...er, cep: undefined }));
              }}
              placeholder="CEP"
              aria-label="CEP"
              className={`${inputBase} ${errors.cep ? "border-[#f87171]" : "border-white/15"}`}
            />
            <button
              onClick={calcShipping}
              className="cursor-pointer whitespace-nowrap rounded-[2px] border border-white/20 bg-transparent px-6 text-[12.5px] font-bold tracking-[0.5px] text-white"
            >
              CALCULAR FRETE
            </button>
          </div>
          {errors.cep && <div className="mb-2 text-xs text-[#f87171]">{errors.cep}</div>}
          <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr]">
            <input
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                setErrors((er) => ({ ...er, address: undefined }));
              }}
              placeholder="Endereço"
              aria-label="Endereço"
              className={`${inputBase} ${errors.address ? "border-[#f87171]" : "border-white/15"}`}
            />
            <input
              value={addressNumber}
              onChange={(e) => {
                setAddressNumber(e.target.value);
                setErrors((er) => ({ ...er, addressNumber: undefined }));
              }}
              placeholder="Número"
              aria-label="Número do endereço"
              className={`${inputBase} ${errors.addressNumber ? "border-[#f87171]" : "border-white/15"}`}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <input
              value={neighborhood}
              onChange={(e) => {
                setNeighborhood(e.target.value);
                setErrors((er) => ({ ...er, neighborhood: undefined }));
              }}
              placeholder="Bairro"
              aria-label="Bairro"
              className={`${inputBase} ${errors.neighborhood ? "border-[#f87171]" : "border-white/15"}`}
            />
            <input
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setErrors((er) => ({ ...er, city: undefined }));
              }}
              placeholder="Cidade"
              aria-label="Cidade"
              className={`${inputBase} ${errors.city ? "border-[#f87171]" : "border-white/15"}`}
            />
            <input
              value={state}
              onChange={(e) => {
                setState(e.target.value);
                setErrors((er) => ({ ...er, state: undefined }));
              }}
              placeholder="Estado"
              aria-label="Estado"
              className={`${inputBase} ${errors.state ? "border-[#f87171]" : "border-white/15"}`}
            />
          </div>

          {shippingCalculated && (
            <div className="mt-4 flex flex-col gap-2.5">
              {(
                [
                  { key: "standard", label: "Padrão · 5 a 8 dias úteis" },
                  { key: "express", label: "Expresso · 2 a 3 dias úteis" },
                ] as const
              ).map((opt) => (
                <label
                  key={opt.key}
                  className="flex cursor-pointer items-center gap-3 rounded-[2px] border px-3.5 py-3"
                  style={{ borderColor: shippingChoice === opt.key ? "#2E7CF6" : "rgba(255,255,255,0.12)" }}
                >
                  <input
                    type="radio"
                    name="shipping"
                    checked={shippingChoice === opt.key}
                    onChange={() => setShippingChoice(opt.key)}
                    className="accent-admin-blue"
                  />
                  <span className="flex-1 text-[13px] text-white">{opt.label}</span>
                  <span className="text-[13px] text-[#9CA3AF]">{fmtBRL(SHIPPING_PRICES[opt.key])}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="mb-9">
          <div className="mb-4 text-[13px] font-bold tracking-[0.6px] text-white">CUPOM DE DESCONTO</div>
          <div className="grid grid-cols-[1fr_auto] gap-3">
            <input
              value={couponInput}
              onChange={(e) => {
                setCouponInput(e.target.value);
                setCouponInvalid(false);
              }}
              placeholder="Código do cupom"
              className={`${inputBase} border-white/15`}
            />
            <button
              onClick={applyCoupon}
              className="cursor-pointer whitespace-nowrap rounded-[2px] border border-white/20 bg-transparent px-6 text-[12.5px] font-bold tracking-[0.5px] text-white"
            >
              APLICAR
            </button>
          </div>
          {appliedCoupon && <div className="mt-2.5 text-[12.5px] text-[#22C55E]">Cupom {appliedCoupon.code} aplicado</div>}
          {couponInvalid && <div className="mt-2.5 text-[12.5px] text-[#f87171]">Cupom inválido.</div>}
        </div>

        <div>
          <div className="mb-4 text-[13px] font-bold tracking-[0.6px] text-white">PAGAMENTO</div>
          <div className="mb-5 flex w-fit rounded-[2px] border border-white/15">
            <button
              onClick={() => setPaymentMethod("pix")}
              className={`cursor-pointer border-none px-[22px] py-3 text-xs font-bold tracking-[0.5px] ${
                paymentMethod === "pix" ? "bg-admin-blue text-white" : "bg-transparent text-[#9CA3AF]"
              }`}
            >
              PIX
            </button>
            <button
              onClick={() => setPaymentMethod("card")}
              className={`cursor-pointer border-none px-[22px] py-3 text-xs font-bold tracking-[0.5px] ${
                paymentMethod === "card" ? "bg-admin-blue text-white" : "bg-transparent text-[#9CA3AF]"
              }`}
            >
              CARTÃO DE CRÉDITO
            </button>
          </div>
          {paymentMethod === "pix" ? (
            <div className="flex items-center gap-6 border border-white/8 bg-[#141414] p-7">
              <div className="stripe-placeholder-light flex h-[110px] w-[110px] shrink-0 items-center justify-center text-center font-mono text-[8px] text-[#5a5a5a]">
                QR CODE
              </div>
              <p className="m-0 text-[13px] leading-relaxed text-[#9CA3AF]">
                Após finalizar, um QR code será gerado para pagamento instantâneo via Pix. Aprovação em segundos.
              </p>
            </div>
          ) : (
            <div>
              <input placeholder="Número do cartão" aria-label="Número do cartão" className={`${inputBase} mb-3 border-white/15`} />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr_1fr]">
                <input placeholder="Nome impresso no cartão" aria-label="Nome impresso no cartão" className={`${inputBase} border-white/15`} />
                <input placeholder="Validade" aria-label="Validade" className={`${inputBase} border-white/15`} />
                <input placeholder="CVV" aria-label="CVV" className={`${inputBase} border-white/15`} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="sticky top-8 border border-white/8 bg-[#141414] p-7">
        <div className="mb-5 text-[13px] font-bold tracking-[0.6px] text-white">RESUMO DO PEDIDO</div>
        <div className="mb-5 flex max-h-[260px] flex-col gap-3.5 overflow-y-auto">
          {cartItems.map((item, i) => (
            <div key={i} className="flex justify-between gap-2.5">
              <div className="text-[12.5px] leading-tight text-[#e5e5e5]">
                {item.name} <span className="text-[#8a8f99]">×{item.qty}</span>
                <br />
                <span className="text-[#8a8f99]">
                  Tam {item.size}
                  {item.customFee > 0 && ` · personalização +${fmtBRL(item.customFee)}`}
                </span>
              </div>
              <div className="whitespace-nowrap text-[13px] text-white">{fmtBRL(item.lineTotal)}</div>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2.5 border-t border-white/10 pt-4 text-[13px]">
          <div className="flex justify-between text-[#9CA3AF]">
            <span>Subtotal</span>
            <span className="text-white">{fmtBRL(subtotal)}</span>
          </div>
          <div className="flex justify-between text-[#9CA3AF]">
            <span>Frete</span>
            <span className="text-white">{shippingCalculated ? fmtBRL(shipping) : "A calcular"}</span>
          </div>
          {appliedCoupon && (
            <div className="flex justify-between text-[#22C55E]">
              <span>Desconto</span>
              <span>−{fmtBRL(discount)}</span>
            </div>
          )}
        </div>
        <div className="mb-6 mt-3.5 flex justify-between border-t border-white/10 pt-4">
          <span className="text-sm font-bold text-white">Total</span>
          <span className="text-[19px] font-bold text-white">{fmtBRL(total)}</span>
        </div>
        <button
          onClick={placeOrder}
          disabled={placing}
          className="w-full cursor-pointer rounded-[2px] border-none bg-admin-blue py-4 text-[13px] font-bold tracking-[1px] text-white hover:bg-admin-blue-hover disabled:opacity-60"
        >
          {placing ? "PROCESSANDO..." : "FINALIZAR PEDIDO"}
        </button>
      </div>
    </section>
  );
}
