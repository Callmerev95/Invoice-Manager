# Panduan pakai (V1)

Istilah mengikuti glosarium (`CONTEXT.md`): draf, terbit, item baris, pajak,
pembayaran, penyesuaian, sisa tagihan, template, nomor seri, token, halaman klien.

## 1. Buat template dulu

Template = identitas bisnis + pola penomoran + ketentuan yang dipakai berulang
(`/templates` → Template baru).

- **Pola nomor** wajib memuat `{seq}`, mis. `INV-{yyyy}-{seq:3}` → `INV-2026-001`.
  Nomor diklaim atomik saat terbit; tidak pernah dobel.
- **Pajak** dalam basis poin (PPN 11% = 1100) + label bebas.
- **Visual dokumen** (opsional): upload logo (maks 512px/300KB), pilih aksen
  (default gelap), upload gambar tanda tangan (maks 800x300/300KB). Berlaku untuk
  invoice baru; invoice terbit tidak berubah (snapshot).

## 2. Buat invoice (draf)

`/invoices` → Invoice baru → pilih template, isi klien + item baris → Simpan
(draf) atau langsung Terbitkan. Draf = satu-satunya fase yang bisa diubah bebas.

## 3. Terbitkan invoice

Tombol **Terbitkan invoice** mengunci draf: nomor diklaim, tanggal + token dibuat,
PDF ditulis. Invoice terbit **immutable**: tidak bisa diubah/hapus/batal
(ditegakkan database, bukan sekadar UI).

Bagikan ke klien via **halaman klien** (`/v/[token]`, tanpa login) atau unduh PDF.

## 4. Catat pembayaran & penyesuaian

- **Membayar sebagian**: catat nominal (selalu positif) → mengurangi sisa tagihan.
  Lunas = sisa ≤ 0 (kelebihan bayar dicatat sebagai info, bukan refund).
- **Penyesuaian**: satu-satunya cara mengubah besar tagihan setelah terbit
  (diskon/koreksi, boleh negatif, alasan wajib). Tidak ada tombol batal.
- Status **lewat jatuh tempo** terhitung otomatis: terbit + jatuh tempo lewat +
  sisa positif. Bell di topbar menghitungnya; klik untuk daftar + tautan.

## 5. Filter & halaman

Daftar invoice: tab Semua/Draf/Terbit/Lewat/Lunas berangka hitungan, 20/halaman
(nomor di desktop, panah di mobile). Dashboard: statistik + 8 terbaru berpengpager.

## 6. Akun demo

Di deployment demo: login pakai kredensial di kotak demo → banner dashboard →
"Isi ulang data demo" untuk reset. Jangan lakukan ini di production.
