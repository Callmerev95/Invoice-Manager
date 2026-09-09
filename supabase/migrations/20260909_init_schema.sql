-- invoice-manager V1: domain schema
create type public.invoice_status as enum ('draft', 'issued');

create table public.templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  business_name text,
  business_line text,
  business_address text,
  business_email text,
  business_phone text,
  business_website text,
  logo_path text,
  invoice_title text not null default 'INVOICE',
  footer_note text,
  payment_terms text,
  payment_to text,
  signature_text text,
  number_pattern text not null default 'INV-{yyyy}-{seq:3}',
  tax_label text not null default 'PPN',
  tax_rate_bps int not null default 0 check (tax_rate_bps between 0 and 100000),
  due_days int not null default 14 check (due_days >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index templates_user_idx on public.templates (user_id);

create table public.invoice_series (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  template_id uuid not null references public.templates(id) on delete cascade,
  pattern text not null,
  next_seq int not null default 1 check (next_seq >= 1),
  unique (user_id, template_id)
);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  template_id uuid references public.templates(id) on delete set null,
  status public.invoice_status not null default 'draft',
  number text not null default '',
  seq int not null default 0,
  pattern text not null default '',
  token text not null default '',
  client_name text not null,
  client_email text,
  client_address text,
  issue_date date,
  due_date date not null,
  business_name text,
  business_line text,
  business_address text,
  business_email text,
  business_phone text,
  business_website text,
  logo_path text,
  invoice_title text not null default 'INVOICE',
  footer_note text,
  payment_terms text,
  payment_to text,
  signature_text text,
  tax_label text not null default 'PPN',
  tax_rate_bps int not null default 0 check (tax_rate_bps between 0 and 100000),
  currency text not null default 'IDR',
  accent_color text default '#0B1211',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, number),
  constraint chk_issued_complete check (
    status = 'draft'
    or (number <> '' and seq > 0 and pattern <> '' and token <> '' and issue_date is not null)
  )
);

create unique index invoices_token_idx on public.invoices (token) where token <> '';
create index invoices_user_idx on public.invoices (user_id);
create index invoices_status_idx on public.invoices (status);
create index invoices_user_due_idx on public.invoices (user_id, due_date);

create table public.line_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  position int not null,
  description text not null,
  quantity numeric(12,4) not null check (quantity >= 0),
  unit_price_sen bigint not null check (unit_price_sen >= 0),
  subtotal_sen bigint not null check (subtotal_sen >= 0)
);

create index line_items_invoice_idx on public.line_items (invoice_id);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  amount_sen bigint not null check (amount_sen > 0),
  paid_at date not null default current_date,
  note text,
  created_at timestamptz not null default now()
);

create index payments_invoice_idx on public.payments (invoice_id);

create table public.adjustments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  amount_sen bigint not null check (amount_sen <> 0),
  reason text not null,
  created_at timestamptz not null default now()
);

create index adjustments_invoice_idx on public.adjustments (invoice_id);

-- updated_at maintenance
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger trg_templates_updated
  before update on public.templates
  for each row execute function public.set_updated_at();

create trigger trg_invoices_updated
  before update on public.invoices
  for each row execute function public.set_updated_at();

-- issued invoices are immutable (ADR-0001)
create or replace function public.prevent_issued_mutation()
returns trigger language plpgsql as $$
begin
  if old.status = 'issued' then
    raise exception 'issued invoice is immutable'
      using errcode = 'P0001';
  end if;
  return new;
end $$;

create trigger trg_issued_immutable
  before update or delete on public.invoices
  for each row execute function public.prevent_issued_mutation();

-- RLS
alter table public.templates enable row level security;
alter table public.invoice_series enable row level security;
alter table public.invoices enable row level security;
alter table public.line_items enable row level security;
alter table public.payments enable row level security;
alter table public.adjustments enable row level security;

create policy "templates owner" on public.templates for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "series owner" on public.invoice_series for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "invoices owner" on public.invoices for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "line_items via invoice" on public.line_items for all to authenticated using (exists (select 1 from public.invoices i where i.id = invoice_id and i.user_id = auth.uid())) with check (exists (select 1 from public.invoices i where i.id = invoice_id and i.user_id = auth.uid()));
create policy "payments via invoice" on public.payments for all to authenticated using (exists (select 1 from public.invoices i where i.id = invoice_id and i.user_id = auth.uid())) with check (exists (select 1 from public.invoices i where i.id = invoice_id and i.user_id = auth.uid()));
create policy "adjustments via invoice" on public.adjustments for all to authenticated using (exists (select 1 from public.invoices i where i.id = invoice_id and i.user_id = auth.uid())) with check (exists (select 1 from public.invoices i where i.id = invoice_id and i.user_id = auth.uid()));

-- public storage for PDFs
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('invoice-pdfs', 'invoice-pdfs', true, 10485760, array['application/pdf'])
on conflict (id) do nothing;

create policy "invoice-pdfs public read" on storage.objects for select using (bucket_id = 'invoice-pdfs');
create policy "invoice-pdfs owner upload" on storage.objects for insert to authenticated with check (bucket_id = 'invoice-pdfs' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "invoice-pdfs owner update" on storage.objects for update to authenticated using (bucket_id = 'invoice-pdfs' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "invoice-pdfs owner delete" on storage.objects for delete to authenticated using (bucket_id = 'invoice-pdfs' and (storage.foldername(name))[1] = auth.uid()::text);

-- anonymous read-only view for issuing link (token = capability)
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