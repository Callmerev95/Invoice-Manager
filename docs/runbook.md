# Runbook (operasional)

## Tambah migrasi baru

1. Tulis file `supabase/migrations/YYYYMMDD_<slug>.sql` (idempoten bila bisa:
   `IF NOT EXISTS`, `DROP ... IF EXISTS`, `CREATE OR REPLACE`, `ON CONFLICT`).
2. **Perhatian fungsi ganda**: bila menimpa fungsi yang sudah ada versi fix-nya
   (`issue_invoice`, `create_invoice_from_template`), salin dari versi terakhir
   di DB/repo — jangan dari file lama. Yang menang = yang di-apply terakhir.
3. Apply via SQL Editor sesuai urutan dependensi; verifikasi via katalog
   (`pg_proc`, `pg_indexes`, `storage.buckets`).
4. Sinkronkan `src/lib/supabase/database.types.ts` manual untuk kolom/RPC baru
   (atau regenerate bila CLI tersedia).

## Reset data demo

- Reviewer mandiri: login demo → banner dashboard → "Isi ulang data demo"
  (RPC `reset_demo_data()` + seed ulang). Berlaku bila migrasi reset sudah
  di-apply di project demo.
- Manual (SQL Editor **project demo**, ganti UID dari `auth.users`):
  ```sql
  alter table public.invoices disable trigger trg_issued_immutable;
  delete from public.invoices where user_id = '<UID>';
  delete from public.invoice_series where user_id = '<UID>';
  delete from public.templates where user_id = '<UID>';
  alter table public.invoices enable trigger trg_issued_immutable;
  -- file storage: hapus via Dashboard → Storage → bucket template-assets (UI, bukan SQL)
  ```
- Wajib verifikasi: `tgenabled = 'O'` untuk `trg_issued_immutable` + hitungan 0,0.
  Jangan pernah jalankan ini di production.

## Darurat umum

| Gejala | Cek |
| ------ | --- |
| Terbit gagal `chk_issued_complete` | `pattern` draf `''`? Re-run migrasi pattern-snapshot terakhir |
| Tab filter janggal / pager kosong | RPC summaries/counts ada? (`pg_proc`) |
| PDF tanpa gambar | kolom visual ada? bucket `template-assets` ada? |
| Seed gagal di tengah | baca pesan baris pertama yang error; data lama mungkin sudah terhapus — seed ulang |
| `use server` build error "only async functions" | jangan export konstanta dari file aksi server |

## Regenerasi tipe & cek rutin

- `npm run lint`, `npm run build` sebelum tiap commit.
- Praktik terbaik: tiap selesai fitur → verifikasi → commit → push (satu fitur satu commit).
