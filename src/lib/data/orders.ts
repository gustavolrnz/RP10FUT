import "server-only";
import { prisma } from "@/lib/prisma";
import { toNum } from "@/lib/serialize";
import { PAGE_SIZE, ORDER_STATUSES } from "@/lib/constants";

export type OrderRowDTO = {
  id: string;
  orderNumber: string;
  email: string;
  date: string;
  status: string;
  total: number;
};

export type OrderDetailDTO = OrderRowDTO & {
  shipping: number;
  discount: number;
  items: {
    name: string;
    size: string;
    qty: number;
    unitPrice: number;
    customName: string | null;
    customNumber: string | null;
  }[];
};

function dateLabel(d: Date) {
  return d.toLocaleDateString("pt-BR");
}

export async function listOrders(params: { search?: string; status?: string; page?: number }) {
  const search = (params.search || "").trim();
  const page = Math.max(1, params.page || 1);

  const where = {
    ...(search
      ? {
          OR: [
            { orderNumber: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(params.status && params.status !== "all" ? { status: params.status } : {}),
  };

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rows: OrderRowDTO[] = orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    email: o.email,
    date: dateLabel(o.createdAt),
    status: o.status,
    total: toNum(o.total),
  }));

  return { rows, page: Math.min(page, pageCount), pageCount, total };
}

export async function getOrderDetail(orderNumber: string): Promise<OrderDetailDTO | null> {
  const o = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });
  if (!o) return null;
  return {
    id: o.id,
    orderNumber: o.orderNumber,
    email: o.email,
    date: dateLabel(o.createdAt),
    status: o.status,
    total: toNum(o.total),
    shipping: toNum(o.shipping),
    discount: toNum(o.discount),
    items: o.items.map((it) => ({
      name: it.name,
      size: it.size,
      qty: it.qty,
      unitPrice: toNum(it.unitPrice),
      customName: it.customName,
      customNumber: it.customNumber,
    })),
  };
}

export async function lookupOrdersByEmail(email: string): Promise<OrderDetailDTO[]> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return [];
  const orders = await prisma.order.findMany({
    where: { email: normalized },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  return orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    email: o.email,
    date: dateLabel(o.createdAt),
    status: o.status,
    total: toNum(o.total),
    shipping: toNum(o.shipping),
    discount: toNum(o.discount),
    items: o.items.map((it) => ({
      name: it.name,
      size: it.size,
      qty: it.qty,
      unitPrice: toNum(it.unitPrice),
      customName: it.customName,
      customNumber: it.customNumber,
    })),
  }));
}

export async function dashboardMetrics() {
  const orders = await prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: "asc" } });

  const totalSales = orders.reduce((s, o) => s + toNum(o.total), 0);

  const counts = new Map<string, number>();
  for (const o of orders) {
    for (const it of o.items) {
      counts.set(it.name, (counts.get(it.name) || 0) + it.qty);
    }
  }
  const best = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];

  const statusCounts = new Map<string, number>(ORDER_STATUSES.map((s) => [s, 0]));
  for (const o of orders) statusCounts.set(o.status, (statusCounts.get(o.status) || 0) + 1);
  const maxStatus = Math.max(1, ...statusCounts.values());

  const byDate = new Map<string, number>();
  for (const o of orders) {
    const label = o.createdAt.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    byDate.set(label, (byDate.get(label) || 0) + toNum(o.total));
  }
  const dateEntries = [...byDate.entries()].slice(-5);
  const maxDate = Math.max(1, ...dateEntries.map(([, v]) => v));

  const attentionOrders = orders
    .filter((o) => o.status === "Pendente")
    .slice(-5)
    .reverse()
    .map((o) => ({
      orderNumber: o.orderNumber,
      email: o.email,
      date: dateLabel(o.createdAt),
      status: o.status,
      total: toNum(o.total),
    }));

  return {
    totalSales,
    orderCount: orders.length,
    bestSeller: best ? best[0] : null,
    statusChart: [...statusCounts.entries()].map(([label, count]) => ({
      label,
      count,
      pct: Math.round((count / maxStatus) * 100),
    })),
    salesChart: dateEntries.map(([label, total]) => ({
      label,
      total,
      pct: Math.max(4, Math.round((total / maxDate) * 100)),
    })),
    attentionOrders,
  };
}
