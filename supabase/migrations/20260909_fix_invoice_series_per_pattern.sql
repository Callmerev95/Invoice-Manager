-- The unique constraint on issued numbers is per-user across ALL templates
-- (partial unique index (user_id, number) where number <> ''), so the seq
-- counter must share that namespace: key it on (user_id, pattern), not
-- (user_id, template_id). Two templates with the same number pattern would
-- otherwise both allocate seq 1 -> duplicate (user_id, number).
alter table public.invoice_series alter column template_id drop not null;

alter table public.invoice_series drop constraint invoice_series_user_id_template_id_key;

create unique index invoice_series_user_pattern_key
  on public.invoice_series (user_id, pattern);

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
        token = regexp_replace(gen_random_uuid()::text, '-', '', 'g'),
        issue_date = current_date,
        due_date = current_date + inv.due_days
    where inv_up.id = p_invoice_id
    returning inv_up.number, inv_up.token, inv_up.issue_date, inv_up.due_date;
end $function$;

revoke execute on function public.issue_invoice(uuid) from public;
grant execute on function public.issue_invoice(uuid) to authenticated;
