# Deploy

Ada dua deployment yang terpisah total (project Supabase berbeda, hosting berbeda
atau project hosting berbeda). **Tidak ada data yang berbagi.**

## A. Production (milik sendiri)

1. Buat project Supabase prod → apply migrasi sesuai `docs/setup.md` langkah 3.
2. Deploy (mis. Vercel) dari branch `main`, env:
   - `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - **Jangan set** `ALLOW_DEMO_SEED` / `DEMO_EMAILS` / `NEXT_PUBLIC_DEMO_PASSWORD`
3. Verifikasi prod: `/dev/seed` menampilkan "dinonaktifkan", tidak ada kotak demo di login, tidak ada banner reset di dashboard.

## B. Live demo (untuk reviewer)

1. Buat project Supabase **baru** → apply migrasi (langkah yang sama).
2. Auth → Users → buat user demo fake, mis. `demo@test.com` (kata sandi bebas, mis. `Demo1234!`).
3. Deploy terpisah menunjuk Supabase demo, env = 4 variabel dasar + :
   - `ALLOW_DEMO_SEED=true`
   - `DEMO_EMAILS=demo@test.com` (harus persis sama dengan email langkah 2)
   - `NEXT_PUBLIC_DEMO_PASSWORD=<kata sandi langkah 2>`
4. Login sebagai akun demo → jalankan seed sekali via banner dashboard.
5. Uji: bell berbadge, pager 2 halaman, PDF berlogo, reset mengembalikan data.
6. Kosongkan untuk reviewer: hapus data via reset (atau SQL pengosongan di runbook) agar reviewer mengisi sendiri.

## Aturan besi

- Kredensial demo adalah throwaway untuk env terisolasi; bocor pun tidak menyentuh prod (guard ganda + project beda).
- `ALLOW_DEMO_SEED` tidak pernah ada di production.
- Setiap ganti `NEXT_PUBLIC_*`, redeploy/restart (nilai dibaca saat start).
