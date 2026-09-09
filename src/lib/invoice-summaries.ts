import type { createClient } from "@/lib/supabase/server";
import type { EffectiveStatus } from "@/lib/invoices";

type ServerClient = Awaited<ReturnType<typeof createClient>>;

export const INVOICE_PAGE_SIZE = 20;

export type SummaryFilter = EffectiveStatus | "all";

export type InvoiceSummaryRow = {
  id: string;
  number: string;
  clientName: string;
  issueDate: string | null;
  dueDate: string | null;
  balanceSen: number;
  effectiveStatus: EffectiveStatus;
  hasAdjustment: boolean;
};

type RpcRow = {
  id: string;
  number: string;
  client_name: string;
  issue_date: string | null;
  due_date: string | null;
  balance_sen: number;
  has_adjustment: boolean;
  effective_status: EffectiveStatus;
  total_count: number;
};

function toRow(r: RpcRow): InvoiceSummaryRow {
  return {
    id: r.id,
    number: r.number,
    clientName: r.client_name,
    issueDate: r.issue_date,
    dueDate: r.due_date,
    balanceSen: Number(r.balance_sen),
    effectiveStatus: r.effective_status,
    hasAdjustment: r.has_adjustment,
  };
}

export async function getInvoiceSummaries(
  supabase: ServerClient,
  filter: SummaryFilter,
  page: number,
  pageSize = INVOICE_PAGE_SIZE
): Promise<{ rows: InvoiceSummaryRow[]; totalCount: number }> {
  const safePage = Number.isInteger(page) && page > 0 ? page : 1;
  const { data, error } = await supabase.rpc("invoice_summaries", {
    p_status: filter,
    p_limit: pageSize,
    p_offset: (safePage - 1) * pageSize,
  });
  if (error || !data) return { rows: [], totalCount: 0 };
  const rows = (data as RpcRow[]).map(toRow);
  const totalCount = data.length > 0 ? Number((data[0] as RpcRow).total_count) : 0;
  return { rows, totalCount };
}

export async function getStatusCounts(
  supabase: ServerClient
): Promise<Map<SummaryFilter, number>> {
  const counts = new Map<SummaryFilter, number>();
  const { data } = await supabase.rpc("invoice_status_counts");
  let total = 0;
  for (const row of (data ?? []) as { status: EffectiveStatus; count: number }[]) {
    const n = Number(row.count);
    counts.set(row.status, n);
    total += n;
  }
  counts.set("all", total);
  return counts;
}

export function clampPage(page: number, totalCount: number, pageSize = INVOICE_PAGE_SIZE): number {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  if (!Number.isInteger(page) || page < 1) return 1;
  return Math.min(page, totalPages);
}

export function totalPages(totalCount: number, pageSize = INVOICE_PAGE_SIZE): number {
  return Math.max(1, Math.ceil(totalCount / pageSize));
}
