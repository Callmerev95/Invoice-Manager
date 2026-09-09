import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { toTemplateDraft } from "@/lib/templates";
import { TemplateForm } from "@/components/template/template-form";

export const metadata: Metadata = {
  title: "Edit template — Invoice Manager",
};

export default async function EditTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const supabase = await createClient();

  const { data: row } = await supabase
    .from("templates")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!row) notFound();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Edit template</h1>
        <p className="mt-1 text-sm text-ink-muted">{row.name}</p>
      </div>
      <TemplateForm initial={toTemplateDraft(row)} />
    </div>
  );
}