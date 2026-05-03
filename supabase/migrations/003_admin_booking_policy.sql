-- Allow admins to update bookings (payment confirmation)

create policy "Admins update any booking"
  on public.bookings for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );
