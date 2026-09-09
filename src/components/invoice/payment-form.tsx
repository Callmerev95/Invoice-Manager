"use client";

import { useActionState } from "react";
import { Undo2 } from "lucide-react";
import {
  addPaymentAction,
  type ActionState,
} from "@/app/(app)/invoices/actions";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";

export function PaymentForm({ invoiceId }: { invoiceId: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    addPaymentAction,
    undefined
  );
  const today = new Date().toISOString().slice(0, 10);

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
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Nominal (Rp)" htmlFor="payment_amount">
          <Input
            id="payment_amount"
            name="amount"
            required
            inputMode="numeric"
            placeholder="500000"
          />
        </Field>
        <Field label="Tanggal" htmlFor="payment_paid_at">
          <Input id="payment_paid_at" name="paid_at" type="date" defaultValue={today} />
        </Field>
        <Field label="Catatan" htmlFor="payment_note">
          <Input id="payment_note" name="note" placeholder="Mis. transfer BCA" />
        </Field>
      </div>
      <Button type="submit" disabled={pending}>
        <Undo2 className="h-4 w-4" aria-hidden />
        {pending ? "Menyimpan…" : "Catat pembayaran"}
      </Button>
    </form>
  );
}