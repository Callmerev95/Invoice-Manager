import { createClient } from "@/lib/supabase/server";
import { isPublicInvoice, toPdfInvoice } from "@/lib/public-invoice";
import { renderInvoicePdf } from "@/lib/pdf";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  if (!/^[0-9a-f]{32}$/.test(token)) {
    return new Response("Invoice tidak ditemukan", { status: 404 });
  }

  const supabase = await createClient();
  const { data } = await supabase.rpc("get_public_invoice", { p_token: token });
  if (!isPublicInvoice(data)) {
    return new Response("Invoice tidak ditemukan", { status: 404 });
  }

  const buffer = await renderInvoicePdf(toPdfInvoice(data));
  return new Response(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${data.number}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}