import type { Database } from "@/lib/supabase/database.types";

export type InvoiceStatus = Database["public"]["Enums"]["invoice_status"];

export type SummaryTotalsRow = {
  id: string;
  number: string;
  client_name: string;
  status: InvoiceStatus;
  issue_date: string | null;
  due_date: string | null;
  tax_rate_bps: number;
};

export type EffectiveStatus = "draft" | "issued" | "overdue" | "paid";

export type InvoiceSummary = {
  id: string;
  number: string;
  clientName: string;
  status: InvoiceStatus;
  issueDate: string | null;
  dueDate: string | null;
  subtotalSen: number;
  taxSen: number;
  totalSen: number;
  adjustmentSen: number;
  paidSen: number;
  balanceSen: number;
  hasAdjustment: boolean;
  effectiveStatus: EffectiveStatus;
};

type SumRow = { invoice_id: string; amount_sen: number };
type ItemRow = { invoice_id: string; subtotal_sen: number };

function toMap<Row extends SumRow>(rows: Row[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const row of rows) {
    map.set(row.invoice_id, (map.get(row.invoice_id) ?? 0) + row.amount_sen);
  }
  return map;
}

export function summarizeInvoices(
  invoices: SummaryTotalsRow[],
  itemSums: ItemRow[],
  paymentSums: SumRow[],
  adjustmentSums: SumRow[]
): InvoiceSummary[] {
  const subtotal = new Map<string, number>();
  for (const row of itemSums) {
    subtotal.set(row.invoice_id, (subtotal.get(row.invoice_id) ?? 0) + row.subtotal_sen);
  }
  const paid = toMap(paymentSums);
  const adj = toMap(adjustmentSums);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = today.toISOString().slice(0, 10);

  return invoices.map((inv) => {
    const subtotalSen = subtotal.get(inv.id) ?? 0;
    const taxSen = Math.round((subtotalSen * inv.tax_rate_bps) / 10000);
    const totalSen = subtotalSen + taxSen;
    const adjustmentSen = adj.get(inv.id) ?? 0;
    const paidSen = paid.get(inv.id) ?? 0;
    const balanceSen = totalSen + adjustmentSen - paidSen;

    let effectiveStatus: EffectiveStatus = "issued";
    if (inv.status === "draft") {
      effectiveStatus = "draft";
    } else if (balanceSen <= 0) {
      effectiveStatus = "paid";
    } else if (inv.due_date && inv.due_date < todayKey) {
      effectiveStatus = "overdue";
    }

    return {
      id: inv.id,
      number: inv.number,
      clientName: inv.client_name,
      status: inv.status,
      issueDate: inv.issue_date,
      dueDate: inv.due_date,
      subtotalSen,
      taxSen,
      totalSen,
      adjustmentSen,
      paidSen,
      balanceSen,
      hasAdjustment: adjustmentSums.some((r) => r.invoice_id === inv.id),
      effectiveStatus,
    };
  });
}

export function formatRupiah(sen: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Math.round(sen / 100));
}

export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(y, m - 1, d));
}