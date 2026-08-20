"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateCustomizationFee } from "@/lib/actions/settings";
import { useToast } from "@/components/admin/toast-provider";
import { PrimaryButton } from "@/components/admin/ui";

export function SettingsClient({ customizationFee }: { customizationFee: number }) {
  const router = useRouter();
  const toast = useToast();
  const [, startTransition] = useTransition();
  const [value, setValue] = useState(customizationFee.toFixed(2));
  const [saving, setSaving] = useState(false);

  async function save() {
    const parsed = parseFloat(value.replace(",", "."));
    if (isNaN(parsed) || parsed < 0) {
      toast("Informe um valor válido.", "danger");
      return;
    }
    setSaving(true);
    try {
      await updateCustomizationFee(parsed);
      toast("Valor da personalização salvo.", "success");
      startTransition(() => router.refresh());
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="mb-2 text-[22px] font-bold text-white">Ajustes</h1>
      <p className="mb-7 text-[13px] text-admin-text3">Valores cobrados sobre os produtos na loja.</p>
      <div className="max-w-[460px] rounded-lg border border-admin-border bg-admin-panel p-6">
        <div className="mb-2 text-[13px] font-bold text-admin-text">PERSONALIZAÇÃO (NOME + NÚMERO)</div>
        <p className="mb-4 text-[12.5px] leading-relaxed text-admin-text3">
          Valor adicional cobrado por peça quando o cliente preenche nome ou número. Use 0 para incluir sem custo.
        </p>
        <div className="flex items-center gap-2.5">
          <span className="text-[13px] text-admin-text2">R$</span>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            aria-label="Valor da personalização"
            className="flex-1 rounded-md border border-white/10 bg-admin-input px-3 py-[11px] text-[14px] text-white outline-none"
          />
          <PrimaryButton onClick={save} disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
