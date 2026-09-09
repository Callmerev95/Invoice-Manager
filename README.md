# Invoice Manager V1.0.0

Aplikasi web pribadi untuk freelancer Indonesia membuat, menerbitkan, dan menagih
invoice secara profesional. Dark-first, Bahasa Indonesia.

## Mengapa app ini ada

Freelancer Indonesia menagih dengan cara yang rapuh: nominal dihitung manual dan
rawan selisih, nomor invoice dibuat asal sehingga mudah dobel, dan penagihan
lewat chat tanpa dokumen resmi yang bisa dipegang klien. Akibatnya tiga hal
berulang: **tagihan berantakan** (angka tidak tepercaya), **kesan tidak
profesional** (dokumen seadanya menurunkan kepercayaan klien membayar), dan
**jejak bayar hilang** (lupa mana yang lunas, mana yang telat, siapa yang harus
dikejar).

Invoice Manager menjawab ketiganya dengan satu alur: invoice **diterbitkan
sebagai dokumen terkunci** (angka tidak bisa diubah diam-diam → tepercaya),
tampil **profesional** (kop, logo, tanda tangan, halaman klien resmi), dan
**status selalu jelas** (draf, terbit, lewat jatuh tempo, lunas — plus pengingat
bell dan riwayat bayar/penyesuaian yang teraudit).

**Coba langsung:** deployment demo + akun demo (lihat `docs/deploy.md`).

## Fitur V1

Skeleton loading · visual kustom PDF (logo, aksen, tanda tangan) · bell lewat
jatuh tempo · pagination + tab berangka · PWA installable · footer + versi ·
live demo. Selengkapnya: `docs/changelog.md`.

## Mulai

```bash
npm install
cp .env.example .env.local  # isi kredensial Supabase
npm run dev                  # http://localhost:3000
```

Panduan lengkap: [`docs/setup.md`](docs/setup.md) (instal + migrasi berurutan),
[`docs/deploy.md`](docs/deploy.md) (prod + demo), [`docs/panduan-pakai.md`](docs/panduan-pakai.md) (cara pakai).

## Untuk pengembang

- Glosarium domain: [`CONTEXT.md`](CONTEXT.md) · desain visual: [`docs/DESIGN.md`](docs/DESIGN.md) · keputusan: [`docs/adr/`](docs/adr/)
- Arsitektur + skema + runbook: [`docs/arsitektur.md`](docs/arsitektur.md), [`docs/skema.md`](docs/skema.md), [`docs/runbook.md`](docs/runbook.md)
- Data contoh lokal: `/dev/seed` (dev only, destruktif — baca peringatan)
- Cara kerja: satu fitur satu commit (lihat `AGENTS.md`); `npm run lint` + `npm run build` sebelum commit.
