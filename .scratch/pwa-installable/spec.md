# Spec: PWA installable (tanpa service worker)

Status: ready-for-agent

## Problem Statement

Freelancer membuka aplikasi dari browser setiap kali — tidak ada ikon di home screen, tidak tampil fullscreen standalone, status bar tidak menyatu dengan tema gelap. Aplikasi terasa seperti situs, bukan alat kerja sehari-hari.

## Solution

Aplikasi dapat di-install ke HP/laptop: manifest + ikon adaptif + theme-color + meta Apple, sehingga muncul prompt install, berjalan standalone, dan menyatu dengan sistem. Tanpa service worker: tidak ada data privat yang ter-cache, tidak ada risiko angka basi.

## User Stories

1. Sebagai freelancer di Android/Chrome, saya ingin tawaran Install muncul, sehingga aplikasi ada di home screen.
2. Sebagai freelancer di iPhone, saya ingin Add to Home Screen berikon benar dan berjalan fullscreen, sehingga setara aplikasi native ringan.
3. Sebagai freelancer, saya ingin status bar/splash memakai warna tema gelap, sehingga transisi buka aplikasi mulus.
4. Sebagai pemilik produk, saya ingin audit Lighthouse kategori PWA hijau, sehingga kualitas terukur.
5. Sebagai pengembang, saya ingin tanpa service worker dan tanpa dependensi ikon permanen, sehingga tidak ada beban pemeliharaan.

## Implementation Decisions

- Satu sumber ikon: SVG (kotak charcoal + dokumen emerald + cek) → PNG 192/512, maskable 512 full-bleed (motif di zona aman tengah), apple-touch 180. Generate via `sips` macOS saat build fitur; tanpa paket baru.
- Manifest `manifest.webmanifest`: nama, short_name, start_url `/`, standalone, theme/background `#0B1211`, ikon any + maskable.
- Metadata root: manifest, themeColor, viewportFit cover (sinkron dengan safe-area bottom-nav), appleWebApp capable + title + black-translucent, icons + apple-touch-icon.
- SVG default template Next yang tak terpakai dihapus dari `public/`.
- Tanpa istilah domain baru, tanpa ADR (mudah dibalik).

## Testing Decisions

- Prinsip: uji perilaku eksternal (prompt install, ikon terpasang, standalone, theme-color), bukan isi file.
- Verifikasi manual: Chrome desktop/Android (install prompt + window-controls), iOS Safari (Add to Home Screen + splash + status bar), tab Application DevTools (manifest valid, tanpa service worker).
- Regresi umum: `lint` lolos, `build` produksi lolos, Lighthouse PWA hijau.
- Prior art: belum ada pengujian PWA; acuan adalah kriteria installability Chrome.

## Out of Scope

- Service worker, cache offline, halaman fallback offline.
- Push notification (butuh server + tabel langganan — bertentangan dengan keputusan bell stateless).
- Shortcuts/actions manifest, share target, file handling.
- Maskable khusus terpisah (full-bleed dipakai ulang karena motif sudah di zona aman).

## Further Notes

- Jika nanti dibutuhkan offline/push, itu fitur tersendiri dengan analisis risiko data basi terlebih dahulu.
