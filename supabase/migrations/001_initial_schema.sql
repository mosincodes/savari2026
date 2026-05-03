-- Savvari initial schema — run in Supabase SQL editor or via CLI

-- Extensions
create extension if not exists "pgcrypto";

-- ─── Profiles (extends auth.users) ─────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  phone text,
  cnic_last4 text,
  photo_url text,
  rating_avg numeric(3,2) default 0,
  role text not null default 'both' check (role in ('driver', 'passenger', 'both')),
  is_admin boolean not null default false,
  emergency_contact_phone text,
  onboarding_completed boolean not null default false,
  no_show_count int not null default 0,
  reliability_flagged boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_phone_idx on public.profiles (phone);

-- ─── Phase 1 signups (no auth) ─────────────────────────────────────────────
create table public.driver_signups (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  whatsapp_phone text not null,
  cnic_last4 text not null,
  car_make_model text not null,
  car_color text not null,
  number_plate text not null,
  route_from text not null,
  route_from_other text,
  route_to text not null,
  route_to_other text,
  departure_time time not null,
  days_available text[] not null,
  available_seats int not null check (available_seats between 1 and 4),
  notes text,
  created_at timestamptz not null default now()
);

create table public.passenger_signups (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  whatsapp_phone text not null,
  cnic_last4 text not null,
  route_from text not null,
  route_from_other text,
  route_to text not null,
  route_to_other text,
  preferred_time time not null,
  days_needed text[] not null,
  seats_needed int not null check (seats_needed in (1, 2)),
  notes text,
  created_at timestamptz not null default now()
);

-- ─── Vehicles ──────────────────────────────────────────────────────────────
create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references public.profiles(id) on delete cascade,
  make_model text not null,
  color text not null,
  number_plate text not null,
  total_seats int not null default 4 check (total_seats between 1 and 8),
  created_at timestamptz not null default now()
);

create index vehicles_driver_id_idx on public.vehicles (driver_id);

-- ─── Rides ─────────────────────────────────────────────────────────────────
create table public.rides (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references public.profiles(id) on delete cascade,
  vehicle_id uuid references public.vehicles(id) on delete set null,
  from_area text not null,
  from_area_other text,
  to_area text not null,
  to_area_other text,
  departure_time time not null,
  days text[] not null,
  seats_available int not null check (seats_available >= 0),
  women_only boolean not null default false,
  meeting_point text,
  status text not null default 'active' check (status in ('active', 'full', 'cancelled', 'completed')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index rides_areas_time_idx on public.rides (from_area, to_area, departure_time);
create index rides_driver_idx on public.rides (driver_id);
create index rides_status_idx on public.rides (status);

-- ─── Bookings ────────────────────────────────────────────────────────────────
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid not null references public.rides(id) on delete cascade,
  passenger_id uuid not null references public.profiles(id) on delete cascade,
  seats_booked int not null default 1 check (seats_booked >= 1),
  status text not null default 'confirmed' check (status in ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'pending_review', 'paid', 'rejected')),
  payment_method text check (payment_method in ('jazzcash', 'easypaisa', 'bank')),
  payment_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (ride_id, passenger_id)
);

create index bookings_ride_idx on public.bookings (ride_id);
create index bookings_passenger_idx on public.bookings (passenger_id);

-- ─── Admin matches (trial + in-app) ────────────────────────────────────────
create table public.matches (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid references public.rides(id) on delete set null,
  driver_signup_id uuid references public.driver_signups(id) on delete set null,
  passenger_signup_id uuid references public.passenger_signups(id) on delete set null,
  passenger_profile_id uuid references public.profiles(id) on delete set null,
  matched_by uuid references public.profiles(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'completed', 'no_show', 'cancelled')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Ratings ───────────────────────────────────────────────────────────────
create table public.ratings (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid not null references public.rides(id) on delete cascade,
  from_user_id uuid not null references public.profiles(id) on delete cascade,
  to_user_id uuid not null references public.profiles(id) on delete cascade,
  score int not null check (score between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (ride_id, from_user_id, to_user_id)
);

-- ─── Trigger: new auth user → profile ───────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, phone, full_name)
  values (
    new.id,
    coalesce(new.phone, new.raw_user_meta_data->>'phone'),
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do update set
    phone = coalesce(excluded.phone, public.profiles.phone),
    full_name = coalesce(nullif(excluded.full_name, ''), public.profiles.full_name),
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── updated_at helper ─────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger rides_updated_at before update on public.rides
  for each row execute function public.set_updated_at();
create trigger bookings_updated_at before update on public.bookings
  for each row execute function public.set_updated_at();
create trigger matches_updated_at before update on public.matches
  for each row execute function public.set_updated_at();

-- ─── RLS ───────────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.driver_signups enable row level security;
alter table public.passenger_signups enable row level security;
alter table public.vehicles enable row level security;
alter table public.rides enable row level security;
alter table public.bookings enable row level security;
alter table public.matches enable row level security;
alter table public.ratings enable row level security;

-- Profiles
create policy "Users can read own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);
create policy "Admins read all profiles"
  on public.profiles for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

-- Signups: public insert, admin select
create policy "Anyone can insert driver signup"
  on public.driver_signups for insert with check (true);
create policy "Admins read driver signups"
  on public.driver_signups for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

create policy "Anyone can insert passenger signup"
  on public.passenger_signups for insert with check (true);
create policy "Admins read passenger signups"
  on public.passenger_signups for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

-- Vehicles
create policy "Drivers manage own vehicles"
  on public.vehicles for all using (auth.uid() = driver_id);

-- Rides
create policy "Authenticated users can read active rides"
  on public.rides for select using (
    auth.role() = 'authenticated' and (status = 'active' or driver_id = auth.uid())
  );
create policy "Drivers insert own rides"
  on public.rides for insert with check (auth.uid() = driver_id);
create policy "Drivers update own rides"
  on public.rides for update using (auth.uid() = driver_id);

-- Bookings
create policy "Passengers read own bookings"
  on public.bookings for select using (auth.uid() = passenger_id);
create policy "Drivers read bookings for their rides"
  on public.bookings for select using (
    exists (select 1 from public.rides r where r.id = ride_id and r.driver_id = auth.uid())
  );
create policy "Passengers insert bookings"
  on public.bookings for insert with check (auth.uid() = passenger_id);
create policy "Users update own booking or driver updates"
  on public.bookings for update using (
    auth.uid() = passenger_id
    or exists (select 1 from public.rides r where r.id = ride_id and r.driver_id = auth.uid())
  );

-- Matches (admin full access for authenticated admins)
create policy "Admins manage matches"
  on public.matches for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

-- Ratings
create policy "Participants read ratings for rides they joined"
  on public.ratings for select using (
    auth.uid() = from_user_id or auth.uid() = to_user_id
    or exists (
      select 1 from public.bookings b
      where b.ride_id = ratings.ride_id and b.passenger_id = auth.uid()
    )
    or exists (
      select 1 from public.rides r
      where r.id = ratings.ride_id and r.driver_id = auth.uid()
    )
  );
create policy "Users insert ratings they authored"
  on public.ratings for insert with check (auth.uid() = from_user_id);

-- ─── Storage bucket for profile photos (optional) ──────────────────────────
-- insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);
-- policies for avatars can be added in dashboard

comment on table public.driver_signups is 'Phase 1 manual trial driver intake';
comment on table public.passenger_signups is 'Phase 1 manual trial passenger intake';
