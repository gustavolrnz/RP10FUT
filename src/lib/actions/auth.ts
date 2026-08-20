"use server";

import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";

export async function logout() {
  await signOut({ redirectTo: "/" });
}

/** Admin login's "already signed in as a matching staff e-mail" shortcut. */
export async function bypassStaffSignIn() {
  try {
    await signIn("staff-bypass", { redirectTo: "/admin" });
  } catch (e) {
    if (e instanceof AuthError) {
      redirect("/admin/login?error=1");
    }
    throw e;
  }
}
