import type { createClient } from "@/lib/supabase/server";
import { patternRequiresSeq } from "@/lib/templates";

type ServerClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Compute the next allocatable invoice sequence per number pattern.
 *
 * Mirrors the allocation logic in the `issue_invoice` RPC: the counter is
 * namespaced by (user, pattern), so the next seq for a pattern is
 * `greatest(coalesce(series.next_seq, 0), coalesce(max(issued.seq), 0)) + 1`.
 * The `max(seq)` fallback also covers rows written outside the RPC
 * (e.g. seeders). Patterns without a `{seq}` placeholder are skipped —
 * callers fall back to `formatNumber(pattern, 1)`.
 *
 * Returned values are advisory: the actual number is assigned atomically
 * at issue time. Callers render with `formatNumber(pattern, next, year)`.
 */
export async function nextSequencesByPattern(
  supabase: ServerClient,
  patterns: string[]
): Promise<Map<string, number>> {
  const next = new Map<string, number>();

  const seqPatterns = [...new Set(patterns)].filter(patternRequiresSeq);
  if (seqPatterns.length === 0) return next;

  const [issuedRes, seriesRes] = await Promise.all([
    supabase
      .from("invoices")
      .select("pattern, seq")
      .in("pattern", seqPatterns)
      .neq("number", "")
      .neq("seq", 0),
    supabase
      .from("invoice_series")
      .select("pattern, next_seq")
      .in("pattern", seqPatterns),
  ]);

  const maxIssued = new Map<string, number>();
  for (const row of issuedRes.data ?? []) {
    if (row.pattern == null || row.seq == null) continue;
    maxIssued.set(row.pattern, Math.max(maxIssued.get(row.pattern) ?? 0, row.seq));
  }

  const seriesNext = new Map<string, number>();
  for (const row of seriesRes.data ?? []) {
    if (row.pattern == null || row.next_seq == null) continue;
    seriesNext.set(row.pattern, Math.max(seriesNext.get(row.pattern) ?? 0, row.next_seq));
  }

  for (const pattern of seqPatterns) {
    const base = Math.max(maxIssued.get(pattern) ?? 0, seriesNext.get(pattern) ?? 0);
    next.set(pattern, base + 1);
  }

  return next;
}
