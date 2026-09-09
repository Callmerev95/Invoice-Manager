"use server";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { canRunSeeder } from "@/lib/demo";
import { removeAssets } from "@/lib/template-assets";

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

const SEED_CLIENTS: { name: string; email?: string }[] = [
  { name: "Arya Wijaya", email: "arya@karya.id" },
  { name: "Maya Store", email: "hello@mayastore.co" },
  { name: "Kopi Senja", email: "halo@kopisenja.coffee" },
  { name: "Rumah Roti", email: "pesan@rumahroti.id" },
  { name: "Bengkel Maju", email: "info@bengkelmaju.id" },
  { name: "Toko Berkah", email: "halo@tokoberkah.id" },
  { name: "PT Nusa Karya", email: "admin@nusakarya.co.id" },
  { name: "Kedai Pagi", email: "pagi@kedaipagi.id" },
  { name: "Studio Lensa", email: "halo@studiolensa.id" },
  { name: "Laundry Bersih", email: "cs@laundrybersih.id" },
  { name: "CV Cahaya Timur", email: "info@cahayatimur.id" },
  { name: "Warung Sore", email: "sore@warungsore.id" },
  { name: "PT Samudra Biru", email: "keuangan@samudrabiru.id" },
  { name: "Barbershop Rapi", email: "booking@barberrapi.id" },
  { name: "Toko Bunga Asri", email: "halo@bungaasri.id" },
  { name: "Katering Rasa", email: "order@kateringrasa.id" },
  { name: "PT Wira Logistik", email: "billing@wiralogistik.id" },
  { name: "Kafe Teduh", email: "halo@kafeteduh.id" },
  { name: "Percetakan Cepat", email: "order@cetakcepat.id" },
  { name: "Butik Anggun", email: "cs@butikanggun.id" },
  { name: "PT Graha Pangan", email: "finance@grahapangan.id" },
  { name: "Salon Ayu", email: "booking@salonayu.id" },
  { name: "Toko Alat Tulis Prima", email: "halo@atprima.id" },
  { name: "Fotokopi Kilat", email: "order@fotokopikilat.id" },
  { name: "PT Cakra Steel", email: "accounting@cakrasteel.id" },
];

const SEED_SERVICES: [string, number][] = [
  // [deskripsi, harga rupiah satuan]
  ["Desain UI aplikasi mobile", 2_850_000],
  ["Identitas visual (logo + panduan merek)", 2_400_000],
  ["Konten Instagram 1 bulan", 900_000],
  ["Pitch deck & materi presentasi", 2_200_000],
  ["Sesi konsultasi merek (3 jam)", 250_000],
  ["Packaging & label produk", 1_900_000],
  ["Desain menu digital", 600_000],
  ["Audit UX + rekomendasi perbaikan", 1_750_000],
  ["Landing page 1 halaman", 1_200_000],
  ["Sistem desain komponen dasar", 3_100_000],
];

function buildSeedInvoices(): SeedInvoice[] {
  return SEED_CLIENTS.map((client, idx) => {
    const n = idx + 1;
    const mode = n % 5;
    const [descA, priceA] = SEED_SERVICES[idx % SEED_SERVICES.length];
    const [descB, priceB] = SEED_SERVICES[(idx + 3) % SEED_SERVICES.length];
    const items: [string, number, number][] =
      n % 2 === 0
        ? [[descA, 1, priceA], [descB, 2, priceB]]
        : [[descA, 1, priceA]];

    const base = {
      clientName: client.name,
      clientEmail: client.email,
      number: `INV-2026-${String(n).padStart(3, "0")}`,
      seq: n,
      items,
    };

    if (mode === 0) {
      // Lewat jatuh tempo: terbit lama, tanpa pembayaran
      return { ...base, issuedDaysAgo: 30 + n, dueDays: 14 };
    }
    if (mode === 1) {
      // Lunas: pembayaran penuh
      const total = items.reduce((acc, [, qty, price]) => acc + qty * price, 0);
      const withTax = Math.round(total * (1 + TEMPLATE_A.tax_rate_bps / 10000));
      return {
        ...base,
        issuedDaysAgo: 20 + n,
        dueDays: 14,
        payments: [
          { rupiah: Math.floor(withTax / 2), daysAgo: 10, note: "Transfer tahap 1" },
          { rupiah: Math.ceil(withTax / 2), daysAgo: 5, note: "Pelunasan" },
        ],
      };
    }
    if (mode === 2) {
      // Terbit + penyesuaian diskon, belum lunas
      return {
        ...base,
        issuedDaysAgo: 12,
        dueDays: 30,
        adjustment: { rupiah: -150_000, reason: "Diskon pelanggan baru", daysAgo: 9 },
      };
    }
    if (mode === 3) {
      // Terbit + pembayaran sebagian
      return {
        ...base,
        issuedDaysAgo: 6,
        dueDays: 14,
        payments: [{ rupiah: 500_000, daysAgo: 2, note: "Uang muka" }],
      };
    }
    // Terbit biasa
    return { ...base, issuedDaysAgo: 3, dueDays: 14 };
  });
}

