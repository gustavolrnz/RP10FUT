import { auth } from "@/auth";
import { logoutCustomer } from "@/lib/actions/account";
import { AccountClient } from "./account-client";

export default async function AccountPage() {
  const session = await auth();
  const loggedIn = session?.user?.kind === "customer";

  if (loggedIn) {
    const name = session.user.name || "";
    const email = session.user.email || "";
    const initial = name.trim() ? name.trim()[0].toUpperCase() : "?";
    return (
      <section className="mx-auto max-w-[560px] px-6 pb-24 pt-20 sm:px-12 sm:pt-28">
        <div className="mb-6 flex h-[60px] w-[60px] items-center justify-center rounded-full border border-white/10 bg-[#141414] font-anton text-[22px] text-admin-blue">
          {initial}
        </div>
        <h1 className="font-anton mb-2 text-[clamp(28px,4vw,38px)] tracking-wide text-white">OLÁ, {name.toUpperCase()}</h1>
        <p className="mb-10 text-sm text-[#9CA3AF]">{email}</p>
        <div className="flex flex-col gap-3">
          <a href="/orders" className="flex items-center justify-between border border-white/8 bg-[#141414] px-5 py-[18px] text-sm font-semibold text-white no-underline hover:border-white/25">
            <span>Meus pedidos</span>
            <span className="text-[#8a8f99]">›</span>
          </a>
          <a href="/catalog" className="flex items-center justify-between border border-white/8 bg-[#141414] px-5 py-[18px] text-sm font-semibold text-white no-underline hover:border-white/25">
            <span>Continuar comprando</span>
            <span className="text-[#8a8f99]">›</span>
          </a>
        </div>
        <form action={logoutCustomer}>
          <button
            type="submit"
            className="mt-8 cursor-pointer rounded-[2px] border border-white/20 bg-transparent px-6 py-3.5 text-[13px] font-semibold tracking-wide text-[#9CA3AF] hover:border-white hover:text-white"
          >
            SAIR DA CONTA
          </button>
        </form>
      </section>
    );
  }

  return <AccountClient />;
}
