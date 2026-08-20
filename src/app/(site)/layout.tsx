import { getAllMedia } from "@/lib/data/settings";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { WhatsAppFloat } from "@/components/site/whatsapp-float";
import { MiniCartDrawer } from "@/components/site/mini-cart-drawer";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const media = await getAllMedia();
  const logoSrc = media.logo || "/assets/rp10fut-logo.png";

  return (
    <div className="flex min-h-screen flex-col bg-[#0A0A0A] font-sans">
      <Header logoSrc={logoSrc} />
      <div className="flex-1">{children}</div>
      <Footer logoSrc={logoSrc} />
      <WhatsAppFloat />
      <MiniCartDrawer />
    </div>
  );
}
