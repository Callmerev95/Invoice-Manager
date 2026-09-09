import type { PdfInvoice } from "@/lib/pdf";

export type PublicInvoiceItem = {
  position: number;
  description: string;
  quantity: number;
  unit_price_sen: number;
  subtotal_sen: number;
};

export type PublicInvoicePayment = {
  paid_at: string;
  amount_sen: number;
  note: string | null;
};

export type PublicInvoiceAdjustment = {
  amount_sen: number;
  reason: string;
  created_at: string;
};

export type PublicInvoice = {
  number: string;
  client_name: string;
  client_email: string | null;
  client_address: string | null;
  issue_date: string | null;
  due_date: string;
  currency: string;
  business_name: string | null;
  business_line: string | null;
  business_address: string | null;
  business_email: string | null;
  business_phone: string | null;
  business_website: string | null;
  logo_path: string | null;
  invoice_title: string;
  footer_note: string | null;
  payment_terms: string | null;
  payment_to: string | null;
  signature_text: string | null;
  signature_image_path: string | null;
  tax_label: string;
  tax_rate_bps: number;
  accent_color: string | null;
  items: PublicInvoiceItem[];
  payments: PublicInvoicePayment[];
  adjustments: PublicInvoiceAdjustment[];
  totals: {
    subtotal_sen: number;
    tax_sen: number;
    adjustment_sen: number;
    paid_sen: number;
  };
};

export type PublicStatus = "issued" | "overdue" | "paid";

export function publicStatus(
  pub: PublicInvoice,
  today = new Date()
): PublicStatus {
  const paidSen =
    pub.totals.subtotal_sen + pub.totals.tax_sen + pub.totals.adjustment_sen - pub.totals.paid_sen;
  if (paidSen <= 0) return "paid";
  const todayKey = today.toISOString().slice(0, 10);
  if (pub.due_date < todayKey) return "overdue";
  return "issued";
}

export function toPdfInvoice(pub: PublicInvoice): PdfInvoice {
  return {
    status: "issued",
    number: pub.number,
    invoiceTitle: pub.invoice_title,
    clientName: pub.client_name,
    clientEmail: pub.client_email,
    clientAddress: pub.client_address,
    issueDate: pub.issue_date,
    dueDate: pub.due_date,
    businessName: pub.business_name,
    businessLine: pub.business_line,
    businessAddress: pub.business_address,
    businessEmail: pub.business_email,
    businessPhone: pub.business_phone,
    businessWebsite: pub.business_website,
    footerNote: pub.footer_note,
    paymentTerms: pub.payment_terms,
    paymentTo: pub.payment_to,
    signatureText: pub.signature_text,
    signatureImagePath: pub.signature_image_path ?? null,
    signatureImageDataUri: null,
    logoPath: pub.logo_path ?? null,
    logoDataUri: null,
    accentColor: pub.accent_color ?? null,
    taxLabel: pub.tax_label || "Pajak",
    items: pub.items.map((it) => ({
      description: it.description,
      quantity: it.quantity,
      unitPriceSen: it.unit_price_sen,
      subtotalSen: it.subtotal_sen,
    })),
    subtotalSen: pub.totals.subtotal_sen,
    taxSen: pub.totals.tax_sen,
    adjustmentSen: pub.totals.adjustment_sen,
    paidSen: pub.totals.paid_sen,
    balanceSen:
      pub.totals.subtotal_sen +
      pub.totals.tax_sen +
      pub.totals.adjustment_sen -
      pub.totals.paid_sen,
    hasAdjustment: pub.adjustments.length > 0,
    effectiveStatus: publicStatus(pub),
  };
}

export function isPublicInvoice(value: unknown): value is PublicInvoice {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as PublicInvoice).number === "string" &&
    Array.isArray((value as PublicInvoice).items) &&
    Array.isArray((value as PublicInvoice).payments) &&
    Array.isArray((value as PublicInvoice).adjustments) &&
    typeof (value as PublicInvoice).totals === "object"
  );
}