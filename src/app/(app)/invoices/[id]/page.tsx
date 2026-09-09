import Link from "next/link";
import { ChevronLeft, Download, ExternalLink, FilePenLine, Trash2 } from "lucide-react";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { buildInvoiceVM, formatQuantity, type InvoiceVM } from "@/lib/invoice-vm";
import { formatRupiah, formatDate } from "@/lib/invoices";
import { InvoiceStatusChip } from "@/components/invoice-status-chip";
import { DraftEditor } from "@/components/invoice/draft-editor";
import { DeleteButton } from "@/components/delete-button";
import { ConfirmAction } from "@/components/confirm-action";
import { CopyLinkButton } from "@/components/copy-link-button";
import { PaymentForm } from "@/components/invoice/payment-form";
import { AdjustmentForm } from "@/components/invoice/adjustment-form";
import {
  deleteDraftAction,
  deletePaymentAction,
  deleteAdjustmentAction,
} from "../actions";

export default async function InvoiceDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ issued?: string; payment?: string; adjustment?: string }>;
}) {
  await requireUser();
  const { id } = await params;
  const sp = await searchParams;
  const supabase = await createClient();

  const [invRes, itemRes, payRes, adjRes] = await Promise.all([
    supabase.from("invoices").select("*").eq("id", id).single(),
    supabase.from("line_items").select("*").eq("invoice_id", id),
    supabase.from("payments").select("*").eq("invoice_id", id),
    supabase.from("adjustments").select("*").eq("invoice_id", id),
  ]);

  if (!invRes.data || invRes.error) notFound();

  const vm = buildInvoiceVM(
    invRes.data,
    itemRes.data ?? [],
    payRes.data ?? [],
    adjRes.data ?? []
  );

  return (
    <div className="space-y-6">
      <Link
        href="/invoices"
        className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
        Kembali
      </Link>

      {sp.issued === "1" ? (
        <p className="rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-sm text-primary">
          Invoice {vm.number} berhasil diterbitkan. Bagikan tautan klien ke pembeli.
        </p>
      ) : null}
      {sp.payment === "1" ? (
        <p className="rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-sm text-primary">
          Pembayaran tercatat.
        </p>
      ) : null}
      {sp.adjustment === "1" ? (
        <p className="rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-sm text-primary">
          Penyesuaian ditambahkan.
        </p>
      ) : null}

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-semibold tracking-tight">
              {vm.status === "issued" ? vm.number : "Draf invoice"}
            </h1>
            <InvoiceStatusChip status={vm.effectiveStatus} hasAdjustment={vm.hasAdjustment} />
          </div>
          <p className="mt-1 text-sm text-ink-muted">
            {vm.clientName || "Tanpa nama klien"}
            {vm.clientEmail ? ` · ${vm.clientEmail}` : ""}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {vm.status === "issued" ? (
            <>
              <Link
                href={`/v/${vm.token}`}
                target="_blank"
                className="inline-flex items-center gap-2 rounded-md border border-line-strong px-3 py-1.5 text-sm text-ink hover:bg-surface-2"
              >
                <ExternalLink className="h-4 w-4" aria-hidden />
                Halaman klien
              </Link>
              <CopyLinkButton
                url={`${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/v/${vm.token}`}
              />
              <Link
                href={`/invoices/${vm.id}/pdf`}
                className="inline-flex items-center gap-2 rounded-md border border-line-strong px-3 py-1.5 text-sm text-ink hover:bg-surface-2"
              >
                <Download className="h-4 w-4" aria-hidden />
                Unduh PDF
              </Link>
            </>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-sm text-ink-faint">
              <FilePenLine className="h-4 w-4" aria-hidden />
              Draf belum dapat dibagikan
            </span>
          )}
          {vm.status === "draft" ? (
            <DeleteButton
              action={deleteDraftAction}
              id={vm.id}
              confirmText="Hapus invoice draf ini? Tindakan tidak bisa dibatalkan."
            >
              <Trash2 className="h-4 w-4" aria-hidden />
              Hapus
            </DeleteButton>
          ) : null}
        </div>
      </header>

      {vm.status === "draft" ? (
        <DraftEditor invoice={vm} />
      ) : (
        <IssuedView vm={vm} />
      )}
    </div>
  );
}

