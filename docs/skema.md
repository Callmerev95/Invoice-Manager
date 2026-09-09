# Skema (V1)

Rujukan penuh: `supabase/migrations/`. Ringkasan:

## Tabel

- **templates** — milik user: identitas bisnis, `logo_path`, `accent_color`
  (`#RRGGBB`, default gelap), `signature_image_path`, `number_pattern`,
  pajak (`tax_label`, `tax_rate_bps`), `due_days`, ketentuan.
- **invoice_series** — counter `(user_id, pattern)` → `next_seq` (unik per pola,
  bukan per template: dua template berpola sama berbagi namespace).
- **invoices** — snapshot template saat draf dibuat (identitas, visual, pajak,
  `pattern`) + `status` (`draft`/`issued`), `number`, `seq`, `token`,
  `issue_date`, `due_date`. Unik `(user_id, number)` hanya bila terbit.
- **line_items** — `(invoice_id, position, description, quantity, unit_price_sen,
  subtotal_sen)`; subtotal salinan hitung frontend.
- **payments** — `(invoice_id, amount_sen > 0, paid_at, note)`.
- **adjustments** — `(invoice_id, amount_sen ≠ 0, reason wajib)`.

Check penting: `chk_issued_complete` (terbit wajib lengkap: nomor, seq, pola,
token, tanggal); tarif 0–100000 bps; nominal pembayaran > 0.

## Storage (bucket publik, tulis pemilik per folder UID)

- **invoice-pdfs** — PDF terbit (`{uid}/{invoiceId}.pdf`), upsert tiap berubah.
- **template-assets** — logo & tanda tangan (`{uid}/{templateId}/...`), maks 1MB,
  PNG/JPEG. Baca publik (dibutuhkan PDF + halaman klien).

## Fungsi RPC (definer + cek `auth.uid()`, revoke public)

`create_invoice_from_template`, `issue_invoice`, `save_invoice_draft`,
`render_number`, `get_public_invoice` (anon + authenticated),
`invoice_summaries`, `invoice_status_counts`, `reset_demo_data` (email demo saja).

## Trigger

`set_updated_at` (templates, invoices); `trg_issued_immutable` (invoices:
tolak ubah/hapus invoice terbit — jangan dimatikan kecuali reset demo via RPC).
