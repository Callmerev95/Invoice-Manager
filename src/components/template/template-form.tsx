"use client";

import { useActionState } from "react";
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
import { clsx } from "clsx";

export function TemplateForm({
  initial,
}: {
  initial: TemplateDraft;
}) {
  const [state, action, pending] = useActionState<TemplateFormState, FormData>(
    saveTemplateAction,
    undefined
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