# DESIGN.md — Invoice Manager (neu gelap)

Identitas visual: **taktil dan tenang** — permukaan yang bisa "disentuh".
Produk kerja pelacak invoice untuk freelancer Indonesia. Semuanya baca seperti
buku besar yang diukir: angka tabular, setiap keadaan selalu terlihat, dan
kedalaman berarti sesuatu (timbul = aksi, cekung = isi).

## Arah desain

| Sumbu        | Keputusan                                                                  |
| ------------ | -------------------------------------------------------------------------- |
| Mood         | Modern & tegas — workbench gelap yang tactile, bukan "SaaS menyenangkan".  |
| Kanvas       | Forest charcoal `#141D19`; bayangan ganda `#0C1211`-gelap / `#2A3A34`-terang |
| Aksen        | Satu aksen emerald `#2EC48F`. Hijau bermakna uang & lunas. Dilarang aksen kedua. |
| Navigator    | Sidebar kiri (desktop) + bottom-nav (mobile). Item aktif cekung.           |
| Cahaya       | **Dark saja**, tanpa toggle (terang = fitur susulan terpisah).             |
| Tipografi    | Rubik (400/500/700) via `next/font/google`; angka `tabular-nums` di seluruh UI. |

## Bahasa kedalaman (aturan utama)

Bayangan bukan dekorasi — ia mengkodekan makna. Token: `shadow-neu-out`
(timbul), `shadow-neu-in` (cekung), `shadow-neu-sm` (timbul kecil).

| Bentuk              | Arti                                  | Contoh                          |
| ------------------- | ------------------------------------- | ------------------------------- |
| Timbul (`out/sm`)   | Bisa ditekan / permukaan interaktif   | Tombol, kartu, pil, nav hover   |
| Cekung (`in`)       | Isi / wadah / keadaan aktif           | Input, panel tabel, nav aktif, halaman pager aktif |
| Datar               | Teks, label, pemisah                  | Judul, hairline struktural      |

- Dilarang: bayangan pada elemen datar; lebih dari satu level timbul bertumpuk
  tanpa alasan; glow/shimmer/animasi loop.
- Radius: `rounded-xl` komponen, `rounded-2xl` panel/kartu, `rounded-full` pil.
- Baris tabel padat: `py-2`, `text-sm`; hairline pemisah `line/60`.

## Tokens

### Warna

| Token              | Hex       | Dipakai untuk                                  |
| ------------------ | --------- | ---------------------------------------------- |
| `bg`               | `#141D19` | Kanvas (sama dengan surface: ekstrusi butuh kesamaan) |
| `surface`          | `#141D19` | Kartu / panel / input                          |
| `surface-2`        | `#1C2622` | Hover, skeleton                                |
| `border-line*`     | —         | HANYA hairline struktural (`/60`); bukan bingkai kartu |
| `text`             | `#E4ECE8` | Teks primer (kontras > 7:1)                    |
| `text-muted`       | `#9FAEA7` | Teks sekunder (≥ 4.5:1)                        |
| `text-faint`       | `#7A8A83` | Placeholder — dilarang untuk teks kecil penting |
| `primary`          | `#2EC48F` | Aksi utama, link, status terbit                |
| `primary-hover`    | `#3FD6A1` | Hover aksen                                    |
| `primary-strong`   | `#17A674` | Status lunas                                   |
| `warning`          | `#D5A83E` | Status lewat jatuh tempo (fungsional)          |
| `danger`           | `#E05A5A` | Hapus, error, masalah                          |

Aturan satu-aksen dan status semantik diredam tetap berlaku. **Disiplin kontras
baru**: teks kecil tidak boleh memakai warna lebih redup dari `text-muted` di
atas kanvas — abu-di-atas-abu adalah kegagalan, bukan gaya.

### Status invoice (chip)

Pil timbul (`neu-sm`): Draf `text-muted`, Terbit `primary`, Lewat `warning`,
Lunas `primary-strong`, penyesuaian pil kecil + ikon.

### Tipografi

Satu keluarga: **Rubik**. Angka besar total `text-3xl` extrabold `tabular-nums`
(Rubik mendukung figur tabular — diverifikasi di prototipe). Sentence case di
mana-mana, tanpa eyebrow label, tanpa meta string `·`, tanpa `→` dekoratif.

## Tata letak

Tidak berubah dari V1 (sidebar `w-60`, bottom-nav `h-16`, konten rata kiri,
tabel penuh wadah, formulir maks ~720px). Navigasi aktif: cekung + `primary`.

## Gerak

- Zona tenang. Tekan tombol = tenggelam (`active:shadow-neu-in`) — satu-satunya
  momen taktil. Transisi 120–160ms.
- `prefers-reduced-motion: reduce` mematikan semua animasi; loading = skeleton
  timbul statis (tanpa shimmer bergerak).

## Aksesibilitas

- Kontras: primer ≥ 7:1, sekunder ≥ 4.5:1.
- Fokus: ring 2px `primary` offset 2px (input mengandalkan ini; tanpa border fokus).
- Target sentuh ≥ 44px; error = teks `danger` + `aria-invalid`.
- Empty state = undangan aksi.

## Voice (Bahasa Indonesia)

Tidak berubah: active voice, sentence case, nama aksi konsisten
(Terbitkan invoice → "Invoice terbit").

## Batas cakupan

Halaman `/v/[token]` dan PDF **bukan** bagian chrome aplikasi — keduanya dokumen
milik template dengan desain konservatif sendiri, tidak ikut bahasa neu.

## Anti-pola (guardrail)

- Tidak ada gradient wash dekoratif; tidak ada glow; tidak ada glass/blur.
- Tidak ada bayangan pada elemen datar; tidak ada radius pill untuk tombol/kartu.
- Tidak ada aksen kata tunggal dalam judul; tidak ada warna di luar token.
- Nol heksa hardcoded di komponen — semua warna lewat token (syarat toggle
  terang susulan).
