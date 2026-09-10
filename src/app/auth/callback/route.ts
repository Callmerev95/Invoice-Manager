import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Whitelist: tautan pemulihan satu-satunya alur yang memakai `next`.
  // Tanpa ini, param terbuka jadi celah open-redirect setelah sesi tukar.
  const next = searchParams.get("next") === "/update-password" ? "/update-password" : "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const host = forwardedHost
        ? `https://${forwardedHost}`
        : origin;
      return NextResponse.redirect(`${host}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=callback`);
}