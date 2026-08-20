import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Sidebar } from "@/components/admin/sidebar";
import { ToastProvider } from "@/components/admin/toast-provider";
import { getAllMedia } from "@/lib/data/settings";

export default async function DashboardShellLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.kind !== "staff") redirect("/admin/login");

  const media = await getAllMedia();

  return (
    <ToastProvider>
      <div className="grid min-h-screen grid-cols-[230px_1fr]">
        <Sidebar
          userName={session.user.name || session.user.email || ""}
          role={session.user.role || "operational"}
          logoUrl={media.logo || "/assets/rp10fut-logo.png"}
        />
        <main className="overflow-x-hidden px-10 py-8">{children}</main>
      </div>
    </ToastProvider>
  );
}
