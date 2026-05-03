import type { NextRequest } from "next/server";
import { requireOnboardedSession } from "@/lib/api-middleware";
import { jsonOk, runApi } from "@/lib/api-response";
import { ForbiddenError, NotFoundError, ApiError } from "@/lib/api-error";
import { fetchBookingRaw } from "@/lib/db/queries/bookings.queries";
import { createClient } from "@/lib/supabase/server";
import { revalidateBookingsAffected } from "@/lib/services/revalidate-tags";

type RouteParams = { params: Promise<{ id: string }> };

async function assertBookingAccess(supabase: Awaited<ReturnType<typeof createClient>>, userId: string, bookingId: string) {
  const booking = await fetchBookingRaw(supabase, bookingId);
  if (!booking) throw new NotFoundError("Booking not found");
  const rideId = booking.ride_id as string;
  const { data: ride } = await supabase.from("rides").select("driver_id").eq("id", rideId).maybeSingle();

  const isPassenger = booking.passenger_id === userId;
  const isDriver = ride?.driver_id === userId;
  if (!isPassenger && !isDriver) throw new ForbiddenError();

  return { booking, rideId, isPassenger };
}

export async function GET(_request: NextRequest, context: RouteParams) {
  return runApi(async () => {
    const { id } = await context.params;
    const { user, supabase } = await requireOnboardedSession();
    const { booking } = await assertBookingAccess(supabase, user.id, id);
    return jsonOk(booking);
  });
}

/** Passenger cancels their booking (confirmed/pending flows). */
export async function PATCH(_request: NextRequest, context: RouteParams) {
  return runApi(async () => {
    const { id } = await context.params;
    const { user, supabase } = await requireOnboardedSession();
    const { booking, isPassenger } = await assertBookingAccess(supabase, user.id, id);
    if (!isPassenger) throw new ForbiddenError("Only passengers can cancel from this endpoint.");

    const rideId = booking.ride_id as string;
    const { error } = await supabase
      .from("bookings")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("passenger_id", user.id);

    if (error) throw new ApiError(error.message, "BOOKING_PATCH_FAILED", 400);

    revalidateBookingsAffected(user.id, rideId);

    return jsonOk({ status: "cancelled" });
  });
}
