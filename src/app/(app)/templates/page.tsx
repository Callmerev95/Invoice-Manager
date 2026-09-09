import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { nextSequencesByPattern } from "@/lib/invoice-series";
import { formatNumber } from "@/lib/templates";
import { DeleteButton } from "@/components/delete-button";
import { deleteTemplateAction } from "./actions";

export default async function TemplatesPage() {
  await requireUser();
  const supabase = await createClient();

  const [templatesRes, invoicesRes] = await Promise.all([
    supabase
      .from("templates")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100),
    supabase.from("invoices").select("template_id"),
  ]);

  const templates = templatesRes.data ?? [];

  const nextByPattern = await nextSequencesByPattern(
    supabase,
    templates.map((t) => t.number_pattern ?? "INV-{yyyy}-{seq:3}")
  );

  const counts = new Map<string, number>();
  for (const inv of invoicesRes.data ?? []) {
    if (inv.template_id) {
      counts.set(inv.template_id, (counts.get(inv.template_id) ?? 0) + 1);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Template</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Identitas bisnis dan ketentuan untuk membuat invoice.
          </p>
        </div>
        <Link
          href="/templates/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-bg hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Template baru
        </Link>
      </header>

      {templates.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line-strong px-6 py-16 text-center">
          <p className="text-sm text-ink-muted">
            Belum ada template. Buat satu untuk mulai membuat invoice.
          </p>
          <Link
            href="/templates/new"
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-bg hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Buat template pertama
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {templates.map((t) => {
            const count = counts.get(t.id) ?? 0;
            return (
              <div
                key={t.id}
                className="group rounded-lg border border-line bg-surface p-4 transition-colors hover:border-line-strong"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-ink">{t.name}</h2>
                    <p className="mt-0.5 text-sm text-ink-muted">
                      {t.business_name || "Identitas bisnis belum diisi"}
                    </p>
                  </div>
                  <DeleteButton
                    action={deleteTemplateAction}
                    id={t.id}
                    confirmText={`Hapus template "${t.name}"?`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                    <span className="sr-only">Hapus {t.name}</span>
                  </DeleteButton>
                </div>
                <dl className="mt-4 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-ink-faint">Nomor berikutnya</dt>
                    <dd className="tabular-nums text-ink-muted">
                      {formatNumber(
                        t.number_pattern ?? "INV-{yyyy}-{seq:3}",
                        nextByPattern.get(
                          t.number_pattern ?? "INV-{yyyy}-{seq:3}"
                        ) ?? 1
                      )}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-ink-faint">Jatuh tempo</dt>
                    <dd className="text-ink-muted">{t.due_days} hari</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-ink-faint">Invoice dibuat</dt>
                    <dd className="text-ink-muted">{count}</dd>
                  </div>
                </dl>
                <Link
                  href={`/templates/${t.id}/edit`}
                  className="mt-4 inline-flex w-full items-center justify-center rounded-md border border-line-strong px-3 py-1.5 text-sm text-ink transition-colors hover:bg-surface-2"
                >
                  Edit template
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}