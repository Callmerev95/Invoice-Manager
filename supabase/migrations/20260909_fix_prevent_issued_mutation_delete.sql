-- prevent_issued_mutation ran for DELETE too and ended with `return new`,
-- which is NULL in a BEFORE DELETE trigger — null return silently skips the
-- delete, so even drafts could not be removed. Return `old` on delete.
create or replace function public.prevent_issued_mutation()
returns trigger language plpgsql as $$
begin
  if old.status = 'issued' then
    raise exception 'issued invoice is immutable'
      using errcode = 'P0001';
  end if;
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end $$;