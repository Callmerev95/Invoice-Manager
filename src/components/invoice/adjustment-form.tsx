"use client";

import { useActionState } from "react";
import { SlidersHorizontal } from "lucide-react";
import {
  addAdjustmentAction,
  type ActionState,
} from "@/app/(app)/invoices/actions";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";

export function AdjustmentForm({ invoiceId }: { invoiceId: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    addAdjustmentAction,
    undefined
  );

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={invoiceId} />
      {state?.error ? (
        <p
          role="alert"
          className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
        >
          {state.error}
        </p>
      ) : null}
      <p className="text-sm text-ink-muted">
        Pengurangan dinyatakan dengan angka negatif (mis. <span className="tabular-nums">-100000</span>),
        penambahan dengan angka positif.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nominal (Rp)" htmlFor="adjustment_amount">
          <Input
            id="adjustment_amount"
            name="amount"
            required
            inputMode="numeric"
            placeholder="-150000"
          />
        </Field>
        <Field label="Alasan" htmlFor="adjustment_reason">
          <Input
            id="adjustment_reason"
            name="reason"
            required
            placeholder="Mis. diskon pelunasan awal"
          />
        </Field>
      </div>
      <Button type="submit" disabled={pending}>
        <SlidersHorizontal className="h-4 w-4" aria-hidden />
        {pending ? "Menyimpan…" : "Tambahkan penyesuaian"}
      </Button>
    </form>
  );
}