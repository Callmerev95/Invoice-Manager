import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-4 text-ink">
      <section className="relative overflow-hidden rounded-3xl bg-surface px-8 py-14 text-center shadow-neu-out sm:px-16">
        <div
          aria-hidden
          className="bg-emboss-doc pointer-events-none absolute -right-6 -top-10 h-80 w-60 rotate-12 opacity-40"
        />
        <div className="relative z-10">
          <p className="text-5xl font-bold tabular-nums text-primary">404</p>
          <h1 className="mt-4 text-xl font-bold tracking-tight">
            Halaman tidak ditemukan
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-sm text-ink-muted">
            Tautan yang kamu buka tidak ada atau sudah dipindahkan. Cek kembali
            alamatnya, atau mulai dari beranda.
          </p>
          <Link
            href="/"
            className="mt-7 inline-flex min-h-[44px] items-center rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-bg shadow-neu-sm transition-all hover:-translate-y-px hover:shadow-neu-out active:shadow-neu-in"
          >
            Kembali ke beranda
          </Link>
        </div>
      </section>
    </main>
  );
}
