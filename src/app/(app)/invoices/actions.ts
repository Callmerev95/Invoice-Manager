"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { buildInvoiceVM } from "@/lib/invoice-vm";
import { renderInvoicePdf } from "@/lib/pdf";

export type ActionState = { error?: string } | undefined;

type ItemInput = {
  position: number;
  description: string;
  quantity: number;
  unitPriceSen: number;
};

function s(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function gatherItems(formData: FormData): { items: ItemInput[]; error?: string } {
  const descriptions = formData.getAll("item_description");
  const quantities = formData.getAll("item_quantity");
  const prices = formData.getAll("item_unit_price_rupiah");
  const items: ItemInput[] = [];

  for (let i = 0; i < descriptions.length; i++) {
    const description = s(descriptions[i]);
    const quantityRaw = String(quantities[i] ?? "");
    const priceRaw = String(prices[i] ?? "");
    const quantity = quantityRaw === "" ? NaN : Number(quantityRaw);
    const priceRupiah = priceRaw === "" ? NaN : Number(priceRaw);

    const emptyRow =
      !description &&
      (!Number.isFinite(quantity) || quantity <= 0) &&
      (!Number.isFinite(priceRupiah) || priceRupiah <= 0);
    if (emptyRow) continue;

    if (!description) return { items, error: `Baris ${i + 1}: deskripsi wajib diisi.` };
    if (!Number.isFinite(quantity) || quantity < 0)
      return { items, error: `Baris ${i + 1}: jumlah harus angka valid.` };
    if (!Number.isFinite(priceRupiah) || priceRupiah < 0)
      return { items, error: `Baris ${i + 1}: harga harus angka valid.` };

    items.push({
      position: i,
      description,
      quantity,
      unitPriceSen: Math.round(Math.trunc(priceRupiah * 100)), // rupiah → sen
    });
  }

  return { items };
}

function parseMoneyRupiah(raw: string): number | null {
  const digits = raw.replace(/[^\d\-]/g, "");
  if (digits === "" || digits === "-") return null;
  const n = Number(digits);
  if (!Number.isFinite(n)) return null;
  return Math.trunc(n * 100); // rupiah → sen
}

function friendlyRpcError(error: { message?: string; code?: string }): string {
  const m = error.message ?? "";
  if (/sudah terbit/i.test(m)) return "Invoice sudah terbit dan tidak bisa diubah.";
  if (/not found/.test(m)) return "Data tidak ditemukan.";
  if (m) return m.slice(0, 120);
  return "Terjadi kesalahan. Coba lagi.";
}

async function renewIssuedPdf(
  userId: string,
  invoiceId: string
): Promise<void> {
  const supabase = await createClient();
  try {
    const [invRes, itemRes, payRes, adjRes] = await Promise.all([
      supabase.from("invoices").select("*").eq("id", invoiceId).single(),
      supabase.from("line_items").select("*").eq("invoice_id", invoiceId),
      supabase.from("payments").select("*").eq("invoice_id", invoiceId),
      supabase.from("adjustments").select("*").eq("invoice_id", invoiceId),
    ]);
    if (invRes.error || !invRes.data) return;
    const vm = buildInvoiceVM(
      invRes.data,
      itemRes.data ?? [],
      payRes.data ?? [],
      adjRes.data ?? []
    );
    const buffer = await renderInvoicePdf(vm);
    await supabase.storage
      .from("invoice-pdfs")
      .upload(`${userId}/${invoiceId}.pdf`, new Blob([buffer]), {
        contentType: "application/pdf",
        upsert: true,
      });
  } catch (err) {
    console.error("PDF regeneration failed", err);
  }
}

export async function createInvoiceAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const supabase = await createClient();

  const templateId = s(formData.get("template"));
  const clientName = s(formData.get("client_name"));
  const clientEmail = s(formData.get("client_email"));
  const clientAddress = s(formData.get("client_address"));
  const dueRaw = s(formData.get("due_days"));
  const dueDays = dueRaw === "" ? null : Number(dueRaw);

  if (!templateId) return { error: "Template belum dipilih." };
  if (!clientName) return { error: "Nama klien wajib diisi." };
  if (dueDays !== null && (!Number.isInteger(dueDays) || dueDays < 0))
    return { error: "Jatuh tempo harus angka 0 atau lebih." };

  const { items, error } = gatherItems(formData);
  if (error) return { error };
  if (items.length === 0) return { error: "Tambahkan minimal satu baris item." };

  const { data: invoiceId, error: rpcError } = await supabase.rpc(
    "create_invoice_from_template",
    {
      p_user_id: user.id,
      p_template_id: templateId,
      p_client_name: clientName,
      p_client_email: clientEmail || null,
      p_client_address: clientAddress || null,
      p_due_days: dueDays,
      p_items: items.map((it) => ({
        position: it.position,
        description: it.description,
        quantity: it.quantity,
        unit_price_sen: it.unitPriceSen,
      })),
    }
  );

  if (rpcError) return { error: friendlyRpcError(rpcError) };
  if (typeof invoiceId !== "string") return { error: "Invoice gagal dibuat." };

  const action = s(formData.get("action"));
  if (action === "issue") {
    const issueError = await issueInvoiceById(user.id, invoiceId);
    if (issueError) return { error: issueError };
    revalidatePath(`/invoices/${invoiceId}`);
    redirect(`/invoices/${invoiceId}?issued=1`);
  }

  revalidatePath("/invoices");
  redirect(`/invoices/${invoiceId}`);
}

