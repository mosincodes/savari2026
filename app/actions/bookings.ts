"use server";

import { createClient } from "@/lib/supabase/server";
import type { BookingState } from "@/lib/types/form-states";
import {
  bookRideForPassenger,
  confirmBookingPaymentAdmin,
  submitBookingPaymentFromForm,
  submitRatingFromForm,
} from "@/lib/services/bookings-service";

export type { BookingState } from "@/lib/types/form-states";

export async function bookRide(rideId: string, seats: number = 1): Promise<BookingState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Not logged in" };
  return bookRideForPassenger(user.id, rideId, seats);
}

export async function submitBookingPayment(
  _prev: BookingState | undefined,
  formData: FormData,
): Promise<BookingState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Not logged in" };
  return submitBookingPaymentFromForm(user.id, formData);
}

export async function submitRating(
  _prev: BookingState | undefined,
  formData: FormData,
): Promise<BookingState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Not logged in" };
  return submitRatingFromForm(user.id, formData);
}

export async function confirmPaymentFromForm(formData: FormData): Promise<void> {
  const bookingId = formData.get("booking_id") as string;
  if (!bookingId) return;
  await confirmPaymentAdmin(bookingId);
}

export async function confirmPaymentAdmin(bookingId: string): Promise<BookingState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Not logged in" };
  return confirmBookingPaymentAdmin(bookingId, user.id);
}
