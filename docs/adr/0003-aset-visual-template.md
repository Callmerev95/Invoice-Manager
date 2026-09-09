# Aset visual template (logo, kop, aksen, tanda tangan gambar)

Template boleh membawa logo, warna aksen, dan gambar tanda tangan yang tampil di PDF dan halaman klien. Semua aset visual mengikuti aturan snapshot: disalin ke invoice saat draf dibuat, sehingga mengubah template tidak menyentuh invoice terbit (konsisten dengan ADR 0001).

**Alasan**: invoice freelancer perlu terlihat profesional (kop + logo + tanda tangan) tanpa mengorbankan kepercayaan angka. Aset disimpan di bucket publik terpisah `template-assets` (bukan `invoice-pdfs`) agar lifecycle-nya milik template, bukan milik dokumen terbit. Background/watermark full-page image ditolak: biaya render + risiko kontras lebih besar dari manfaat; kop rapi + satu aksen cukup.

**Konsekuensi**: batas ringan (logo maks 512px/300KB, tanda tangan maks 800x300/300KB, bucket maks 1MB, PNG/JPEG) agar generate PDF tetap <2 detik dan PDF <400KB; file lama yang diganti dihapus agar tidak orphan; invoice terbit lama tidak berubah saat visual template diubah.

**Status**: accepted
**Superseded by**: —
**Related**: ADR 0001
