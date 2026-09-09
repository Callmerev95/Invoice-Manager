import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

export const ASSET_BUCKET = "template-assets";

export const LOGO_MAX_W = 512;
export const LOGO_MAX_H = 512;
export const LOGO_MAX_BYTES = 300 * 1024;

export const SIGN_MAX_W = 800;
export const SIGN_MAX_H = 300;
export const SIGN_MAX_BYTES = 300 * 1024;

const INPUT_MAX_BYTES = 8 * 1024 * 1024;
const FETCH_MAX_BYTES = 1024 * 1024;

export function isHexColor(value: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}

export function assetKindError(file: File): string | null {
  if (file.type !== "image/png" && file.type !== "image/jpeg") {
    return "Format harus PNG atau JPG.";
  }
  if (file.size > INPUT_MAX_BYTES) {
    return "Ukuran file maksimal 8MB.";
  }
  return null;
}

/** Resize + kompres di browser agar ringan. Mengembalikan blob siap upload + ekstensi. */
export async function processImage(
  file: File,
  maxW: number,
  maxH: number
): Promise<{ blob: Blob; ext: string }> {
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, maxW / bitmap.width, maxH / bitmap.height);
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Browser tidak mendukung pengolahan gambar.");
    ctx.drawImage(bitmap, 0, 0, w, h);
    const keepPng = file.type === "image/png";
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, keepPng ? "image/png" : "image/jpeg", 0.82)
    );
    if (!blob) throw new Error("Gagal memproses gambar.");
    return { blob, ext: keepPng ? "png" : "jpg" };
  } finally {
    bitmap.close();
  }
}

type Client = SupabaseClient<Database>;

export async function uploadAsset(
  supabase: Client,
  path: string,
  blob: Blob,
  contentType: string
): Promise<string | null> {
  const { error } = await supabase.storage
    .from(ASSET_BUCKET)
    .upload(path, blob, { contentType, upsert: true });
  if (error) return error.message;
  return null;
}

export async function removeAssets(
  supabase: Client,
  paths: string[]
): Promise<void> {
  const list = paths.filter(Boolean);
  if (list.length === 0) return;
  await supabase.storage.from(ASSET_BUCKET).remove(list);
}

export function assetPublicUrl(
  supabase: Client,
  path: string | null
): string | null {
  if (!path) return null;
  const { data } = supabase.storage.from(ASSET_BUCKET).getPublicUrl(path);
  return data.publicUrl || null;
}

/** Server: fetch gambar publik menjadi data URI untuk di-embed ke PDF. Gagal sunyi → null. */
export async function fetchAssetDataUri(
  url: string | null
): Promise<string | null> {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const type = res.headers.get("content-type") ?? "";
    if (!type.startsWith("image/")) return null;
    const buf = await res.arrayBuffer();
    if (buf.byteLength === 0 || buf.byteLength > FETCH_MAX_BYTES) return null;
    const b64 = Buffer.from(buf).toString("base64");
    return `data:${type};base64,${b64}`;
  } catch {
    return null;
  }
}
