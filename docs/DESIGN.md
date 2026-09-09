# DESIGN.md — Invoice Manager (V1)

Identitas visual: **terukur dan tegas** (brief pengguna). Produk kerja pelacak
invoice untuk freelancer Indonesia. Semuanya baca seperti buku besar: angka
selalu tabular, setiap keadaan (status invoice) selalu terlihat, dan tidak ada
dekorasi yang tidak membawa informasi.

## Arah desain (dari brief)

| Sumbu        | Keputusan                                                                 |
| ------------ | ------------------------------------------------------------------------- |
| Mood         | Modern & tegas — gelap seperti workbench, bukan "SaaS menyenangkan".      |
| Aksen        | Satu aksen emerald. Hijau bermakna uang & lunas. Dilarang aksen kedua.    |
| Navigator    | Sidebar kiri (desktop) + bottom-nav (mobile).                            |
| Cahaya       | **Dark-first**, tanpa toggle light V1. Dokumen PDF dikontrol template.    |
| Tipografi    | Satu keluarga grotesk; angka pakai `tabular-nums` di seluruh UI.          |

## Tokens

### Warna (dark mode saja)

Karakter charcoal gelap **dengan rona hijau** (bukan abu bersih) supaya
menyatu dengan aksen, bukan "hitam + hijau tempel".

| Token              | Hex      | Dipakai untuk                                   |
| ------------------ | -------- | ----------------------------------------------- |
| `bg`               | `#0B1211`| Kanvas                                            |
| `surface`          | `#121C19`| Kartu / panel                                     |
| `surface-2`        | `#1A2622`| Kartu hover, input                                 |
| `border`           | `#2A3A34`| Garis struktural                                  |
| `border-strong`    | `#3A4E46`| Fokus struktural, pemisah tabel                  |
| `text`             | `#E4ECE8`| Teks primer (kontras > 7:1)                      |
| `text-muted`       | `#9FAEA7`| Teks sekunder (≥ 4.5:1)                          |
| `text-faint`       | `#6E7D76`| Placeholder, label mati                          |
| `primary`          | `#2EC48F`| Aksi utama, link, status terbit                  |
| `primary-hover`    | `#3FD6A1`| Hover aksen                                      |
| `primary-strong`   | `#17A674`| Status lunas                                      |
| `warning`          | `#D5A83E`| Status lewat jatuh tempo (computed)              |
| `danger`           | `#E05A5A`| Hapus, error, masalah                            |

Aturan satu-aksen: **emerald hanya untuk uang/lunas/aksi utama.** Status
warning/danger adalah semantik (fungsional), bukan aksen dekoratif — tetap
diredam agar tidak berteriak.

### Status invoice (chip)

| Status | Chip (pill kecil)                             | Ikon (lucide)      |
| ------ | --------------------------------------------- | ------------------ |
| Draft  | `border` dashed, `text-muted`                 | FileText           |
| Terbit | `primary` solid, `text` gelap                 | Send               |
| Lewat  | `warning` tint, `text-warning`                | AlarmClock         |
| Lunas  | `primary-strong` solid, `text` gelap          | Check              |
| Disesuaikan (ada penyesuaian) | `border-strong` + badge kecil `warning` | SlidersHorizontal |

### Tipografi

Satu keluarga: **Familjen Grotesk** (variabel 300–700) via `next/font/google`,
`display: "optional"`, `preload: true`. Tidak ada keluarga monospace untuk
label data — semua angka pakai `font-variant-numeric: tabular-nums` pada font
yang sama (identitas angka ada di *angka*, bukan di *jenis huruf terpisah*).

| Peran          | Ukuran / berat                              |
| -------------- | ------------------------------------------- |
| Judul halaman  | `text-xl` semibold, `tracking-tight`        |
| Angka besar (total) | `text-3xl` extrabold `tabular-nums`    |
| Body / data    | `text-sm`                                   |
| Tabel          | `text-sm` `tabular-nums`                    |
| Chip status    | `text-xs` semibold                          |

Sentence case di mana-mana (tiada ALL-CAPS), tanpa eyebrow label di atas judul.

### Radius & spacing

- Komponen: `rounded-md` (6px). Tidak ada pill untuk tombol/kartu.
- Chip status: pil kecil (tinggi 5–6px) — kebenaran tag, bukan pintu radius.
- Baris tabel padat: `py-2`, `text-sm`. Daftar invoice adalah peta kerja.
- Spacing: skala default Tailwind; grid konten padat (tabel) maks ~1280px,
  formulir maks ~720px.

## Tata letak

Desktop — sidebar tetap `w-60`:

```
┌──────┬────────────────────────────────────┐
│ Nama │  Invoice                     [+ Baru]│
│       │  ┌────────────────────────────────┐ │
│ Beranda│  No   Klien   Status  Jatuh  Total│ │
│ Template│  ─────────────────────────────── │ │
│ Invoice│  │ dense table                    │ │
│ Setelan│  └────────────────────────────────┘ │
└──────┴────────────────────────────────────┘
```

Mobile — bottom-nav `h-16`, 4 item (Beranda, Template, Invoice, Setelan;
Pembayaran dikelola di dalam detail invoice):

```
┌────────────────────────┐
│ Invoice            [+Baru]│
│                        │
│ content (tabel → card) │
│                        │
├────────────────────────┤
│  Beranda  Template  Invoice  Setelan │
└────────────────────────┘
```

- Isi konten rata kiri; tabel penuh lebar wadah.
- Navigasi aktif: aksen `primary` + latar `surface-2`.

## Gerak

- Zona tenang. Satu momen orkestrasi saat masuk dashboard (fade + 4px,
  ~200ms). Transisi komponen 120–160ms.
- `prefers-reduced-motion: reduce` mematikan semua animasi; loading = skeleton
  statis (tanpa shimmer bergerak).

## Aksesibilitas

- Kontras: teks primer ≥ 7:1, sekunder ≥ 4.5:1 (di atas `bg`/`surface`).
- Fokus: ring 2px `primary` dengan offset 2px — terlihat di semua media.
- Target sentuh ≥ 44px (bottom-nav, tombol ikon).
- Error/inline validasi: teks `danger` + `aria-invalid`, bukan hanya warna.
- Empty state = undangan aksi, bukan keluhan ("Belum ada invoice — Terbitkan
  yang pertama").

## Voice (Bahasa Indonesia)

Active voice, sentence case, kata konsisten sepanjang alur. Nama aksi tetap
sama dari tombol sampai notifikasi: tombol "Terbitkan invoice" → konfirmasi
"Invoice terbit". Kata kunci domain: **draft, terbit, kirim, lunas, catat
pembayaran, lewat jatuh tempo, penyesuaian**. Hindari jargon teknis kepada
pengguna (dokumen, bukan "snapshot"; catat pembayaran, bukan "record payment").

## Anti-pola (guardrail)

- Tidak ada gradient wash sebagai dekorasi, satu warna rata saja.
- Tidak ada bayangan lunak `rgba(0,0,0,.1)` di bawah kartu; pisahkan dengan
  `border`/latar.
- Tidak ada aksen kata tunggal dalam judul, tidak ada meta string `·`, tidak
  ada tanda `→` akan di-link/button.
- Tidak ada radius seragam pill di semua elemen.
- Halaman `/v/[token]` dan PDF **bukan** bagian chrome aplikasi — keduanya
  dokumen yang dikontrol template pengguna, desainnya milik data template.