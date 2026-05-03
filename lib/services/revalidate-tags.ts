import { revalidatePath, revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";

export function revalidateRidesAffected(userId?: string, rideId?: string) {
  revalidateTag(CACHE_TAGS.rides);
  if (rideId) revalidateTag(CACHE_TAGS.ride(rideId));
  if (userId) revalidateTag(CACHE_TAGS.userBookings(userId));
  revalidatePath("/rides");
  if (rideId) revalidatePath(`/rides/${rideId}`);
}

export function revalidateBookingsAffected(passengerId: string, rideId?: string) {
  revalidateTag(CACHE_TAGS.userBookings(passengerId));
  if (rideId) {
    revalidateTag(CACHE_TAGS.ride(rideId));
    revalidatePath(`/rides/${rideId}`);
  }
  revalidatePath("/bookings");
}

export function revalidateProfileAffected(userId: string) {
  revalidateTag(CACHE_TAGS.profile(userId));
  revalidateTag(CACHE_TAGS.profileRatings(userId));
  revalidatePath("/profile");
}

export function revalidateAdminSurfaces() {
  revalidateTag(CACHE_TAGS.adminDashboard);
  revalidateTag(CACHE_TAGS.adminMatches);
  revalidateTag(CACHE_TAGS.adminPayments);
  revalidatePath("/admin");
  revalidatePath("/admin/matches");
  revalidatePath("/admin/payments");
}
