"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { uploadSiteMedia } from "@/lib/actions/media";
import { useToast } from "@/components/admin/toast-provider";

const TESTIMONIAL_SLOTS = [1, 2, 3] as const;

export function MediaClient({ media }: { media: Record<string, string> }) {
  const router = useRouter();
  const toast = useToast();
  const [, startTransition] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);

  async function onUpload(key: string, file: File | undefined) {
    if (!file) return;
    setBusy(key);
    try {
      const result = await uploadSiteMedia(key as never, file);
      if (!result.ok) {
        toast(result.error, "danger");
        return;
      }
      toast("Mídia atualizada.", "success");
      startTransition(() => router.refresh());
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <h1 className="mb-2 text-[22px] font-bold text-white">Mídia do site</h1>
      <p className="mb-7 text-[13px] text-admin-text3">
        Substitua o vídeo do hero, a logo e as fotos de depoimentos exibidas no site.
      </p>
      <div className="grid max-w-[900px] grid-cols-2 gap-5">
        <div className="rounded-lg border border-admin-border bg-admin-panel p-5">
          <div className="mb-3 text-[13px] font-bold text-admin-text">VÍDEO DO HERO (INÍCIO)</div>
          {media.heroVideo ? (
            <video
              key={media.heroVideo}
              src={media.heroVideo}
              muted
              controls
              className="mb-3 aspect-video w-full rounded-md bg-admin-input object-cover"
            />
          ) : (
            <div className="mb-3 flex aspect-video w-full items-center justify-center rounded-md bg-admin-input text-xs text-admin-text3">
              Nenhum vídeo enviado
            </div>
          )}
          <input
            type="file"
            accept="video/*"
            disabled={busy === "heroVideo"}
            onChange={(e) => onUpload("heroVideo", e.target.files?.[0])}
            className="text-xs text-admin-text2"
          />
        </div>

        <div className="rounded-lg border border-admin-border bg-admin-panel p-5">
          <div className="mb-3 text-[13px] font-bold text-admin-text">LOGO DO SITE</div>
          <div className="mb-3 flex aspect-video w-full items-center justify-center rounded-md bg-admin-input">
            {media.logo ? (
              // eslint-disable-next-line @next/next/no-img-element -- data comes from local uploads dir, arbitrary aspect ratios
              <img src={media.logo} alt="Logo" className="max-h-[70%] max-w-[70%]" />
            ) : (
              <span className="text-xs text-admin-text3">Usando logo padrão</span>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            disabled={busy === "logo"}
            onChange={(e) => onUpload("logo", e.target.files?.[0])}
            className="text-xs text-admin-text2"
          />
        </div>

        {TESTIMONIAL_SLOTS.map((n) => {
          const key = `testimonial${n}`;
          return (
            <div key={key} className="rounded-lg border border-admin-border bg-admin-panel p-5">
              <div className="mb-3 text-[13px] font-bold text-admin-text">FOTO DEPOIMENTO {n}</div>
              <div className="mb-3 flex aspect-square w-full items-center justify-center overflow-hidden rounded-md bg-admin-input">
                {media[key] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={media[key]} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xs text-admin-text3">Nenhuma foto enviada</span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                disabled={busy === key}
                onChange={(e) => onUpload(key, e.target.files?.[0])}
                className="text-xs text-admin-text2"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
