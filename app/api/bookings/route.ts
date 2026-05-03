import type { NextRequest } from "next/server";
import {
  bookRideBodySchema,
} from "@/lib/validations";
import { requireOnboardedSession, readJsonBody } from "@/lib/api-middleware";
import { jsonCreated, jsonOk, runApi, zodErrorToValidation } from "@/lib/api-response";
import { ApiError } from "@/lib/api-error";
import {
  listBookingsForPassenger,
  ridesMapForIds,
} from "@/lib/db/queries/bookings.queries";
import { bookRideForPassenger } from "@/lib/services/bookings-service";

export async function GET() {
  return runApi(async () => {
    const { user, supabase } = await requireOnboardedSession();
    const bookings = await listBookingsForPassenger(supabase, user.id);
    const rideIds = [...new Set(bookings.map((b) => b.ride_id))];
    const ridesMap = await ridesMapForIds(supabase, rideIds);
    return jsonOk({ bookings, rides: ridesMap });
  });
}

export async function POST(request: NextRequest) {
  return runApi(async () => {
    const { user } = await requireOnboardedSession();
    const raw = await readJsonBody(request);
    const parsed = bookRideBodySchema.safeParse(raw);
    if (!parsed.success) throw zodErrorToValidation(parsed.error);

    const { ride_id, seats } = parsed.data;
    const res = await bookRideForPassenger(user.id, ride_id, seats);
    if (!res.ok) {
      throw new ApiError(res.message ?? "Booking failed", "BOOK_RIDE_FAILED", 400);
    }
    return jsonCreated<{ booked: true }>({ booked: true });
  });
}
