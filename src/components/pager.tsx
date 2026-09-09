import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

function pageList(page: number, total: number): (number | "…")[] {
  const keep = new Set<number>([1, page - 1, page, page + 1, total]);
  const nums = [...keep].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  for (let i = 0; i < nums.length; i++) {
    if (i > 0 && nums[i] - nums[i - 1] > 1) out.push("…");
    out.push(nums[i]);
  }
  return out;
}

export function Pager({
  page,
  totalPages,
  makeHref,
  label = "Navigasi halaman",
}: {
  page: number;
  totalPages: number;
  makeHref: (page: number) => string;
  label?: string;
}) {
  if (totalPages <= 1) return null;

  const prevHref = page > 1 ? makeHref(page - 1) : null;
  const nextHref = page < totalPages ? makeHref(page + 1) : null;

  return (
    <nav aria-label={label} className="flex items-center justify-between gap-2">
      {/* Mobile: panah saja */}
      <div className="flex w-full items-center justify-between md:hidden">
        {prevHref ? (
          <Link
            href={prevHref}
            aria-label="Halaman sebelumnya"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-line text-ink hover:bg-surface-2"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </Link>
        ) : (
          <span
            aria-hidden
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-line opacity-40"
          >
            <ChevronLeft className="h-5 w-5" />
          </span>
        )}
        <span className="text-sm tabular-nums text-ink-muted" aria-live="polite">
          Hal {page}/{totalPages}
        </span>
        {nextHref ? (
          <Link
            href={nextHref}
            aria-label="Halaman berikutnya"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-line text-ink hover:bg-surface-2"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </Link>
        ) : (
          <span
            aria-hidden
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-line opacity-40"
          >
            <ChevronRight className="h-5 w-5" />
          </span>
        )}
      </div>

      {/* Desktop: nomor halaman */}
      <div className="hidden w-full items-center justify-center gap-1 md:flex">
        {prevHref ? (
          <Link
            href={prevHref}
            aria-label="Halaman sebelumnya"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-line text-ink hover:bg-surface-2"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </Link>
        ) : (
          <span
            aria-hidden
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-line opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </span>
        )}
        {pageList(page, totalPages).map((p, i) =>
          p === "…" ? (
            <span key={`gap-${i}`} aria-hidden className="px-1 text-ink-faint">
              …
            </span>
          ) : p === page ? (
            <span
              key={p}
              aria-current="page"
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-primary/50 bg-surface-2 px-3 text-sm font-medium tabular-nums text-primary"
            >
              {p}
            </span>
          ) : (
            <Link
              key={p}
              href={makeHref(p)}
              aria-label={`Halaman ${p}`}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-line px-3 text-sm tabular-nums text-ink-muted hover:text-ink"
            >
              {p}
            </Link>
          )
        )}
        {nextHref ? (
          <Link
            href={nextHref}
            aria-label="Halaman berikutnya"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-line text-ink hover:bg-surface-2"
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        ) : (
          <span
            aria-hidden
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-line opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </div>
    </nav>
  );
}
