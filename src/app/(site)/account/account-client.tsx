"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useTransition } from "react";
import { signUpCustomer, signInCustomer, socialSignInCustomer } from "@/lib/actions/account";

const inputClass =
  "w-full box-border rounded-[2px] border border-white/15 bg-[#141414] px-3.5 py-[13px] text-sm text-white outline-none placeholder:text-[#5a5a5a] focus:border-admin-blue";

export function AccountClient() {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [mode, setMode] = useState<"create" | "login">("create");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isCreate = mode === "create";

  async function submit() {
    if (!email.trim() || !password.trim() || (isCreate && !name.trim())) {
      setError("Preencha todos os campos para continuar.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const result = isCreate
        ? await signUpCustomer({ name, email, password, confirmPassword })
        : await signInCustomer({ email, password });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      startTransition(() => router.refresh());
    } finally {
      setSubmitting(false);
    }
  }

  async function socialSignIn(provider: "Google" | "Apple") {
    const emailPrompt = window.prompt(`Simulação de login ${provider} — informe o e-mail da conta:`);
    if (!emailPrompt || !emailPrompt.trim()) return;
    const result = await socialSignInCustomer({ provider, email: emailPrompt });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <section className="mx-auto max-w-[460px] px-6 pb-24 pt-20 sm:px-12 sm:pt-24">
      <h1 className="font-anton mb-3 text-[clamp(30px,4vw,42px)] tracking-wide text-white">
        {isCreate ? "CRIE SUA CONTA" : "ENTRAR NA CONTA"}
      </h1>
      <p className="mb-8 text-sm text-[#9CA3AF]">
        {isCreate ? "Acompanhe pedidos e agilize suas próximas compras." : "Acesse sua conta RP10FUT."}
      </p>

      <div className="mb-8 flex w-fit gap-0 rounded-[2px] border border-white/15">
        <button
          onClick={() => {
            setMode("create");
            setError("");
          }}
          className={`cursor-pointer border-none px-[22px] py-3 text-xs font-bold tracking-[0.5px] ${
            isCreate ? "bg-admin-blue text-white" : "bg-transparent text-[#9CA3AF]"
          }`}
        >
          CRIAR CONTA
        </button>
        <button
          onClick={() => {
            setMode("login");
            setError("");
          }}
          className={`cursor-pointer border-none px-[22px] py-3 text-xs font-bold tracking-[0.5px] ${
            !isCreate ? "bg-admin-blue text-white" : "bg-transparent text-[#9CA3AF]"
          }`}
        >
          ENTRAR
        </button>
      </div>

      <div className="mb-6 flex flex-col gap-2.5">
        <button
          onClick={() => socialSignIn("Google")}
          className="flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-[2px] border-none bg-white px-4 py-3.5 text-[13px] font-bold text-[#1f1f1f]"
        >
          <svg width="17" height="17" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.81z" />
            <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.92l-3.88-3c-1.08.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.94H1.28v3.1A12 12 0 0 0 12 24z" />
            <path fill="#FBBC05" d="M5.29 14.29a7.2 7.2 0 0 1 0-4.58v-3.1H1.28a12 12 0 0 0 0 10.78z" />
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.28 6.61l4.01 3.1C6.23 6.86 8.88 4.75 12 4.75z" />
          </svg>
          CONTINUAR COM GOOGLE
        </button>
        <button
          onClick={() => socialSignIn("Apple")}
          className="flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-[2px] border border-white/20 bg-black px-4 py-3.5 text-[13px] font-bold text-white"
        >
          <svg width="15" height="17" viewBox="0 0 384 512" fill="#fff">
            <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141 0 184.8 0 273.5c0 26.2 4.8 53.3 14.4 81.2 12.8 37.5 59 129.3 107.2 127.8 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-84.1 102.6-121.7-65.2-30.7-57.7-90-57.7-92.1zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
          </svg>
          CONTINUAR COM APPLE
        </button>
      </div>

      <div className="mb-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-[11.5px] text-[#8a8f99]">OU</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <div className="flex flex-col gap-3.5">
        {isCreate && <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome completo" className={inputClass} />}
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" className={inputClass} />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" className={inputClass} />
        {isCreate && (
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirmar senha"
            className={inputClass}
          />
        )}
      </div>

      {error && <div className="mt-3.5 text-[12.5px] text-[#f87171]">{error}</div>}

      <button
        onClick={submit}
        disabled={submitting}
        className="mt-6 w-full cursor-pointer rounded-[2px] border-none bg-admin-blue py-4 text-[13px] font-bold tracking-wide text-white hover:bg-admin-blue-hover disabled:opacity-60"
      >
        {submitting ? "..." : isCreate ? "CRIAR CONTA" : "ENTRAR"}
      </button>

      <p className="mt-6 text-center text-xs text-[#8a8f99]">
        Prefere comprar sem conta?{" "}
        <Link href="/checkout" className="text-admin-blue no-underline">
          Finalize como visitante
        </Link>
        .
      </p>
    </section>
  );
}
