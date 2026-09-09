"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { SendHorizonal, Save } from "lucide-react";
import {
  createInvoiceAction,
  type ActionState,
} from "@/app/(app)/invoices/actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import {
  LineItemsEditor,
  type DraftItem,
} from "@/components/invoice/line-items-editor";
import { formatNumber } from "@/lib/templates";

export type TemplatePick = {
  id: string;
  name: string;
  due_days: number;
  tax_rate_bps: number;
  tax_label: string;
  number_pattern: string;
  /** Advisory next seq for this pattern (assigned atomically at issue time). */
  next_seq: number;
};

export function InvoiceForm({ template }: { template: TemplatePick }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    createInvoiceAction,
    undefined
  );
  const [items, setItems] = useState<DraftItem[]>([
    { key: 1, description: "", quantity: "1", unitPriceRupiah: 0 },
  ]);
  const [dueDays, setDueDays] = useState(template.due_days);

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
      <input type="hidden" name="template" value={template.id} />

      {state?.error ? (
        <p
          role="alert"
          className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
        >
          {state.error}
        </p>
      ) : null}

      <p className="text-sm text-ink-muted">
        Berdasarkan template{" "}
        <span className="font-medium text-ink">{template.name}</span>
      </p>

      <section className="space-y-4">
        <h2 className="text-base font-semibold">Klien</h2>
        <Field label="Nama klien" htmlFor="client_name">
          <Input id="client_name" name="client_name" required placeholder="Nama atau perusahaan" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email" htmlFor="client_email">
            <Input id="client_email" name="client_email" type="email" />
          </Field>
          <Field label="Jatuh tempo (hari)" htmlFor="due_days" hint={`Jatuh tempo akan menjadi ${dueLabel}.`}>
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
          <Textarea id="client_address" name="client_address" />
        </Field>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold">Item</h2>
        <LineItemsEditor
          items={items}
          setItems={setItems}
          taxRateBps={template.tax_rate_bps}
          taxLabel={template.tax_label}
        />
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
        <p className="text-sm text-ink-muted">
          Nomor berikutnya:{" "}
          <span className="tabular-nums font-medium text-ink">
            {formatNumber(
              template.number_pattern,
              template.next_seq,
              new Date().getFullYear()
            )}
          </span>
        </p>
        <div className="flex items-center gap-3">
          <Link
            href="/invoices"
            className="inline-flex items-center rounded-md border border-line-strong px-4 py-2 text-sm text-ink hover:bg-surface-2"
          >
            Batal
          </Link>
          <Button type="submit" name="action" value="save" variant="ghost" disabled={pending}>
            <Save className="h-4 w-4" aria-hidden />
            {pending ? "Menyimpan…" : "Simpan draf"}
          </Button>
          <Button type="submit" name="action" value="issue" disabled={pending}>
            <SendHorizonal className="h-4 w-4" aria-hidden />
            {pending ? "Memproses…" : "Buat & terbitkan"}
          </Button>
        </div>
      </div>
    </form>
  );
}