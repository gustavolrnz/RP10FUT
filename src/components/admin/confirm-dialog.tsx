"use client";

export function ConfirmDialog({
  message,
  onConfirm,
  onCancel,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/60">
      <div className="w-[380px] rounded-[10px] border border-white/10 bg-admin-panel p-7">
        <div className="mb-[22px] text-[15px] leading-relaxed font-semibold text-white">{message}</div>
        <div className="flex gap-2.5">
          <button
            onClick={onConfirm}
            className="flex-1 rounded-md border-none bg-admin-red-text px-3 py-3 text-[13px] font-bold text-admin-panel cursor-pointer"
          >
            Confirmar
          </button>
          <button
            onClick={onCancel}
            className="rounded-md border border-admin-border-strong bg-transparent px-5 py-3 text-[13px] font-semibold text-admin-text2 cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
