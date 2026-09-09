-- pagination: agregat ringkasan di DB agar filter status terhitung tetap akurat
--
-- Latar: status Draf/Terbit/Lewat/Lunas adalah status TERHITUNG
-- (draf / sisa<=0 lunas / jatuh tempo lewat / sisanya terbit). Menghitungnya
-- di JS menuntut fetch seluruh tabel anak tanpa batas. RPC ini memindahkan
-- agregat + filter + paginasi ke SQL dalam 1 roundtrip per kebutuhan.

-- 1. indeks untuk ORDER + filter per pengguna
create index if not exists invoices_user_created_idx
  on public.invoices (user_id, created_at desc);

create index if not exists invoices_user_status_created_idx
  on public.invoices (user_id, status, created_at desc);

-- 2. halaman ringkasan + total hitungan filter aktif
create or replace function public.invoice_summaries(
  p_status text default 'all',
  p_limit int default 20,
  p_offset int default 0
)
returns table(
  id uuid,
  number text,
  client_name text,
  issue_date date,
  due_date date,
  tax_rate_bps int,
  subtotal_sen bigint,
  tax_sen bigint,
  adjustment_sen bigint,
  paid_sen bigint,
  balance_sen bigint,
  has_adjustment boolean,
  effective_status text,
  total_count bigint
)
language sql
security definer
set search_path = public
stable
as $$
  with base as (
    select
      i.id,
      i.number,
      i.client_name,
      i.issue_date,
      i.due_date,
      i.tax_rate_bps,
      i.status,
      i.created_at,
      coalesce((select sum(li.subtotal_sen) from public.line_items li where li.invoice_id = i.id), 0)::bigint as subtotal_sen,
      coalesce((select sum(a.amount_sen) from public.adjustments a where a.invoice_id = i.id), 0)::bigint as adjustment_sen,
      coalesce((select sum(p.amount_sen) from public.payments p where p.invoice_id = i.id), 0)::bigint as paid_sen
    from public.invoices i
    where i.user_id = auth.uid()
  ),
  computed as (
    select
      b.*,
      (round(b.subtotal_sen * b.tax_rate_bps / 10000.0))::bigint as tax_sen,
      case
        when b.status = 'draft' then 'draft'
        when b.subtotal_sen
           + (round(b.subtotal_sen * b.tax_rate_bps / 10000.0))::bigint
           + b.adjustment_sen - b.paid_sen <= 0 then 'paid'
        when b.due_date < current_date then 'overdue'
        else 'issued'
      end as effective_status
    from base b
  ),
  filtered as (
    select * from computed c
    where p_status = 'all' or c.effective_status = p_status
  )
  select
    f.id,
    f.number,
    f.client_name,
    f.issue_date,
    f.due_date,
    f.tax_rate_bps,
    f.subtotal_sen,
    f.tax_sen,
    f.adjustment_sen,
    f.paid_sen,
    f.subtotal_sen + f.tax_sen + f.adjustment_sen - f.paid_sen as balance_sen,
    f.adjustment_sen <> 0 as has_adjustment,
    f.effective_status,
    count(*) over () as total_count
  from filtered f
  order by f.created_at desc
  limit greatest(p_limit, 1)
  offset greatest(p_offset, 0);
$$;

revoke execute on function public.invoice_summaries(text, int, int) from public;
grant execute on function public.invoice_summaries(text, int, int) to authenticated;

-- 3. hitungan per tab filter (satu roundtrip murah)
create or replace function public.invoice_status_counts()
returns table(status text, count bigint)
language sql
security definer
set search_path = public
stable
as $$
  with base as (
    select
      i.id,
      i.status,
      i.due_date,
      coalesce((select sum(li.subtotal_sen) from public.line_items li where li.invoice_id = i.id), 0)::bigint as subtotal_sen,
      i.tax_rate_bps,
      coalesce((select sum(a.amount_sen) from public.adjustments a where a.invoice_id = i.id), 0)::bigint as adjustment_sen,
      coalesce((select sum(p.amount_sen) from public.payments p where p.invoice_id = i.id), 0)::bigint as paid_sen
    from public.invoices i
    where i.user_id = auth.uid()
  ),
  computed as (
    select
      case
        when b.status = 'draft' then 'draft'
        when b.subtotal_sen
           + (round(b.subtotal_sen * b.tax_rate_bps / 10000.0))::bigint
           + b.adjustment_sen - b.paid_sen <= 0 then 'paid'
        when b.due_date < current_date then 'overdue'
        else 'issued'
      end as effective_status
    from base b
  )
  select c.effective_status as status, count(*) as count
  from computed c
  group by c.effective_status;
$$;

revoke execute on function public.invoice_status_counts() from public;
grant execute on function public.invoice_status_counts() to authenticated;
