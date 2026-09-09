-- draft invoices use number = '' until issued; the full unique (user_id, number)
-- constraint blocked creating a second draft. Enforce uniqueness only on issued.
alter table public.invoices drop constraint invoices_user_id_number_key;

create unique index invoices_user_id_number_key
  on public.invoices (user_id, number)
  where number <> '';