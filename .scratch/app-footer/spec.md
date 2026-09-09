# Spec: Footer aplikasi + versi V1

Status: ready-for-agent

## Problem Statement

Aplikasi tidak mencantumkan identitas pembuat, copyright, dan versi di mana pun. Reviewer dan pengguna tidak tahu siapa di balik aplikasi dan versi apa yang sedang berjalan — kurang profesional untuk produk yang memamerkan portofolio.

## Solution

Satu komponen footer mungil di bagian bawah shell aplikasi dan halaman publik klien: copyright tahun dinamis, nama author, nama produk, dan label versi mayor. Versi dibaca dari `package.json` (sumber tunggal); rilis ini menaikkan versi ke 1.0.0 sebagai penanda V1.

## User Stories

1. Sebagai reviewer, saya ingin melihat copyright, nama pembuat, dan versi di bagian bawah aplikasi, sehingga saya tahu konteks produk yang saya nilai.
2. Sebagai klien, saya ingin halaman invoice publik tetap mencantumkan atribusi pembuat, sehingga dokumen terasa sah.
3. Sebagai pemilik produk, saya ingin label versi otomatis mengikuti `package.json`, sehingga tidak basi saat rilis V2.
4. Sebagai pemilik produk, saya ingin footer tidak mengganggu bottom-nav mobile, sehingga tetap rapi di HP.
5. Sebagai pengembang, saya ingin satu komponen dipakai dua tempat (varian gelap/terang), sehingga tidak ada duplikasi teks.

## Implementation Decisions

- Sumber tunggal: `package.json` (`1.0.0`), dibaca lewat modul meta; label tampil `V{major}`, full version sebagai `title` (tooltip).
- Teks: `© {tahun dinamis} Callmerev • Invoice Manager V1`.
- Penempatan: bawah konten shell app (dalam padding aman bottom-nav) + gantikan baris kredit lama di halaman publik (varian terang).
- Tanpa istilah domain baru, tanpa ADR (sepele, mudah dibalik).

## Testing Decisions

- Prinsip: uji perilaku eksternal (teks tampil di kedua tempat; tahun benar; label V1).
- Regresi umum: `lint` lolos, `build` produksi lolos.
- Prior art: tidak ada; pola komponen server presentasional yang sudah ada.

## Out of Scope

- Tautan sosial/portofolio, halaman tentang, changelog UI.
- Footer di PDF, email, halaman auth.
- Strategi rilis/semver di luar bump sekali ini.

## Further Notes

- Rilis berikutnya cukup bump `package.json`; label footer ikut tanpa ubah kode.
