"use client";

import { useEffect, useRef } from "react";

export function HeroVideo({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    const tryPlay = () => v.play().catch(() => {});
    tryPlay();
    document.addEventListener("click", tryPlay, { once: true });
    return () => document.removeEventListener("click", tryPlay);
  }, []);

  return (
    <video ref={ref} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover">
      <source src={src} type="video/mp4" />
    </video>
  );
}
