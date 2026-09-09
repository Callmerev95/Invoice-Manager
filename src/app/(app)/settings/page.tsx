import { requireUser } from "@/lib/auth";

export default async function SettingsPlaceholder() {
  await requireUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Setelan</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Profil, nomor seri, dan setelan lainnya.
        </p>
      </div>
      <div className="rounded-lg border border-dashed border-line-strong px-6 py-12 text-center">
        <p className="text-sm text-ink-muted">
          Halaman setelan belum dibangun.
        </p>
      </div>
    </div>
  );
}