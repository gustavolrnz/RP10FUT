"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import type { OrderRowDTO, OrderDetailDTO } from "@/lib/data/orders";
import { updateOrderStatus } from "@/lib/actions/orders";
import { useToast } from "@/components/admin/toast-provider";
import { Modal } from "@/components/admin/modal";
import { GhostButton, StatusBadge, Pagination } from "@/components/admin/ui";
import { ORDER_STATUSES, fmtBRL } from "@/lib/constants";

export function OrdersClient({
  rows,
  page,
  pageCount,
  filters,
  detail,
}: {
  rows: OrderRowDTO[];
  page: number;
  pageCount: number;
  filters: { q: string; status: string };
  detail: OrderDetailDTO | null;
}) {
  const router = useRouter();
  const toast = useToast();
  const [, startTransition] = useTransition();
  const [q, setQ] = useState(filters.q);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function buildQuery(next: Record<string, string | undefined>) {
    const merged: Record<string, string> = {};
    if (filters.q) merged.q = filters.q;
    if (filters.status !== "all") merged.status = filters.status;
    Object.entries(next).forEach(([k, v]) => {
      if (v === undefined) delete merged[k];
      else merged[k] = v;
    });
    return new URLSearchParams(merged).toString();
  }

  function pushFilters(next: Record<string, string | undefined>) {
    router.push(`/admin/orders?${buildQuery(next)}`);
  }

  function onSearchChange(value: string) {
    setQ(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => pushFilters({ q: value || undefined, page: undefined }), 300);
  }

  function closeDetail() {
    pushFilters({ order: undefined });
  }

  async function setStatus(orderNumber: string, status: string) {
    await updateOrderStatus(orderNumber, status);
    toast("Status do pedido atualizado.", "success");
    startTransition(() => router.refresh());
  }

  return (
    <div>
      <h1 className="mb-6 text-[22px] font-bold text-white">Pedidos</h1>

      <div className="mb-[18px] flex flex-wrap gap-3">
        <input
          value={q}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por pedido ou e-mail..."
          className="min-w-[220px] flex-1 rounded-md border border-white/10 bg-admin-panel px-3.5 py-2.5 text-[13px] text-white outline-none"
        />
        <select
          value={filters.status}
          onChange={(e) => pushFilters({ status: e.target.value === "all" ? undefined : e.target.value, page: undefined })}
          className="rounded-md border border-white/10 bg-admin-panel px-3.5 py-2.5 text-[13px] text-white outline-none"
        >
          <option value="all">Todos os status</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-lg border border-admin-border bg-admin-panel">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-admin-panel-alt text-left text-[11px] tracking-wide text-admin-text3">
              <th className="px-4 py-3 font-semibold">PEDIDO</th>
              <th className="p-3 font-semibold">DATA</th>
              <th className="p-3 font-semibold">E-MAIL</th>
              <th className="p-3 font-semibold">STATUS</th>
              <th className="p-3 font-semibold">TOTAL</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[13px] text-admin-text3">
                  Nenhum pedido encontrado.
                </td>
              </tr>
            )}
            {rows.map((o) => (
              <tr key={o.id} className="border-t border-white/6">
                <td className="px-4 py-3.5 font-mono text-[12.5px] text-white">{o.orderNumber}</td>
                <td className="p-3 text-[12.5px] text-admin-text2">{o.date}</td>
                <td className="p-3 text-[12.5px] text-admin-text2">{o.email}</td>
                <td className="p-3">
                  <StatusBadge status={o.status} />
                </td>
                <td className="p-3 text-[12.5px] text-white">{fmtBRL(o.total)}</td>
                <td className="px-4 py-3.5 text-right">
                  <GhostButton onClick={() => pushFilters({ order: o.orderNumber })}>Ver detalhes</GhostButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        pageCount={pageCount}
        makeHref={(p) => `?${buildQuery({ page: String(p) })}`}
      />

      {detail && (
        <Modal onClose={closeDetail} width={560}>
          <div className="mb-1.5 flex items-baseline justify-between">
            <div className="font-mono text-lg font-bold text-white">{detail.orderNumber}</div>
            <div className="text-xs text-admin-text3">{detail.date}</div>
          </div>
          <div className="mb-6 text-[13px] text-admin-text2">{detail.email}</div>

          <div className="mb-6">
            <div className="mb-2.5 text-[11px] font-bold tracking-wide text-admin-text3">ITENS E PERSONALIZAÇÃO</div>
            <div className="flex flex-col gap-2.5">
              {detail.items.map((it, i) => (
                <div key={i} className="flex justify-between rounded-md bg-admin-input px-3.5 py-3">
                  <div>
                    <div className="text-[13px] font-semibold text-white">{it.name}</div>
                    <div className="mt-0.5 text-[11.5px] text-admin-text3">
                      Tam {it.size} · {it.customName || it.customNumber ? `${it.customName ?? ""} ${it.customNumber ?? ""}`.trim() : "sem personalização"} · Qtd {it.qty}
                    </div>
                  </div>
                  <div className="text-[13px] text-white">{fmtBRL(it.unitPrice * it.qty)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6 flex flex-col gap-2 border-t border-white/8 pt-4 text-[13px] text-admin-text2">
            <div className="flex justify-between">
              <span>Frete</span>
              <span className="text-white">{fmtBRL(detail.shipping)}</span>
            </div>
            <div className="flex justify-between">
              <span>Desconto</span>
              <span className="text-white">{fmtBRL(detail.discount)}</span>
            </div>
            <div className="flex justify-between text-[14px] font-bold text-white">
              <span>Total</span>
              <span>{fmtBRL(detail.total)}</span>
            </div>
          </div>

          <div>
            <div className="mb-2.5 text-[11px] font-bold tracking-wide text-admin-text3">ATUALIZAR STATUS</div>
            <div className="flex flex-wrap gap-2">
              {ORDER_STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(detail.orderNumber, s)}
                  className={`cursor-pointer rounded-md px-4 py-[9px] text-xs font-bold ${
                    detail.status === s
                      ? "border-none bg-admin-blue text-white"
                      : "border border-white/15 bg-transparent font-semibold text-admin-text2"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={closeDetail}
            className="mt-6 w-full cursor-pointer rounded-md border border-white/15 bg-transparent py-[13px] text-[13px] font-semibold text-admin-text2"
          >
            Fechar
          </button>
        </Modal>
      )}
    </div>
  );
}
