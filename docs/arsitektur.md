# Arsitektur (V1)

Next.js App Router + Supabase (Postgres, Auth, Storage). Satu pengguna per baris
(RLS `user_id = auth.uid()`); halaman publik klien via RPC bertoken (tanpa login).

## Aturan keras (lihat `docs/adr/`)

- **ADR-0001**: invoice terbit immutable — trigger `trg_issued_immutable` menolak
  UPDATE/DELETE segala jalur. Satu-satunya fase ubah: draf.
- **ADR-0002**: koreksi pasca-terbit hanya via **penyesuaian** (jumlah + alasan).
  Sisa = subtotal + pajak + penyesuaian − pembayaran.
- **ADR-0003**: aset visual milik template, **disnapshot** ke invoice saat draf
  dibuat (logo, aksen, tanda tangan). Ubah template ≠ ubah invoice terbit.

## Alur data penting

- **Buat draf**: RPC `create_invoice_from_template` — snapshot seluruh identitas +
  visual + **pola penomoran** dari template, insert item atomik.
- **Terbit**: RPC `issue_invoice` — klaim `next_seq` atomik per `(user, pola)`,
  tulis nomor/token/tanggal. Pola ditulis balik (`pattern = ...`) agar lolos
  check `chk_issued_complete`.
- **Ubah draf**: RPC `save_invoice_draft` (ganti meta + seluruh item atomik).
- **PDF**: `@react-pdf/renderer` di route handler; gambar di-pra-fetch jadi data
  URI (gagal sunyi → fallback teks, PDF tidak pernah gagal render); regenerasi
  otomatis tiap pembayaran/penyesuaian berubah.
- **Halaman publik**: RPC `get_public_invoice(token)` (definer, capability = token).

## Pola render & performa

- Server Components + `loading.tsx` per segmen (skeleton statis) + indikator
  pending tautan. Layout streaming: fetch bell dibungkus Suspense sendiri agar
  tidak memblokir fallback halaman.
- **Agregat di DB**: `invoice_summaries(status, limit, offset)` + `invoice_status_counts()`
  — status terhitung (draf/lunas/lewat/terbit) direplikasi di SQL; daftar +
  dashboard tidak lagi full-scan tabel anak. Indeks: `(user_id, created_at)`,
  `(user_id, status, created_at)`.
- **Bell stateless**: tanpa tabel/cron — hitung ulang tiap render dari status
  terhitung; lunas = hilang sendiri.
- **Demo**: project + hosting terpisah; seeder dibuka hanya untuk email demo
  (`ALLOW_DEMO_SEED` + `DEMO_EMAILS`); reset via RPC `reset_demo_data()` definer
  khusus demo (lepas-pasang trigger dalam transaksi).