export async function saveDraftAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const supabase = await createClient();

  const invoiceId = s(formData.get("id"));
  const clientName = s(formData.get("client_name"));
  const clientEmail = s(formData.get("client_email"));
  const clientAddress = s(formData.get("client_address"));
  const dueRaw = s(formData.get("due_days"));
  const dueDays = dueRaw === "" ? null : Number(dueRaw);

  if (!invoiceId) return { error: "Invoice tidak ditemukan." };
  if (!clientName) return { error: "Nama klien wajib diisi." };
  if (dueDays !== null && (!Number.isInteger(dueDays) || dueDays < 0))
    return { error: "Jatuh tempo harus angka 0 atau lebih." };

  const { items, error } = gatherItems(formData);
  if (error) return { error };
  if (items.length === 0) return { error: "Tambahkan minimal satu baris item." };

  const { error: rpcError } = await supabase.rpc("save_invoice_draft", {
    p_invoice_id: invoiceId,
    p_client_name: clientName,
    p_client_email: clientEmail || null,
    p_client_address: clientAddress || null,
    p_due_days: dueDays,
    p_items: items.map((it) => ({
      position: it.position,
      description: it.description,
      quantity: it.quantity,
      unit_price_sen: it.unitPriceSen,
    })),
  });

  if (rpcError) return { error: friendlyRpcError(rpcError) };

  const action = s(formData.get("action"));
  if (action === "issue") {
    const issueError = await issueInvoiceById(user.id, invoiceId);
    if (issueError) return { error: issueError };
    revalidatePath(`/invoices/${invoiceId}`);
    redirect(`/invoices/${invoiceId}?issued=1`);
  }

  revalidatePath(`/invoices/${invoiceId}`);
  redirect(`/invoices/${invoiceId}?saved=1`);
}

async function issueInvoiceById(userId: string, invoiceId: string): Promise<string | null> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("issue_invoice", { p_invoice_id: invoiceId });
  if (error) return friendlyRpcError(error);
  await renewIssuedPdf(userId, invoiceId);
  return null;
}

export async function deleteDraftAction(formData: FormData) {
  const user = await requireUser();
  const supabase = await createClient();
  const invoiceId = s(formData.get("id"));
  if (!invoiceId) return;

  const { error } = await supabase
    .from("invoices")
    .delete()
    .eq("id", invoiceId)
    .eq("user_id", user.id);

  revalidatePath("/invoices");
  if (error) redirect(`/invoices?delete=failed`);
  redirect("/invoices");
}

