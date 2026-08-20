"use client";

export function PrimaryButton(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode },
) {
  const { className = "", ...rest } = props;
  return (
    <button
      {...rest}
      className={`cursor-pointer rounded-md border-none bg-admin-blue px-5 py-[11px] text-[13px] font-bold text-white transition-colors hover:bg-admin-blue-hover disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    />
  );
}

export function GhostButton(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode },
) {
  const { className = "", ...rest } = props;
  return (
    <button
      {...rest}
      className={`cursor-pointer rounded border border-white/12 bg-transparent px-3 py-1.5 text-[11.5px] text-admin-text2 transition-colors hover:text-white ${className}`}
    />
  );
}

export function DangerButton(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode },
) {
  const { className = "", ...rest } = props;
  return (
    <button
      {...rest}
      className={`cursor-pointer rounded border border-red-500/30 bg-transparent px-3 py-1.5 text-[11.5px] text-admin-red-text transition-colors hover:bg-red-500/10 ${className}`}
    />
  );
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Pendente: "bg-[rgba(250,204,21,0.15)] text-admin-yellow",
    "Em produção": "bg-[rgba(46,124,246,0.15)] text-admin-lightblue",
    Enviado: "bg-[rgba(168,85,247,0.15)] text-admin-purple",
    Entregue: "bg-[rgba(34,197,94,0.15)] text-admin-greentext",
  };
  return (
    <span
      className={`rounded px-2.5 py-1 text-[11.5px] font-bold ${styles[status] || styles.Pendente}`}
    >
      {status}
    </span>
  );
}

export function ActiveBadge({ active, activeLabel = "Ativo", inactiveLabel = "Inativo" }: { active: boolean; activeLabel?: string; inactiveLabel?: string }) {
  return (
    <span
      className={`rounded px-2.5 py-1 text-[11px] font-bold ${
        active ? "bg-[rgba(34,197,94,0.15)] text-admin-greentext" : "bg-white/8 text-admin-text3"
      }`}
    >
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}

export function Pagination({
  page,
  pageCount,
  makeHref,
}: {
  page: number;
  pageCount: number;
  makeHref: (page: number) => string;
}) {
  return (
    <div className="mt-4 flex items-center justify-between">
      <span className="text-xs text-admin-text3">
        Página {page} de {pageCount}
      </span>
      <div className="flex gap-2">
        <a
          href={page > 1 ? makeHref(page - 1) : undefined}
          aria-disabled={page <= 1}
          className={`rounded border border-white/12 px-3.5 py-[7px] text-xs text-admin-text2 ${
            page <= 1 ? "pointer-events-none opacity-40" : "hover:text-white"
          }`}
        >
          Anterior
        </a>
        <a
          href={page < pageCount ? makeHref(page + 1) : undefined}
          aria-disabled={page >= pageCount}
          className={`rounded border border-white/12 px-3.5 py-[7px] text-xs text-admin-text2 ${
            page >= pageCount ? "pointer-events-none opacity-40" : "hover:text-white"
          }`}
        >
          Próxima
        </a>
      </div>
    </div>
  );
}
