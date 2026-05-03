import type { BookingState } from "@/lib/types/form-states";
import type { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { bookingPaymentSchema, ratingSchema } from "@/lib/validations";
import { isPrivilegedAdmin } from "@/lib/auth/admin-policy";
import { insertRating } from "@/lib/db/queries/ratings.queries";
import {
  revalidateAdminSurfaces,
  revalidateBookingsAffected,
  revalidateProfileAffected,
} from "@/lib/services/revalidate-tags";
import { revalidatePath } from "next/cache";

export async function bookRideForPassenger(
  passengerId: string,
  rideId: string,
  seats: number = 1,
): Promise<BookingState> {
  const supabase = await createClient();

  const { error } = await supabase.rpc("book_ride", {
    p_ride_id: rideId,
    p_passenger_id: passengerId,
    p_seats: seats,
  });

  if (error) {
    console.error(error);
    return { ok: false, message: error.message };
  }

  revalidateBookingsAffected(passengerId, rideId);
  revalidatePath("/rides");
  return { ok: true };
}

export async function submitBookingPaymentForPassenger(
  passengerId: string,
  input: z.infer<typeof bookingPaymentSchema>,
): Promise<BookingState> {
  const supabase = await createClient();

  const { booking_id, payment_method, payment_ref } = input;

  const { error } = await supabase
    .from("bookings")
    .update({
      payment_method,
      payment_ref,
      payment_status: "pending_review",
      updated_at: new Date().toISOString(),
    })
    .eq("id", booking_id)
    .eq("passenger_id", passengerId);

  if (error) {
    console.error(error);
    return { ok: false, message: error.message };
  }

  revalidateBookingsAffected(passengerId);
  revalidateAdminSurfaces();
  return { ok: true };
}

export async function submitBookingPaymentFromForm(
  passengerId: string,
  formData: FormData,
): Promise<BookingState> {
  const parsed = bookingPaymentSchema.safeParse({
    booking_id: formData.get("booking_id"),
    payment_method: formData.get("payment_method"),
    payment_ref: formData.get("payment_ref"),
  });
  if (!parsed.success) {
    return { ok: false, message: "Invalid payment details" };
  }

  return submitBookingPaymentForPassenger(passengerId, parsed.data);
}

export async function submitRatingFromInput(
  actorId: string,
  input: z.infer<typeof ratingSchema>,
): Promise<BookingState> {
  const supabase = await createClient();

  const { ride_id, to_user_id, score, comment } = input;

  const { error } = await insertRating(supabase, {
    ride_id,
    from_user_id: actorId,
    to_user_id,
    score,
    comment: comment || null,
  });

  if (error) {
    console.error(error);
    return { ok: false, message: error.message };
  }

  revalidateProfileAffected(to_user_id);
  revalidatePath(`/rides/${ride_id}`);
  revalidateBookingsAffected(actorId, ride_id);
  return { ok: true };
}

export async function submitRatingFromForm(actorId: string, formData: FormData): Promise<BookingState> {
  const parsed = ratingSchema.safeParse({
    ride_id: formData.get("ride_id"),
    to_user_id: formData.get("to_user_id"),
    score: formData.get("score"),
    comment: formData.get("comment") || "",
  });
  if (!parsed.success) {
    return { ok: false, message: "Invalid rating" };
  }

  return submitRatingFromInput(actorId, parsed.data);
}

export async function confirmBookingPaymentAdmin(bookingId: string, adminUserId: string): Promise<BookingState> {
  if (!(await isPrivilegedAdmin(adminUserId))) {
    return { ok: false, message: "Forbidden" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("bookings")
    .update({ payment_status: "paid", updated_at: new Date().toISOString() })
    .eq("id", bookingId);

  if (error) return { ok: false, message: error.message };
  revalidateAdminSurfaces();
  revalidatePath("/bookings");
  return { ok: true };
}
