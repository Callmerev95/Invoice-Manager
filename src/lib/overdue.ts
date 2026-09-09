import { createClient } from "@/lib/supabase/server";

export type OverdueItem = {
  id: string;
  number: string;
  clientName: string;
  dueDate: string;
  daysLate: number;
  balanceSen: number;
};

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Daftar invoice lewat jatuh tempo milik pengguna, terurut yang paling telat dulu. Stateless. */
export async function getOverdueItems(limit = 20): Promise<OverdueItem[]> {
  const supabase = await createClient();
  const today = todayKey();

  const { data: invoices } = await supabase
    .from("invoices")
    .select("id, number, client_name, due_date, tax_rate_bps")
    .eq("status", "issued")
    .order("due_date", { ascending: true })
    .limit(50);
  if (!invoices || invoices.length === 0) return [];

  const ids = invoices.map((i) => i.id);
  const [itemRes, payRes, adjRes] = await Promise.all([
    supabase.from("line_items").select("invoice_id, subtotal_sen").in("invoice_id", ids),
    supabase.from("payments").select("invoice_id, amount_sen").in("invoice_id", ids),
    supabase.from("adjustments").select("invoice_id, amount_sen").in("invoice_id", ids),
  ]);

  const subtotal = new Map<string, number>();
  for (const r of itemRes.data ?? []) {
    subtotal.set(r.invoice_id, (subtotal.get(r.invoice_id) ?? 0) + r.subtotal_sen);
  }
  const paid = new Map<string, number>();
  for (const r of payRes.data ?? []) {
    paid.set(r.invoice_id, (paid.get(r.invoice_id) ?? 0) + r.amount_sen);
  }
  const adj = new Map<string, number>();
  for (const r of adjRes.data ?? []) {
    adj.set(r.invoice_id, (adj.get(r.invoice_id) ?? 0) + r.amount_sen);
  }

  const items: OverdueItem[] = [];
  for (const inv of invoices) {
    const sub = subtotal.get(inv.id) ?? 0;
    const tax = Math.round((sub * inv.tax_rate_bps) / 10000);
    const balance = sub + tax + (adj.get(inv.id) ?? 0) - (paid.get(inv.id) ?? 0);
    if (balance <= 0) continue;
    if (!inv.due_date || inv.due_date >= today) continue;
    const daysLate = Math.floor(
      (Date.parse(today) - Date.parse(inv.due_date)) / 86_400_000
    );
    items.push({
      id: inv.id,
      number: inv.number,
      clientName: inv.client_name,
      dueDate: inv.due_date,
      daysLate: Math.max(daysLate, 1),
      balanceSen: balance,
    });
    if (items.length >= limit) break;
  }
  return items;
}