function IssuedView({ vm }: { vm: InvoiceVM }) {
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-lg border border-line">
        <div className="w-full border-b border-line bg-primary px-5 py-5 text-bg">
          <h2 className="text-sm font-medium uppercase tracking-wide opacity-80">
            {vm.invoiceTitle || "Invoice"}
          </h2>
          <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight">
            {formatRupiah(vm.balanceSen)}
          </p>
          <p className="mt-1 text-sm opacity-80">
            {vm.effectiveStatus === "paid" ? "Lunas" : "Sisa tagihan"}
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 px-5 py-4 text-sm sm:grid-cols-4">
          <Meta label="Tanggal terbit" value={formatDate(vm.issueDate)} />
          <Meta label="Jatuh tempo" value={formatDate(vm.dueDate)} />
          <Meta label="Subtotal" value={formatRupiah(vm.subtotalSen)} />
          <Meta label="Pajak" value={`${vm.taxLabel || "Pajak"} · ${formatRupiah(vm.taxSen)}`} />
          {vm.hasAdjustment ? (
            <Meta label="Penyesuaian" value={formatRupiah(vm.adjustmentSen)} />
          ) : null}
          <Meta label="Dibayar" value={formatRupiah(vm.paidSen)} />
        </dl>
      </section>

      <section className="overflow-hidden rounded-lg border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface text-xs uppercase tracking-wide text-ink-faint">
            <tr>
              <th scope="col" className="px-4 py-2.5 font-medium">Deskripsi</th>
              <th scope="col" className="px-4 py-2.5 text-right font-medium">Jumlah</th>
              <th scope="col" className="hidden px-4 py-2.5 text-right font-medium sm:table-cell">Harga</th>
              <th scope="col" className="px-4 py-2.5 text-right font-medium">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {vm.items.map((it) => (
              <tr key={it.id ?? it.position}>
                <td className="px-4 py-3">{it.description || "—"}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatQuantity(it.quantity)}</td>
                <td className="hidden px-4 py-3 text-right tabular-nums sm:table-cell">
                  {formatRupiah(it.unitPriceSen)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{formatRupiah(it.subtotalSen)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {vm.paymentTo ? (
        <section className="rounded-lg border border-line p-5">
          <h2 className="text-base font-semibold">Pembayaran</h2>
          <p className="mt-2 whitespace-pre-line text-sm text-ink-muted">{vm.paymentTo}</p>
        </section>
      ) : null}

      <section id="pembayaran" className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Pembayaran</h2>
          <p className="text-sm text-ink-muted">
            Sudah dibayar {formatRupiah(vm.paidSen)} dari {formatRupiah(vm.totalSen)}
            {vm.hasAdjustment ? ` (${formatRupiah(vm.adjustmentSen)} penyesuaian)` : ""}.
          </p>
        </div>
        {vm.payments.length > 0 ? (
          <ul className="divide-y divide-line rounded-lg border border-line">
            {[...vm.payments].reverse().map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{formatRupiah(p.amountSen)}</p>
                  <p className="text-xs text-ink-muted">
                    {formatDate(p.paidAt)}
                    {p.note ? ` · ${p.note}` : ""}
                  </p>
                </div>
                <ConfirmAction
                  action={deletePaymentAction}
                  hidden={{ payment_id: p.id, invoice_id: vm.id }}
                  confirmText="Hapus catatan pembayaran ini?"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                  Hapus
                </ConfirmAction>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-muted">Belum ada pembayaran tercatat.</p>
        )}
        <PaymentForm invoiceId={vm.id} />
      </section>

      <section id="penyesuaian" className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Penyesuaian</h2>
          <p className="text-sm text-ink-muted">
            Diskon, koreksi, atau biaya tambahan setelah terbit.
          </p>
        </div>
        {vm.adjustments.length > 0 ? (
          <ul className="divide-y divide-line rounded-lg border border-line">
            {[...vm.adjustments].reverse().map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p
                    className={`text-sm font-medium tabular-nums ${
                      a.amountSen < 0 ? "text-danger" : "text-ink"
                    }`}
                  >
                    {a.amountSen < 0 ? "−" : "+"}{formatRupiah(Math.abs(a.amountSen))}
                  </p>
                  <p className="text-xs text-ink-muted">
                    {formatDate(a.createdAt)} · {a.reason}
                  </p>
                </div>
                <ConfirmAction
                  action={deleteAdjustmentAction}
                  hidden={{ adjustment_id: a.id, invoice_id: vm.id }}
                  confirmText="Hapus penyesuaian ini?"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                  Hapus
                </ConfirmAction>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-muted">Belum ada penyesuaian.</p>
        )}
        <AdjustmentForm invoiceId={vm.id} />
      </section>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-ink-faint">{label}</dt>
      <dd className="mt-0.5 tabular-nums text-ink">{value}</dd>
    </div>
  );
}