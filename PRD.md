# PRD — Invoice Manager V1

| | |
| --- | --- |
| Produk | Invoice Manager |
| Versi dokumen | 1.0.0 |
| Status | Rilis V1 (live) |
| Author | Callmerev — https://callmerev.my.id |
| Produksi | https://invoice-manager.callmerev.my.id |
| Live demo | https://invoice-manager-demo.callmerev.my.id |
| Stack | Next.js 16 (App Router, TypeScript, Turbopack) · Supabase (Postgres, Auth, Storage) · Tailwind CSS 4 · @react-pdf/renderer |

---

## 1. Ringkasan eksekutif

Invoice Manager adalah aplikasi web untuk freelancer Indonesia yang ingin
menagih secara profesional. Produk menutup tiga celah pekerjaan penagihan yang
paling sering menurunkan kepercayaan klien: angka yang dihitung manual dan rawan
selisih, nomor invoice yang mudah dobel, dan jejak pembayaran yang hilang di
dalam percakapan chat.

Nilai inti produk adalah **dokumen terkunci**: begitu invoice diterbitkan,
seluruh isinya (item, angka, visual, pola penomoran) tersnapshot dan ditegakkan
immutable di level database — bukan hanya disembunyikan di UI. Perubahan besar
tagihan pasca-terbit hanya mungkin lewat **penyesuaian** beralasan, dan uang
masuk dicatat sebagai **pembayaran**, sehingga sisa tagihan selalu bisa
dipertanggungjawabkan ke klien.

Aplikasi ini single-user per akun (freelancer mengelola invoice miliknya
sendiri), berbahasa Indonesia, dark-first, dan dapat dipasang di HP sebagai PWA.
Setiap invoice terbit menghasilkan **halaman klien resmi** berbasis token yang
bisa dibuka klien tanpa akun, lengkap dengan unduhan PDF.

## 2. Latar belakang & masalah

### 2.1 Pernyataan masalah

Freelancer Indonesia umumnya menagih dengan cara yang rapuh:

1. **Nominal dihitung manual** (kalkulator/chat) — rawan selisih dan tidak ada
   jejak perhitungan.
2. **Nomor invoice dibuat asal** — mudah dobel, sulit dirujuk ulang, tidak ada
   urutan yang bisa diaudit.
3. **Penagihan lewat chat tanpa dokumen resmi** — klien tidak punya acuan resmi
   untuk membayar; bukti transfer dan status pembayaran tercecer.

### 2.2 Konsekuensi

- **Tagihan berantakan** → freelancer dan klien berbeda persepsi soal jumlah.
- **Kesan tidak profesional** → klien merasa bebas menunda membayar.
- **Jejak bayar hilang** → freelancer lupa mana yang lunas, mana yang lewat
  jatuh tempo, dan siapa yang harus dikejar.

### 2.3 Peluang

Belum banyak tool invoice berbahasa Indonesia yang: (a) gratis untuk
penggunaan personal, (b) menegakkan integritas dokumen di level data, (c)
memberi klien halaman status resmi tanpa akun, dan (d) bekerja penuh di HP.
Invoice Manager mengisi celah itu.

## 3. Sasaran & pengguna

### 3.1 Sasaran produk

| # | Sasaran | Ukuran keberhasilan |
| --- | --- | --- |
| S1 | Angka tagihan selalu tepercaya | Sisa tagihan = subtotal + pajak + penyesuaian − pembayaran, direplikasi identik di SQL dan UI; invoice terbit tidak bisa berubah diam-diam |
| S2 | Proses menagih terasa profesional | Invoice terbit menghasilkan PDF berkop + halaman klien resmi berbasis token |
| S3 | Status penagihan selalu terlihat | Draf/terbit/lewat jatuh tempo/lunas dihitung otomatis; tagihan telat tersorot lewat bell dan tab filter |
| S4 | Ringan dipakai di HP | Daftar di-paginasi via agregat database (20/halaman); PWA installable; target sentuh ≥ 44px |
| S5 | Aman secara default | Isolasi baris RLS per user; token akses acak 32 hex; kredensial demo terisolasi total dari prod |

### 3.2 Pengguna

**Persona utama — Freelancer mandiri.** Melayani beberapa klien per bulan,
mengirim tagihan dari laptop maupun HP, tidak mau berlangganan tool SaaS asing.
Kebutuhan: template berulang, penomoran otomatis, PDF rapi, riwayat bayar.

**Pengguna sekunder — Klien freelancer.** Menerima link invoice, membuka tanpa
akun, ingin melihat ringkasan tagihan + status + bukti dokumen (PDF).

