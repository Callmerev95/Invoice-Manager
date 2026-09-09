import { LogOut } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { nextSequencesByPattern } from "@/lib/invoice-series";
import {
  DEFAULT_NUMBER_PATTERN,
  formatNumber,
} from "@/lib/templates";
import { PasswordForm } from "@/components/settings/password-form";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ password?: string }>;
}) {
  const user = await requireUser();
  const sp = await searchParams;
  const supabase = await createClient();

  const { data: templateRows } = await supabase
    .from("templates")
    .select("number_pattern");
  const patterns = [
    ...new Set(
      (templateRows ?? []).map((t) => t.number_pattern ?? DEFAULT_NUMBER_PATTERN)
    ),
  ];
  const year = new Date().getFullYear();
  const nextByPattern = await nextSequencesByPattern(supabase, patterns);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Setelan</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Profil, nomor seri, dan setelan lainnya.
        </p>
      </div>

      {sp.password === "1" ? (
        <p className="rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-sm text-primary">
          Kata sandi berhasil diganti.
        </p>
      ) : null}

      <section
        aria-labelledby="settings-account"
        className="rounded-2xl bg-surface p-5 shadow-neu-out"
      >
        <h2 id="settings-account" className="text-base font-semibold">
          Akun
        </h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <dt className="text-xs uppercase tracking-wide text-ink-faint">
                Email masuk
              </dt>
              <dd className="mt-0.5 text-ink">{user.email ?? "—"}</dd>
            </div>
            <form action="/auth/signout" method="POST">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-surface px-3 py-1.5 text-sm text-ink shadow-neu-sm transition-all hover:bg-surface-2 active:shadow-neu-in"
              >
                <LogOut className="h-4 w-4" aria-hidden />
                Keluar
              </button>
            </form>
          </div>
        </dl>
      </section>

      <section
        aria-labelledby="settings-password"
        className="rounded-2xl bg-surface p-5 shadow-neu-out"
      >
        <h2 id="settings-password" className="text-base font-semibold">
          Kata sandi
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Minimal 8 karakter. Anda tetap masuk setelah mengganti.
        </p>
        <PasswordForm />
      </section>

      <section
        aria-labelledby="settings-series"
        className="rounded-2xl bg-surface p-5 shadow-neu-out"
      >
        <h2 id="settings-series" className="text-base font-semibold">
          Nomor seri
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Nomor diklaim atomik saat invoice diterbitkan, satu seri per pola
          penomoran. Nilai di bawah hanya perkiraan berikutnya.
        </p>
        {patterns.length === 0 ? (
          <p className="mt-4 text-sm text-ink-muted">
            Belum ada pola penomoran. Buat template untuk memulai seri.
          </p>
        ) : (
          <dl className="mt-4 space-y-3 text-sm">
            {patterns.map((pattern) => (
              <div
                key={pattern}
                className="flex flex-wrap items-baseline justify-between gap-2 border-t border-line/60 pt-3 first:border-t-0 first:pt-0"
              >
                <dt className="tabular-nums text-ink-muted">{pattern}</dt>
                <dd className="tabular-nums font-medium text-ink">
                  {formatNumber(pattern, nextByPattern.get(pattern) ?? 1, year)}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </section>
    </div>
  );
}
