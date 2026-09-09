import { clsx } from "clsx";
import { ArrowDownLeft } from "lucide-react";
import type { EffectiveStatus } from "@/lib/invoices";

const styles: Record<EffectiveStatus, string> = {
  draft: "border border-dashed border-ink-faint text-ink-muted",
  issued: "border border-primary/40 text-primary",
  overdue: "border border-warning/50 text-warning",
  paid: "bg-primary/15 text-primary-strong",
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
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
          styles[status]
        )}
      >
        {labels[status]}
      </span>
      {hasAdjustment ? (
        <span
          title="Ada penyesuaian"
          className="inline-flex items-center gap-1 rounded-full border border-line-strong px-2 py-0.5 text-xs text-ink-muted"
        >
          <ArrowDownLeft className="h-3 w-3" aria-hidden />
          Penyesuaian
        </span>
      ) : null}
    </span>
  );
}