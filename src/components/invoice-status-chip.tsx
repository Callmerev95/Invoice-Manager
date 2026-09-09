import { clsx } from "clsx";
import { ArrowDownLeft } from "lucide-react";
import type { EffectiveStatus } from "@/lib/invoices";

const styles: Record<EffectiveStatus, string> = {
  draft: "text-ink-muted",
  issued: "text-primary",
  overdue: "text-warning",
  paid: "text-primary-strong",
};

const labels: Record<EffectiveStatus, string> = {
  draft: "Draf",
  issued: "Terbit",
  overdue: "Lewat",
  paid: "Lunas",
};

export function InvoiceStatusChip({
  status,
  hasAdjustment = false,
}: {
  status: EffectiveStatus;
  hasAdjustment?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={clsx(
          "inline-flex items-center rounded-full bg-surface px-2.5 py-0.5 text-xs font-medium shadow-neu-sm",
          styles[status]
        )}
      >
        {labels[status]}
      </span>
      {hasAdjustment ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 text-xs text-ink-muted shadow-neu-sm">
          <ArrowDownLeft className="h-3 w-3" aria-hidden />
          Penyesuaian
        </span>
      ) : null}
    </span>
  );
}