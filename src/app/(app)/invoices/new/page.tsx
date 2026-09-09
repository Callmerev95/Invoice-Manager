import Link from "next/link";
import { ChevronLeft, Plus } from "lucide-react";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { nextSequencesByPattern } from "@/lib/invoice-series";
import { InvoiceForm, type TemplatePick } from "@/components/invoice/invoice-form";
import { formatNumber } from "@/lib/templates";

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  await requireUser();
  const { template } = await searchParams;
  const supabase = await createClient();

  const { data: templates } = await supabase
    .from("templates")
    .select("id, name, due_days, tax_rate_bps, tax_label, number_pattern, invoice_title")
    .order("name");

  const selected = templates?.find((t) => t.id === template) ?? null;

  if (template && !selected) notFound();

  const year = new Date().getFullYear();
  const nextByPattern = await nextSequencesByPattern(
    supabase,
    (templates ?? []).map((t) => t.number_pattern)
  );

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <Link
          href="/invoices"
          aria-label="Kembali ke daftar invoice"
          className="rounded-md border border-line-strong p-2 text-ink-muted hover:text-ink"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </Link>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Invoice baru</h1>
          <p className="text-sm text-ink-muted">
            {selected
              ? `Template: ${selected.name}`
              : "Pilih template untuk mulai membuat invoice."}
          </p>
        </div>
      </header>

      {selected ? (
        <InvoiceForm
          template={toTemplatePick(
            selected,
            nextByPattern.get(selected.number_pattern)
          )}
        />
      ) : templates && templates.length > 0 ? (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <li key={t.id}>
              <Link
                href={`/invoices/new?template=${t.id}`}
                className="flex h-full flex-col justify-between gap-4 rounded-lg border border-line p-5 transition-colors hover:border-primary/60 hover:bg-surface-2"
              >
                <div>
                  <h2 className="font-medium text-ink">{t.name}</h2>
                  <p className="mt-1 text-sm text-ink-muted">
                    {t.tax_rate_bps > 0 ? `${t.tax_label || "Pajak"} ${(t.tax_rate_bps / 100).toLocaleString("id-ID")}%` : "Tanpa pajak"}
                    {t.due_days > 0 ? ` · jatuh tempo ${t.due_days} hari` : ""}
                  </p>
                  <p className="mt-2 tabular-nums text-xs text-ink-faint">
                    Nomor berikutnya:{" "}
                    {formatNumber(
                      t.number_pattern,
                      nextByPattern.get(t.number_pattern) ?? 1,
                      year
                    )}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                  <Plus className="h-4 w-4" aria-hidden />
                  Gunakan
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-lg border border-dashed border-line-strong px-6 py-16 text-center">
          <p className="text-sm text-ink-muted">
            Belum ada template. Buat dulu template invoice Anda.
          </p>
          <Link
            href="/templates/new"
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-bg hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Buat template
          </Link>
        </div>
      )}
    </div>
  );
}

function toTemplatePick(
  t: {
    id: string;
    name: string;
    due_days: number;
    tax_rate_bps: number;
    tax_label: string;
    number_pattern: string;
  },
  nextSeq?: number
): TemplatePick {
  return {
    id: t.id,
    name: t.name,
    due_days: t.due_days,
    tax_rate_bps: t.tax_rate_bps,
    tax_label: t.tax_label,
    number_pattern: t.number_pattern,
    next_seq: nextSeq ?? 1,
  };
}