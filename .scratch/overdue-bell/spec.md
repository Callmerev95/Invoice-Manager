# Spec: Bell lewat jatuh tempo (in-app, stateless)

Status: ready-for-agent

## Problem Statement

Freelancer tidak sadar ada invoice yang lewat jatuh tempo sampai ia membuka dashboard dan membaca kartu ringkasan. Tidak ada titik tunggal yang selalu terlihat di semua halaman untuk mengingatkan tagihan telat — pengguna harus ingat mengecek sendiri.

## Solution

Ikon bell di topbar global (terlihat di semua halaman aplikasi, desktop dan mobile) menampilkan angka jumlah invoice lewat jatuh tempo. Diklik, panel menampilkan daftar (nomor, klien, telat N hari, sisa) yang masing-masing tertaut ke detail invoice. Tanpa bunyi/toast, tanpa tombol aksi lain. Dihitung ulang tiap navigasi dari status terhitung yang sudah ada — tanpa tabel, cron, atau email baru.

## User Stories

1. Sebagai freelancer, saya ingin melihat angka tagihan telat di bell setiap membuka halaman mana pun, sehingga saya langsung sadar tanpa harus ke dashboard.
2. Sebagai freelancer, saya ingin mengklik bell dan melihat daftar invoice telat (nomor, klien, lama telat, sisa), sehingga saya tahu apa yang harus ditagih.
3. Sebagai freelancer, saya ingin mengklik item di panel dan langsung tiba di detail invoice-nya, sehingga saya bisa menindaklanjuti.
4. Sebagai freelancer, saya ingin bell tanpa badge saat tidak ada yang telat, sehingga ketenangan berarti tidak ada pekerjaan.
5. Sebagai freelancer, saya ingin panel bisa ditutup dengan keyboard (Escape) dan dibaca pembaca layar, sehingga tetap aksesibel.
6. Sebagai freelancer yang invoice-nya lunas, saya ingin item hilang sendiri dari panel saat refresh, sehingga daftar selalu akurat tanpa aksi tandai-dibaca.
7. Sebagai pemilik produk, saya ingin query bell ringan (hanya invoice terbit + agregat seperlunya, limit kecil), sehingga topbar tidak memperlambat semua halaman.
8. Sebagai pengembang, saya ingin tidak ada migrasi DB dan tidak ada state baca/belum-baca, sehingga tidak ada sinkronisasi basi antara status baca dan status terhitung.

## Implementation Decisions

- Satu seam: helper server yang mengambil invoice terbit tertua (limit kecil, urut jatuh tempo menaik) + agregat anak yang difilter ke id tersebut, lalu menurunkan daftar telat (sisa > 0 dan jatuh tempo lewat). Dipakai ulang logika status terhitung yang sudah ada (terbit + lewat + sisa positif).
- Topbar kecil di shell aplikasi memuat bell; bell adalah komponen klien (butuh interaktivitas buka/tutup) yang menerima daftar dari server. Badge hanya angka; panel hanya daftar + tautan (+ tautan "Lihat semua" ke daftar terfilter telat).
- Visual: ikon bell standar, badge peringatan (semantik telat, bukan aksen dekoratif), panel kartu bergaris tanpa bayangan lunak, target sentuh ≥44px, fokus 2px — sesuai guardrail desain.
- Kosakata domain dipakai apa adanya: Lewat jatuh tempo. Tidak ada istilah baru, tidak perlu ADR.

## Testing Decisions

- Prinsip: uji perilaku eksternal (badge = jumlah telat; panel berisi baris yang benar; klik → detail; lunasi → hilang; 0 telat → tanpa badge), bukan detail implementasi dropdown.
- Verifikasi manual dengan data nyata: buat invoice, majukan skenario lewat tempo (atau ubah tanggal), cek bell; catat pembayaran penuh → item hilang.
- Regresi umum: `lint` lolos, `build` produksi lolos.
- Prior art: belum ada pengujian notifikasi sebelumnya; acuan adalah chip status dan halaman daftar yang sudah ada.

## Out of Scope

- Bunyi, toast, push, email, WA otomatis.
- Tombol "salin teks tagih", aksi massal, filter/sort di panel.
- State dibaca/belum-dibaca, tabel notifikasi, cron/penjadwalan.
- Bell di halaman publik klien dan PDF.
- Refactor agregasi dashboard (fitur tersendiri).

## Further Notes

- Jika nanti dibutuhkan "tandai dibaca" atau pengingat ke klien, itu fitur tersendiri dengan tabel `dismissed`/log kirim + penjadwalan — tidak dicampur ke sini.
