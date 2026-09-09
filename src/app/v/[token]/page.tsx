import Link from "next/link";
import { Download } from "lucide-react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  isPublicInvoice,
  publicStatus,
} from "@/lib/public-invoice";
import { formatRupiah, formatDate } from "@/lib/invoices";
import { formatQuantity } from "@/lib/invoice-vm";

function accentOf(raw: string | null): string | null {
  return raw && /^#[0-9a-fA-F]{6}$/.test(raw) ? raw : null;
}

export default async function PublicInvoicePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  if (!/^[0-9a-f]{32}$/.test(token)) notFound();

  const supabase = await createClient();
  const { data } = await supabase.rpc("get_public_invoice", { p_token: token });
  if (!isPublicInvoice(data)) notFound();

  const pub = data;
  const status = publicStatus(pub);
  const accent = accentOf(pub.accent_color) ?? "#0B1211";
  const balanceSen = pub.totals.subtotal_sen + pub.totals.tax_sen + pub.totals.adjustment_sen - pub.totals.paid_sen;

  return (
    <main className="min-h-screen bg-[#f4f4f0] px-4 py-8 text-neutral-900 sm:px-8">
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="flex items-center justify-end">
          <Link
            href={`/v/${token}/pdf`}
            className="inline-flex items-center gap-2 rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white"
          >
            <Download className="h-4 w-4" aria-hidden />
            Unduh PDF
          </Link>
        </div>

        <article className="rounded-lg bg-white p-8 shadow-sm sm:p-12">
          <header className="flex flex-wrap items-start justify-between gap-6 border-b border-neutral-200 pb-8">
            <div>
              {pub.business_name || pub.business_line ? (
                <>
                  <h1 className="text-xl font-bold">{pub.business_name || ""}</h1>
                  <p className="mt-0.5 text-sm text-neutral-600">
                    {pub.business_line || ""}
                  </p>
                </>
              ) : (
                <h1 className="text-xl font-bold">{pub.invoice_title || "Invoice"}</h1>
              )}
              {(pub.business_address ||
                pub.business_phone ||
                pub.business_email ||
                pub.business_website) && (
                <p className="mt-2 whitespace-pre-line text-sm text-neutral-600">
                  {[pub.business_address, pub.business_phone, pub.business_email, pub.business_website]
                    .filter(Boolean)
                    .join("\n")}
                </p>
              )}
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold tracking-tight">
                {pub.invoice_title || "Invoice"}
              </h2>
              <p className="mt-1 tabular-nums text-lg font-semibold" style={{ color: accent }}>
                {pub.number}
              </p>
              <p className="mt-2 text-sm text-neutral-600">Terbit {formatDate(pub.issue_date)}</p>
              <p className="text-sm text-neutral-600">Jatuh tempo {formatDate(pub.due_date)}</p>
              <span
                className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                  status === "paid"
                    ? "bg-emerald-100 text-emerald-800"
                    : status === "overdue"
                      ? "bg-red-100 text-red-800"
                      : "bg-neutral-900 text-white"
                }`}
              >
                {status === "paid" ? "Lunas" : status === "overdue" ? "Lewat jatuh tempo" : "Belum dibayar"}
              </span>
            </div>
          </header>

          <section className="py-6">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Ditagihkan ke
            </h2>
            <p className="mt-1 font-medium">{pub.client_name}</p>
            {pub.client_email ? (
              <p className="text-sm text-neutral-600">{pub.client_email}</p>
            ) : null}
            {pub.client_address ? (
              <p className="whitespace-pre-line text-sm text-neutral-600">{pub.client_address}</p>
            ) : null}
          </section>

          <section className="overflow-hidden rounded-md border border-neutral-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
                <tr>
                  <th scope="col" className="px-3 py-2.5 font-medium">Deskripsi</th>
                  <th scope="col" className="px-3 py-2.5 text-right font-medium">Jumlah</th>
                  <th scope="col" className="hidden px-3 py-2.5 text-right font-medium sm:table-cell">Harga</th>
                  <th scope="col" className="px-3 py-2.5 text-right font-medium">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {pub.items.map((it, i) => (
                  <tr key={i}>
                    <td className="px-3 py-3">{it.description || "—"}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{formatQuantity(it.quantity)}</td>
                    <td className="hidden px-3 py-3 text-right tabular-nums sm:table-cell">
                      {formatRupiah(it.unit_price_sen)}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">{formatRupiah(it.subtotal_sen)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-neutral-200 p-4">
              <dl className="ml-auto space-y-1.5 text-sm sm:w-64">
                <div className="flex justify-between text-neutral-600">
                  <dt>Subtotal</dt>
                  <dd className="tabular-nums">{formatRupiah(pub.totals.subtotal_sen)}</dd>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <dt>{pub.tax_label || "Pajak"}</dt>
                  <dd className="tabular-nums">{formatRupiah(pub.totals.tax_sen)}</dd>
                </div>
                {pub.adjustments.length > 0 ? (
                  <div className="flex justify-between text-neutral-600">
                    <dt>Penyesuaian</dt>
                    <dd className="tabular-nums">{formatRupiah(pub.totals.adjustment_sen)}</dd>
                  </div>
                ) : null}
                {pub.totals.paid_sen > 0 ? (
                  <div className="flex justify-between text-neutral-600">
                    <dt>Sudah dibayar</dt>
                    <dd className="tabular-nums text-emerald-700">
                      −{formatRupiah(pub.totals.paid_sen)}
                    </dd>
                  </div>
                ) : null}
                <div className="flex justify-between border-t border-neutral-200 pt-2 text-base font-bold">
                  <dt>Total</dt>
                  <dd className="tabular-nums">{formatRupiah(balanceSen)}</dd>
                </div>
              </dl>
            </div>
          </section>

          {pub.payments.length > 0 ? (
            <section className="mt-6">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Riwayat pembayaran
              </h2>
              <ul className="mt-2 space-y-1.5 text-sm">
                {[...pub.payments]
                  .sort((a, b) => b.paid_at.localeCompare(a.paid_at))
                  .map((p, i) => (
                    <li key={i} className="flex justify-between">
                      <span className="text-neutral-600">
                        {formatDate(p.paid_at)}
                        {p.note ? ` — ${p.note}` : ""}
                      </span>
                      <span className="tabular-nums font-medium">{formatRupiah(p.amount_sen)}</span>
                    </li>
                  ))}
              </ul>
            </section>
          ) : null}

          {pub.payment_to ? (
            <section className="mt-6">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Pembayaran dapat dilakukan ke
              </h2>
              <p className="mt-2 whitespace-pre-line text-sm">{pub.payment_to}</p>
            </section>
          ) : null}

          {pub.payment_terms ? (
            <section className="mt-6">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Ketentuan pembayaran
              </h2>
              <p className="mt-2 whitespace-pre-line text-sm">{pub.payment_terms}</p>
            </section>
          ) : null}

          {pub.signature_text ? (
            <section className="mt-8">
              <div className="text-base font-semibold" style={{ color: accent }}>
                {pub.signature_text}
              </div>
            </section>
          ) : null}

          {pub.footer_note ? (
            <footer className="mt-10 border-t border-neutral-200 pt-4 text-xs text-neutral-500">
              <p className="whitespace-pre-line">{pub.footer_note}</p>
            </footer>
          ) : null}

          <p className="mt-6 text-center text-[11px] text-neutral-400">
            Dibuat dengan Invoice Manager
          </p>
        </article>
      </div>
    </main>
  );
}