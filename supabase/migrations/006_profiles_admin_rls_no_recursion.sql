-- Admin checks that subquery profiles under RLS cause "infinite recursion detected in policy"
-- (PostgreSQL evaluates all permissive SELECT policies; "Admins read all profiles" re-reads profiles).

create or replace function public.current_user_profile_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select p.is_admin from public.profiles p where p.id = auth.uid()),
    false
  );
$$;

comment on function public.current_user_profile_is_admin() is
  'Bypasses profiles RLS; use in policies instead of EXISTS (select ... profiles ...).';

revoke all on function public.current_user_profile_is_admin() from public;
grant execute on function public.current_user_profile_is_admin() to authenticated;
grant execute on function public.current_user_profile_is_admin() to service_role;

-- profiles
drop policy if exists "Admins read all profiles" on public.profiles;
create policy "Admins read all profiles"
  on public.profiles for select
  using (public.current_user_profile_is_admin());

-- signups & matches (same anti-pattern as 001)
drop policy if exists "Admins read driver signups" on public.driver_signups;
create policy "Admins read driver signups"
  on public.driver_signups for select
  using (public.current_user_profile_is_admin());

drop policy if exists "Admins read passenger signups" on public.passenger_signups;
create policy "Admins read passenger signups"
  on public.passenger_signups for select
  using (public.current_user_profile_is_admin());

drop policy if exists "Admins manage matches" on public.matches;
create policy "Admins manage matches"
  on public.matches for all
  using (public.current_user_profile_is_admin());

-- 003_admin_booking_policy
drop policy if exists "Admins update any booking" on public.bookings;
create policy "Admins update any booking"
  on public.bookings for update
  using (public.current_user_profile_is_admin());
