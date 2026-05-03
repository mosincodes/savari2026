import type { SupabaseClient } from "@supabase/supabase-js";

export type BookingRow = {
  id: string;
  status: string;
  payment_status: string;
  payment_method: string | null;
  payment_ref: string | null;
  seats_booked: number;
  ride_id: string;
  created_at: string;
};

export type RideSummary = {
  id: string;
  from_area: string;
  to_area: string;
  departure_time: string;
  status: string;
};

export async function listBookingsForPassenger(supabase: SupabaseClient, passengerId: string): Promise<BookingRow[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select("id, status, payment_status, payment_method, payment_ref, seats_booked, ride_id, created_at")
    .eq("passenger_id", passengerId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data || []) as BookingRow[];
}

export async function ridesMapForIds(
  supabase: SupabaseClient,
  rideIds: string[],
): Promise<Record<string, RideSummary>> {
  if (rideIds.length === 0) return {};
  const { data, error } = await supabase
    .from("rides")
    .select("id, from_area, to_area, departure_time, status")
    .in("id", rideIds);

  if (error) throw new Error(error.message);
  return Object.fromEntries((data || []).map((r) => [r.id as string, r as RideSummary]));
}

/** Booking row accessible to passenger or ride driver (caller must authorize). */
export async function fetchBookingRaw(supabase: SupabaseClient, bookingId: string) {
  const { data, error } = await supabase.from("bookings").select("*").eq("id", bookingId).maybeSingle();
  if (error) throw new Error(error.message);
  return data as Record<string, unknown> | null;
}

export async function countBookingsForPassenger(supabase: SupabaseClient, passengerId: string): Promise<number | null> {
  const { count } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("passenger_id", passengerId);
  return count ?? 0;
}
