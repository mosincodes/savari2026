import type { SupabaseClient } from "@supabase/supabase-js";
import { canonicalArea, displayArea, COMMUTE_TIME_WINDOW_MIN } from "@/lib/area-match";
import { withinMinutes } from "@/lib/time";
import { clampPagination, type PaginationInput, type PaginationMeta, paginationMeta } from "@/lib/db/pagination";

export type RideListRow = {
  id: string;
  driver_id: string;
  from_area: string;
  to_area: string;
  departure_time: string;
  return_time: string | null;
  days: string[] | null;
  seats_available: number;
  women_only: boolean;
  meeting_point: string | null;
  status: string;
};

export type BrowseListing = RideListRow & {
  listingKind: "ride" | "signup";
  driverName?: string | null;
  contactPhone?: string | null;
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
  "id, driver_id, from_area, to_area, departure_time, return_time, days, seats_available, women_only, meeting_point, status";

const signupListSelect =
  "id, full_name, whatsapp_phone, route_from, route_from_other, route_to, route_to_other, departure_time, return_time, days_available, available_seats, created_at";

function matchesTimeFilter(
  departure: string,
  returnTime: string | null,
  around: string,
  windowMin: number,
): boolean {
  const depart = String(departure).slice(0, 5);
  const ret = returnTime ? String(returnTime).slice(0, 5) : null;
  return (
    withinMinutes(depart, around, windowMin) || (ret !== null && withinMinutes(ret, around, windowMin))
  );
}

function signupToListing(row: Record<string, unknown>): BrowseListing {
  const from = displayArea(String(row.route_from), row.route_from_other as string | null);
  const to = displayArea(String(row.route_to), row.route_to_other as string | null);
  return {
    id: String(row.id),
    driver_id: "",
    from_area: from,
    to_area: to,
    departure_time: String(row.departure_time),
    return_time: row.return_time ? String(row.return_time) : null,
    days: (row.days_available as string[]) ?? null,
    seats_available: Number(row.available_seats),
    women_only: false,
    meeting_point: null,
    status: "active",
    listingKind: "signup",
    driverName: String(row.full_name),
    contactPhone: String(row.whatsapp_phone),
  };
}

async function listDriverSignupsForBrowse(
  supabase: SupabaseClient,
  options: {
    from_area?: string;
    to_area?: string;
    around_time?: string;
  },
): Promise<BrowseListing[]> {
  let q = supabase
    .from("driver_signups")
    .select(signupListSelect)
    .order("created_at", { ascending: false })
    .limit(200);

  const from = canonicalArea(options.from_area);
  const to = canonicalArea(options.to_area);
  if (from && from !== "Other") q = q.eq("route_from", from);
  if (to && to !== "Other") q = q.eq("route_to", to);

  const { data, error } = await q;
  if (error) {
    console.error("driver_signups browse:", error.message);
    return [];
  }

  let list = (data || []).map((r) => signupToListing(r as Record<string, unknown>));

  if (options.around_time) {
    const around = options.around_time.slice(0, 5);
    list = list.filter((r) =>
      matchesTimeFilter(r.departure_time, r.return_time, around, COMMUTE_TIME_WINDOW_MIN),
    );
  }

  return list;
}

export async function listActiveRidesForBrowse(
  supabase: SupabaseClient,
  options: {
    excludeDriverId?: string;
    from_area?: string;
    to_area?: string;
    around_time?: string;
    pagination?: PaginationInput;
    includeSignups?: boolean;
  },
): Promise<{ rows: BrowseListing[]; meta: PaginationMeta }> {
  const from = canonicalArea(options.from_area);
  const to = canonicalArea(options.to_area);

  const paginationInput =
    options.around_time && !options.pagination ? { page: 1, pageSize: 200 } : options.pagination ?? {};
  const { page, pageSize, from: rangeFrom, to: rangeTo } = clampPagination(paginationInput);

  let q = supabase
    .from("rides")
    .select(rideListSelect, { count: "exact" })
    .eq("status", "active")
    .gt("seats_available", 0)
    .order("created_at", { ascending: false });

  if (options.excludeDriverId) q = q.neq("driver_id", options.excludeDriverId);
  if (from && from !== "Other") q = q.eq("from_area", from);
  if (to && to !== "Other") q = q.eq("to_area", to);

  const { data, error, count } = await q.range(rangeFrom, rangeTo);
  if (error) throw new Error(error.message);

  let rideList = ((data || []) as RideListRow[]).map((r) => ({
    ...r,
    listingKind: "ride" as const,
  }));

  if (options.around_time) {
    const around = options.around_time.slice(0, 5);
    rideList = rideList.filter((r) =>
      matchesTimeFilter(r.departure_time, r.return_time, around, COMMUTE_TIME_WINDOW_MIN),
    );
  }

  let combined: BrowseListing[] = rideList;

  if (options.includeSignups !== false) {
    const signups = await listDriverSignupsForBrowse(supabase, {
      from_area: options.from_area,
      to_area: options.to_area,
      around_time: options.around_time,
    });
    const rideKeys = new Set(rideList.map((r) => `${r.from_area}|${r.to_area}|${r.departure_time.slice(0, 5)}`));
    const dedupedSignups = signups.filter(
      (s) => !rideKeys.has(`${s.from_area}|${s.to_area}|${s.departure_time.slice(0, 5)}`),
    );
    combined = [...rideList, ...dedupedSignups];
  }

  const meta = paginationMeta(page, pageSize, count, combined.length);
  return { rows: combined, meta };
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
