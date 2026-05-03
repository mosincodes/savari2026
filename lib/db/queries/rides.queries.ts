import type { SupabaseClient } from "@supabase/supabase-js";
import { withinMinutes } from "@/lib/time";
import { clampPagination, type PaginationInput, type PaginationMeta, paginationMeta } from "@/lib/db/pagination";

export type RideListRow = {
  id: string;
  driver_id: string;
  from_area: string;
  to_area: string;
  departure_time: string;
  days: string[] | null;
  seats_available: number;
  women_only: boolean;
  meeting_point: string | null;
  status: string;
};

export type RideDetailRow = Record<string, unknown> & {
  id: string;
  driver_id: string;
  status: string;
  seats_available: number | null;
  women_only: boolean;
  from_area: string;
  to_area: string;
  departure_time: string;
  days: string[] | null;
  meeting_point: string | null;
  notes: string | null;
};

const rideListSelect =
  "id, driver_id, from_area, to_area, departure_time, days, seats_available, women_only, meeting_point, status";

export async function listActiveRidesForBrowse(
  supabase: SupabaseClient,
  options: {
    excludeDriverId?: string;
    from_area?: string;
    to_area?: string;
    around_time?: string;
    pagination?: PaginationInput;
  },
): Promise<{ rows: RideListRow[]; meta: PaginationMeta }> {
  const { page, pageSize, from, to } = clampPagination(options.pagination ?? {});
  let q = supabase
    .from("rides")
    .select(rideListSelect, { count: "exact" })
    .eq("status", "active")
    .gt("seats_available", 0)
    .order("created_at", { ascending: false });

  if (options.excludeDriverId) q = q.neq("driver_id", options.excludeDriverId);
  if (options.from_area) q = q.eq("from_area", options.from_area);
  if (options.to_area) q = q.eq("to_area", options.to_area);

  const { data, error, count } = await q.range(from, to);
  if (error) throw new Error(error.message);

  let list = (data || []) as RideListRow[];
  if (options.around_time) {
    list = list.filter((r) => {
      const t = String(r.departure_time).slice(0, 5);
      return withinMinutes(t, options.around_time!, 15);
    });
  }

  const meta = paginationMeta(page, pageSize, count, list.length);
  return { rows: list, meta };
}

export async function getRideById(supabase: SupabaseClient, rideId: string): Promise<RideDetailRow | null> {
  const { data, error } = await supabase.from("rides").select("*").eq("id", rideId).single();
  if (error) return null;
  return data as RideDetailRow;
}

export type RideDetailBundle = {
  ride: RideDetailRow;
  driver: {
    id: string;
    full_name: string | null;
    rating_avg: number | string | null;
    phone: string | null;
  } | null;
  myBooking: Record<string, unknown> | null;
  passengerIds: string[];
  passengerNames: Record<string, string>;
  myRatingToDriver: { id: string } | null;
  ratedPassengerIds: Set<string>;
};

export async function getRideDetailBundle(
  supabase: SupabaseClient,
  rideId: string,
  currentUserId: string,
): Promise<RideDetailBundle | null> {
  const ride = await getRideById(supabase, rideId);
  if (!ride) return null;

  const [
    driverRes,
    myBookingRes,
    rideBookingsRes,
    myRatingToDriverRes,
    myRatingsToPassengersRes,
  ] = await Promise.all([
    supabase.from("profiles").select("id, full_name, rating_avg, phone").eq("id", ride.driver_id).single(),
    supabase.from("bookings").select("*").eq("ride_id", rideId).eq("passenger_id", currentUserId).maybeSingle(),
    supabase.from("bookings").select("passenger_id").eq("ride_id", rideId),
    supabase
      .from("ratings")
      .select("id")
      .eq("ride_id", rideId)
      .eq("from_user_id", currentUserId)
      .eq("to_user_id", ride.driver_id as string)
      .maybeSingle(),
    supabase.from("ratings").select("to_user_id").eq("ride_id", rideId).eq("from_user_id", currentUserId),
  ]);

  const passengerIds =
    ((rideBookingsRes.data || []) as { passenger_id: string }[])
      .map((b) => b.passenger_id)
      .filter(Boolean) ?? [];

  let passengerNames: Record<string, string> = {};
  if (passengerIds.length > 0) {
    const { data: pprofiles } = await supabase.from("profiles").select("id, full_name").in("id", passengerIds);
    passengerNames = Object.fromEntries(
      (pprofiles || []).map((p) => [p.id as string, (p.full_name as string | null) || "Passenger"]),
    );
  }

  const ratedPassengerIds = new Set(
    ((myRatingsToPassengersRes.data || []) as { to_user_id: string }[]).map((r) => r.to_user_id),
  );

  return {
    ride,
    driver: (driverRes.data as RideDetailBundle["driver"]) ?? null,
    myBooking: (myBookingRes.data as Record<string, unknown> | null) ?? null,
    passengerIds,
    passengerNames,
    myRatingToDriver: myRatingToDriverRes.data as { id: string } | null,
    ratedPassengerIds,
  };
}

export async function countDriverActiveRides(
  supabase: SupabaseClient,
  driverProfileId: string,
): Promise<number | null> {
  const { count } = await supabase
    .from("rides")
    .select("*", { count: "exact", head: true })
    .eq("driver_id", driverProfileId)
    .eq("status", "active");
  return count ?? 0;
}
