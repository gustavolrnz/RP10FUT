// Every admin page/login reads live Postgres data (staff, products, orders,
// media). Don't let Next try to prerender any of it at build time -- see
// (site)/layout.tsx for why.
export const dynamic = "force-dynamic";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-admin-bg font-sans text-admin-text">{children}</div>;
}
