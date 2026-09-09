# Spec: Visual kustom PDF invoice (logo, kop, aksen, tanda tangan gambar)

Status: ready-for-agent

## Problem Statement

Freelancer menerbitkan invoice yang terlihat generik: tanpa logo, tanpa kop identitas yang rapi, tanpa tanda tangan. Invoice terasa kurang profesional di mata klien, padahal identitas bisnis sudah diisi di template — hanya saja tidak divisualkan di PDF maupun halaman klien.

## Solution

Template dapat membawa logo (upload), warna aksen tunggal, dan gambar tanda tangan (upload) di samping teks nama. PDF dan halaman klien menampilkan kop rapi (logo + nama + slogan + kontak), aksen pilihan, dan blok tanda tangan gambar + nama. Semua visual mengikuti aturan snapshot: berlaku untuk invoice baru/draf, invoice terbit tidak berubah.

## User Stories

1. Sebagai freelancer, saya ingin mengupload logo ke template, sehingga PDF dan halaman klien menampilkan identitas bisnis saya.
2. Sebagai freelancer, saya ingin memilih warna aksen template, sehingga nomor dan badge invoice tampil dengan warna brand saya.
3. Sebagai freelancer, saya ingin mengupload gambar tanda tangan plus teks nama, sehingga invoice terbit terlihat sah dan personal.
4. Sebagai freelancer, saya ingin melihat pratinjau visual di form template, sehingga saya tahu hasilnya sebelum menerbitkan invoice.
5. Sebagai freelancer, saya ingin mengubah visual template kapan saja tanpa merusak invoice terbit lama, sehingga riwayat tagihan tetap tepercaya.
6. Sebagai freelancer, saya ingin file gambar otomatis diperkecil/dikompres saat upload, sehingga aplikasi tetap cepat dan PDF tetap ringan.
7. Sebagai klien, saya ingin melihat logo dan tanda tangan di halaman invoice publik, sehingga saya percaya dokumennya.
8. Sebagai klien, saya ingin mengunduh PDF yang memuat visual yang sama dengan halaman publik, sehingga tidak ada perbedaan.
9. Sebagai pemilik produk, saya ingin generate PDF tetap di bawah 2 detik dan ukuran PDF di bawah 400KB, sehingga fitur tidak memperlambat alur terbit.
10. Sebagai pengembang, saya ingin kegagalan memuat gambar tidak menggagalkan render PDF (fallback teks), sehingga satu aset rusak tidak memblokir alur bayar.

## Implementation Decisions

- Satu seam utama: snapshot visual di RPC pembuatan draf dari template (logo, aksen, tanda tangan disalin ke baris invoice). Tidak ada referensi hidup template→invoice terbit.
- Penyimpanan: bucket publik terpisah untuk aset template (baca publik agar PDF dan halaman klien bisa memuat; tulis/hapus hanya pemilik lewat kepemilikan folder). Batas bucket 1MB, hanya PNG/JPEG; batas aplikasi logo 512px sisi terpanjang/300KB dan tanda tangan 800x300/300KB dengan resize+kompres di browser sebelum upload.
- Aksen default gelap; validasi format heksa di server dan klien dengan fallback kontras yang sudah ada di halaman publik.
- PDF memuat gambar lewat pra-fetch server menjadi data URI dengan fallback sunyi ke teks bila gagal; tidak ada URL mentah yang bisa memblokir render.
- File lama yang diganti ikut dihapus; penghapusan template ikut menghapus file visualnya agar tidak orphan.
- Kosakata domain baru: Logo, Kop, Aksen, Tanda tangan gambar (lihat glosarium + ADR aset visual template).

## Testing Decisions

- Prinsip: uji perilaku eksternal (logo/aksen/tanda tangan tampil di PDF + halaman publik; invoice terbit lama tidak berubah setelah template diubah; fallback saat gambar rusak), bukan detail implementasi upload.
- Verifikasi manual: buat template → upload logo + tanda tangan + aksen → buat draf → terbitkan → cek PDF internal, halaman publik, dan PDF publik.
- Uji batas: file di atas batas ditolak dengan pesan jelas; hapus logo kembali ke fallback teks tanpa error.
- Uji regresi snapshot: ubah visual template setelah terbit → PDF invoice lama identik.
- Regresi umum: `lint` lolos, `build` produksi lolos.
- Prior art: belum ada pengujian PDF visual sebelumnya; acuan perilaku adalah rute PDF dan halaman publik yang sudah ada.

## Out of Scope

- Background/watermark full-page image.
- Font kustom PDF.
- Tanda tangan canvas/digital (coretan di browser).
- Multi-template per invoice; visual per-invoice (visual milik template + snapshot).
- Pengiriman email/WA otomatis; penghapusan file orphan historis.

## Further Notes

- Keputusan batas ukuran dan penolakan background image dicatat di ADR aset visual template.
- Refactor agregasi query tetap ditunda (fitur tersendiri) — tidak dicampur ke fitur ini.
