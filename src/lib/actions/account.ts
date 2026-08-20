"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";
import { signIn, signOut } from "@/auth";

const signUpSchema = z.object({
  name: z.string().trim().min(1, "Preencha todos os campos para continuar."),
  email: z.string().trim().email("Preencha todos os campos para continuar.").transform((s) => s.toLowerCase()),
  password: z.string().min(1, "Preencha todos os campos para continuar."),
});

export async function signUpCustomer(input: { name: string; email: string; password: string; confirmPassword: string }) {
  if (!input.name.trim() || !input.email.trim() || !input.password.trim()) {
    return { ok: false as const, error: "Preencha todos os campos para continuar." };
  }
  if (input.password !== input.confirmPassword) {
    return { ok: false as const, error: "As senhas não coincidem." };
  }
  const data = signUpSchema.parse(input);

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    return { ok: false as const, error: "Já existe uma conta com este e-mail." };
  }

  const passwordHash = await bcrypt.hash(data.password, 12);
  await prisma.user.create({ data: { name: data.name.trim(), email: data.email, passwordHash } });

  return signInCustomer({ email: data.email, password: data.password });
}

export async function signInCustomer(input: { email: string; password: string }) {
  try {
    await signIn("customer", { email: input.email, password: input.password, redirect: false });
    return { ok: true as const };
  } catch (e) {
    if (e instanceof AuthError) {
      return { ok: false as const, error: "E-mail ou senha incorretos." };
    }
    throw e;
  }
}

export async function socialSignInCustomer(input: { provider: "Google" | "Apple"; email: string }) {
  const email = input.email.trim().toLowerCase();
  if (!email) return { ok: false as const, error: "Informe um e-mail." };
  try {
    await signIn("social-simulated", {
      provider: input.provider,
      email,
      name: email.split("@")[0],
      redirect: false,
    });
    return { ok: true as const };
  } catch (e) {
    if (e instanceof AuthError) return { ok: false as const, error: "Não foi possível entrar." };
    throw e;
  }
}

export async function logoutCustomer() {
  await signOut({ redirectTo: "/" });
}
