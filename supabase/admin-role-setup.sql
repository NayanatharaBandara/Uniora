-- Run in Supabase SQL Editor after creating the intended admin user through UNIORA registration.
alter table public.profiles
  add column if not exists role text not null default 'student';

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('student', 'seller', 'admin'));

-- Replace the email below with the admin account's email address.
-- This promotes the matching existing profile using the auth user ID.
update public.profiles p
set role = 'admin'
from auth.users u
where p.id = u.id
  and lower(u.email) = lower('YOUR_ADMIN_EMAIL@example.com');

-- Never allow normal users to update their own role from the client.
-- Keep role changes restricted to this trusted SQL process or a secure server-side admin process.
