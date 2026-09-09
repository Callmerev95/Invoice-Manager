import type { Tables } from "@/lib/supabase/database.types";

export type InvoiceRow = Tables<"invoices">;
export type LineItemRow = Tables<"line_items">;
export type PaymentRow = Tables<"payments">;
export type AdjustmentRow = Tables<"adjustments">;

export type InvoiceItemVM = {
  id?: string;
  position: number;
  description: string;
  quantity: number;
  unitPriceSen: number;
  subtotalSen: number;
};

export type EffectiveStatus = "draft" | "issued" | "overdue" | "paid";

export type InvoiceVM = {
  id: string;
  status: InvoiceRow["status"];
  number: string;
  pattern: string;
  token: string;
  clientName: string;
  clientEmail: string | null;
  clientAddress: string | null;
  issueDate: string | null;
  dueDate: string;
  dueDays: number;
  templateId: string | null;
  invoiceTitle: string;
  businessName: string | null;
  businessLine: string | null;
  businessAddress: string | null;
  businessEmail: string | null;
  businessPhone: string | null;
  businessWebsite: string | null;
  footerNote: string | null;
  paymentTerms: string | null;
  paymentTo: string | null;
  signatureText: string | null;
  taxLabel: string;
  taxRateBps: number;
  currency: string;
  accentColor: string | null;
  items: InvoiceItemVM[];
  payments: { id: string; paidAt: string; amountSen: number; note: string | null }[];
  adjustments: { id: string; amountSen: number; reason: string; createdAt: string }[];
  subtotalSen: number;
  taxSen: number;
  adjustmentSen: number;
  paidSen: number;
  totalSen: number;
  balanceSen: number;
  hasAdjustment: boolean;
  effectiveStatus: EffectiveStatus;
};

export function buildInvoiceVM(
  row: InvoiceRow,
  items: LineItemRow[],
  payments: PaymentRow[],
  adjustments: AdjustmentRow[],
  today = new Date()
): InvoiceVM {
  const subtotalSen = items.reduce((acc, it) => acc + it.subtotal_sen, 0);
  const taxSen = Math.round((subtotalSen * row.tax_rate_bps) / 10000);
  const totalSen = subtotalSen + taxSen;
  const adjustmentSen = adjustments.reduce((acc, a) => acc + a.amount_sen, 0);
  const paidSen = payments.reduce((acc, p) => acc + p.amount_sen, 0);
  const balanceSen = totalSen + adjustmentSen - paidSen;

  const todayKey = today.toISOString().slice(0, 10);
  let effectiveStatus: EffectiveStatus = "issued";
  if (row.status === "draft") {
    effectiveStatus = "draft";
  } else if (balanceSen <= 0) {
    effectiveStatus = "paid";
  } else if (row.due_date < todayKey) {
    effectiveStatus = "overdue";
  }

  const itemVMs: InvoiceItemVM[] = [...items]
    .sort((a, b) => a.position - b.position)
    .map((it) => ({
      id: it.id,
      position: it.position,
      description: it.description,
      quantity: it.quantity,
      unitPriceSen: it.unit_price_sen,
      subtotalSen: it.subtotal_sen,
    }));

  const paymentVMs = [...payments]
    .sort((a, b) => a.paid_at.localeCompare(b.paid_at))
    .map((p) => ({
      id: p.id,
      paidAt: p.paid_at,
      amountSen: p.amount_sen,
      note: p.note,
    }));

  const adjustmentVMs = [...adjustments]
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .map((a) => ({
      id: a.id,
      amountSen: a.amount_sen,
      reason: a.reason,
      createdAt: a.created_at,
    }));

  return {
    id: row.id,
    status: row.status,
    number: row.number,
    pattern: row.pattern,
    token: row.token,
    clientName: row.client_name,
    clientEmail: row.client_email,
    clientAddress: row.client_address,
    issueDate: row.issue_date,
    dueDate: row.due_date,
    dueDays: row.due_days,
    templateId: row.template_id,
    invoiceTitle: row.invoice_title,
    businessName: row.business_name,
    businessLine: row.business_line,
    businessAddress: row.business_address,
    businessEmail: row.business_email,
    businessPhone: row.business_phone,
    businessWebsite: row.business_website,
    footerNote: row.footer_note,
    paymentTerms: row.payment_terms,
    paymentTo: row.payment_to,
    signatureText: row.signature_text,
    taxLabel: row.tax_label,
    taxRateBps: row.tax_rate_bps,
    currency: row.currency,
    accentColor: row.accent_color,
    items: itemVMs,
    payments: paymentVMs,
    adjustments: adjustmentVMs,
    subtotalSen,
    taxSen,
    adjustmentSen,
    paidSen,
    totalSen,
    balanceSen,
    hasAdjustment: adjustmentVMs.length > 0,
    effectiveStatus,
  };
}

export function formatQuantity(q: number): string {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 4,
  }).format(q);
}