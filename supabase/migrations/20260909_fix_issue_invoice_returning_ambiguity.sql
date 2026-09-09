-- issue_invoice RETURNS TABLE(number, token, ...) creates OUT params whose
-- names collide with result columns in the RETURN QUERY ... RETURNING list,
-- causing `column reference "number" is ambiguous`. Qualify with a table alias.
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
    update public.invoices as inv_up
    set status = 'issued',
        number = public.render_number(inv.pattern, new_seq),
        seq = new_seq,
        token = regexp_replace(gen_random_uuid()::text, '-', '', 'g'),
        issue_date = current_date,
        due_date = current_date + inv.due_days
    where inv_up.id = p_invoice_id
    returning inv_up.number, inv_up.token, inv_up.issue_date, inv_up.due_date;
end $function$;