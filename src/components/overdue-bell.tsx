"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { formatRupiah, formatDate } from "@/lib/invoices";
import type { OverdueItem } from "@/lib/overdue";

export function OverdueBell({ items }: { items: OverdueItem[] }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const count = items.length;

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onPointerDown(e: PointerEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open ]);

  return (
    <div ref={panelRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={
          count === 0
            ? "Notifikasi: tidak ada invoice lewat jatuh tempo"
            : `Notifikasi: ${count} invoice lewat jatuh tempo`
        }
        className="relative inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl px-2 text-ink-muted transition-all hover:text-ink hover:shadow-neu-sm"
      >
        <Bell className="h-5 w-5" aria-hidden />
        {count > 0 ? (
          <span
            aria-hidden
            className="absolute right-0.5 top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-warning px-1 text-[11px] font-semibold tabular-nums text-bg"
          >
            {count > 99 ? "99+" : count}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          role="region"
          aria-label="Invoice lewat jatuh tempo"
          className="absolute right-0 z-30 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl bg-surface shadow-neu-out"
        >
          <p className="border-b border-line/60 px-4 py-2.5 text-sm font-semibold text-ink">
            {count === 0
              ? "Lewat jatuh tempo"
              : `Lewat jatuh tempo (${count})`}
          </p>
          {count === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-ink-muted">
              Tidak ada yang lewat jatuh tempo.
            </p>
          ) : (
            <ul className="max-h-80 divide-y divide-line/60 overflow-y-auto">
              {items.map((it) => (
                <li key={it.id}>
                  <Link
                    href={`/invoices/${it.id}`}
                    onClick={() => setOpen(false)}
                    className="block px-4 py-3 transition-colors hover:bg-surface-2"
                  >
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="font-medium tabular-nums text-ink">
                        {it.number || "Tanpa nomor"}
                      </span>
                      <span className="text-sm font-semibold tabular-nums text-warning">
                        {formatRupiah(it.balanceSen)}
                      </span>
                    </span>
                    <span className="mt-0.5 block truncate text-sm text-ink-muted">
                      {it.clientName || "Tanpa nama klien"}
                    </span>
                    <span className="mt-0.5 block text-xs text-ink-faint">
                      Telat {it.daysLate} hari · Jatuh tempo {formatDate(it.dueDate)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {count > 0 ? (
            <Link
              href="/invoices?status=overdue"
              onClick={() => setOpen(false)}
              className="block border-t border-line/60 px-4 py-2.5 text-center text-sm font-medium text-primary hover:text-primary-hover"
            >
              Lihat semua
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
