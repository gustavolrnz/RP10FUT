"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/require-staff";
import { saveUploadedFile } from "@/lib/storage";

const SITE_MEDIA_KEYS = ["heroVideo", "logo", "testimonial1", "testimonial2", "testimonial3"] as const;
type SiteMediaKey = (typeof SITE_MEDIA_KEYS)[number];

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_VIDEO_BYTES = 60 * 1024 * 1024;

export async function uploadSiteMedia(key: SiteMediaKey, file: File) {
  await requireStaff("general_admin");
  if (!SITE_MEDIA_KEYS.includes(key)) return { ok: false as const, error: "Chave de mídia inválida." };

  const isVideo = key === "heroVideo";
  const result = await saveUploadedFile(file, {
    maxBytes: isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES,
    kind: isVideo ? "video" : "image",
  });
  if (!result.ok) return result;

  await prisma.siteMedia.upsert({
    where: { key },
    update: { url: result.url },
    create: { key, url: result.url },
  });

  revalidatePath("/admin/media");
  revalidatePath("/");
  return { ok: true as const, url: result.url };
}

export async function uploadProductImage(file: File) {
  await requireStaff();
  return saveUploadedFile(file, { maxBytes: MAX_IMAGE_BYTES, kind: "image" });
}
