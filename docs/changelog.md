# Changelog

## V1.0.0 — rilis awal

- **Skeleton loading**: `loading.tsx` per segmen (Beranda, Invoice, detail, Template) + indikator pending navigasi.
- **Visual kustom PDF**: logo upload, aksen, gambar tanda tangan + nama, kop rapi; tersnapshot ke invoice.
- **Bell lewat jatuh tempo**: badge angka + panel daftar/tautan, stateless, tutup klik-di-luar/Escape.
- **Pagination**: agregat RPC (`invoice_summaries`, `invoice_status_counts`) + indeks; daftar 20/halaman + tab berangka; dashboard agregat + 8 terbaru; pager responsif (nomor desktop, panah mobile).
- **PWA installable**: manifest + ikon + metadata Apple; tanpa service worker.
- **Footer + versi**: `© 2026 Callmerev • Invoice Manager V1`; bump `1.0.0`.
- **Live demo**: env terpisah, akun demo publik, seed 25 contoh bervisiual, reset mandiri.
- **Fix**: snapshot pola penomoran saat terbit (draf RPC + pola kustom yang selama ini diabaikan).
- **Rebrand Neumorphism gelap** (ADR-0004): kanvas forest `#141D19` + bayangan ganda, Rubik, timbul=aksi/cekung=isi; PDF & halaman klien tidak berubah; terang = fitur susulan di atas token semantik.
- **Fix**: pratinjau logo kosong (`src=""`) di form edit template.