**Anti-persona.** Tim akuntansi multi-user, kebutuhan faktur pajak formal
(e-faktur), integrasi pembayaran otomatis — di luar lingkup V1.

## 4. Lingkup

### 4.1 Dalam lingkup V1

Autentikasi email-sandi (login, signup, konfirmasi, pemulihan kata sandi),
template dengan visual, siklus invoice draf→terbit, penomoran atomik,
pembayaran, penyesuaian, status terhitung, bell lewat jatuh tempo, daftar
terfilter + paginasi, dashboard ringkasan, PDF kustom, halaman klien publik,
PWA, landing page + SEO, live demo dengan seed & reset mandiri.

### 4.2 Di luar lingkup (eksplisit)

Multi-user/tim dan peran · integrasi payment gateway · e-faktur/pajak formal ·
pengingat email otomatis · mode terang penuh (tersedia sebagai fitur susulan di
atas token semantik) · i18n selain Bahasa Indonesia · aplikasi native.

## 5. Aturan domain (integritas dokumen)

Aturan ini ditegakkan di **level database**, bukan hanya UI:

1. **ADR-0001 — Invoice terbit immutable.** Trigger `trg_issued_immutable`
   menolak UPDATE/DELETE terhadap invoice berstatus `issued` dari jalur mana
   pun. Fase satu-satunya yang bisa diubah bebas adalah **draf**.
2. **ADR-0002 — Penyesuaian, bukan pembatalan.** Setelah terbit, besar tagihan
   hanya berubah lewat dokumen **penyesuaian** (`amount ≠ 0`, alasan wajib).
   Sisa tagihan = subtotal + pajak + penyesuaian − pembayaran.
3. **ADR-0003 — Snapshot aset visual.** Logo, warna aksen, dan gambar tanda
   tangan adalah milik template dan **tersnapshot** ke invoice saat draf
   dibuat. Mengubah template tidak pernah mengubah invoice lama.
4. **Penomoran atomik.** Counter `next_seq` diklaim di dalam transaksi per
   `(user, pola penomoran)`; nomor seperti `INV-{yyyy}-{seq:3}` dirender oleh
   fungsi `render_number`. Unik `(user_id, number)` hanya untuk invoice terbit.
5. **Kelengkapan terbit.** Check `chk_issued_complete`: invoice terbit wajib
   punya nomor, seq, pola, token, dan tanggal terbit/jatuh tempo.

## 6. Kebutuhan fungsional

### 6.1 Akun & sesi

| ID | Kebutuhan |
| --- | --- |
| FR-01 | Signup/login email + kata sandi (min. 8 karakter) dengan pesan error yang jelas |
| FR-02 | Alur lupa kata sandi: tautan email → halaman atur sandi baru, hanya dengan sesi valid; callback divalidasi anti open-redirect |
| FR-03 | Semua route aplikasi (`/dashboard`, `/invoices`, `/templates`, `/settings`, `/dev`) dilindungi; pengunjung anonim dialihkan ke `/login?next=…` |
| FR-04 | Pengguna yang sudah login dihalaman auth dilompatkan ke dashboard |

### 6.2 Template

| ID | Kebutuhan |
| --- | --- |
| FR-05 | Template menyimpan identitas bisnis (nama, slogan, kontak), pola penomoran, ketentuan pembayaran, `due_days`, pajak (label bebas + tarif 0–100000 bps) |
| FR-06 | Visual template: upload logo & gambar tanda tangan (PNG/JPEG ≤ 1 MB, per folder user) dan warna aksen `#RRGGBB` |
| FR-07 | Pembuatan draf invoice tersnapshot: seluruh identitas, visual, pajak, dan pola penomoran template disalin ke invoice (RPC atomik + insert item) |

### 6.3 Invoice

| ID | Kebutuhan |
| --- | --- |
| FR-08 | Draf dapat diedit bebas: meta + seluruh item baris diganti atomik (RPC `save_invoice_draft`) |
| FR-09 | Menerbitkan invoice: klaim nomor dari seri, set tanggal terbit/jatuh tempo, hasilkan token publik, tulis PDF (RPC `issue_invoice`) |
| FR-10 | Item baris dihitung di frontend (`quantity` pecahan didukung), `subtotal_sen` tersimpan sebagai salinan untuk audit |
| FR-11 | Pembayaran: nominal selalu > 0, boleh sebagian, kapan pun; sisa dan status dihitung ulang |
| FR-12 | Penyesuaian: jumlah boleh negatif/positif, alasan wajib; satu-satunya jalur mengubah besar tagihan setelah terbit |
| FR-13 | Kelebihan bayar (sisa negatif) ditampilkan sebagai informasi, tidak pernah "dikembalikan" otomatis |
| FR-14 | Invoice terbit tidak dapat diedit/dihapus dari UI maupun API (database menolak) |
| FR-15 | PDF diregenerasi otomatis setiap pembayaran/penyesuaian berubah; juga dapat diregenerasi on-demand |
| FR-16 | Status terhitung: `draf`, `terbit`, `lewat jatuh tempo` (terbit + jatuh tempo lewat + sisa > 0), `lunas` (sisa ≤ 0) |

