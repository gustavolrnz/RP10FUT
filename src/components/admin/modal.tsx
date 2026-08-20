"use client";

export function Modal({
  onClose,
  width = 460,
  children,
}: {
  onClose: () => void;
  width?: number;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="max-h-[88vh] overflow-y-auto rounded-[10px] border border-white/10 bg-admin-panel p-8"
        style={{ width }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[11.5px] text-admin-text3">{label}</label>
      {children}
    </div>
  );
}

export const inputClass =
  "w-full rounded-md border border-white/10 bg-admin-input px-3 py-2.5 text-[13.5px] text-white font-sans outline-none focus:border-admin-blue";
