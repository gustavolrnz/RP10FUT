import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";
import { getAllMedia } from "@/lib/data/settings";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (session?.user?.kind === "staff") redirect("/admin");

  // Already signed in as a customer whose e-mail is on staff -- match the
  // prototype's "no second login" behavior: hand them straight into Admin.
  if (session?.user?.kind === "customer" && session.user.email) {
    const staff = await prisma.staffUser.findUnique({ where: { email: session.user.email } });
    if (staff) {
      try {
        await signIn("staff-bypass", { redirectTo: "/admin" });
      } catch (e) {
        if (!(e instanceof AuthError)) throw e;
      }
    }
  }

  const { error } = await searchParams;
  const media = await getAllMedia();
  const logoSrc = media.logo || "/assets/rp10fut-logo.png";

  async function submit(formData: FormData) {
    "use server";
    try {
      await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirectTo: "/admin",
      });
    } catch (e) {
      if (e instanceof AuthError) {
        redirect("/admin/login?error=1");
      }
      throw e;
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A]">
      <div className="w-full max-w-[400px] px-8 py-10">
        <div className="mb-8 flex justify-center">
          {/* Uploaded/prototype assets vary in size; unoptimized avoids Next's static-size requirement. */}
          <Image src={logoSrc} alt="RP10FUT" height={56} width={140} unoptimized className="h-14 w-auto" />
        </div>
        <h1 className="font-anton mb-2 text-center text-[22px] tracking-wide text-white">
          ÁREA ADMINISTRATIVA
        </h1>
        <p className="mb-8 text-center text-[12.5px] text-[#6b6b6b]">
          Acesso restrito à equipe RP10FUT
        </p>

        <form action={submit} className="flex flex-col gap-3.5">
          <input
            name="email"
            type="email"
            required
            placeholder="E-mail cadastrado"
            className="w-full rounded-[2px] border border-white/15 bg-[#141414] px-3.5 py-[13px] text-sm text-white outline-none placeholder:text-[#5a5a5a] focus:border-admin-blue"
          />
          <input
            name="password"
            type="password"
            required
            placeholder="Senha"
            className="w-full rounded-[2px] border border-white/15 bg-[#141414] px-3.5 py-[13px] text-sm text-white outline-none placeholder:text-[#5a5a5a] focus:border-admin-blue"
          />

          {error && (
            <div className="text-center text-[12.5px] text-admin-red-text">
              E-mail ou senha incorretos, ou não autorizado.
            </div>
          )}

          <button
            type="submit"
            className="mt-2.5 w-full cursor-pointer rounded-[2px] border-none bg-admin-blue py-[15px] text-[13px] font-bold tracking-wide text-white transition-colors hover:bg-admin-blue-hover"
          >
            ENTRAR
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/" className="text-xs text-[#6b6b6b] no-underline">
            Voltar ao site
          </Link>
        </div>
      </div>
    </div>
  );
}
