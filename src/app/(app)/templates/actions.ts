"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_NUMBER_PATTERN, patternRequiresSeq } from "@/lib/templates";
import { isHexColor, removeAssets } from "@/lib/template-assets";
import type { TemplateDraft } from "@/lib/templates";

export type TemplateFormState = { error?: string } | undefined;

function s(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function si(value: FormDataEntryValue | null, fallback: number): number {
  const n = Number.parseInt(s(value), 10);
  return Number.isFinite(n) ? n : fallback;
}

export async function saveTemplateAction(
  _prev: TemplateFormState,
  formData: FormData
): Promise<TemplateFormState> {
  const user = await requireUser();
  const supabase = await createClient();

  const id = s(formData.get("id"));
  const name = s(formData.get("name"));
  const numberPattern =
    s(formData.get("number_pattern")) || DEFAULT_NUMBER_PATTERN;
  const dueDays = si(formData.get("due_days"), 14);
  const taxBps = si(formData.get("tax_rate_bps"), 0);
  const taxLabel = s(formData.get("tax_label"));
  const invoiceTitle = s(formData.get("invoice_title"));
  const accentColor = s(formData.get("accent_color")) || "#0B1211";
  const logoPath = s(formData.get("logo_path"));
  const signatureImagePath = s(formData.get("signature_image_path"));

  if (!name) return { error: "Nama template wajib diisi." };
  if (!patternRequiresSeq(numberPattern)) {
    return { error: "Pola nomor harus memuat {seq} agar nomor otomatis." };
  }
  if (!Number.isInteger(dueDays) || dueDays < 0) {
    return { error: "Jatuh tempo harus angka 0 atau lebih." };
  }
  if (!Number.isInteger(taxBps) || taxBps < 0) {
    return { error: "Tarif pajak harus angka 0 atau lebih." };
  }
  if (!isHexColor(accentColor)) {
    return { error: "Warna aksen harus format #RRGGBB." };
  }

  const values: Omit<TemplateDraft, "id"> & { user_id: string } = {
    name,
    number_pattern: numberPattern,
    due_days: dueDays,
    tax_label: taxLabel,
    tax_rate_bps: taxBps,
    invoice_title: invoiceTitle || "Invoice",
    business_name: s(formData.get("business_name")),
    business_line: s(formData.get("business_line")),
    business_address: s(formData.get("business_address")),
    business_phone: s(formData.get("business_phone")),
    business_email: s(formData.get("business_email")),
    business_website: s(formData.get("business_website")),
    payment_to: s(formData.get("payment_to")),
    payment_terms: s(formData.get("payment_terms")),
    signature_text: s(formData.get("signature_text")),
    signature_image_path: signatureImagePath,
    logo_path: logoPath,
    accent_color: accentColor,
    footer_note: s(formData.get("footer_note")),
    user_id: user.id,
  };

  if (id) {
    const { data: existing } = await supabase
      .from("templates")
      .select("logo_path, signature_image_path")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    const { error } = await supabase
      .from("templates")
      .update(values)
      .eq("id", id)
      .eq("user_id", user.id)
      .select("id")
      .single();
    if (error) return { error: error.message };

    // Hapus file lama yang diganti agar tidak orphan.
    const stale = [
      existing?.logo_path && existing.logo_path !== logoPath
        ? existing.logo_path
        : "",
      existing?.signature_image_path &&
      existing.signature_image_path !== signatureImagePath
        ? existing.signature_image_path
        : "",
    ];
    await removeAssets(supabase, stale);
  } else {
    const { error } = await supabase
      .from("templates")
      .insert(values);
    if (error) return { error: error.message };
  }

  revalidatePath("/templates");
  redirect("/templates");
}

export async function deleteTemplateAction(formData: FormData) {
  const user = await requireUser();
  const supabase = await createClient();
  const id = s(formData.get("id"));
  if (!id) return;

  const { data: existing } = await supabase
    .from("templates")
    .select("logo_path, signature_image_path")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  await supabase
    .from("templates")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  await removeAssets(supabase, [
    existing?.logo_path ?? "",
    existing?.signature_image_path ?? "",
  ]);

  revalidatePath("/templates");
  redirect("/templates");
}