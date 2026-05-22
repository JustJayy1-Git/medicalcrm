-- Fix profiles RLS so users (including kiosk) can read their own row.
-- The old policy subquery on public.profiles caused recursion / empty reads.

drop policy if exists profiles_self_read on public.profiles;
drop policy if exists profiles_admin_manager_read on public.profiles;

create policy profiles_self_read on public.profiles
  for select to authenticated
  using (auth.uid() = id);

create or replace function public.is_admin_or_manager()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'manager')
  );
$$;

create policy profiles_admin_manager_read on public.profiles
  for select to authenticated
  using (public.is_admin_or_manager());

-- Admins still manage all profiles (unchanged intent, security definer avoids recursion)
drop policy if exists profiles_admin_all on public.profiles;
create policy profiles_admin_all on public.profiles
  for all to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );
