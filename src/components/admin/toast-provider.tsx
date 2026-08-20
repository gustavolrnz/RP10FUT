"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

type ToastType = "success" | "danger";
type ToastState = { message: string; type: ToastType; visible: boolean };

const ToastContext = createContext<((message: string, type?: ToastType) => void) | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState>({ message: "", type: "success", visible: false });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((message: string, type: ToastType = "success") => {
    setToast({ message, type, visible: true });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast((s) => ({ ...s, visible: false })), 2600);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      {toast.visible && (
        <div
          className="fixed bottom-6 right-6 z-[500] rounded-md px-[22px] py-3.5 text-[13px] font-semibold text-white shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
          style={{ backgroundColor: toast.type === "danger" ? "#b91c1c" : "#16803d" }}
        >
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  );
}
