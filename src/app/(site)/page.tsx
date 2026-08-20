import { getAllMedia } from "@/lib/data/settings";
import { listCompetitions } from "@/lib/data/storefront";
import { HeroVideo } from "@/components/site/hero-video";
import { Ticker, CompetitionsGrid, SocialProof, FinalCta } from "@/components/site/home-sections";

export default async function HomePage() {
  const [media, competitions] = await Promise.all([getAllMedia(), listCompetitions()]);
  const heroVideoSrc = media.heroVideo || "/assets/hero-video.mp4";

  return (
    <>
      <section className="relative flex h-[88vh] min-h-[600px] items-end overflow-hidden">
        <HeroVideo src={heroVideoSrc} />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0.25)_0%,rgba(10,10,10,0.55)_60%,#0A0A0A_100%)]" />
        <div className="relative mx-auto w-full max-w-[1440px] px-5 pb-[90px] sm:px-12">
          <h1 className="animate-hero-headline font-anton mb-8 max-w-[900px] text-[clamp(52px,7.5vw,112px)] leading-[0.93] tracking-[0.5px] text-white text-pretty">
            VISTA A HISTÓRIA
            <br />
            DO SEU TIME.
          </h1>
          <a
            href="/catalog"
            className="animate-hero-cta inline-block rounded-[2px] bg-admin-blue px-[42px] py-[19px] text-sm font-bold tracking-[1.4px] text-white no-underline hover:bg-admin-blue-hover"
          >
            VER CATÁLOGO
          </a>
        </div>
      </section>

      <Ticker />

      <section className="mx-auto max-w-[1440px] px-5 pt-[140px] sm:px-12">
        <div className="mb-16 grid grid-cols-[auto_1fr] gap-14">
          <div className="font-anton leading-[0.8] tracking-[0.5px] text-admin-blue text-[clamp(80px,11vw,160px)]">&ldquo;</div>
          <blockquote className="mt-4 m-0">
            <p className="font-anton m-0 max-w-[820px] text-[clamp(26px,3.4vw,40px)] leading-[1.25] tracking-[0.3px] text-white">
              NÃO VENDEMOS CAMISA. VENDEMOS O MOMENTO EM QUE VOCÊ VESTE A SUA HISTÓRIA.
            </p>
          </blockquote>
        </div>
        <div className="grid grid-cols-1 gap-14 border-t border-white/10 pt-14 sm:grid-cols-[220px_1fr]">
          <div className="text-xs font-bold tracking-[1.5px] text-[#9CA3AF]">MANIFESTO</div>
          <div className="flex max-w-[720px] flex-col gap-6 text-[18px] leading-[1.85] text-[#e5e5e5]">
            <p className="m-0">
              A RP10FUT nasceu de uma ideia simples: uma camisa de futebol carrega mais do que um escudo e uma cor. Ela carrega uma
              torcida, uma data, um jogo assistido ao lado de alguém que importa.
            </p>
            <p className="m-0">
              Colocar o nome e o número que você escolhe transforma a peça em algo pessoal. Não é mais &ldquo;uma camisa do
              time&rdquo;, é a sua história com aquele time, impressa e usável.
            </p>
            <p className="m-0 text-[#9CA3AF]">
              Trabalhamos com as principais competições do mundo: Brasileirão, seleções nacionais, Premier League, La Liga,
              Bundesliga, Serie A e Ligue 1. Não importa qual seja a sua paixão, você encontra a camisa certa e a veste do seu jeito.
            </p>
          </div>
        </div>
      </section>

      <CompetitionsGrid competitions={competitions} />
      <SocialProof media={media} />
      <FinalCta />
    </>
  );
}
