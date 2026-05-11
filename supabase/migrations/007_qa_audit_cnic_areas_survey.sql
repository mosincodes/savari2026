-- QA audit: full CNIC storage, ride return legs, signup return time, profile gender,
-- commuter survey persistence, widen CNIC columns (rename semantics).

alter table public.profiles rename column cnic_last4 to cnic;

alter table public.driver_signups rename column cnic_last4 to cnic;
alter table public.driver_signups add column if not exists return_time time;

alter table public.passenger_signups rename column cnic_last4 to cnic;

alter table public.rides add column if not exists return_time time;

alter table public.profiles add column if not exists gender text
  check (gender is null or gender in ('male', 'female', 'prefer_not_say'));

create table if not exists public.survey_responses (
  id uuid primary key default gen_random_uuid(),
  contact text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists survey_responses_created_idx on public.survey_responses (created_at desc);

alter table public.survey_responses enable row level security;

drop policy if exists "Allow anonymous survey inserts" on public.survey_responses;
create policy "Allow anonymous survey inserts"
  on public.survey_responses for insert to anon with check (char_length(contact) <= 200);

grant insert on public.survey_responses to anon;
grant insert on public.survey_responses to authenticated;
