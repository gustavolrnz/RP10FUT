"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { CouponDTO } from "@/lib/data/coupons";
import { createCoupon, toggleCouponActive, updateCoupon } from "@/lib/actions/coupons";
import { useToast } from "@/components/admin/toast-provider";
import { Modal, Field, inputClass } from "@/components/admin/modal";
import { PrimaryButton, GhostButton, ActiveBadge } from "@/components/admin/ui";
import { fmtBRL } from "@/lib/constants";

const EMPTY_DRAFT = {
  id: undefined as string | undefined,
  code: "",
  type: "percentage" as "percentage" | "fixed",
  value: "",
  expiresAt: "",
  usageLimit: "",
};

export function CouponsClient({ coupons }: { coupons: CouponDTO[] }) {
  const router = useRouter();
  const toast = useToast();
  const [, startTransition] = useTransition();

  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<"new" | "edit">("new");
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [saving, setSaving] = useState(false);

  function openNew() {
    setMode("new");
    setDraft(EMPTY_DRAFT);
    setModalOpen(true);
  }

  function openEdit(c: CouponDTO) {
    setMode("edit");
    setDraft({ id: c.id, code: c.code, type: c.type, value: String(c.value), expiresAt: c.expiresAt, usageLimit: String(c.usageLimit) });
    setModalOpen(true);
  }

  async function save() {
    const value = parseFloat(draft.value.replace(",", "."));
    const usageLimit = parseInt(draft.usageLimit, 10);
    if (!draft.code.trim() || isNaN(value) || !draft.expiresAt || isNaN(usageLimit)) {
      toast("Preencha todos os campos do cupom.", "danger");
      return;
    }
    setSaving(true);
    try {
      const input = { code: draft.code, type: draft.type, value, expiresAt: draft.expiresAt, usageLimit };
      const result = mode === "new" ? await createCoupon(input) : await updateCoupon(draft.id!, input);
      if (!result.ok) {
        toast(result.error, "danger");
        return;
      }
      toast("Cupom salvo com sucesso.", "success");
      setModalOpen(false);
      startTransition(() => router.refresh());
    } finally {
      setSaving(false);
    }
  }

  async function onToggle(c: CouponDTO) {
    await toggleCouponActive(c.id);
    toast("Status do cupom atualizado.", "success");
    startTransition(() => router.refresh());
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-[22px] font-bold text-white">Cupons</h1>
        <PrimaryButton onClick={openNew}>+ Novo cupom</PrimaryButton>
      </div>

      <div className="overflow-hidden rounded-lg border border-admin-border bg-admin-panel">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-admin-panel-alt text-left text-[11px] tracking-wide text-admin-text3">
              <th className="px-4 py-3 font-semibold">CÓDIGO</th>
              <th className="p-3 font-semibold">DESCONTO</th>
              <th className="p-3 font-semibold">VALIDADE</th>
              <th className="p-3 font-semibold">USO</th>
              <th className="p-3 font-semibold">STATUS</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[13px] text-admin-text3">
                  Nenhum cupom cadastrado.
                </td>
              </tr>
            )}
            {coupons.map((c) => (
              <tr key={c.id} className="border-t border-white/6">
                <td className="px-4 py-3.5 font-mono text-[13px] font-bold text-white">{c.code}</td>
                <td className="p-3 text-[12.5px] text-admin-text2">{c.type === "percentage" ? `${c.value}%` : fmtBRL(c.value)}</td>
                <td className="p-3 text-[12.5px] text-admin-text2">{c.expiresAt}</td>
                <td className="p-3 text-[12.5px] text-admin-text2">
                  {c.usedCount} / {c.usageLimit}
                </td>
                <td className="p-3">
                  <ActiveBadge active={c.active} />
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-right">
                  <GhostButton className="mr-1.5" onClick={() => openEdit(c)}>
                    Editar
                  </GhostButton>
                  <GhostButton onClick={() => onToggle(c)}>{c.active ? "Desativar" : "Ativar"}</GhostButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <Modal onClose={() => setModalOpen(false)}>
          <div className="mb-6 text-lg font-bold text-white">{mode === "new" ? "Novo cupom" : "Editar cupom"}</div>
          <div className="flex flex-col gap-3.5">
            <Field label="CÓDIGO DO CUPOM">
              <input
                className={`${inputClass} uppercase`}
                value={draft.code}
                onChange={(e) => setDraft((d) => ({ ...d, code: e.target.value }))}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="TIPO">
                <select
                  className={inputClass}
                  value={draft.type}
                  onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value as "percentage" | "fixed" }))}
                >
                  <option value="percentage">Percentual (%)</option>
                  <option value="fixed">Valor fixo (R$)</option>
                </select>
              </Field>
              <Field label="VALOR">
                <input className={inputClass} value={draft.value} onChange={(e) => setDraft((d) => ({ ...d, value: e.target.value }))} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="EXPIRA EM">
                <input
                  type="date"
                  className={inputClass}
                  value={draft.expiresAt}
                  onChange={(e) => setDraft((d) => ({ ...d, expiresAt: e.target.value }))}
                />
              </Field>
              <Field label="LIMITE DE USOS">
                <input className={inputClass} value={draft.usageLimit} onChange={(e) => setDraft((d) => ({ ...d, usageLimit: e.target.value }))} />
              </Field>
            </div>
          </div>
          <div className="mt-7 flex gap-2.5">
            <PrimaryButton className="flex-1 py-[13px]" disabled={saving} onClick={save}>
              {saving ? "Salvando..." : "Salvar cupom"}
            </PrimaryButton>
            <button
              onClick={() => setModalOpen(false)}
              className="cursor-pointer rounded-md border border-white/15 bg-transparent px-[22px] py-[13px] text-[13.5px] font-semibold text-admin-text2"
            >
              Cancelar
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
