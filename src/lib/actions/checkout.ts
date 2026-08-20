"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/data/settings";
import { SIZES } from "@/lib/constants";

const SHIPPING_PRICES: Record<string, number> = { standard: 24.9, express: 39.9 };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CEP_RE = /^\d{5}-?\d{3}$/;

const checkoutItemSchema = z.object({
  productId: z.string(),
  size: z.string(),
  customName: z.string().default(""),
  customNumber: z.string().default(""),
  qty: z.coerce.number().int().positive(),
});

const checkoutSchema = z.object({
  email: z.string().trim().min(1).regex(EMAIL_RE, "Informe um e-mail válido."),
  accountMode: z.enum(["guest", "login"]),
  loginPassword: z.string().optional(),
  fullName: z.string().trim().min(1),
  cep: z.string().trim().regex(CEP_RE, "Informe um CEP válido."),
  address: z.string().trim().min(1),
  addressNumber: z.string().trim().min(1),
  neighborhood: z.string().trim().min(1),
  city: z.string().trim().min(1),
  state: z.string().trim().min(1),
  shippingChoice: z.enum(["standard", "express"]),
  couponCode: z.string().trim().optional(),
  paymentMethod: z.enum(["pix", "credit_card"]),
  items: z.array(checkoutItemSchema).min(1),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export async function validateCoupon(code: string, subtotal: number) {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return { ok: false as const };

  const coupon = await prisma.coupon.findFirst({
    where: { code: { equals: normalized, mode: "insensitive" } },
  });
  if (!coupon || !coupon.active) return { ok: false as const };
  if (coupon.expiresAt < new Date()) return { ok: false as const };
  if (coupon.usedCount >= coupon.usageLimit) return { ok: false as const };

  const value = coupon.value.toNumber();
  const discount = coupon.type === "percentage" ? subtotal * (value / 100) : Math.min(value, subtotal);

  return { ok: true as const, code: coupon.code, type: coupon.type, discount };
}

export async function createOrder(input: CheckoutInput) {
  const data = checkoutSchema.parse(input);

  if (data.accountMode === "login") {
    if (!data.loginPassword) {
      return { ok: false as const, field: "email", error: "Informe sua senha." };
    }
    const user = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    const valid = user?.passwordHash ? await bcrypt.compare(data.loginPassword, user.passwordHash) : false;
    if (!user || !valid) {
      return { ok: false as const, field: "email", error: "E-mail ou senha incorretos." };
    }
  }

  const products = await prisma.product.findMany({
    where: { id: { in: data.items.map((i) => i.productId) } },
  });
  const productById = new Map(products.map((p) => [p.id, p]));
  const settings = await getSettings();

  let subtotal = 0;
  const orderItemsData: {
    productId: string;
    name: string;
    size: string;
    customName: string | null;
    customNumber: string | null;
    qty: number;
    unitPrice: number;
    customFee: number;
  }[] = [];

  for (const item of data.items) {
    const product = productById.get(item.productId);
    if (!product) continue;
    const hasCustomization = !!(item.customName.trim() || item.customNumber.trim());
    const customFee = hasCustomization ? settings.customizationFee : 0;
    const unitPrice = (product.salePrice ? product.salePrice.toNumber() : product.price.toNumber()) + customFee;
    subtotal += unitPrice * item.qty;
    orderItemsData.push({
      productId: product.id,
      name: product.name,
      size: item.size,
      customName: item.customName.trim() || null,
      customNumber: item.customNumber.trim() || null,
      qty: item.qty,
      unitPrice,
      customFee,
    });
  }

  if (orderItemsData.length === 0) {
    return { ok: false as const, field: "items", error: "Carrinho vazio." };
  }

  const shipping = SHIPPING_PRICES[data.shippingChoice];

  let discount = 0;
  let couponCode: string | null = null;
  if (data.couponCode) {
    const result = await validateCoupon(data.couponCode, subtotal);
    if (result.ok) {
      discount = result.discount;
      couponCode = result.code;
    }
  }

  const total = subtotal + shipping - discount;

  const order = await prisma.$transaction(async (tx) => {
    let orderNumber = "";
    let created: { orderNumber: string } | null = null;
    for (let attempt = 0; attempt < 5 && !created; attempt++) {
      orderNumber = "RP-" + Math.floor(10000 + Math.random() * 89999);
      try {
        created = await tx.order.create({
          data: {
            orderNumber,
            email: data.email.toLowerCase(),
            status: "Pendente",
            shipping,
            discount,
            total,
            fullName: data.fullName,
            cep: data.cep,
            address: data.address,
            number: data.addressNumber,
            neighborhood: data.neighborhood,
            city: data.city,
            state: data.state,
            paymentMethod: data.paymentMethod,
            paymentStatus: "pending",
            couponCode,
            items: { create: orderItemsData },
          },
        });
      } catch (e) {
        if (attempt === 4) throw e;
      }
    }

    for (const item of data.items) {
      const product = productById.get(item.productId);
      if (!product || !SIZES.includes(item.size as (typeof SIZES)[number])) continue;
      const field = ("stock" + item.size) as "stockP" | "stockM" | "stockG" | "stockGG" | "stockXG";
      const current = (product as unknown as Record<string, number>)[field];
      await tx.product.update({
        where: { id: product.id },
        data: { [field]: Math.max(0, current - item.qty) },
      });
    }

    if (couponCode) {
      await tx.coupon.update({ where: { code: couponCode }, data: { usedCount: { increment: 1 } } });
    }

    return created!;
  });

  return { ok: true as const, orderNumber: order.orderNumber };
}
