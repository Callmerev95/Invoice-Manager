"use server";

import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type SeedResult = { ok: true; summary: string[] } | { ok: false; error: string };

type SeedInvoice = {
  clientName: string;
  clientEmail?: string;
  clientAddress?: string;
  issuedDaysAgo: number;
  dueDays: number;
  number: string;
  seq: number;
  items: [string, number, number][]; // [description, quantity, unit price rupiah]
  adjustment?: { rupiah: number; reason: string; daysAgo: number };
  payments?: { rupiah: number; daysAgo: number; note: string }[];
};

const TEMPLATE_A = {
  name: "Konsultasi & Desain",
  tax_label: "PPN",
  tax_rate_bps: 1100,
  due_days: 14,
  number_pattern: "INV-{yyyy}-{seq:3}",
};

const TEMPLATE_B = {
  name: "Hosting Bulanan",
  tax_label: "PPN",
  tax_rate_bps: 0,
  due_days: 1,
  number_pattern: "INV-H-{yyyy}-{seq:3}",
};

const BUSINESS = {
  business_name: "Studio Teras",
  business_line: "Jasa desain & konsultasi produk digital",
  business_address: "Jl. Cikini Raya No. 12, Jakarta Pusat",
  business_phone: "+62 812-3456-7890",
  business_email: "halo@studioteras.id",
  business_website: "studioteras.id",
  payment_to:
    "BCA 8831 2345 6789 a.n. Raka Putra\nBNI 0189 4567 1234 a.n. Raka Putra",
  payment_terms:
    "Pembayaran dilakukan melalui transfer bank. Simpan bukti transfer sebagai referensi.",
  signature_text: "Raka Putra\nStudio Teras",
  footer_note:
    "Terima kasih atas kepercayaan Anda. Jangan ragu menghubungi kami untuk pertanyaan.",
};

const SEED_INVOICES: SeedInvoice[] = [
  {
    clientName: "Arya Wijaya",
    clientEmail: "arya@karya.id",
    issuedDaysAgo: 7,
    dueDays: 14,
    number: "INV-2026-001",
    seq: 1,
    items: [["Desain UI aplikasi mobile", 1, 2_850_000]],
  },
  {
    clientName: "Maya Store",
    clientEmail: "hello@mayastore.co",
    issuedDaysAgo: 1,
    dueDays: 14,
    number: "INV-2026-002",
    seq: 2,
    items: [
      ["Identitas visual (logo + panduan merek)", 1, 2_400_000],
      ["Konten Instagram 1 bulan", 1, 900_000],
    ],
  },
  {
    clientName: "Kopi Senja",
    clientEmail: "halo@kopisenja.coffee",
    issuedDaysAgo: 45,
    dueDays: 14,
    number: "INV-2026-003",
    seq: 3,
    items: [
      ["Pitch deck & materi presentasi", 1, 2_200_000],
      ["Sesi konsultasi merek (3 jam)", 3, 250_000],
    ],
  },
  {
    clientName: "Rumah Roti",
    clientEmail: "pesan@rumahroti.id",
    issuedDaysAgo: 39,
    dueDays: 14,
    number: "INV-2026-004",
    seq: 4,
    items: [
      ["Packaging & label produk", 1, 1_900_000],
      ["Desain menu digital", 1, 600_000],
    ],
    adjustment: { rupiah: -150_000, reason: "Diskon pelunasan awal", daysAgo: 36 },
    payments: [
      { rupiah: 1_000_000, daysAgo: 37, note: "Transfer BCA" },
      { rupiah: 1_625_000, daysAgo: 35, note: "Pelunasan" },
    ],
  },
];

function dateDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function senFromRupiah(rupiah: number): number {
  return Math.round(rupiah * 100);
}

