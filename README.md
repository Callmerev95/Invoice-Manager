# Invoice Manager

> Aplikasi web untuk freelancer Indonesia: buat, terbitkan, dan tagih invoice
> tanpa hitung manual — dokumen terkunci, status selalu jelas, dan halaman klien
> resmi untuk setiap tagihan.

**Live demo:** [invoice-manager-demo.callmerev.my.id](https://invoice-manager-demo.callmerev.my.id)
· **Author:** [Callmerev](https://callmerev.my.id)

---

## Mengapa aplikasi ini ada

Freelancer Indonesia menagih dengan cara yang rapuh: nominal dihitung manual dan
rawan selisih, nomor invoice dibuat asal sehingga mudah dobel, dan penagihan
lewat chat tanpa dokumen resmi yang bisa dipegang klien. Akibatnya tiga hal
berulang:

| Masalah | Akar penyebab | Jawaban Invoice Manager |
| --- | --- | --- |
| **Tagihan berantakan** | Angka dihitung manual, riwayat bayar tercecer | Invoice terbit sebagai dokumen terkunci; sisa tagihan selalu bisa dijelaskan lewat riwayat pembayaran & penyesuaian |
| **Kesan tidak profesional** | Dokumen seadanya menurunkan kepercayaan klien | Kop rapi (logo, aksen brand, tanda tangan) + halaman klien resmi + PDF siap kirim |
| **Jejak bayar hilang** | Lupa mana yang lunas, siapa yang telat | Status terhitung otomatis (draf, terbit, lewat jatuh tempo, lunas) + bell pengingat di setiap halaman |

## Fitur V1

- **Template berulang** — identitas bisnis, pola penomoran, ketentuan, dan pajak
  dikonfigurasi sekali; visual (logo, aksen, tanda tangan) tersnapshot ke setiap
  invoice sehingga mengubah template tidak menyentuh dokumen lama.
- **Dokumen terkunci (immutable)** — invoice terbit tidak bisa diubah atau
  dihapus, ditegakkan trigger database (ADR-0001), bukan sekadar UI.
- **Koreksi terkontrol** — setelah terbit, besar tagihan hanya bisa berubah lewat
  **penyesuaian** berjumlah + alasan wajib (ADR-0002).
- **Penomoran atomik** — counter `next_seq` per pola diklaim di dalam transaksi;
  nomor invoice tidak pernah terpakai dua kali.
- **Pembayaran sebagian** — catat uang masuk kapan pun; status dan sisa tagihan
  dihitung ulang otomatis.
- **PDF kustom** — `@react-pdf/renderer` di server, logo/aksen/tanda tangan
  disnapshot; kegagalan ambil gambar jatuh ke fallback teks sehingga PDF tidak
  pernah gagal render.
- **Halaman klien publik** `/v/[token]` — ringkasan invoice, status, dan unduhan
  PDF tanpa akun; akses lewat token acak 32 heksadesimal.
- **Bell lewat jatuh tempo** — badge angka + panel daftar tagihan telat;
  stateless, tanpa tabel atau cron (dihitung ulang dari status terhitung).
- **Daftar ringan** — agregat `invoice_summaries` + `invoice_status_counts` di
  database, filter status berangka, 20 invoice per halaman.
- **PWA installable** — manifest + ikon + metadata Apple; tampil standalone tanpa
  app store.
- **Landing page publik** — memperkenalkan produk, CTA ke live demo, dan SEO
  lengkap (metadata, sitemap, Open Graph, JSON-LD).

## Tumpukan teknologi

| Lapisan | Teknologi |
| --- | --- |
| Framework | Next.js 16 (App Router, Server Components, Turbopack) |
| Bahasa | TypeScript 5 |
| UI | React 19, Tailwind CSS 4, lucide-react |
| Data & Auth | Supabase (Postgres, Auth, Storage) via `@supabase/ssr` |
| PDF | `@react-pdf/renderer` |
| Font | Rubik via `next/font/google` |
| Lint | ESLint 9 (`eslint-config-next`) |

Tidak ada state manager client: data dan mutasi mengalir lewat Server Component +
Server Action, dengan agregat dihitung di Postgres.

## Menjalankan secara lokal

### Prasyarat

- Node.js 20+
- Project Supabase (free tier cukup) — atau Supabase CLI untuk stack lokal

### Langkah

```bash
npm install
cp .env.example .env.local   # isi kredensial Supabase
```

Isi `.env.local`:

```dotenv
SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Apply migrasi **berurutan** (nomor file menaik) lewat SQL editor Supabase atau
`supabase db push`. Semua file ada di `supabase/migrations/`.

```bash
npm run dev     # http://localhost:3000
```

Lalu buat akun lewat `/signup`, isi template pertama di `/templates/new`, dan
mulai membuat invoice.

Data contoh lokal bisa dibuat lewat `/dev/seed` (dev only, destruktif — muncul
hanya saat bukan production atau flag demo aktif).

### Perintah

| Perintah | Kegunaan |
| --- | --- |
| `npm run dev` | Server pengembangan |
| `npm run build` | Build produksi |
| `npm run start` | Jalankan hasil build |
| `npm run lint` | ESLint |

## Arsitektur singkat

```
src/
  app/
    page.tsx                 # landing publik + JSON-LD
    (auth)/                  # login, signup, lupa/atur kata sandi
    (app)/                   # dashboard, invoices, templates, settings (wajib login)
    v/[token]/               # halaman klien publik + /pdf
    robots.ts, sitemap.ts, opengraph-image.tsx  # SEO
  components/                # primitif UI, editor invoice, form, nav, footer
  lib/                       # akses data, tipe DB, PDF, helper domain
supabase/migrations/         # skema + RPC + trigger
```

**Model data** (ringkas): `templates` (identitas + visual + pola penomoran),
`invoice_series` (counter per pola), `invoices` (snapshot template, status
`draft`/`issued`, nomor, token), `line_items`, `payments`, `adjustments`.
Isolasi baris lewat RLS `user_id = auth.uid()`; halaman publik membaca lewat RPC
bertoken tanpa membuka tabel.

**Aturan domain yang ditegakkan database**

1. Invoice terbit immutable — trigger `trg_issued_immutable` menolak UPDATE/DELETE.
2. Koreksi pasca-terbit hanya via penyesuaian beralasan.
3. Aset visual disnapshot dari template saat draf dibuat.

## Deployment

Dua deployment terpisah total (project Supabase berbeda, tanpa berbagi data):

- **Production** — `main`, tanpa flag demo apa pun.
- **Live demo** — deployment + Supabase sendiri, `ALLOW_DEMO_SEED=true` +
  `DEMO_EMAILS=<email demo>` + `NEXT_PUBLIC_DEMO_PASSWORD=<sandi demo>`, dan
  `NEXT_PUBLIC_NO_INDEX=true` agar demo tidak masuk mesin pencari.

Variabel SEO opsional: `NEXT_PUBLIC_SITE_URL` (canonical/sitemap/Open Graph) dan
`NEXT_PUBLIC_DEMO_URL` (tombol demo di landing). Nilai `NEXT_PUBLIC_*` dibaca
saat build — redeploy setelah mengubahnya.

## Kualitas

- `npm run lint` dan `npm run build` dijalankan sebelum setiap commit.
- Alur kritis (immutability invoice terbit, nomor unik, snapshot pola penomoran,
  reset demo) ditegakkan di level database, bukan hanya di UI.
- Aksesibilitas: target sentuh ≥ 44px, `focus-visible` konsisten, kontras teks
  terhadap kanvas gelap dijaga, pembeda status tidak hanya lewat warna.

## Lisensi & kredit

Proyek pribadi. Dibuat oleh [Callmerev](https://callmerev.my.id).