### 6.4 Navigasi & pemantauan

| ID | Kebutuhan |
| --- | --- |
| FR-17 | Daftar invoice: filter per status, 20 item/halaman, tab berangka, pager responsif (nomor di desktop, panah di mobile) |
| FR-18 | Dashboard: agregat per status + 8 invoice terbaru |
| FR-19 | Bell lewat jatuh tempo: badge jumlah + panel daftar tautan; stateless tanpa tabel/cron; hilang sendiri saat lunas |

### 6.5 Halaman klien publik

| ID | Kebutuhan |
| --- | --- |
| FR-20 | `/v/[token]` menampilkan ringkasan invoice, riwayat bayar/penyesuaian, status, dan tombol unduh PDF — tanpa akun |
| FR-21 | Token acak 32 heksa; format tidak valid → 404; halaman `noindex` dan diblokir robots.txt agar tidak masuk mesin pencari |
| FR-22 | Visual halaman klien mengikuti aksen template dengan fallback kontras ≥ 3:1 |

### 6.6 Landing, SEO & PWA

| ID | Kebutuhan |
| --- | --- |
| FR-23 | Landing publik memperkenalkan produk (masalah–solusi, fitur, CTA demo) dan mengalihkan pengguna ter-login ke dashboard |
| FR-24 | SEO: metadata + canonical, sitemap.xml, robots.txt, Open Graph image 1200×630 (dibangun saat build), JSON-LD `WebApplication`, Twitter card |
| FR-25 | Halaman auth dan aplikasi `noindex`; hanya landing yang diindeks |
| FR-26 | PWA installable: manifest, ikon (termasuk maskable), tema gelap; tanpa service worker di V1 |
| FR-27 | Tombol "Coba demo" mengarah ke deployment demo (`NEXT_PUBLIC_DEMO_URL`, fallback domain demo), dibuka di tab baru |

### 6.7 Live demo

| ID | Kebutuhan |
| --- | --- |
| FR-28 | Deployment demo terisolasi (Supabase + hosting sendiri); seed 25 invoice contoh bervisiual lewat `/dev/seed` |
| FR-29 | Seeder hanya aktif untuk email terdaftar (`ALLOW_DEMO_SEED` + `DEMO_EMAILS`); reset data mandiri via RPC `reset_demo_data` |
| FR-30 | Demo tidak masuk indeks: `NEXT_PUBLIC_NO_INDEX=true` → robots `Disallow: /` + meta `noindex, nofollow` |
| FR-31 | Kotak isi-otomatis kredensial demo di halaman login hanya tampil saat env demo di-set |

## 7. Kebutuhan non-fungsional

| Kategori | Persyaratan |
| --- | --- |
| Keamanan | RLS `user_id = auth.uid()` di semua tabel user; RPC definer dengan pemeriksaan `auth.uid()`; bucket tulis-hanya-pemilik; kredensial demo throwaway dan terisolasi total dari prod |
| Integritas | Aturan domain ditegakkan database (immutable, unik, kelengkapan); nominal dalam sen untuk menghindari kesalahan floating point |
| Performa | Agregat daftar/dashboard dihitung di Postgres dengan indeks `(user_id, created_at)` dan `(user_id, status, created_at)`; streaming layout dengan Suspense agar bell tidak memblokir halaman |
| Keandalan PDF | Gambar di-pra-fetch jadi data URI; kegagalan ambil gambar jatuh ke fallback teks — PDF tidak pernah gagal render |
| Aksesibilitas | Target sentuh ≥ 44px, `focus-visible` konsisten, label + `aria-describedby`/`aria-invalid` otomatis, pembeda status tidak hanya warna |
| Visual | Neumorphism gelap: kanvas forest `#141D19`, aksen emerald tunggal `#2EC48F`, bayangan mengkodekan makna (timbul = aksi, cekung = isi), tipografi Rubik + `tabular-nums` |
| PWA | Installable, `display: standalone`, tema gelap |
| SEO | Satu bahasa (id), `metadataBase` produksi, sitemap hanya memuat halaman indeksabel |

## 8. Model data (ringkas)

