import Link from "next/link";
import { Plus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  summarizeInvoices,
  formatRupiah,
  formatDate,
} from "@/lib/invoices";
import { InvoiceStatusChip } from "@/components/invoice-status-chip";

export default async function DashboardPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const [invRes, itemRes, payRes, adjRes, tplRes] = await Promise.all([
    supabase
      .from("invoices")
      .select("id, number, client_name, status, issue_date, due_date, tax_rate_bps")
      .order("created_at", { ascending: false })
      .limit(500),
    supabase.from("line_items").select("invoice_id, subtotal_sen"),
    supabase.from("payments").select("invoice_id, amount_sen"),
    supabase.from("adjustments").select("invoice_id, amount_sen"),
    supabase.from("templates").select("id", { count: "exact", head: true }),
  ]);

  const summaries = summarizeInvoices(
    invRes.data ?? [],
    itemRes.data ?? [],
    payRes.data ?? [],
    adjRes.data ?? []
  );

  const templateCount = tplRes.count ?? 0;
  const unpaid = summaries.filter(
    (s) => s.effectiveStatus === "issued" || s.effectiveStatus === "overdue"
  );
  const outstandingSen = unpaid.reduce((acc, s) => acc + s.balanceSen, 0);
  const overdueCount = summaries.filter(
    (s) => s.effectiveStatus === "overdue"
  ).length;

  const greeting = user.email?.split("@")[0] ?? "Pengguna";

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Beranda</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Halo, {greeting}. Ini ringkasan keuangan Anda.
          </p>
        </div>
        <Link
          href="/templates"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-bg hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Buat invoice
        </Link>
      </header>

      <section aria-label="Ringkasan" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Template" value={String(templateCount)} />
        <StatCard label="Belum lunas" value={String(unpaid.length)} />
        <StatCard label="Piutang" value={formatRupiah(outstandingSen)} />
        <StatCard
          label="Lewat jatuh tempo"
          value={String(overdueCount)}
          tone={overdueCount > 0 ? "danger" : "default"}
        />
      </section>

      <section aria-label="Invoice terbaru">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">Invoice terbaru</h2>
          <Link
            href="/invoices"
            className="text-sm font-medium text-primary hover:text-primary-hover"
          >
            Lihat semua
          </Link>
        </div>

        {summaries.length === 0 ? (
          <div className="rounded-lg border border-dashed border-line-strong px-6 py-12 text-center">
            <p className="text-sm text-ink-muted">Belum ada invoice.</p>
            <Link
              href="/templates"
              className="mt-4 inline-flex items-center gap-2 rounded-md border border-line-strong px-3 py-1.5 text-sm text-ink hover:bg-surface-2"
            >
              Buat dari template
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-line">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface text-xs uppercase tracking-wide text-ink-faint">
                <tr>
                  <th scope="col" className="px-4 py-2.5 font-medium">Invoice</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">Klien</th>
                  <th scope="col" className="hidden px-4 py-2.5 font-medium sm:table-cell">Jatuh tempo</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">Status</th>
                  <th scope="col" className="px-4 py-2.5 text-right font-medium">Sisa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {summaries.slice(0, 8).map((inv) => (
                  <tr key={inv.id} className="transition-colors hover:bg-surface/60">
                    <td className="px-4 py-3 font-medium text-ink">{inv.number}</td>
                    <td className="px-4 py-3 text-ink-muted">{inv.clientName || "—"}</td>
                    <td className="hidden px-4 py-3 text-ink-muted sm:table-cell">
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
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "danger";
}) {
  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <p className="text-xs uppercase tracking-wide text-ink-faint">{label}</p>
      <p
        className={`mt-1.5 text-xl font-semibold tabular-nums ${
          tone === "danger" ? "text-danger" : "text-ink"
        }`}
      >
        {value}
      </p>
    </div>
  );
}