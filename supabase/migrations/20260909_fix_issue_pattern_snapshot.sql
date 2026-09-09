-- fix: snapshot pola penomoran + tulis balik pattern saat terbit
--
-- Latar: create_invoice_from_template tidak pernah mengisi kolom pattern
-- (draf RPC selalu pattern = ''), dan issue_invoice hanya meng-coalesce
-- pattern di variabel lokal tanpa menulis balik ke baris. Akibatnya
-- UPDATE ke 'issued' selalu melanggar chk_issued_complete (pattern <> '')
-- dan pola nomor kustom template selalu jatuh ke fallback default.

-- 1. draf lama: isi pattern dari template-nya
update public.invoices i
set pattern = t.number_pattern
from public.templates t
where i.template_id = t.id
  and i.status = 'draft'
  and (i.pattern is null or i.pattern = '');

-- 2. draf baru: snapshot pola dari template saat dibuat
create or replace function public.create_invoice_from_template(
  p_user_id uuid,
  p_template_id uuid,
  p_client_name text,
  p_client_email text,
  p_client_address text,
  p_due_days int,
  p_items jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  tmpl public.templates%rowtype;
  inv_id uuid;
  it jsonb;
  due_offset int;
begin
  if p_user_id is distinct from auth.uid() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  select * into tmpl from public.templates
  where id = p_template_id and user_id = p_user_id;
  if not found then
    raise exception 'template not found' using errcode = 'P0002';
  end if;

  due_offset := coalesce(p_due_days, tmpl.due_days);

  insert into public.invoices (
    user_id, template_id, status, client_name, client_email, client_address,
    due_date, due_days,
    business_name, business_line, business_address, business_email,
    business_phone, business_website, logo_path, invoice_title, footer_note,
    payment_terms, payment_to, signature_text, signature_image_path, tax_label, tax_rate_bps,
    currency, accent_color, pattern
  ) values (
    p_user_id, p_template_id, 'draft', p_client_name, p_client_email, p_client_address,
    current_date + due_offset, due_offset,
    tmpl.business_name, tmpl.business_line, tmpl.business_address, tmpl.business_email,
    tmpl.business_phone, tmpl.business_website, tmpl.logo_path, tmpl.invoice_title, tmpl.footer_note,
    tmpl.payment_terms, tmpl.payment_to, tmpl.signature_text, tmpl.signature_image_path, tmpl.tax_label, tmpl.tax_rate_bps,
    'IDR', tmpl.accent_color, tmpl.number_pattern
  )
  returning id into inv_id;

  if p_items is not null and jsonb_typeof(p_items) = 'array' then
    for it in select * from jsonb_array_elements(p_items) loop
      insert into public.line_items (
        invoice_id, position, description, quantity, unit_price_sen, subtotal_sen
      ) values (
        inv_id,
        coalesce((it->>'position')::int, 0),
        coalesce(it->>'description', ''),
        coalesce((it->>'quantity')::numeric(12,4), 0),
        coalesce((it->>'unit_price_sen')::bigint, 0),
        round(coalesce((it->>'quantity')::numeric(12,4), 0) * coalesce((it->>'unit_price_sen')::bigint, 0))
      );
    end loop;
  end if;

  return inv_id;
end $$;

revoke execute on function public.create_invoice_from_template(uuid, uuid, text, text, text, int, jsonb) from public;
grant execute on function public.create_invoice_from_template(uuid, uuid, text, text, text, int, jsonb) to authenticated;

-- 3. sabuk pengaman: issue_invoice menulis balik pattern hasil coalesce
create or replace function public.issue_invoice(p_invoice_id uuid)
returns table(number text, token text, issue_date date, due_date date)
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  inv public.invoices%rowtype;
  new_seq bigint;
begin
  select * into inv from public.invoices where id = p_invoice_id;
  if not found then
    raise exception 'invoice not found' using errcode = 'P0002';
  end if;
  if inv.user_id is distinct from auth.uid() then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if inv.status <> 'draft' then
    raise exception 'invoice sudah terbit' using errcode = 'P0002';
  end if;
  inv.pattern := coalesce(nullif(inv.pattern, ''), 'INV-{yyyy}-{seq:3}');

  insert into public.invoice_series (user_id, template_id, pattern, next_seq)
  values (inv.user_id, inv.template_id, inv.pattern, 1)
  on conflict (user_id, pattern)
  do update set
    next_seq = greatest(
      public.invoice_series.next_seq + 1,
      (select coalesce(max(i.seq), 0) + 1
       from public.invoices i
       where i.user_id = excluded.user_id
         and i.pattern = excluded.pattern
         and i.number <> '')
    ),
    template_id = excluded.template_id
  returning next_seq into new_seq;

  return query
    update public.invoices as inv_up
    set status = 'issued',
        number = public.render_number(inv.pattern, new_seq),
        seq = new_seq,
        pattern = inv.pattern,
        token = regexp_replace(gen_random_uuid()::text, '-', '', 'g'),
        issue_date = current_date,
        due_date = current_date + inv.due_days
    where inv_up.id = p_invoice_id
    returning inv_up.number, inv_up.token, inv_up.issue_date, inv_up.due_date;
end $function$;

revoke execute on function public.issue_invoice(uuid) from public;
grant execute on function public.issue_invoice(uuid) to authenticated;
