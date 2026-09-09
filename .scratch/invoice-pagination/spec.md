# Spec: Pagination daftar Invoice + dashboard (agregat DB)

Status: ready-for-agent

## Problem Statement

Halaman daftar Invoice mengambil hingga 1000 invoice plus seluruh tabel anak (item baris, pembayaran, penyesuaian) tanpa batas, lalu menghitung status di browser. Semakin banyak data, navigasi semakin berat. Dashboard pun mengambil semua tabel anak padahal hanya menampilkan 8 terbaru. Perlu pagination bernomor di URL agar navigasi cepat, bisa back/forward, dan bisa dibagikan.

## Solution

Agregat ringkasan pindah ke database via RPC (satu roundtrip mengembalikan halaman + total hitungan), daftar Invoice tampil 20/halaman dengan pager bernomor di desktop dan panah prev/next saja di mobile, tab filter menampilkan angka per status, dan dashboard memakai hitungan agregat + 8 terbaru berpengpager kecil. Full-scan tabel anak dihapus dari kedua halaman.

## User Stories

1. Sebagai freelancer, saya ingin daftar Invoice tampil 20 per halaman dengan nomor halaman di URL desktop, sehingga saya bisa navigasi, kembali, dan membagikan halaman tertentu.
2. Sebagai freelancer di HP, saya ingin pager hanya berupa panah kiri/kanan + posisi halaman, sehingga tetap ringkas di layar kecil.
3. Sebagai freelancer, saya ingin tab Draf/Terbit/Lewat/Lunas menampilkan angka hitungan yang akurat, sehingga saya tahu isi tiap tab sebelum klik.
4. Sebagai freelancer, saya ingin ganti filter me-reset ke halaman 1 dan halaman invalid dijepit ke rentang valid, sehingga tidak ada halaman kosong membingungkan.
5. Sebagai freelancer, saya ingin dashboard tetap menampilkan statistik + 8 terbaru tanpa melambat saat data tumbuh, sehingga halaman pertama selalu ringan.
6. Sebagai pemilik produk, saya ingin jumlah roundtrip per halaman tetap kecil (ringkasan + hitungan), sehingga latensi cloud tidak terasa.
7. Sebagai pengembang, saya ingin logika status terhitung tinggal di satu tempat (SQL mereplikasi aturan JS yang sama), sehingga tidak ada dua kebenaran.
8. Sebagai pengembang, saya ingin indeks mendukung ORDER + filter per pengguna, sehingga pagination tidak full-scan.

## Implementation Decisions

- Satu seam baru: RPC ringkasan (halaman + total) dan RPC hitungan status; pola keamanan mengikuti RPC yang ada (definer + `auth.uid()`, revoke public). Replikasi aturan status: draf / sisa≤0 lunas / jatuh tempo lewat / sisanya terbit.
- Dibatasi: 20/halaman daftar, 8/halaman blok terbaru dashboard; param URL dipertahankan (`status`, `page`); satu komponen pager responsif (nomor + ellipsis di desktop, panah + posisi di mobile, target ≥44px, label Indonesia).
- Batas dikenal: `current_date` SQL memakai zona server (beda potensial dengan JS hanya di tengah malam tepat).
- Kosakata domain tidak berubah; tanpa ADR (perubahan mudah dibalik, tidak ada trade-off sejati selain SQL-vs-JS yang dicatat di sini).

## Testing Decisions

- Prinsip: uji perilaku eksternal (halaman berisi baris yang benar; hitungan tab cocok dengan isi; URL back/forward; clamp halaman invalid), bukan detail SQL.
- Verifikasi manual dengan data >20 (atau seed) di desktop + emulasi mobile; bandingkan hitungan tab dengan daftar terfilter.
- Regresi umum: `lint` lolos, `build` produksi lolos.
- Prior art: pola pengujian loading segmen dari fitur skeleton (throttle + fallback).

## Out of Scope

- Pagination halaman Template (limit 100, masih kecil) dan halaman publik klien.
- Pencarian/sortir kolom, ukuran halaman pilihan pengguna.
- Perubahan aturan status terhitung; refactor query lain.

## Further Notes

- Slice: (1) RPC + indeks + migrasi, (2) daftar Invoice, (3) dashboard. Lapor tiap slice.
- Jika data tumbuh melewati ribuan invoice, evaluasi cursor pagination sebagai fitur tersendiri.
