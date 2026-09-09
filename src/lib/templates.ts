import type { Database } from "@/lib/supabase/database.types";

export type TemplateRow = Database["public"]["Tables"]["templates"]["Row"];

export const DEFAULT_NUMBER_PATTERN = "INV-{yyyy}-{seq:3}";

export function formatNumber(
  pattern: string,
  seq: number,
  year = new Date().getFullYear()
): string {
  return pattern
    .replace(/\{yyyy\}/g, String(year))
    .replace(
      /\{seq(?::(\d+))?\}/g,
      (_, width: string | undefined) =>
        String(seq).padStart(width ? Math.max(1, Number(width)) : 1, "0")
    );
}

export function patternRequiresSeq(pattern: string): boolean {
  return /\{seq/.test(pattern);
}

export type TemplateDraft = {
  id?: string;
  name: string;
  number_pattern: string;
  due_days: number;
  tax_label: string;
  tax_rate_bps: number;
  invoice_title: string;
  business_name: string;
  business_line: string;
  business_address: string;
  business_phone: string;
  business_email: string;
  business_website: string;
  payment_to: string;
  payment_terms: string;
  signature_text: string;
  footer_note: string;
};

export function toTemplateDraft(row: TemplateRow): TemplateDraft {
  return {
    id: row.id,
    name: row.name,
    number_pattern: row.number_pattern ?? DEFAULT_NUMBER_PATTERN,
    due_days: row.due_days,
    tax_label: row.tax_label ?? "",
    tax_rate_bps: row.tax_rate_bps,
    invoice_title: row.invoice_title ?? "",
    business_name: row.business_name ?? "",
    business_line: row.business_line ?? "",
    business_address: row.business_address ?? "",
    business_phone: row.business_phone ?? "",
    business_email: row.business_email ?? "",
    business_website: row.business_website ?? "",
    payment_to: row.payment_to ?? "",
    payment_terms: row.payment_terms ?? "",
    signature_text: row.signature_text ?? "",
    footer_note: row.footer_note ?? "",
  };
}

export function emptyTemplateDraft(): TemplateDraft {
  return {
    name: "",
    number_pattern: DEFAULT_NUMBER_PATTERN,
    due_days: 14,
    tax_label: "",
    tax_rate_bps: 0,
    invoice_title: "Invoice",
    business_name: "",
    business_line: "",
    business_address: "",
    business_phone: "",
    business_email: "",
    business_website: "",
    payment_to: "",
    payment_terms: "",
    signature_text: "",
    footer_note: "",
  };
}