const SEED_INVOICES: SeedInvoice[] = buildSeedInvoices();

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
  const user = await requireUser();
  if (!canRunSeeder(user.email)) {
    return { ok: false, error: "Seeder tidak tersedia di environment ini." };
  }
  const supabase = await createClient();
  const summary: string[] = [];

  const { data: oldTemplates } = await supabase
    .from("templates")
    .select("logo_path, signature_image_path")
    .eq("user_id", user.id);

  // Wipe via RPC: invoice terbit immutable bagi DELETE biasa (ADR-0001),
  // jadi reset dilepas-pasang trigger di dalam fungsi definer khusus demo.
  const { error: resetError } = await supabase.rpc("reset_demo_data");
  if (resetError) {
    const msg = /forbidden/i.test(resetError.message ?? "")
      ? "Reset hanya untuk akun demo."
      : (resetError.message ?? "").slice(0, 120) || "Gagal mereset data demo.";
    return { ok: false, error: msg };
  }

  await removeAssets(
    supabase,
    (oldTemplates ?? []).flatMap((t) => [
      t.logo_path ?? "",
      t.signature_image_path ?? "",
    ])
  );

  const templateA = await insertTemplate(TEMPLATE_A);
  if (!templateA) return { ok: false, error: "Gagal membuat template pertama." };
  const templateB = await insertTemplate(TEMPLATE_B);
  if (!templateB) return { ok: false, error: "Gagal membuat template kedua." };
  summary.push(`Template "${TEMPLATE_A.name}" dibuat.`);
  summary.push(`Template "${TEMPLATE_B.name}" dibuat.`);

  // Showcase visual: logo + tanda tangan + aksen untuk template pertama.
  const visualError = await seedTemplateVisual(supabase, user.id, templateA);
  if (visualError) return { ok: false, error: visualError };
  summary.push("Visual template (logo, aksen, tanda tangan) dipasang.");

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

async function seedTemplateVisual(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  templateId: string
): Promise<string | null> {
  try {
    const dir = path.join(process.cwd(), "public", "demo");
    const logo = await readFile(path.join(dir, "logo.png"));
    const signature = await readFile(path.join(dir, "signature.png"));
    const logoPath = `${userId}/${templateId}/logo.png`;
    const signaturePath = `${userId}/${templateId}/signature.png`;

    const { error: logoError } = await supabase.storage
      .from("template-assets")
      .upload(logoPath, logo, { contentType: "image/png", upsert: true });
    if (logoError) return `Gagal mengupload logo contoh: ${logoError.message}`;

    const { error: signError } = await supabase.storage
      .from("template-assets")
      .upload(signaturePath, signature, { contentType: "image/png", upsert: true });
    if (signError) return `Gagal mengupload tanda tangan contoh: ${signError.message}`;

    const { error: updateError } = await supabase
      .from("templates")
      .update({
        logo_path: logoPath,
        signature_image_path: signaturePath,
        accent_color: "#17A674",
      })
      .eq("id", templateId)
      .eq("user_id", userId);
    if (updateError) return `Gagal menyimpan visual contoh: ${updateError.message}`;
    return null;
  } catch (err) {
    return `Gagal membaca aset contoh: ${err instanceof Error ? err.message : "unknown"}`;
  }
}