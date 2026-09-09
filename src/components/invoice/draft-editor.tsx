"use client";

import { useActionState, useState } from "react";
import { SendHorizonal, Save } from "lucide-react";
import {
  saveDraftAction,
  type ActionState,
} from "@/app/(app)/invoices/actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import {
  LineItemsEditor,
  type DraftItem,
} from "@/components/invoice/line-items-editor";
import type { InvoiceVM } from "@/lib/invoice-vm";

export function DraftEditor({ invoice }: { invoice: InvoiceVM }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    saveDraftAction,
    undefined
  );
  const [items, setItems] = useState<DraftItem[]>(
    invoice.items.map((it, i) => ({
      key: i,
      description: it.description,
      quantity: String(it.quantity),
      unitPriceRupiah: Math.round(it.unitPriceSen / 100),
    }))
  );
  const [dueDays, setDueDays] = useState(invoice.dueDays);

  const due = new Date();
  due.setDate(due.getDate() + dueDays);
  const dueLabel = due.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const submitter = (e.nativeEvent as SubmitEvent).submitter as
      | HTMLButtonElement
      | null;
    if (
      submitter?.value === "issue" &&
      !window.confirm(
        "Terbitkan invoice sekarang? Setelah terbit, isi invoice tidak bisa diubah."
      )
    ) {
      e.preventDefault();
    }
  }

  return (
    <form action={action} onSubmit={handleSubmit} className="max-w-3xl space-y-8">
      <input type="hidden" name="id" value={invoice.id} />

      {state?.error ? (
        <p
          role="alert"
          className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
        >
          {state.error}
        </p>
      ) : null}

      <section className="space-y-4">
        <h2 className="text-base font-semibold">Klien</h2>
        <Field label="Nama klien" htmlFor="client_name">
          <Input
            id="client_name"
            name="client_name"
            required
            defaultValue={invoice.clientName}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email" htmlFor="client_email">
            <Input
              id="client_email"
              name="client_email"
              type="email"
              defaultValue={invoice.clientEmail ?? ""}
            />
          </Field>
          <Field
            label="Jatuh tempo (hari)"
            htmlFor="due_days"
            hint={`Jatuh tempo akan menjadi ${dueLabel}.`}
          >
            <Input
              id="due_days"
              name="due_days"
              type="number"
              min={0}
              value={dueDays}
              onChange={(e) => setDueDays(Number(e.target.value))}
            />
          </Field>
        </div>
        <Field label="Alamat" htmlFor="client_address">
          <Textarea
            id="client_address"
            name="client_address"
            defaultValue={invoice.clientAddress ?? ""}
          />
        </Field>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold">Item</h2>
        <LineItemsEditor
          items={items}
          setItems={setItems}
          taxRateBps={invoice.taxRateBps}
          taxLabel={invoice.taxLabel}
        />
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
        <p className="text-sm text-ink-muted">
          Nomor diberikan saat terbit (pola{" "}
          <span className="tabular-nums">{invoice.pattern || "INV-{yyyy}-{seq:3}"}</span>).
        </p>
        <div className="flex items-center gap-3">
          <Button type="submit" name="action" value="save" variant="ghost" disabled={pending}>
            <Save className="h-4 w-4" aria-hidden />
            {pending ? "Menyimpan…" : "Simpan draf"}
          </Button>
          <Button type="submit" name="action" value="issue" disabled={pending}>
            <SendHorizonal className="h-4 w-4" aria-hidden />
            {pending ? "Memproses…" : "Terbitkan"}
          </Button>
        </div>
      </div>
    </form>
  );
}