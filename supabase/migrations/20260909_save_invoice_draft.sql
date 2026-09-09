-- atomic draft editing (replace invoice meta + all line items)
create or replace function public.save_invoice_draft(
  p_invoice_id uuid,
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
  v_inv public.invoices%rowtype;
  v_it jsonb;
begin
  select * into v_inv from public.invoices where id = p_invoice_id;
  if not found then
    raise exception 'invoice not found' using errcode = 'P0002';
  end if;
  if v_inv.user_id is distinct from auth.uid() then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if v_inv.status <> 'draft' then
    raise exception 'invoice sudah terbit' using errcode = 'P0002';
  end if;

  update public.invoices
  set client_name = coalesce(p_client_name, v_inv.client_name),
      client_email = p_client_email,
      client_address = p_client_address,
      due_days = greatest(coalesce(p_due_days, v_inv.due_days), 0),
      due_date = current_date + greatest(coalesce(p_due_days, v_inv.due_days), 0)
  where id = p_invoice_id;

  delete from public.line_items where invoice_id = p_invoice_id;

  if p_items is not null and jsonb_typeof(p_items) = 'array' then
    for v_it in select * from jsonb_array_elements(p_items) loop
      insert into public.line_items (
        invoice_id, position, description, quantity, unit_price_sen, subtotal_sen
      ) values (
        p_invoice_id,
        coalesce((v_it->>'position')::int, 0),
        coalesce(v_it->>'description', ''),
        coalesce((v_it->>'quantity')::numeric(12,4), 0),
        coalesce((v_it->>'unit_price_sen')::bigint, 0),
        round(coalesce((v_it->>'quantity')::numeric(12,4), 0) * coalesce((v_it->>'unit_price_sen')::bigint, 0))
      );
    end loop;
  end if;

  return p_invoice_id;
end $$;

revoke execute on function public.save_invoice_draft(uuid, text, text, text, int, jsonb) from public;
grant execute on function public.save_invoice_draft(uuid, text, text, text, int, jsonb) to authenticated;