| Entitas | Isi penting | Aturan |
| --- | --- | --- |
| `templates` | Identitas bisnis, logo, aksen, tanda tangan, pola penomoran, pajak, `due_days` | Milik user |
| `invoice_series` | Counter `next_seq` per `(user_id, pattern)` | Klaim atomik di transaksi |
| `invoices` | Snapshot template + status `draft`/`issued` + nomor/seq/pattern/token/tanggal | Immutable saat `issued`; unik `(user_id, number)` hanya terbit |
| `line_items` | Posisi, deskripsi, qty, harga satuan (sen), subtotal salinan | Urut per posisi |
| `payments` | Jumlah (sen) > 0, waktu, catatan | Mengurangi sisa |
| `adjustments` | Jumlah ≠ 0, alasan wajib | Jalur koreksi pasca-terbit |

**RPC utama:** `create_invoice_from_template`, `save_invoice_draft`,
`issue_invoice`, `render_number`, `invoice_summaries`,
`invoice_status_counts`, `get_public_invoice` (anon), `reset_demo_data` (demo).

**Storage:** `invoice-pdfs` (`{uid}/{invoiceId}.pdf`, upsert) dan
`template-assets` (`{uid}/{templateId}/…`, baca publik karena dibutuhkan PDF dan
halaman klien).

## 9. Alur kunci

**Draf → terbit → dibayar.** Freelancer membuat template sekali → membuat draf
dari template (snapshot) → mengedit item bebas → menerbitkan (nomor diklaim,
token lahir, PDF ditulis) → mengirim link halaman klien → mencatat pembayaran
(sebagian boleh) → status berubah otomatis; jika lewat jatuh tempo, invoice
muncul di bell sampai lunas.

**Koreksi pasca-terbit.** Salah nominal setelah terbit → tambah penyesuaian
beralasan → PDF & sisa diperbarui; dokumen asli tidak pernah berubah diam-diam.

## 10. Metrik keberhasilan

Karena produk ini pribadi (satu pengguna aktif: pemilik), metrik keberhasilan
V1 bersifat teknis/operasional:

- Nol insiden invoice terbit yang berubah tanpa penyesuaian (dipastikan oleh
  trigger database).
- Nol nomor invoice dobel (counter atomik + constraint unik).
- Waktu buat-terbit-kirim satu invoice < 2 menit dengan template siap.
- Lighthouse/LCP landing sehat; lint + build hijau di setiap commit.

## 11. Risiko & mitigasi

| Risiko | Mitigasi |
| --- | --- |
| Kredensial demo bocor | Throwaway, terisolasi di project Supabase + deployment terpisah; guard ganda di server |
| Halaman klien tersebar luas (token dibagikan) | Token acak 32 hex + `noindex` + robots.txt; tidak ada data selain invoice itu |
| PDF gagal karena gambar rusak | Pra-fetch jadi data URI dengan fallback teks |
| Perubahan skema merusak invoice lama | Semua referensi visual/pola tersnapshot ke invoice, bukan join langsung |

## 12. Rencana lanjutan (kandidat V2)

- Mode terang penuh di atas token semantik yang sudah ada.
- Pengingat jatuh tempo via email (scheduled job).
- Ekspor laporan (CSV/rekap per periode).
- Integrasi tautan pembayaran (opsional, non-kustodian).
- i18n Inggris untuk klien internasional.

## 13. Glosarium

**Invoice** — dokumen tagihan resmi (bukan "faktur"/"bill"). **Draf** — fase
sebelum terbit, satu-satunya fase yang bisa diubah bebas. **Terbit** —
mengunci invoice menjadi `issued` sekaligus menghasilkan nomor, tanggal, dan
token. **Lewat jatuh tempo** — terbit + jatuh tempo lewat + sisa > 0.
**Lunas** — sisa ≤ 0. **Item baris** — satu baris produk/layanan. **Pajak** —
tarif dalam basis poin dengan label fleksibel. **Pembayaran** — uang masuk,
nominal selalu positif. **Penyesuaian** — dokumen terkunci (jumlah + alasan),
satu-satunya jalur mengubah tagihan setelah terbit. **Sisa tagihan** — subtotal
+ pajak + penyesuaian − pembayaran. **Template** — konfigurasi invoice
berulang. **Pola penomoran** — format nomor seperti `INV-{yyyy}-{seq:3}`.
**Snapshot** — salinan tetap konfigurasi ke invoice saat dibuat. **Token** —
kunci akses acak milik invoice terbit untuk halaman klien. **Halaman klien** —
`/v/[token]`, ringkasan + PDF tanpa login.