async function getInvoiceOwner(
  supabase: Awaited<ReturnType<typeof createClient>>,
  invoiceId: string
) {
  const { data } = await supabase
    .from("invoices")
    .select("status, user_id")
    .eq("id", invoiceId)
    .single();
  return data ?? null;
}

export async function addPaymentAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();
  const invoiceId = s(formData.get("id"));
  const amountSen = parseMoneyRupiah(s(formData.get("amount")));
  const paidAt = s(formData.get("paid_at")) || new Date().toISOString().slice(0, 10);
  const note = s(formData.get("note"));

  if (!invoiceId) return { error: "Invoice tidak ditemukan." };
  if (amountSen === null || amountSen <= 0)
    return { error: "Masukkan nominal pembayaran lebih dari 0." };

  const invoice = await getInvoiceOwner(supabase, invoiceId);
  if (!invoice || invoice.status !== "issued")
    return { error: "Hanya invoice terbit yang bisa menerima pembayaran." };

  const { error } = await supabase.from("payments").insert({
    invoice_id: invoiceId,
    amount_sen: amountSen,
    paid_at: paidAt,
    note: note || null,
  });
  if (error) return { error: friendlyRpcError(error) };

  await renewIssuedPdf(invoice.user_id, invoiceId);
  revalidatePath(`/invoices/${invoiceId}`);
  redirect(`/invoices/${invoiceId}?payment=1`);
}

export async function deletePaymentAction(formData: FormData) {
  const supabase = await createClient();
  const paymentId = s(formData.get("payment_id"));
  const invoiceId = s(formData.get("invoice_id"));
  if (!paymentId || !invoiceId) return;

  await supabase.from("payments").delete().eq("id", paymentId);

  const invoice = await getInvoiceOwner(supabase, invoiceId);
  if (invoice) await renewIssuedPdf(invoice.user_id, invoiceId);

  revalidatePath(`/invoices/${invoiceId}`);
  redirect(`/invoices/${invoiceId}#pembayaran`);
}

export async function addAdjustmentAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();
  const invoiceId = s(formData.get("id"));
  const amountSen = parseMoneyRupiah(s(formData.get("amount")));
  const reason = s(formData.get("reason"));

  if (!invoiceId) return { error: "Invoice tidak ditemukan." };
  if (amountSen === null || amountSen === 0)
    return { error: "Nominal penyesuaian tidak boleh 0." };
  if (!reason) return { error: "Alasan penyesuaian wajib diisi." };

  const invoice = await getInvoiceOwner(supabase, invoiceId);
  if (!invoice || invoice.status !== "issued")
    return { error: "Hanya invoice terbit yang bisa disesuaikan." };

  const { error } = await supabase.from("adjustments").insert({
    invoice_id: invoiceId,
    amount_sen: amountSen,
    reason,
  });
  if (error) return { error: friendlyRpcError(error) };

  await renewIssuedPdf(invoice.user_id, invoiceId);
  revalidatePath(`/invoices/${invoiceId}`);
  redirect(`/invoices/${invoiceId}?adjustment=1`);
}

export async function deleteAdjustmentAction(formData: FormData) {
  const supabase = await createClient();
  const adjustmentId = s(formData.get("adjustment_id"));
  const invoiceId = s(formData.get("invoice_id"));
  if (!adjustmentId || !invoiceId) return;

  await supabase.from("adjustments").delete().eq("id", adjustmentId);

  const invoice = await getInvoiceOwner(supabase, invoiceId);
  if (invoice) await renewIssuedPdf(invoice.user_id, invoiceId);

  revalidatePath(`/invoices/${invoiceId}`);
  redirect(`/invoices/${invoiceId}#penyesuaian`);
}