# Spec: Live demo untuk reviewer (env terpisah + reset + kredensial fake)

Status: ready-for-agent

## Problem Statement

Reviewer/recruiter tidak bisa menilai aplikasi tanpa akun dan data. Memberi akses ke production berisiko (data asli, tanpa reset), sedangkan seeder dev mati di production dan tidak memamerkan fitur visual terbaru.

## Solution

Environment demo terisolasi penuh (project Supabase + deployment sendiri) dengan akun demo publik berkredensial fake yang tertulis di halaman login. Data contoh mencakup semua fitur (visual template, overdue, pagination 2 halaman), dan akun demo bisa me-reset datanya sendiri kapan pun via seeder yang dibuka khusus untuk email demo.

## User Stories

1. Sebagai reviewer, saya ingin melihat kredensial demo langsung di halaman login, sehingga saya masuk dalam sekali klik tanpa bertanya.
2. Sebagai reviewer, saya ingin data langsung lengkap (25 invoice, template bervisiual, tagihan telat, pagination), sehingga semua fitur terlihat dalam 2 menit.
3. Sebagai reviewer, saya ingin bebas mengutak-atik lalu mengembalikan keadaan via tombol reset, sehingga eksplorasi tanpa rasa bersalah.
4. Sebagai pemilik produk, saya ingin demo 100% terpisah dari production (project + hosting beda), sehingga data asli mustahil tersentuh.
5. Sebagai pemilik produk, saya ingin seeder mustahil aktif di production (cek ganda: flag + daftar email), sehingga kredensial demo bocor pun tidak membuka prod.
6. Sebagai pengembang, saya ingin reuse seeder dev yang ada (bukan sistem kedua), sehingga satu logika seed untuk dev dan demo.

## Implementation Decisions

- Isolasi: project Supabase baru (migrasi repo di-apply berurutan) + deployment hosting terpisah; user demo `demo@test.com` dibuat manual sekali.
- Guard ganda: seeder jalan bila non-prod, atau bila prod + `ALLOW_DEMO_SEED=true` + email ∈ `DEMO_EMAILS`. Halaman seed ikut flag env; aksi cek email juga.
- Seed upgrade: 25 invoice (pola status deterministik) + template pertama dipasangi logo/tanda tangan/aksen contoh dari `public/demo/` (ringan, <25KB) yang diupload aksi seed ke `template-assets`.
- Login: kotak demo (hanya render bila `NEXT_PUBLIC_DEMO_PASSWORD` diset — prod tidak set → tidak render) berisi email + isi-otomatis.
- Dashboard akun demo: banner tautan isi-ulang ke `/dev/seed`.
- Tanpa istilah domain baru; tanpa ADR (prosedur deploy, mudah dibalik; strategi dicatat di README + spec ini).

## Testing Decisions

- Prinsip: uji perilaku eksternal (login demo masuk; data lengkap; reset mengembalikan; kotak demo tidak render di prod), bukan detail guard.
- Verifikasi manual di deployment demo + pastikan di prod: `/dev/seed` tertutup dan banner reset tidak muncul.
- Regresi umum: `lint` lolos, `build` produksi lolos.
- Prior art: seeder dev yang sudah ada; pola kotak login mengikuti pesan info yang ada.

## Out of Scope

- Pembuatan project Supabase demo (manual sekali oleh pemilik, terpandu README).
- Reset otomatis terjadwal; multi-akun demo; isolasi data antar reviewer.
- Rotasi kredensial otomatis; rate-limit tombol seed.
- Demo tanpa login (ditolak: butuh RLS khusus, risiko bocor).

## Further Notes

- Kredensial demo adalah throwaway untuk env terisolasi; bocornya kredensial tidak membahayakan prod karena guard ganda + project berbeda.
- Jika reviewer butuh data lebih (mis. >50 invoice), naikkan daftar seed sebagai fitur tersendiri.
