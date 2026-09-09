# Spec: Landing page tamu (neu gelap)

Status: ready-for-agent

## Problem Statement

Pengunjung baru (termasuk reviewer) yang membuka URL deployment langsung diarahkan ke login tanpa tahu apa produk ini, apa masalahnya, dan apa isinya — kesan pertama hilang, demo mudah terlewat.

## Solution

Landing page tamu bergaya Neumorphism gelap di root `/`: hero + cerita masalah-solusi + fitur V1 nyata + CTA demo/masuk + footer. Pengunjung yang sudah login tetap diarahkan ke dashboard.

## User Stories

1. Sebagai reviewer, saya ingin membuka URL utama dan langsung memahami produk ini menyelesaikan apa, sehingga saya tertarik mencoba.
2. Sebagai reviewer, saya ingin tombol "Coba demo" menunjuk langsung ke deployment demo, sehingga saya sampai ke produk dalam satu klik.
3. Sebagai pemilik, saya ingin pengguna yang sudah login tetap mendarat di dashboard, sehingga landing tidak mengganggu alur harian.
4. Sebagai pemilik, saya ingin landing memakai bahasa visual aplikasi (neu gelap, Rubik, aksen emerald), sehingga kesan pertama konsisten dengan isi.
5. Sebagai pengembang, saya ingin landing memakai token semantik tanpa heksa hardcoded, sehingga tema terang susulan tidak menabrak halaman ini.
6. Sebagai pengembang, saya ingin CTA demo berfallback ke login bila URL demo belum diset, sehingga tidak ada link mati di environment mana pun.

## Implementation Decisions

- Satu halaman root baru menggantikan redirect tak bersyarat; cek sesi ringan (bukan helper yang melempar redirect), login → dashboard.
- Konten dari sumber nyata: masalah-solusi dari README, fitur dari changelog V1.0.0 — tanpa pricing/testimoni/angka palsu.
- Bahasa visual ikut DESIGN.md: timbul = tombol, cekung = panel konten, aksen emerald hanya CTA utama, token semantik, radius panel 2xl.
- CTA demo membaca `NEXT_PUBLIC_DEMO_URL`; kosong → fallback `/login`.
- Footer pakai komponen yang ada; tanpa dependensi baru, tanpa migrasi, tanpa ADR.

## Testing Decisions

- Prinsip: uji perilaku eksternal (tamu lihat landing; login dilompatkan; CTA menunjuk target benar; tanpa link mati).
- Verifikasi: lint + build; screenshot `/` saat logout; uji redirect saat login manual oleh pemilik.
- Prior art: pola halaman publik yang sudah ada; screenshot flow dari rebrand.

## Out of Scope

- Pricing, FAQ, testimoni, blog.
- Halaman dokumentasi terpisah untuk pengunjung (docs sudah ada di repo).
- Banner bahasa Inggris / i18n.

## Further Notes

- Setelah URL demo stabil, isi `NEXT_PUBLIC_DEMO_URL` di deployment prod.
