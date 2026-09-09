"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  saveTemplateAction,
  type TemplateFormState,
} from "@/app/(app)/templates/actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import {
  formatNumber,
  patternRequiresSeq,
  type TemplateDraft,
} from "@/lib/templates";
import {
  LOGO_MAX_BYTES,
  LOGO_MAX_H,
  LOGO_MAX_W,
  SIGN_MAX_BYTES,
  SIGN_MAX_H,
  SIGN_MAX_W,
  assetKindError,
  assetPublicUrl,
  processImage,
  removeAssets,
  uploadAsset,
} from "@/lib/template-assets";
import { createClient } from "@/lib/supabase/client";
import { clsx } from "clsx";

function formatKB(bytes: number): string {
  return `${Math.round(bytes / 1024)} KB`;
}

function VisualUploader({
  kind,
  folder,
  initialPath,
  fieldName,
  inputId,
  maxW,
  maxH,
  maxBytes,
  hint,
}: {
  kind: "logo" | "signature";
  folder: string;
  initialPath: string;
  fieldName: string;
  inputId: string;
  maxW: number;
  maxH: number;
  maxBytes: number;
  hint: string;
}) {
  const [path, setPath] = useState(initialPath);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    const kindError = assetKindError(file);
    if (kindError) {
      setError(kindError);
      return;
    }
    setBusy(true);
    try {
      const { blob, ext } = await processImage(file, maxW, maxH);
      if (blob.size > maxBytes) {
        setError(
          `Hasil kompresi masih ${formatKB(blob.size)} (maks ${formatKB(maxBytes)}). Gunakan gambar lebih sederhana.`
        );
        return;
      }
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      const userId = data.user?.id;
      if (!userId) {
        setError("Sesi berakhir. Muat ulang halaman lalu coba lagi.");
        return;
      }
      const objectPath = `${userId}/${folder}/${kind}.${ext}`;
      const uploadError = await uploadAsset(
        supabase,
        objectPath,
        blob,
        ext === "png" ? "image/png" : "image/jpeg"
      );
      if (uploadError) {
        setError(uploadError);
        return;
      }
      if (path && path !== objectPath) {
        await removeAssets(supabase, [path]);
      }
      setPath(objectPath);
      setPreview(assetPublicUrl(supabase, objectPath));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengupload gambar.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove() {
    if (!path) return;
    setBusy(true);
    try {
      await removeAssets(createClient(), [path]);
      setPath("");
      setPreview(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name={fieldName} value={path} />
      {preview || path ? (
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview ?? ""}
            alt=""
            className="max-h-20 max-w-48 rounded-md border border-line bg-surface-2 object-contain p-1"
          />
          <Button
            type="button"
            variant="ghost"
            disabled={busy}
            onClick={handleRemove}
          >
            {busy ? "Memproses…" : "Hapus"}
          </Button>
        </div>
      ) : (
        <p className="text-sm text-ink-faint">Belum ada gambar.</p>
      )}
      <Input
        id={inputId}
        type="file"
        accept="image/png,image/jpeg"
        disabled={busy}
        onChange={(e) => {
          void handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
        aria-describedby={`${inputId}-hint`}
      />
      <p id={`${inputId}-hint`} className="text-sm text-ink-muted">
        {busy ? "Mengupload…" : hint}
      </p>
      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function TemplateForm({
  initial,
}: {
  initial: TemplateDraft;
}) {  const [state, action, pending] = useActionState<TemplateFormState, FormData>(
    saveTemplateAction,
    undefined
  );
  const [accent, setAccent] = useState(initial.accent_color || "#0B1211");
  const [folder] = useState(
    () =>
      initial.id ??
      `baru-${typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now())}`
  );

  const patternHint = patternRequiresSeq(initial.number_pattern)
    ? `Contoh: ${formatNumber(initial.number_pattern, 1, new Date().getFullYear())}`
    : null;

  const preview = patternRequiresSeq(initial.number_pattern)
    ? formatNumber(initial.number_pattern, 1, new Date().getFullYear())
    : null;

  return (
    <form action={action} className="max-w-3xl space-y-8">
      {state?.error ? (
        <p
          role="alert"
          className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
        >
          {state.error}
        </p>
      ) : null}

      {initial.id ? (
        <input type="hidden" name="id" value={initial.id} />
      ) : null}

      <section className="space-y-4">
        <h2 className="text-base font-semibold">Dasar</h2>
        <Field label="Nama template" htmlFor="name">
          <Input
            id="name"
            name="name"
            defaultValue={initial.name}
            placeholder="mis. Konsultasi, Freelance web, Jasa bulanan"
            required
          />
        </Field>
        <Field label="Judul invoice" htmlFor="invoice_title">
          <Input
            id="invoice_title"
            name="invoice_title"
            defaultValue={initial.invoice_title}
            placeholder="Invoice"
          />
        </Field>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold">Identitas bisnis</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nama bisnis" htmlFor="business_name">
            <Input id="business_name" name="business_name" defaultValue={initial.business_name} />
          </Field>
          <Field label="Slogan / tagline" htmlFor="business_line">
            <Input id="business_line" name="business_line" defaultValue={initial.business_line} />
          </Field>
        </div>
        <Field label="Alamat" htmlFor="business_address">
          <Textarea id="business_address" name="business_address" defaultValue={initial.business_address} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Telepon" htmlFor="business_phone">
            <Input id="business_phone" name="business_phone" defaultValue={initial.business_phone} />
          </Field>
          <Field label="Email" htmlFor="business_email">
            <Input id="business_email" name="business_email" type="email" defaultValue={initial.business_email} />
          </Field>
          <Field label="Situs web" htmlFor="business_website">
            <Input id="business_website" name="business_website" defaultValue={initial.business_website} />
          </Field>
        </div>
        <Field label="Pembayaran ke" htmlFor="payment_to" hint="Rekening tujuan transfer, mis. Bank BCA — a.n. Namamu — 1234567890.">
          <Textarea id="payment_to" name="payment_to" defaultValue={initial.payment_to} />
        </Field>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold">Visual dokumen</h2>
        <p className="text-sm text-ink-muted">
          Logo, aksen, dan gambar tanda tangan tampil di PDF dan halaman klien.
          Perubahan hanya berlaku untuk invoice baru — invoice terbit tidak berubah.
        </p>
        <Field label="Logo" htmlFor="logo_file">
          <VisualUploader
            kind="logo"
            folder={folder}
            initialPath={initial.logo_path}
            fieldName="logo_path"
            inputId="logo_file"
            maxW={LOGO_MAX_W}
            maxH={LOGO_MAX_H}
            maxBytes={LOGO_MAX_BYTES}
            hint="PNG/JPG, otomatis diperkecil maks 512px / 300KB."
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Warna aksen" htmlFor="accent_color">
            <Input
              id="accent_color"
              type="color"
              value={/^#[0-9a-fA-F]{6}$/.test(accent) ? accent : "#0B1211"}
              onChange={(e) => setAccent(e.target.value)}
              className="h-11 max-w-24 cursor-pointer p-1"
            />
          </Field>
          <Field label="Kode warna (heksa)" htmlFor="accent_hex" hint="Format #RRGGBB, mis. #0B1211.">
            <Input
              id="accent_hex"
              value={accent}
              onChange={(e) => setAccent(e.target.value.trim())}
              placeholder="#0B1211"
              maxLength={7}
            />
          </Field>
        </div>
        <input type="hidden" name="accent_color" value={accent} />
        <Field label="Gambar tanda tangan" htmlFor="signature_file">
          <VisualUploader
            kind="signature"
            folder={folder}
            initialPath={initial.signature_image_path}
            fieldName="signature_image_path"
            inputId="signature_file"
            maxW={SIGN_MAX_W}
            maxH={SIGN_MAX_H}
            maxBytes={SIGN_MAX_BYTES}
            hint="PNG/JPG transparan, otomatis diperkecil maks 800x300 / 300KB. Nama tetap diisi di Model invoice."
          />
        </Field>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold">Nomor & ketentuan</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field
            label="Pola nomor"
            htmlFor="number_pattern"
            hint={patternHint ?? undefined}
            error={
              !patternRequiresSeq(initial.number_pattern)
                ? "Harus memuat {seq}."
                : undefined
            }
          >
            <Input
              id="number_pattern"
              name="number_pattern"
              defaultValue={initial.number_pattern}
              aria-describedby="number_pattern-hint"
            />
          </Field>
          <Field label="Jatuh tempo (hari)" htmlFor="due_days">
            <Input
              id="due_days"
              name="due_days"
              type="number"
              min={0}
              defaultValue={initial.due_days}
            />
          </Field>
          <Field label="Pajak (basis poin)" htmlFor="tax_rate_bps" hint="PPN 11% = 1100">
            <Input
              id="tax_rate_bps"
              name="tax_rate_bps"
              type="number"
              min={0}
              defaultValue={initial.tax_rate_bps}
            />
          </Field>
        </div>
        <Field label="Label pajak" htmlFor="tax_label">
          <Input
            id="tax_label"
            name="tax_label"
            defaultValue={initial.tax_label}
            placeholder="PPN 11%"
          />
        </Field>
        <Field label="Ketentuan pembayaran" htmlFor="payment_terms" hint="Ditampilkan ke klien.">
          <Textarea
            id="payment_terms"
            name="payment_terms"
            defaultValue={initial.payment_terms}
            placeholder="Pembayaran jatuh tempo dalam 14 hari sejak invoice diterbitkan."
          />
        </Field>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold">Model invoice</h2>
        <Field label="Tanda tangan" htmlFor="signature_text">
          <Input
            id="signature_text"
            name="signature_text"
            defaultValue={initial.signature_text}
            placeholder="Nama kamu"
          />
        </Field>
        <Field label="Catatan bawah" htmlFor="footer_note">
          <Textarea
            id="footer_note"
            name="footer_note"
            defaultValue={initial.footer_note}
            placeholder="Terima kasih atas kepercayaan Anda."
          />
        </Field>
      </section>

      <div
        className={clsx(
          "flex items-center justify-between gap-3",
          preview ? "border-t border-line pt-5" : ""
        )}
      >
        {preview ? (
          <p className="text-sm text-ink-muted">
            Nomor pertama:{" "}
            <span className="tabular-nums font-medium text-ink">{preview}</span>
          </p>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-3">
          <Link
            href="/templates"
            className="inline-flex items-center rounded-md border border-line-strong px-4 py-2 text-sm text-ink hover:bg-surface-2"
          >
            Batal
          </Link>
          <Button type="submit" disabled={pending}>
            {pending ? "Menyimpan…" : "Simpan template"}
          </Button>
        </div>
      </div>
    </form>
  );
}