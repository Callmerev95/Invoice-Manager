import Link from "next/link";
import { Plus } from "lucide-react";
import { clsx } from "clsx";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah, formatDate } from "@/lib/invoices";
import {
  clampPage,
  getInvoiceSummaries,
  getStatusCounts,
  totalPages,
  type SummaryFilter,
} from "@/lib/invoice-summaries";
import { InvoiceStatusChip } from "@/components/invoice-status-chip";
import { Pager } from "@/components/pager";

const FILTERS: { key: SummaryFilter; label: string }[] = [
  { key: "all", label: "Semua" },
  { key: "draft", label: "Draf" },
  { key: "issued", label: "Terbit" },
  { key: "overdue", label: "Lewat" },
  { key: "paid", label: "Lunas" },
];

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string; delete?: string }>;
}) {
  await requireUser();
  const {
    status: statusFilter = "all",
    page: pageParam,
    delete: deleted,
  } = await searchParams;
  const supabase = await createClient();

  const filter = FILTERS.some((f) => f.key === statusFilter)
    ? (statusFilter as SummaryFilter)
    : "all";
  const requestedPage = Number.parseInt(pageParam ?? "1", 10);

  const [first, counts] = await Promise.all([
    getInvoiceSummaries(supabase, filter, requestedPage),
    getStatusCounts(supabase),
  ]);

  const page = clampPage(requestedPage, first.totalCount);
  const { rows: summaries, totalCount } =
    page === requestedPage
      ? first
      : await getInvoiceSummaries(supabase, filter, page);
  const pages = totalPages(totalCount);

  const filterHref = (key: SummaryFilter) =>
    key === "all" ? "/invoices" : `/invoices?status=${key}`;
  const pageHref = (p: number) =>
    filter === "all"
      ? `/invoices?page=${p}`
      : `/invoices?status=${filter}&page=${p}`;

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
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-bg shadow-neu-sm transition-all hover:bg-primary-hover active:shadow-neu-in"
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

      <nav aria-label="Filter status" className="flex flex-wrap gap-2">
        {FILTERS.map(({ key, label }) => (
          <Link
            key={key}
            href={filterHref(key)}
            aria-current={filter === key ? "page" : undefined}
            className={clsx(
              "rounded-full bg-surface px-3 py-1 text-sm tabular-nums shadow-neu-sm transition-all",
              filter === key
                ? "font-medium text-primary shadow-neu-in"
                : "text-ink-muted hover:text-ink"
            )}
          >
            {label} · {counts.get(key) ?? 0}
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
        <div className="overflow-hidden rounded-2xl bg-surface shadow-neu-in">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-ink-faint">
              <tr>
                <th scope="col" className="px-4 py-2.5 font-medium">Invoice</th>
                <th scope="col" className="px-4 py-2.5 font-medium">Klien</th>
                <th scope="col" className="hidden px-4 py-2.5 font-medium lg:table-cell">Terbit</th>
                <th scope="col" className="hidden px-4 py-2.5 font-medium md:table-cell">Jatuh tempo</th>
                <th scope="col" className="px-4 py-2.5 font-medium">Status</th>
                <th scope="col" className="px-4 py-2.5 text-right font-medium">Sisa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {summaries.map((inv) => (
                <tr key={inv.id} className="transition-colors hover:bg-surface-2/50">
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

      <Pager page={page} totalPages={pages} makeHref={pageHref} />

      <p className="sr-only" aria-live="polite">
        Menampilkan {summaries.length} dari {totalCount} invoice.
      </p>
    </div>
  );
}
