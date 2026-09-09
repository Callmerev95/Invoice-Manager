import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { emptyTemplateDraft } from "@/lib/templates";
import { TemplateForm } from "@/components/template/template-form";

export const metadata: Metadata = {
  title: "Template baru — Invoice Manager",
};

export default async function NewTemplatePage() {
  await requireUser();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Template baru</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Identitas bisnis dan ketentuan yang dipakai berulang.
        </p>
      </div>
      <TemplateForm initial={emptyTemplateDraft()} />
    </div>
  );
}