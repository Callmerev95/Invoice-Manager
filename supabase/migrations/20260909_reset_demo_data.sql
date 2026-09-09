-- reset data demo: wipe milik akun demo walau ada invoice terbit
--
-- Latar: trigger trg_issued_immutable (ADR-0001) menolak DELETE invoice
-- terbit — benar untuk audit, tapi membuat tombol "isi ulang data demo"
-- gagal. Fungsi definer ini melepas trigger di dalam transaksi, menghapus
-- HANYA data milik pemanggil, lalu memasang trigger lagi (bahkan saat error).
-- Dijaga ganda: hanya callable oleh authenticated DAN email pemanggil harus
-- akun demo. Jangan pernah izinkan anon; jangan pernah longgarkan cek email.

create or replace function public.reset_demo_data()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_email text;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  select email into v_email from auth.users where id = v_uid;
  if v_email is distinct from 'demo@test.com' then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  begin
    alter table public.invoices disable trigger trg_issued_immutable;

    delete from public.line_items
    where invoice_id in (select id from public.invoices where user_id = v_uid);
    delete from public.payments
    where invoice_id in (select id from public.invoices where user_id = v_uid);
    delete from public.adjustments
    where invoice_id in (select id from public.invoices where user_id = v_uid);
    delete from public.invoices where user_id = v_uid;
    delete from public.invoice_series where user_id = v_uid;
    delete from public.templates where user_id = v_uid;

    alter table public.invoices enable trigger trg_issued_immutable;
  exception when others then
    alter table public.invoices enable trigger trg_issued_immutable;
    raise;
  end;
end $$;

revoke execute on function public.reset_demo_data() from public;
grant execute on function public.reset_demo_data() to authenticated;
