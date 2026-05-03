-- Atomic booking: insert booking + decrement seats (SECURITY DEFINER)

create or replace function public.book_ride(
  p_ride_id uuid,
  p_passenger_id uuid,
  p_seats int default 1
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_available int;
  v_driver uuid;
  new_id uuid;
begin
  if p_passenger_id is distinct from auth.uid() then
    raise exception 'not authorized';
  end if;

  select seats_available, driver_id into v_available, v_driver
  from public.rides
  where id = p_ride_id
  for update;

  if v_available is null then
    raise exception 'ride not found';
  end if;

  if v_driver = p_passenger_id then
    raise exception 'cannot book own ride';
  end if;

  if v_available < p_seats then
    raise exception 'not enough seats';
  end if;

  insert into public.bookings (ride_id, passenger_id, seats_booked, status)
  values (p_ride_id, p_passenger_id, p_seats, 'confirmed')
  on conflict (ride_id, passenger_id) do nothing
  returning id into new_id;

  if new_id is null then
    select id into new_id from public.bookings
    where ride_id = p_ride_id and passenger_id = p_passenger_id;
    return new_id;
  end if;

  update public.rides
  set
    seats_available = v_available - p_seats,
    status = case
      when v_available - p_seats <= 0 then 'full'::text
      else status
    end,
    updated_at = now()
  where id = p_ride_id;

  return new_id;
end;
$$;

grant execute on function public.book_ride(uuid, uuid, int) to authenticated;

-- Allow users to insert their own profile row (backup if trigger fails)
create policy "Users insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);
