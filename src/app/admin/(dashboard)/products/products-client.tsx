"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import type { ProductDTO } from "@/lib/data/products";
import { createProduct, deleteProduct, toggleProductActive, updateProduct } from "@/lib/actions/products";
import { uploadProductImage } from "@/lib/actions/media";
import { useToast } from "@/components/admin/toast-provider";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Modal, Field, inputClass } from "@/components/admin/modal";
import { PrimaryButton, GhostButton, DangerButton, ActiveBadge, Pagination } from "@/components/admin/ui";
import { SIZES, fmtBRL } from "@/lib/constants";

type Competition = { id: string; label: string };

const EMPTY_DRAFT = {
  id: undefined as string | undefined,
  name: "",
  team: "",
  competitionId: "",
  price: "",
  salePrice: "",
  imageAltText: "",
  images: [] as string[],
  active: true,
  stock: { P: "0", M: "0", G: "0", GG: "0", XG: "0" },
};

export function ProductsClient({
  rows,
  page,
  pageCount,
  competitions,
  filters,
}: {
  rows: ProductDTO[];
  page: number;
  pageCount: number;
  competitions: Competition[];
  filters: { q: string; competition: string; stock: string };
}) {
  const router = useRouter();
  const toast = useToast();
  const [, startTransition] = useTransition();

  const [q, setQ] = useState(filters.q);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<"new" | "edit">("new");
  const [draft, setDraft] = useState({ ...EMPTY_DRAFT, competitionId: competitions[0]?.id || "" });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [confirm, setConfirm] = useState<{ message: string; action: () => void } | null>(null);

  function pushFilters(next: Partial<typeof filters>, resetPage = true) {
    const merged = { ...filters, ...next };
    const params = new URLSearchParams();
    if (merged.q) params.set("q", merged.q);
    if (merged.competition && merged.competition !== "all") params.set("competition", merged.competition);
    if (merged.stock && merged.stock !== "all") params.set("stock", merged.stock);
    if (!resetPage && page > 1) params.set("page", String(page));
    router.push(`/admin/products?${params.toString()}`);
  }

  function onSearchChange(value: string) {
    setQ(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => pushFilters({ q: value }), 300);
  }

  function openNew() {
    setMode("new");
    setDraft({ ...EMPTY_DRAFT, competitionId: competitions[0]?.id || "" });
    setModalOpen(true);
  }

  function openEdit(p: ProductDTO) {
    setMode("edit");
    setDraft({
      id: p.id,
      name: p.name,
      team: p.team,
      competitionId: p.competitionId,
      price: String(p.price),
      salePrice: p.salePrice ? String(p.salePrice) : "",
      imageAltText: p.imageAltText,
      images: [...p.images],
      active: p.active,
      stock: { P: String(p.stock.P), M: String(p.stock.M), G: String(p.stock.G), GG: String(p.stock.GG), XG: String(p.stock.XG) },
    });
    setModalOpen(true);
  }

  async function onImagesSelected(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const result = await uploadProductImage(file);
        if (result.ok) uploaded.push(result.url);
        else toast(result.error, "danger");
      }
      setDraft((d) => ({ ...d, images: [...d.images, ...uploaded] }));
    } finally {
      setUploading(false);
    }
  }

  async function saveDraft() {
    const price = parseFloat(draft.price.replace(",", "."));
    if (!draft.name.trim() || !draft.team.trim() || isNaN(price)) {
      toast("Preencha nome, time e preço válidos.", "danger");
      return;
    }
    setSaving(true);
    try {
      const input = {
        name: draft.name,
        team: draft.team,
        competitionId: draft.competitionId,
        price,
        salePrice: draft.salePrice.trim() ? parseFloat(draft.salePrice.replace(",", ".")) : null,
        imageAltText: draft.imageAltText,
        images: draft.images,
        active: draft.active,
        stock: {
          P: Number(draft.stock.P) || 0,
          M: Number(draft.stock.M) || 0,
          G: Number(draft.stock.G) || 0,
          GG: Number(draft.stock.GG) || 0,
          XG: Number(draft.stock.XG) || 0,
        },
      };
      if (mode === "new") await createProduct(input);
      else await updateProduct(draft.id!, input);
      toast("Produto salvo com sucesso.", "success");
      setModalOpen(false);
      startTransition(() => router.refresh());
    } catch {
      toast("Não foi possível salvar. Verifique os campos.", "danger");
    } finally {
      setSaving(false);
    }
  }

  function askDelete(p: ProductDTO) {
    setConfirm({
      message: `Excluir "${p.name}" permanentemente?`,
      action: async () => {
        await deleteProduct(p.id);
        toast("Produto excluído.", "danger");
        setConfirm(null);
        startTransition(() => router.refresh());
      },
    });
  }

  async function onToggleActive(p: ProductDTO) {
    await toggleProductActive(p.id);
    toast("Status do produto atualizado.", "success");
    startTransition(() => router.refresh());
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-[22px] font-bold text-white">Produtos</h1>
        <PrimaryButton onClick={openNew}>+ Novo produto</PrimaryButton>
      </div>

      <div className="mb-[18px] flex flex-wrap gap-3">
        <input
          value={q}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por nome ou time..."
          className="min-w-[220px] flex-1 rounded-md border border-white/10 bg-admin-panel px-3.5 py-2.5 text-[13px] text-white outline-none"
        />
        <select
          value={filters.competition}
          onChange={(e) => pushFilters({ competition: e.target.value })}
          className="rounded-md border border-white/10 bg-admin-panel px-3.5 py-2.5 text-[13px] text-white outline-none"
        >
          <option value="all">Todas as competições</option>
          {competitions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        <select
          value={filters.stock}
          onChange={(e) => pushFilters({ stock: e.target.value })}
          className="rounded-md border border-white/10 bg-admin-panel px-3.5 py-2.5 text-[13px] text-white outline-none"
        >
          <option value="all">Todo estoque</option>
          <option value="low">Estoque baixo</option>
          <option value="out">Sem estoque</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-lg border border-admin-border bg-admin-panel">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-admin-panel-alt text-left text-[11px] tracking-wide text-admin-text3">
              <th className="px-4 py-3 font-semibold">PRODUTO</th>
              <th className="p-3 font-semibold">COMPETIÇÃO</th>
              <th className="p-3 font-semibold">PREÇO</th>
              <th className="p-3 font-semibold">ESTOQUE</th>
              <th className="p-3 font-semibold">STATUS</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[13px] text-admin-text3">
                  Nenhum produto encontrado.
                </td>
              </tr>
            )}
            {rows.map((p) => (
              <tr key={p.id} className="border-t border-white/6">
                <td className="px-4 py-3.5">
                  <div className="text-[13.5px] font-semibold text-white">{p.name}</div>
                  <div className="mt-0.5 text-[11.5px] text-admin-text3">{p.team}</div>
                </td>
                <td className="p-3 text-[12.5px] text-admin-text2">{p.competitionLabel}</td>
                <td className="p-3 text-[12.5px] text-white">
                  {p.salePrice ? `${fmtBRL(p.salePrice)} (de ${fmtBRL(p.price)})` : fmtBRL(p.price)}
                </td>
                <td className="p-3">
                  <span
                    className={`text-xs font-bold ${
                      p.totalStock === 0 ? "text-admin-red-text" : p.lowStock ? "text-admin-yellow" : "text-admin-text2 font-normal"
                    }`}
                  >
                    {p.totalStock} un.
                  </span>
                </td>
                <td className="p-3">
                  <ActiveBadge active={p.active} />
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-right">
                  <GhostButton className="mr-1.5" onClick={() => openEdit(p)}>
                    Editar
                  </GhostButton>
                  <GhostButton className="mr-1.5" onClick={() => onToggleActive(p)}>
                    {p.active ? "Desativar" : "Ativar"}
                  </GhostButton>
                  <DangerButton onClick={() => askDelete(p)}>Excluir</DangerButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} pageCount={pageCount} makeHref={(p) => `?${new URLSearchParams({ ...(filters.q ? { q: filters.q } : {}), ...(filters.competition !== "all" ? { competition: filters.competition } : {}), ...(filters.stock !== "all" ? { stock: filters.stock } : {}), page: String(p) }).toString()}`} />

      {modalOpen && (
        <Modal onClose={() => setModalOpen(false)} width={600}>
          <div className="mb-6 text-lg font-bold text-white">{mode === "new" ? "Novo produto" : "Editar produto"}</div>
          <div className="flex flex-col gap-3.5">
            <Field label="NOME DO PRODUTO">
              <input className={inputClass} value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="TIME">
                <input className={inputClass} value={draft.team} onChange={(e) => setDraft((d) => ({ ...d, team: e.target.value }))} />
              </Field>
              <Field label="COMPETIÇÃO">
                <select
                  className={inputClass}
                  value={draft.competitionId}
                  onChange={(e) => setDraft((d) => ({ ...d, competitionId: e.target.value }))}
                >
                  {competitions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="PREÇO (R$)">
                <input className={inputClass} value={draft.price} onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value }))} />
              </Field>
              <Field label="PREÇO PROMOCIONAL (opcional)">
                <input className={inputClass} value={draft.salePrice} onChange={(e) => setDraft((d) => ({ ...d, salePrice: e.target.value }))} />
              </Field>
            </div>
            <Field label="DESCRIÇÃO DA FOTO PRINCIPAL (usada se não houver foto real)">
              <input className={inputClass} value={draft.imageAltText} onChange={(e) => setDraft((d) => ({ ...d, imageAltText: e.target.value }))} />
            </Field>
            <div>
              <label className="mb-2 block text-[11.5px] text-admin-text3">FOTOS DO PRODUTO</label>
              <div className="mb-2.5 flex flex-wrap gap-2.5">
                {draft.images.map((src, i) => (
                  <div key={i} className="relative h-16 w-16 overflow-hidden rounded">
                    <Image src={src} alt="" fill unoptimized className="object-cover" />
                    <button
                      type="button"
                      onClick={() => setDraft((d) => ({ ...d, images: d.images.filter((_, idx) => idx !== i) }))}
                      className="absolute right-0.5 top-0.5 flex h-[18px] w-[18px] cursor-pointer items-center justify-center rounded-full border-none bg-black/70 text-[11px] leading-none text-white"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <input type="file" accept="image/*" multiple disabled={uploading} onChange={(e) => onImagesSelected(e.target.files)} className="text-xs text-admin-text2" />
              {uploading && <div className="mt-1.5 text-xs text-admin-text3">Enviando...</div>}
            </div>
            <div>
              <label className="mb-2.5 block text-[11.5px] text-admin-text3">ESTOQUE POR TAMANHO</label>
              <div className="grid grid-cols-5 gap-2.5">
                {SIZES.map((sz) => (
                  <div key={sz}>
                    <div className="mb-1.5 text-center text-[11px] text-admin-text2">{sz}</div>
                    <input
                      type="number"
                      min={0}
                      value={draft.stock[sz]}
                      onChange={(e) => setDraft((d) => ({ ...d, stock: { ...d.stock, [sz]: e.target.value } }))}
                      className="w-full rounded-md border border-white/10 bg-admin-input px-2 py-[9px] text-center text-[13px] text-white outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
            <label className="mt-1.5 flex cursor-pointer items-center gap-2.5">
              <input
                type="checkbox"
                checked={draft.active}
                onChange={(e) => setDraft((d) => ({ ...d, active: e.target.checked }))}
                className="h-4 w-4 accent-admin-blue"
              />
              <span className="text-[13px] text-admin-text">Ativo no catálogo público</span>
            </label>
          </div>
          <div className="mt-7 flex gap-2.5">
            <PrimaryButton className="flex-1 py-[13px]" disabled={saving} onClick={saveDraft}>
              {saving ? "Salvando..." : "Salvar produto"}
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

      {confirm && <ConfirmDialog message={confirm.message} onConfirm={confirm.action} onCancel={() => setConfirm(null)} />}
    </div>
  );
}
