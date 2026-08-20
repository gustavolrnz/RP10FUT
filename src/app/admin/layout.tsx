export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-admin-bg font-sans text-admin-text">{children}</div>;
}
