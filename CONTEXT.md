# Invoice Manager

Aplikasi web pribadi untuk freelancer Indonesia membuat, menerbitkan, dan menagih invoice secara profesional. Satu pengguna, dark-first, bahasa Indonesia.

## Dokumen & Status

**Invoice**:
Dokumen tagihan dari freelancer ke klien yang berisi item baris, pajak, dan pembayaran.
_Avoid_: faktur, tagihan, bill, dokumen erupsi

**Draf**:
Status invoice sebelum terbit; satu-satunya fase yang bisa diubah bebas.
_Avoid_: konsep, draft (english)

**Terbit**:
Tindakan mengunci invoice menjadi status `issued` yang immutable (lihat ADR 0001), sekaligus menghasilkan nomor, tanggal, dan token publik.
_Avoid_: publish, kirim, finalisasi

**Lewat jatuh tempo**:
Status terhitung: invoice terbit, jatuh tempo sudah lewat, dan sisa tagihan masih positif.
_Avoid_: telat, overdue, menunggak

**Lunas**:
Status terhitung: sisa tagihan sudah ≤ 0.
_Avoid_: paid, bayar lunas, pelunasan

## Struktur tagihan

**Item baris**:
Satu baris produk atau layanan dalam invoice; dihitung di frontend, `subtotal_sen` tersimpan sebagai salinan.
_Avoid_: item (english), produk, baris

**Pajak**:
Tarif PPN dalam basis poin (bps) dengan label fleksibel per template (mis. "PPN 11%").
_Avoid_: tax, PPn (penulisan), pungutan

**Pembayaran**:
Uang masuk yang mengurangi sisa tagihan; nominal selalu positif.
_Avoid_: bayar, transaksi, pemasukan

**Penyesuaian**:
Dokumen terkunci berisi jumlah (boleh negatif) dan alasan wajib, satu-satunya cara mengubah besar tagihan setelah terbit (lihat ADR 0002).
_Avoid_: koreksi, credit note, discount, adjustment (english)

**Sisa tagihan**:
Total (subtotal + pajak) + penyesuaian − pembayaran.
_Avoid_: outstanding, balance, piutang berjalan

**Kelebihan bayar**:
Sisa tagihan yang negatif; dicatat sebagai informasi untuk klien, bukan dikembalikan atau diubah nominalnya.
_Avoid_: refund, kredit, lebih bayar

## Identitas & Penomoran

**Template**:
Konfigurasi tunggal untuk membuat invoice berulang: identitas bisnis, pola penomoran, ketentuan pembayaran, dan pajak.
_Avoid_: model, skema, preset, desain

**Nomor seri (seri)**:
Penomoran invoice berurutan per pengguna; `next_seq` diklaim secara atomik sehingga nomor tidak pernah terpakai dua kali.
_Avoid_: nomor urut, sequence (english), counter

**Pola penomoran**:
Format nomor seperti `INV-{yyyy}-{seq:3}`; setiap identitas bisnis punya satu seri sendiri.
_Avoid_: format, number pattern (english)

**Snapshot**:
Salinan tetap konfigurasi identitas bisnis ke dalam invoice saat proses pembuatan; mengubah template tidak menyentuh invoice lama.
_Avoid_: copy, duplikat, referensi

**Klien**:
Pihak yang menerima invoice.
_Avoid_: customer, pelanggan, konsumen

## Publikasi

**Token**:
Kunci akses acak milik invoice terbit untuk membuka halaman publik klien.
_Avoid_: slug, id, link, kode

**Halaman klien**:
`/v/[token]` — ringkasan invoice, pembayaran, dan unduhan PDF, tanpa perlu login.
_Avoid_: portal, status page, landing

## Verb (proses)

**Menerbitkan invoice**:
Mengunci draf menjadi terbit: mengklaim nomor dari seri, mengatur `issue_date`/`due_date`, membuat token, dan menulis PDF.
_Avoid_: submit, kirim invoice, publish

**Membayar sebagian**:
Mencatat pembayaran yang mengurangi sisa tanpa mengubah nominal invoice.
_Avoid_: cicilan, angsuran