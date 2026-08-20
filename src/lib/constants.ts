export const SIZES = ["P", "M", "G", "GG", "XG"] as const;
export type Size = (typeof SIZES)[number];

export const LOW_STOCK_THRESHOLD = 5;

export const ORDER_STATUSES = ["Pendente", "Em produção", "Enviado", "Entregue"] as const;
export type OrderStatusLabel = (typeof ORDER_STATUSES)[number];

export const PAGE_SIZE = 8;

export function fmtBRL(v: number): string {
  return "R$ " + v.toFixed(2).replace(".", ",");
}