export async function seedDemoAction(): Promise<SeedResult> {
  if (process.env.NODE_ENV === "production") {
    return { ok: false, error: "Seeder hanya dapat dijalankan di environment development." };
  }

  const user = await requireUser();
  const supabase = await createClient();
  const summary: string[] = [];

  const { data: existing } = await supabase
    .from("invoices")
    .select("id")
    .eq("user_id", user.id);
  const invoiceIds = (existing ?? []).map((r) => r.id);

  if (invoiceIds.length > 0) {
    await supabase.from("line_items").delete().in("invoice_id", invoiceIds);
    await supabase.from("payments").delete().in("invoice_id", invoiceIds);
    await supabase.from("adjustments").delete().in("invoice_id", invoiceIds);
    await supabase.from("invoices").delete().in("id", invoiceIds);
  }
  await supabase.from("invoice_series").delete().eq("user_id", user.id);
  await supabase.from("templates").delete().eq("user_id", user.id);

  const templateA = await insertTemplate(TEMPLATE_A);
  if (!templateA) return { ok: false, error: "Gagal membuat template pertama." };
  const templateB = await insertTemplate(TEMPLATE_B);
  if (!templateB) return { ok: false, error: "Gagal membuat template kedua." };
  summary.push(`Template "${TEMPLATE_A.name}" dibuat.`);
  summary.push(`Template "${TEMPLATE_B.name}" dibuat.`);

  for (const inv of SEED_INVOICES) {
    const issueDate = dateDaysAgo(inv.issuedDaysAgo);
    const dueDate = addDays(issueDate, inv.dueDays);
    const subtotalRupiah = inv.items.reduce(
      (acc, [, qty, price]) => acc + qty * price,
      0
    );
    const subtotalSen = senFromRupiah(subtotalRupiah);
    const taxSen = Math.round((subtotalSen * TEMPLATE_A.tax_rate_bps) / 10000);
    const adjustmentSen = inv.adjustment ? senFromRupiah(inv.adjustment.rupiah) : 0;
    const paidSen = (inv.payments ?? []).reduce(
      (acc, p) => acc + senFromRupiah(p.rupiah),
      0
    );
    const balanceSen = subtotalSen + taxSen + adjustmentSen - paidSen;

    const { data: issued, error: invError } = await supabase
      .from("invoices")
      .insert({
        user_id: user.id,
        template_id: templateA,
        status: "issued",
        number: inv.number,
        seq: inv.seq,
        pattern: TEMPLATE_A.number_pattern,
        token: crypto.randomUUID().replace(/-/g, ""),
        client_name: inv.clientName,
        client_email: inv.clientEmail ?? null,
        client_address: inv.clientAddress ?? null,
        issue_date: issueDate,
        due_date: dueDate,
        due_days: inv.dueDays,
        invoice_title: "INVOICE",
        tax_label: TEMPLATE_A.tax_label,
        tax_rate_bps: TEMPLATE_A.tax_rate_bps,
        currency: "IDR",
        ...BUSINESS,
      })
      .select("id")
      .single();
    if (invError || !issued) {
      return { ok: false, error: `Gagal membuat invoice ${inv.number}: ${invError?.message}` };
    }

    for (let i = 0; i < inv.items.length; i++) {
      const [description, qty, priceRupiah] = inv.items[i];
      const unitPriceSen = senFromRupiah(priceRupiah);
      const subtotalSen_i = Math.round(qty * priceRupiah * 100);
      const { error: liError } = await supabase.from("line_items").insert({
        invoice_id: issued.id,
        position: i,
        description,
        quantity: qty,
        unit_price_sen: unitPriceSen,
        subtotal_sen: subtotalSen_i,
      });
      if (liError) {
        return { ok: false, error: `Gagal membuat item "${description}": ${liError.message}` };
      }
    }

    if (inv.adjustment) {
      const { error: adjError } = await supabase.from("adjustments").insert({
        invoice_id: issued.id,
        amount_sen: senFromRupiah(inv.adjustment.rupiah),
        reason: inv.adjustment.reason,
        created_at: `${dateDaysAgo(inv.adjustment.daysAgo)}T09:00:00.000Z`,
      });
      if (adjError) {
        return { ok: false, error: `Gagal membuat penyesuaian: ${adjError.message}` };
      }
    }

    for (const p of inv.payments ?? []) {
      const { error: payError } = await supabase.from("payments").insert({
        invoice_id: issued.id,
        amount_sen: senFromRupiah(p.rupiah),
        paid_at: dateDaysAgo(p.daysAgo),
        note: p.note,
      });
      if (payError) {
        return { ok: false, error: `Gagal membuat pembayaran: ${payError.message}` };
      }
    }

    const statusLabel =
      balanceSen <= 0 ? "Lunas" : dueDate < dateDaysAgo(0) ? "Lewat JT" : "Terbit";
    summary.push(
      `${inv.number} — ${inv.clientName} (${statusLabel}, sisa Rp ${(
        balanceSen / 100
      ).toLocaleString("id-ID")})`
    );
  }

  const draftItems = [
    { position: 0, description: "Desain landing page (3 halaman)", quantity: 1, unit_price_sen: senFromRupiah(3_500_000) },
    { position: 1, description: "Copywriting & struktur konten", quantity: 1, unit_price_sen: senFromRupiah(900_000) },
  ];
  const { data: draftId, error: draftError } = await supabase.rpc(
    "create_invoice_from_template",
    {
      p_user_id: user.id,
      p_template_id: templateA,
      p_client_name: "PT Nusa Boga",
      p_client_email: null,
      p_client_address: "Kawasan Industri Pulo Gadung, Jakarta Timur",
      p_due_days: 14,
      p_items: draftItems,
    }
  );
  if (draftError || typeof draftId !== "string") {
    return { ok: false, error: `Gagal membuat draf: ${draftError?.message}` };
  }
  summary.push("Draf dibuat — PT Nusa Boga (belum terbit).");

  return { ok: true, summary };
}

async function insertTemplate(def: {
  name: string;
  tax_label: string;
  tax_rate_bps: number;
  due_days: number;
  number_pattern: string;
}): Promise<string | null> {
  const user = await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("templates")
    .insert({
      user_id: user.id,
      name: def.name,
      tax_label: def.tax_label,
      tax_rate_bps: def.tax_rate_bps,
      due_days: def.due_days,
      number_pattern: def.number_pattern,
      invoice_title: "INVOICE",
      ...BUSINESS,
    })
    .select("id")
    .single();
  return error ? null : data.id;
}