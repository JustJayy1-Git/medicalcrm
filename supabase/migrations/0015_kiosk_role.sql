-- Kiosk / iPad intake tablet role
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('admin', 'manager', 'staff', 'billing', 'readonly', 'kiosk'));

-- After creating auth user intake-tablet@yourpractice.com, run:
--   insert into public.profiles (id, email, full_name, role, is_active)
--   values ('<auth-user-uuid>', 'intake-tablet@yourpractice.com', 'Office iPad', 'kiosk', true)
--   on conflict (id) do update set role = 'kiosk', is_active = true;
