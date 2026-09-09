import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { buildInvoiceVM } from "@/lib/invoice-vm";
import { renderInvoicePdf } from "@/lib/pdf";
import { assetPublicUrl, fetchAssetDataUri } from "@/lib/template-assets";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireUser();
  const { id } = await params;
  const supabase = await createClient();

  const [invRes, itemRes, payRes, adjRes] = await Promise.all([
    supabase.from("invoices").select("*").eq("id", id).single(),
    supabase.from("line_items").select("*").eq("invoice_id", id),
    supabase.from("payments").select("*").eq("invoice_id", id),
    supabase.from("adjustments").select("*").eq("invoice_id", id),
  ]);

  if (!invRes.data || invRes.error) {
    return new Response("Invoice tidak ditemukan", { status: 404 });
  }

  const vm = buildInvoiceVM(
    invRes.data,
    itemRes.data ?? [],
    payRes.data ?? [],
    adjRes.data ?? []
  );

  const [logoDataUri, signatureImageDataUri] = await Promise.all([
    fetchAssetDataUri(assetPublicUrl(supabase, vm.logoPath)),
    fetchAssetDataUri(assetPublicUrl(supabase, vm.signatureImagePath)),
  ]);

  const buffer = await renderInvoicePdf({
    ...vm,
    logoDataUri,
    signatureImageDataUri,
  });
  return new Response(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${vm.number || "draft-invoice"}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}