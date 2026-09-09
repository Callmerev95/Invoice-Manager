-- visual kustom PDF: aksen + logo + gambar tanda tangan (tersnapshot, ADR-0003)

-- 1. kolom visual di templates (sumber) dan invoices (snapshot)
alter table public.templates
  add column if not exists accent_color text not null default '#0B1211',
  add column if not exists signature_image_path text;

alter table public.templates
  drop constraint if exists chk_templates_accent_hex;

alter table public.templates
  add constraint chk_templates_accent_hex
  check (accent_color ~ '^#[0-9A-Fa-f]{6}$');

alter table public.invoices
  add column if not exists signature_image_path text;

-- 2. bucket publik untuk logo + gambar tanda tangan (ringan: maks 1MB, PNG/JPEG saja)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('template-assets', 'template-assets', true, 1048576, array['image/png', 'image/jpeg'])
on conflict (id) do update
  set public = true,
      file_size_limit = 1048576,
      allowed_mime_types = array['image/png', 'image/jpeg'];

drop policy if exists "template-assets public read" on storage.objects;
create policy "template-assets public read" on storage.objects for select using (bucket_id = 'template-assets');

drop policy if exists "template-assets owner upload" on storage.objects;
create policy "template-assets owner upload" on storage.objects for insert to authenticated with check (bucket_id = 'template-assets' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "template-assets owner update" on storage.objects;
create policy "template-assets owner update" on storage.objects for update to authenticated using (bucket_id = 'template-assets' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "template-assets owner delete" on storage.objects;
create policy "template-assets owner delete" on storage.objects for delete to authenticated using (bucket_id = 'template-assets' and (storage.foldername(name))[1] = auth.uid()::text);

-- 3. snapshot visual template -> draf invoice (ganti hardcode aksen '#0B1211')
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
    currency, accent_color
  ) values (
    p_user_id, p_template_id, 'draft', p_client_name, p_client_email, p_client_address,
    current_date + due_offset, due_offset,
    tmpl.business_name, tmpl.business_line, tmpl.business_address, tmpl.business_email,
    tmpl.business_phone, tmpl.business_website, tmpl.logo_path, tmpl.invoice_title, tmpl.footer_note,
    tmpl.payment_terms, tmpl.payment_to, tmpl.signature_text, tmpl.signature_image_path, tmpl.tax_label, tmpl.tax_rate_bps,
    'IDR', tmpl.accent_color
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

-- 4. halaman publik + PDF klien ikut membawa gambar tanda tangan
create or replace function public.get_public_invoice(p_token text)
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select case
    when i.token = p_token and i.status = 'issued' then
      jsonb_build_object(
        'number', i.number,
        'client_name', i.client_name,
        'client_email', i.client_email,
        'client_address', i.client_address,
        'issue_date', i.issue_date,
        'due_date', i.due_date,
        'currency', i.currency,
        'business_name', i.business_name,
        'business_line', i.business_line,
        'business_address', i.business_address,
        'business_email', i.business_email,
        'business_phone', i.business_phone,
        'business_website', i.business_website,
        'logo_path', i.logo_path,
        'invoice_title', i.invoice_title,
        'footer_note', i.footer_note,
        'payment_terms', i.payment_terms,
        'payment_to', i.payment_to,
        'signature_text', i.signature_text,
        'signature_image_path', i.signature_image_path,
        'tax_label', i.tax_label,
        'tax_rate_bps', i.tax_rate_bps,
        'accent_color', i.accent_color,
        'items', (
          select coalesce(jsonb_agg(jsonb_build_object(
            'position', li.position,
            'description', li.description,
            'quantity', li.quantity,
            'unit_price_sen', li.unit_price_sen,
            'subtotal_sen', li.subtotal_sen
          ) order by li.position), '[]'::jsonb)
          from public.line_items li
          where li.invoice_id = i.id
        ),
        'payments', (
          select coalesce(jsonb_agg(jsonb_build_object(
            'paid_at', p.paid_at,
            'amount_sen', p.amount_sen,
            'note', p.note
          ) order by p.paid_at), '[]'::jsonb)
          from public.payments p
          where p.invoice_id = i.id
        ),
        'adjustments', (
          select coalesce(jsonb_agg(jsonb_build_object(
            'amount_sen', a.amount_sen,
            'reason', a.reason,
            'created_at', a.created_at
          ) order by a.created_at), '[]'::jsonb)
          from public.adjustments a
          where a.invoice_id = i.id
        ),
        'totals', (
          select jsonb_build_object(
            'subtotal_sen',
              coalesce((select sum(li.subtotal_sen) from public.line_items li where li.invoice_id = i.id), 0),
            'tax_sen',
              (round(coalesce((select sum(li.subtotal_sen) from public.line_items li where li.invoice_id = i.id), 0) * i.tax_rate_bps / 10000.0))::bigint,
            'adjustment_sen',
              coalesce((select sum(a.amount_sen) from public.adjustments a where a.invoice_id = i.id), 0),
            'paid_sen',
              coalesce((select sum(p.amount_sen) from public.payments p where p.invoice_id = i.id), 0)
          )
        )
      )
    else null
    end as result
  from public.invoices i
  where i.token = p_token
  limit 1
$$;

revoke execute on function public.get_public_invoice(text) from public;
grant execute on function public.get_public_invoice(text) to anon, authenticated;
