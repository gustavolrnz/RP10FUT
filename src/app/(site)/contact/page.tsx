export default function ContactPage() {
  return (
    <section className="mx-auto max-w-[700px] px-6 py-20 text-center sm:py-24">
      <h1 className="font-anton mb-5 text-[clamp(34px,5vw,56px)] tracking-wide text-white">FALE COM A GENTE</h1>
      <p className="mb-14 text-[15px] leading-relaxed text-[#9CA3AF]">
        Dúvidas sobre pedidos, prazos ou personalização? Estamos por perto.
      </p>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <a
          href="https://wa.me/5511943950780"
          target="_blank"
          rel="noreferrer"
          className="flex flex-col items-center gap-4 border border-white/8 bg-[#141414] px-6 py-10 no-underline hover:border-[#22C55E]"
        >
          <svg width="34" height="34" viewBox="0 0 24 24" fill="#22C55E">
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.79.47 3.48 1.32 4.94L2 22l5.28-1.39a9.9 9.9 0 0 0 4.76 1.21h.01c5.46 0 9.9-4.45 9.9-9.91S17.5 2 12.04 2zm0 18.14c-1.48 0-2.93-.4-4.19-1.15l-.3-.18-3.13.82.84-3.05-.2-.31a8.18 8.18 0 0 1-1.26-4.36c0-4.53 3.69-8.22 8.24-8.22 4.54 0 8.23 3.69 8.23 8.22 0 4.54-3.69 8.23-8.23 8.23z" />
          </svg>
          <span className="text-[15px] font-bold text-white">WhatsApp</span>
          <span className="text-[13px] text-[#9CA3AF]">+55 11 94395-0780</span>
        </a>
        <a
          href="https://instagram.com/rp_10fut"
          target="_blank"
          rel="noreferrer"
          className="flex flex-col items-center gap-4 border border-white/8 bg-[#141414] px-6 py-10 no-underline hover:border-admin-blue"
        >
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#2E7CF6" strokeWidth="2">
            <rect x="2" y="2" width="20" height="20" rx="5" />
            <circle cx="12" cy="12" r="4.5" />
            <circle cx="17.5" cy="6.5" r="1" />
          </svg>
          <span className="text-[15px] font-bold text-white">Instagram</span>
          <span className="text-[13px] text-[#9CA3AF]">@rp_10fut</span>
        </a>
      </div>
    </section>
  );
}
