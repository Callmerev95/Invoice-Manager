# Setup lokal

## Prasyarat

- Node.js 20+ dan npm
- Akun + project Supabase (gratis cukup)

## 1. Instalasi

```bash
npm install
cp .env.example .env.local
```

## 2. Isi env

Dari Supabase Dashboard → Project Settings → API:

| Variabel | Isi |
| -------- | --- |
| `SUPABASE_URL` | Project URL |
| `SUPABASE_PUBLISHABLE_KEY` | Publishable key |
| `NEXT_PUBLIC_SUPABASE_URL` | sama dengan `SUPABASE_URL` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | sama dengan `SUPABASE_PUBLISHABLE_KEY` |

Opsional (demo lokal, lihat `docs/deploy.md`): `ALLOW_DEMO_SEED`, `DEMO_EMAILS`, `NEXT_PUBLIC_DEMO_PASSWORD`.

## 3. Apply migrasi (WAJIB berurutan)

> Jangan andalkan urutan alfabet file: beberapa file menimpa fungsi yang sama dan
> versi yang benar harus menang terakhir. Salah urutan = Terbitkan invoice gagal
> (`chk_issued_complete`) atau series bentrok.

Di Dashboard → SQL Editor → New query, paste-run **satu file per sekali**, urut:

1. `20260909_init_schema.sql`
2. `20260909_issue_flow_rpcs.sql`
3. `20260909_save_invoice_draft.sql`
4. `20260909_fix_issue_invoice_returning_ambiguity.sql`
5. `20260909_fix_invoice_series_per_pattern.sql`
6. `20260909_fix_invoice_unique_issued.sql`
7. `20260909_fix_prevent_issued_mutation_delete.sql`
8. `20260909_template_visual_assets.sql`
9. `20260909_invoice_summaries.sql`
10. `20260909_fix_issue_pattern_snapshot.sql`
11. `20260909_reset_demo_data.sql`

Catatan: no. 4 sudah disupersede oleh no. 5 + no. 10 (tetap dijalankan agar riwayat utuh; yang menentukan adalah no. 10 terakhir).

Verifikasi:

```sql
select proname from pg_proc
where proname in ('invoice_summaries','invoice_status_counts','reset_demo_data');
select id, public from storage.buckets where id in ('invoice-pdfs','template-assets');
```

Harus: 3 fungsi + 2 bucket.

## 4. Jalan

```bash
npm run dev      # development (lambat di navigasi pertama: kompilasi per halaman, normal)
npm run lint     # cek eslint
npm run build && npm run start  # uji production-like (jauh lebih responsif)
```

Buka `http://localhost:3000`, daftar akun, lalu isi data via `/dev/seed` ( dev only;
menghapus data akun — baca peringatannya).

## 5. Masalah umum

- **Terbitkan gagal `chk_issued_complete`** → migrasi no. 10 belum menang terakhir; re-run file no. 10, cek `pattern` draf tidak `''`.
- **Seeder 25 invoice terasa berat di dev** → normal (kompilasi + roundtrip cloud); bandingkan dengan `build && start`.
- **PDF tanpa logo/aksen** → kolom visual belum ada = migrasi no. 8 belum di-apply.
