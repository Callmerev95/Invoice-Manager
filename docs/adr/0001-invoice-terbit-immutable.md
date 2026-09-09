# Invoice terbit tidak dapat diubah

Invoice yang sudah diterbitkan bersifat immutable: tidak boleh diupdate, dihapus, atau dibatalkan. Ini ditegakkan di dalam database lewat trigger `prevent_issued_mutation`, sehingga berlaku untuk semua jalur akses (aplikasi, API, RPC), bukan hanya di lapisan UI.

Alasan: invoice terbit adalah dokumen yang sudah dilihat dan disimpan klien. Mengubah nominal secara diam-diam mematahkan kepercayaan dan hampir tidak mungkin dijelaskan ulang saat pembayaran bermasalah. `draft` adalah satu-satunya fase yang dapat diubah; kunci permanen itu sendiri membuat angka di invoice terbit bisa dipercaya.

**Konsekuensi**: kesalahan setelah terbit tidak bisa dikoreksi langsung. Jalur perbaikan yang sah adalah penyesuaian (ADR 0002), dan setiap perubahan besar tagihan selalu menyisakan jejak audit.

**Status**: accepted
**Superseded by**: —
**Related**: ADR 0002