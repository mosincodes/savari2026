/** Next.js cache tags for `unstable_cache` + `revalidateTag`. */
export const CACHE_TAGS = {
  rides: "rides",
  ride: (id: string) => `ride:${id}`,
  userBookings: (userId: string) => `bookings:user:${userId}`,
  profile: (userId: string) => `profile:${userId}`,
  profileRatings: (userId: string) => `profile:ratings:${userId}`,
  adminDashboard: "admin:dashboard",
  adminMatches: "admin:matches",
  adminPayments: "admin:payments",
} as const;
