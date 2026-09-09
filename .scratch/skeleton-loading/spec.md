# Spec: Skeleton loading per segmen + indikator navigasi pending

Status: ready-for-agent

## Problem Statement

Pengguna membuka aplikasi dan berpindah halaman (Beranda, Template, Invoice, detail invoice). Setiap halaman adalah Server Component yang mengambil data dari Supabase Cloud sebelum render, dan tidak ada status muat apa pun: tidak ada fallback segmen, navigasi tidak memberi umpan balik. Akibatnya perpindahan halaman terkesan stuck/tidak berjalan, terutama di mode pengembangan dan koneksi lambat. Pengukuran build produksi menunjukkan skor Lighthouse 100 — masalahnya adalah persepsi responsivitas, bukan throughput query (data saat ini kecil: 7 invoice, 2 template).

## Solution

Setiap segmen rute utama menampilkan kerangka statis (skeleton) yang langsung muncul saat navigasi dimulai, dengan bentuk menyerupai halaman aslinya (kartu ringkasan, baris tabel, kartu template). Tautan navigasi utama memberi petunjuk pending yang halus dan tidak menggeser tata letak. Kerangka bersifat statis (tanpa shimmer/animasi bergerak) sesuai identitas visual produk dan menghormati `prefers-reduced-motion`.

## User Stories

1. Sebagai freelancer, saya ingin melihat kerangka Beranda (kartu ringkasan + tabel invoice terbaru) seketika setelah klik Beranda, sehingga saya tahu aplikasi merespons.
2. Sebagai freelancer, saya ingin melihat kerangka daftar Invoice (filter status + tabel) saat membuka halaman Invoice, sehingga saya tidak mengira halaman macet.
3. Sebagai freelancer, saya ingin melihat kerangka detail invoice (kepala + blok konten) saat membuka sebuah invoice, sehingga saya tahu datanya sedang dimuat.
4. Sebagai freelancer, saya ingin melihat kerangka daftar Template (grid kartu) saat membuka halaman Template, sehingga navigasi terasa hidup.
5. Sebagai freelancer, saya ingin tautan navigasi yang saya klik menunjukkan status pending yang halus, sehingga klik saya terkonfirmasi sebelum konten tiba.
6. Sebagai pengguna dengan `prefers-reduced-motion`, saya ingin tidak ada animasi bergerak pada status muat, sehingga pengalaman tetap tenang.
7. Sebagai pengguna pembaca layar, saya ingin status muat diumumkan secara sopan, sehingga saya tahu konten sedang dimuat.
8. Sebagai freelancer di HP, saya ingin kerangka tampil benar di navigasi bawah juga, sehingga pengalaman mobile setara desktop.
9. Sebagai pemilik produk, saya ingin skor Lighthouse tetap 100 setelah perubahan ini, sehingga persepsi cepat didukung angka nyata.
10. Sebagai pengembang, saya ingin fallback muat mengikuti konvensi framework (batas Suspense per segmen), sehingga perilaku streaming resmi dan tidak ada logika fetch ganda.

## Implementation Decisions

- Satu seam: fallback batas Suspense per segmen rute (konvensi `loading` framework). Tidak ada seam baru, tidak ada perubahan bentuk query atau agregasi data — refactor query ditunda hingga data besar (ratusan invoice) atau build produksi ikut lambat.
- Empat segmen tercakup: Beranda (dashboard), daftar Invoice, detail Invoice, daftar Template. Segmen lain (pengaturan, form baru/ubah, halaman publik klien, PDF) di luar cakupan.
- Kerangka meniru kepadatan halaman asli: baris tabel padat, kartu ringkasan 4 kolom (2 kolom di mobile), grid kartu template. Lebar blok proporsional, bukan satu spinner generik.
- Visual kerangka: blok permukaan sekunder dengan radius komponen standar, tanpa gradient/shimmer/bayangan lunak — sesuai guardrail desain (satu warna rata, pisahkan dengan garis/latar).
- Petunjuk pending tautan: titik kecil berukuran tetap yang hanya mengubah opacity setelah jeda ~100ms (tanpa flash pada navigasi cepat, tanpa layout shift), selalu di-render tapi tak terlihat saat idle. Menghormati reduced-motion lewat aturan global yang sudah menonaktifkan animasi.
- Aksesibilitas: setiap fallback memuat teks "Memuat…" yang hanya dibaca pembaca layar + peran status; petunjuk pending tautan disembunyikan dari pembaca layar (dekoratif).
- Kosakata domain dipakai apa adanya: Beranda, Template, Invoice, Draf, Terbit, Lewat jatuh tempo, Lunas — tidak ada istilah baru, tidak perlu ADR (mudah dibalik, tidak mengejutkan, tanpa trade-off sejati).

## Testing Decisions

- Prinsip: uji perilaku eksternal (fallback muncul saat segmen ditangguhkan; konten asli menggantikan setelah resolve; tidak ada layout shift), bukan detail implementasi kerangka.
- Throttle jaringan di dev tools untuk memaksa fallback terlihat; verifikasi tiap dari 4 segmen menampilkan kerangkanya lalu konten asli.
- Uji `prefers-reduced-motion: reduce` emulasi: tidak ada animasi bergerak.
- Uji pembaca layar/keyboard: teks muat terumumkan; fokus visible tetap 2px.
- Regresi: `lint` lolos, `build` produksi lolos, skor Lighthouse halaman utama tetap 100.
- Prior art: belum ada pola pengujian loading di codebase (tidak ada fallback segmen sebelumnya); pola Suspense manual framework adalah acuan.

## Out of Scope

- Refactor agregasi query/RPC, indeks baru, paginasi (ditunda; data kecil + build/start sudah responsif).
- Fallback untuk segmen pengaturan, form, halaman publik klien, dan route PDF.
- Toast/bunyi notifikasi, skeleton animasi/shimmer, top progress bar.
- Perubahan bahasa/istilah domain dan ADR baru.

## Further Notes

- Keputusan menunda refactor query dicatat dari pengukuran pengguna: build produksi responsif + Lighthouse 100 → bottleneck yang dirasakan adalah dev-compile + latensi cloud tanpa feedback, bukan DB.
- Jika data tumbuh melewati ~200 invoice atau build produksi melambat, angkat kembali rencana agregasi RPC + paginasi sebagai fitur tersendiri.
