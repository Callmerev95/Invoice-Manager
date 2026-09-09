import Link from "next/link";
import { Plus } from "lucide-react";
import { clsx } from "clsx";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { summarizeInvoices, formatRupiah, formatDate } from "@/lib/invoices";
import { InvoiceStatusChip } from "@/components/invoice-status-chip";
import type { EffectiveStatus } from "@/lib/invoices";

const FILTERS: { key: EffectiveStatus | "all"; label: string }[] = [
  { key: "all", label: "Semua" },
  { key: "draft", label: "Draf" },
  { key: "issued", label: "Terbit" },
  { key: "overdue", label: "Lewat" },
  { key: "paid", label: "Lunas" },
];

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; delete?: string }>;
}) {
  await requireUser();
  const { status: statusFilter = "all", delete: deleted } = await searchParams;
  const supabase = await createClient();

  const [invRes, itemRes, payRes, adjRes] = await Promise.all([
    supabase
      .from("invoices")
      .select("id, number, client_name, status, issue_date, due_date, tax_rate_bps")
      .order("created_at", { ascending: false })
      .limit(1000),
    supabase.from("line_items").select("invoice_id, subtotal_sen"),
    supabase.from("payments").select("invoice_id, amount_sen"),
    supabase.from("adjustments").select("invoice_id, amount_sen"),
  ]);

  let summaries = summarizeInvoices(
    invRes.data ?? [],
    itemRes.data ?? [],
    payRes.data ?? [],
    adjRes.data ?? []
  );

  const filter = FILTERS.some((f) => f.key === statusFilter)
    ? (statusFilter as EffectiveStatus | "all")
    : "all";
  if (filter !== "all") {
    summaries = summaries.filter((s) => s.effectiveStatus === filter);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Invoice</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Buat, terbitkan, dan kelola tagihan Anda.
          </p>
        </div>
        <Link
          href="/invoices/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-bg hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Invoice baru
        </Link>
      </header>

      {deleted === "failed" ? (
        <p
          role="alert"
          className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
        >
          Invoice tidak bisa dihapus karena sudah terbit.
        </p>
      ) : null}

      <nav aria-label="Filter status" className="flex gap-2">
        {FILTERS.map(({ key, label }) => (
          <Link
            key={key}
            href={key === "all" ? "/invoices" : `/invoices?status=${key}`}
            aria-current={filter === key ? "page" : undefined}
            className={clsx(
              "rounded-full border px-3 py-1 text-sm transition-colors",
              filter === key
                ? "border-primary/50 bg-surface-2 font-medium text-primary"
                : "border-line text-ink-muted hover:text-ink"
            )}
          >
            {label}
          </Link>
        ))}
      </nav>

      {summaries.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line-strong px-6 py-16 text-center">
          <p className="text-sm text-ink-muted">
            {filter === "all"
              ? "Belum ada invoice."
              : `Tidak ada invoice berstatus "${FILTERS.find((f) => f.key === filter)?.label}".`}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-line">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-xs uppercase tracking-wide text-ink-faint">
              <tr>
                <th scope="col" className="px-4 py-2.5 font-medium">Invoice</th>
                <th scope="col" className="px-4 py-2.5 font-medium">Klien</th>
                <th scope="col" className="hidden px-4 py-2.5 font-medium lg:table-cell">Terbit</th>
                <th scope="col" className="hidden px-4 py-2.5 font-medium md:table-cell">Jatuh tempo</th>
                <th scope="col" className="px-4 py-2.5 font-medium">Status</th>
                <th scope="col" className="px-4 py-2.5 text-right font-medium">Sisa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {summaries.map((inv) => (
                <tr key={inv.id}>
                  <td className="px-4 py-3">
                    <Link
                      href={`/invoices/${inv.id}`}
                      className="font-medium text-ink hover:text-primary"
                    >
                      {inv.effectiveStatus === "draft" ? "Draf" : inv.number}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{inv.clientName || "—"}</td>
                  <td className="hidden px-4 py-3 text-ink-muted lg:table-cell">
                    {formatDate(inv.issueDate)}
                  </td>
                  <td className="hidden px-4 py-3 text-ink-muted md:table-cell">
                    {formatDate(inv.dueDate)}
                  </td>
                  <td className="px-4 py-3">
                    <InvoiceStatusChip status={inv.effectiveStatus} hasAdjustment={inv.hasAdjustment} />
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-ink">
                    {inv.effectiveStatus === "draft" ? "—" : formatRupiah(inv.balanceSen)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}