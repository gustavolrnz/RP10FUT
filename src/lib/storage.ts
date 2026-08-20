import "server-only";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

const EXT_BY_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/webm": "webm",
};

/**
 * Local-disk file storage for the prototype's uploads (product photos, site
 * media). Swap this for an S3-compatible client later -- callers only see a
 * public URL, so nothing else needs to change.
 */
export async function saveUploadedFile(
  file: File,
  opts: { maxBytes: number; kind: "image" | "video" },
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  if (file.size === 0) return { ok: false, error: "Arquivo vazio." };
  if (file.size > opts.maxBytes) {
    return { ok: false, error: `Arquivo muito grande (máx. ${Math.round(opts.maxBytes / 1024 / 1024)}MB).` };
  }
  const ext = EXT_BY_MIME[file.type];
  if (!ext || (opts.kind === "image" && !file.type.startsWith("image/")) || (opts.kind === "video" && !file.type.startsWith("video/"))) {
    return { ok: false, error: "Formato de arquivo não suportado." };
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  const filename = `${crypto.randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);

  return { ok: true, url: `/uploads/${filename}` };
}
