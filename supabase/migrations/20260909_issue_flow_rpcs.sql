-- invoice issue flow: due_days override + atomic create/issue RPCs

alter table public.invoices
  add column due_days int not null default 14 check (due_days >= 0);

-- render pattern like INV-{yyyy}-{seq:3} -> INV-2026-001
create or replace function public.render_number(p_pattern text, p_seq bigint)
returns text
language plpgsql
stable
set search_path = public
as $$
declare
  width int;
  result text;
begin
  width := coalesce((regexp_match(p_pattern, '\{seq:(\d+)\}'))[1]::int, 1);
  result := regexp_replace(p_pattern, '\{seq(:\d+)?\}', lpad(p_seq::text, greatest(1, width), '0'), 'g');
  result := regexp_replace(result, '\{yyyy\}', extract(year from current_date)::text, 'g');
  return result;
end $$;

-- snapshot template into a draft invoice + insert line items, atomically (ADR snapshot)
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
    payment_terms, payment_to, signature_text, tax_label, tax_rate_bps,
    currency, accent_color
  ) values (
    p_user_id, p_template_id, 'draft', p_client_name, p_client_email, p_client_address,
    current_date + due_offset, due_offset,
    tmpl.business_name, tmpl.business_line, tmpl.business_address, tmpl.business_email,
    tmpl.business_phone, tmpl.business_website, tmpl.logo_path, tmpl.invoice_title, tmpl.footer_note,
    tmpl.payment_terms, tmpl.payment_to, tmpl.signature_text, tmpl.tax_label, tmpl.tax_rate_bps,
    'IDR', '#0B1211'
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

-- claim next seq atomically + finalize draft into immutable issued invoice
create or replace function public.issue_invoice(p_invoice_id uuid)
returns table (number text, token text, issue_date date, due_date date)
language plpgsql
security definer
set search_path = public
as $$
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

  if inv.template_id is not null then
    insert into public.invoice_series (user_id, template_id, pattern, next_seq)
    values (inv.user_id, inv.template_id, inv.pattern, 1)
    on conflict (user_id, template_id)
    do update set next_seq = public.invoice_series.next_seq + 1
    returning next_seq into new_seq;
  else
    select coalesce(max(seq), 0) + 1 into new_seq
    from public.invoices
    where user_id = inv.user_id and pattern = inv.pattern and number <> '';
  end if;

  return query
    update public.invoices
    set status = 'issued',
        number = public.render_number(inv.pattern, new_seq),
        seq = new_seq,
        token = regexp_replace(gen_random_uuid()::text, '-', '', 'g'),
        issue_date = current_date,
        due_date = current_date + inv.due_days
    where id = p_invoice_id
    returning number, token, issue_date, due_date;
end $$;

revoke execute on function public.create_invoice_from_template(uuid, uuid, text, text, text, int, jsonb) from public;
grant execute on function public.create_invoice_from_template(uuid, uuid, text, text, text, int, jsonb) to authenticated;

revoke execute on function public.issue_invoice(uuid) from public;
grant execute on function public.issue_invoice(uuid) to authenticated;