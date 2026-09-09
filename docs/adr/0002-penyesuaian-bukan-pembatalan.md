# Penyesuaian, bukan pembatalan

Setelah invoice terbit, besar tagihan hanya dapat berubah melalui dokumen **penyesuaian** yang terkunci: pasangan jumlah (boleh negatif) dan alasan wajib, disimpan terpisah dari invoice bersama pembayaran. Ini menggantikan mekanisme "batalkan invoice" atau "edit nominal terbit".

Alasan: invoice immutable (ADR 0001), tetapi kebutuhan bisnis itu nyata — diskon karena pekerjaan cacat, kekeliruan perhitungan, layanan yang dibatalkan klien. Alih-alih membuka kembali dokumen kunci, kita menambahkan catatan audit: **sisa tagihan = subtotal + pajak + penyesuaian − pembayaran**. Setiap ketidaksepakatan bisa dijelaskan lewat sekumpulan dokumen kecil yang terdokumentasi, bukan satu angka yang diubah.

**Konsekuensi**: kelebihan bayar (sisa negatif) dipertahankan sebagai informasi, bukan diubah jadi otomatis nol; penyesuaian memerlukan alasan; tampilan invoice klien menampilkan riwayat penyesuaian dan pembayaran.

**Status**: accepted
**Superseded by**: —
**Related**: ADR 0001