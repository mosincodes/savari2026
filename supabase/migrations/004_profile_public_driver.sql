-- Let authenticated users see basic profile of drivers with at least one active ride

create policy "Read active ride driver profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.rides r
      where r.driver_id = profiles.id
        and r.status = 'active'
    )
  );
