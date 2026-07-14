-- Signup email fields (code already sends email) + let passengers browse driver signups.

alter table public.driver_signups add column if not exists email text;
alter table public.passenger_signups add column if not exists email text;

-- Authenticated users can browse open driver signups (in addition to admin read policy).
drop policy if exists "Authenticated browse driver signups" on public.driver_signups;
create policy "Authenticated browse driver signups"
  on public.driver_signups for select
  using (auth.role() = 'authenticated');
