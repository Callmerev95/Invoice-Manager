import { LogOut } from "lucide-react";
import { requireUser } from "@/lib/auth";

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Setelan</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Profil, nomor seri, dan setelan lainnya.
        </p>
      </div>

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
    </div>
  );
}
