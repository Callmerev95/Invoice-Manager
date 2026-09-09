import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Bell,
  FileCheck2,
  FileSignature,
  LayoutTemplate,
  ListFilter,
  PencilLine,
  Smartphone,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AppFooter } from "@/components/app-footer";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "Invoice Manager — tagihan freelancer yang tepercaya",
  description:
    "Buat, terbitkan, dan kejar invoice secara profesional: dokumen terkunci, status jelas, halaman klien resmi.",
};

const NEU_OUT = "shadow-neu-out";
const NEU_IN = "shadow-neu-in";
const NEU_SM = "shadow-neu-sm";

const PROBLEMS: { masalah: string; solusi: string }[] = [
  {
    masalah: "Tagihan berantakan — angka dihitung manual dan rawan selisih",
    solusi:
      "Invoice terbit sebagai dokumen terkunci: angka tidak bisa diubah diam-diam, sisa tagihan selalu bisa dijelaskan lewat riwayat pembayaran dan penyesuaian.",
  },
  {
    masalah: "Kesan tidak profesional — dokumen seadanya menurunkan kepercayaan",
    solusi:
      "Kop rapi dengan logo, aksen brand, dan tanda tangan; klien menerima halaman resmi plus PDF yang rapi tanpa butuh akun.",
  },
  {
    masalah: "Jejak bayar hilang — lupa mana yang lunas dan siapa yang telat",
    solusi:
      "Status terhitung otomatis (draf, terbit, lewat jatuh tempo, lunas) plus bel pengingat di setiap halaman aplikasi.",
  },
];

const FEATURES = [
  {
    icon: PencilLine,
    title: "Visual kustom PDF",
    desc: "Logo, warna aksen, dan gambar tanda tangan ikut tersnapshot ke setiap invoice.",
  },
  {
    icon: FileCheck2,
    title: "Dokumen terkunci",
    desc: "Invoice terbit immutable — dipertahankan database, bukan sekadar UI.",
  },
  {
    icon: Bell,
    title: "Pengingat lewat tempo",
    desc: "Bell dengan angka telatan; daftar tagihan telat satu klik dari mana saja.",
  },
  {
    icon: ListFilter,
    title: "Daftar yang tetap ringan",
    desc: "Agregasi di database: filter berangka, 20 invoice per halaman, responsif.",
  },
  {
    icon: LayoutTemplate,
    title: "Template berulang",
    desc: "Pola penomoran atomik per pola — nomor invoice tidak pernah dobel.",
  },
  {
    icon: Smartphone,
    title: "Pasang di HP",
    desc: "PWA installable: tampil standalone dengan ikon sendiri, tanpa app store.",
  },
];

function demoHref(): string {
  const url = process.env.NEXT_PUBLIC_DEMO_URL;
  return url && url.trim() !== "" ? url.trim() : "/login";
}

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  const demo = demoHref();
  const demoExternal = demo.startsWith("http");

  return (
    <main className="min-h-screen bg-bg text-ink">
      <div className="mx-auto max-w-5xl px-4 py-5 sm:px-8">
        <nav className="neu-entrance flex items-center justify-between" aria-label="Utama">
          <span className="text-sm font-bold tracking-tight">Invoice Manager</span>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex min-h-[44px] items-center rounded-xl bg-surface px-4 py-2 text-sm font-medium shadow-neu-sm transition-all hover:shadow-neu-out"
            >
              Masuk
            </Link>
            <Link
              href={demo}
              {...(demoExternal ? { target: "_blank", rel: "noreferrer" } : {})}
              className={`inline-flex min-h-[44px] items-center rounded-xl bg-primary px-4 py-2 text-sm font-bold text-bg ${NEU_SM} transition-all hover:-translate-y-px hover:shadow-neu-out active:shadow-neu-in`}
            >
              Coba demo
            </Link>
          </div>
        </nav>

        <section
          className={`neu-entrance relative mt-10 overflow-hidden rounded-3xl bg-surface p-8 sm:mt-14 sm:p-12 ${NEU_OUT}`}
          style={{ animationDelay: "60ms" }}
        >
          <div
            aria-hidden
            className="bg-emboss-doc pointer-events-none absolute -right-6 -top-12 h-96 w-72 rotate-12 opacity-50"
          />
          <div className="relative z-10">
          <h1 className="max-w-2xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            Tagihan freelancer yang tepercaya, dari draf sampai lunas.
          </h1>
          <p className="mt-4 max-w-2xl text-ink-muted">
            Invoice Manager membuat, menerbitkan, dan menagih invoice secara
            profesional — dokumen terkunci yang tidak bisa diubah diam-diam,
            status yang selalu jelas, dan halaman klien resmi untuk setiap tagihan.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <Link
              href={demo}
              {...(demoExternal ? { target: "_blank", rel: "noreferrer" } : {})}
              className={`inline-flex min-h-[44px] items-center rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-bg ${NEU_SM}`}
            >
              Coba live demo
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-primary hover:text-primary-hover"
            >
              Sudah punya akun? Masuk
            </Link>
          </div>
          </div>
        </section>

        <Reveal className="mt-12">
          <section aria-labelledby="masalah-solusi">
            <h2 id="masalah-solusi" className="text-xl font-bold tracking-tight">
              Tiga masalah penagihan yang berulang
            </h2>
            <div className="mt-5 space-y-4">
              {PROBLEMS.map((p) => (
                <article
                  key={p.masalah}
                  className={`rounded-2xl bg-surface p-5 sm:p-6 ${NEU_IN}`}
                >
                  <p className="text-sm font-semibold">{p.masalah}</p>
                  <p className="mt-2 text-sm text-ink-muted">{p.solusi}</p>
                </article>
              ))}
            </div>
          </section>
        </Reveal>

        <Reveal className="mt-12">
          <section aria-labelledby="fitur">
            <h2 id="fitur" className="text-xl font-bold tracking-tight">
              Isi V1
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <article
                  key={f.title}
                  className={`rounded-2xl bg-surface p-5 transition-all ${NEU_OUT} hover:shadow-neu-in`}
                >
                  <f.icon className="h-5 w-5 text-primary" aria-hidden />
                  <h3 className="mt-3 text-sm font-bold">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-ink-muted">{f.desc}</p>
                </article>
              ))}
            </div>
          </section>
        </Reveal>

        <Reveal className="mt-12">
          <section className={`relative overflow-hidden rounded-3xl bg-surface p-8 text-center sm:p-12 ${NEU_IN}`}>
            <div
              aria-hidden
              className="bg-emboss-doc pointer-events-none absolute -left-8 -bottom-10 h-72 w-56 -rotate-6 opacity-40"
            />
            <div className="relative z-10">
              <FileSignature className="mx-auto h-6 w-6 text-primary" aria-hidden />
              <h2 className="mt-4 text-xl font-bold tracking-tight">
                Lihat sendiri dengan data contoh
              </h2>
              <p className="mx-auto mt-2 max-w-xl text-sm text-ink-muted">
                Deployment demo berisi 25 invoice contoh — lengkap dengan tagihan
                telat, pembayaran, dan template bervisiual. Bebas diutak-atik dan
                direset kapan pun.
              </p>
              <Link
                href={demo}
                {...(demoExternal ? { target: "_blank", rel: "noreferrer" } : {})}
                className={`mt-6 inline-flex min-h-[44px] items-center rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-bg ${NEU_SM}`}
              >
                Coba live demo
              </Link>
            </div>
          </section>
        </Reveal>

        <AppFooter />
      </div>
    </main>
  );
}
