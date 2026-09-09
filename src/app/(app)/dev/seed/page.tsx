import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { SeedButton } from "./seed-button";

export const runtime = "nodejs";

export default async function SeedPage() {
  const isProduction = process.env.NODE_ENV === "production";

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Isi data contoh</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Halaman pengembangan untuk mengisi aplikasi dengan data percobaan.
        </p>
      </div>

      {isProduction ? (
        <p
          role="alert"
          className="rounded-md border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          Seeder dinonaktifkan di environment production.
        </p>
      ) : (
        <>
          <p className="flex items-start gap-2 rounded-md border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-ink">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden />
            <span>
              Menjalankan seeder akan <strong>menghapus seluruh data invoice dan
              template milik Anda</strong> lalu mengisinya kembali dengan 2 template
              dan 5 invoice contoh.
            </span>
          </p>

          <SeedButton key="seed" />

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-strong"
          >
            Kembali ke dashboard
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </>
      )}
    </div>
  );
}