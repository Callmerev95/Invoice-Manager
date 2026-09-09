This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Data contoh

Untuk melihat tampilan dengan data awal, buka `/dev/seed` (mode development setelah login): tombol "Isi data contoh" akan menghapus seluruh data invoice & template akun dan membuat 2 template + 25 invoice contoh (draf, terbit, lewat jatuh tempo, lunas, penyesuaian) termasuk template bervisiual (logo, aksen, tanda tangan). Seeder hanya aktif di development, atau di production khusus akun demo bila `ALLOW_DEMO_SEED=true` dan email terdaftar di `DEMO_EMAILS`.

## Live demo (untuk reviewer)

1. Buat project Supabase baru → apply seluruh migrasi di `supabase/migrations/` berurutan via SQL Editor.
2. Buat user demo di Auth dashboard: `demo@contoh.test` (kata sandi bebas, mis. `Demo1234!`).
3. Deploy app ke hosting terpisah (project/hosting berbeda dari production) dengan env menunjuk ke Supabase demo, plus:
   - `ALLOW_DEMO_SEED=true`
   - `DEMO_EMAILS=demo@contoh.test`
   - `NEXT_PUBLIC_DEMO_PASSWORD=<kata sandi akun demo>`
4. Login sebagai akun demo → halaman login menampilkan kotak "Coba live demo" → jalankan seeder sekali via banner di dashboard (`Isi ulang data demo`).
5. Jangan pernah set `ALLOW_DEMO_SEED` di deployment production.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
