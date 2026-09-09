import { LogOut } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { PasswordForm } from "@/components/settings/password-form";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ password?: string }>;
}) {
  const user = await requireUser();
  const sp = await searchParams;

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
        className="rounded-lg border border-line bg-surface p-5"
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
                className="inline-flex items-center gap-2 rounded-md border border-line-strong px-3 py-1.5 text-sm text-ink transition-colors hover:bg-surface-2"
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
        className="rounded-lg border border-line bg-surface p-5"
      >
        <h2 id="settings-password" className="text-base font-semibold">
          Kata sandi
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Minimal 8 karakter. Anda tetap masuk setelah mengganti.
        </p>
        <PasswordForm />
      </section>
    </div>
  );
}
