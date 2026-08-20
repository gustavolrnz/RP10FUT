"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { addStaff, removeStaff } from "@/lib/actions/staff";
import { useToast } from "@/components/admin/toast-provider";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { DangerButton, PrimaryButton } from "@/components/admin/ui";

type Staff = { id: string; name: string; email: string; role: "general_admin" | "operational" };

export function UsersClient({ staff, currentEmail }: { staff: Staff[]; currentEmail: string }) {
  const router = useRouter();
  const toast = useToast();
  const [, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"operational" | "general_admin">("operational");
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState<{ message: string; action: () => void } | null>(null);

  async function submit() {
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast("Preencha nome, e-mail e senha.", "danger");
      return;
    }
    setSaving(true);
    try {
      const result = await addStaff({ name, email, password, role });
      if (!result.ok) {
        toast(result.error, "danger");
        return;
      }
      toast("Membro da equipe adicionado.", "success");
      setName("");
      setEmail("");
      setPassword("");
      setRole("operational");
      startTransition(() => router.refresh());
    } finally {
      setSaving(false);
    }
  }

  function askRemove(s: Staff) {
    setConfirm({
      message: `Remover acesso de ${s.name}?`,
      action: async () => {
        const result = await removeStaff(s.id);
        if (result && !result.ok) {
          toast(result.error, "danger");
        } else {
          toast("Acesso removido.", "danger");
        }
        setConfirm(null);
        startTransition(() => router.refresh());
      },
    });
  }

  return (
    <div>
      <h1 className="mb-6 text-[22px] font-bold text-white">Usuários</h1>

      <div className="mb-6 max-w-[640px] rounded-lg border border-admin-border bg-admin-panel p-[22px]">
        <div className="mb-4 text-[13px] font-bold text-admin-text">ADICIONAR MEMBRO DA EQUIPE</div>
        <div className="mb-3 grid grid-cols-2 gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome"
            className="rounded-md border border-white/10 bg-admin-input px-3 py-2.5 text-[13px] text-white outline-none"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail"
            className="rounded-md border border-white/10 bg-admin-input px-3 py-2.5 text-[13px] text-white outline-none"
          />
        </div>
        <div className="mb-4 grid grid-cols-2 gap-3">
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha provisória"
            className="rounded-md border border-white/10 bg-admin-input px-3 py-2.5 text-[13px] text-white outline-none"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "operational" | "general_admin")}
            className="rounded-md border border-white/10 bg-admin-input px-3 py-2.5 text-[13px] text-white outline-none"
          >
            <option value="operational">Equipe operacional</option>
            <option value="general_admin">Admin geral</option>
          </select>
        </div>
        <PrimaryButton onClick={submit} disabled={saving}>
          {saving ? "Adicionando..." : "Adicionar"}
        </PrimaryButton>
      </div>

      <div className="overflow-hidden rounded-lg border border-admin-border bg-admin-panel">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-admin-panel-alt text-left text-[11px] tracking-wide text-admin-text3">
              <th className="px-4 py-3 font-semibold">NOME</th>
              <th className="p-3 font-semibold">E-MAIL</th>
              <th className="p-3 font-semibold">PERMISSÃO</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.id} className="border-t border-white/6">
                <td className="px-4 py-3.5 text-[13px] font-semibold text-white">{s.name}</td>
                <td className="p-3 text-[12.5px] text-admin-text2">{s.email}</td>
                <td className="p-3 text-[12.5px] text-admin-text2">
                  {s.role === "general_admin" ? "Admin geral" : "Equipe operacional"}
                </td>
                <td className="px-4 py-3.5 text-right">
                  {s.email.toLowerCase() !== currentEmail.toLowerCase() && (
                    <DangerButton onClick={() => askRemove(s)}>Remover</DangerButton>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {confirm && <ConfirmDialog message={confirm.message} onConfirm={confirm.action} onCancel={() => setConfirm(null)} />}
    </div>
  );
}
