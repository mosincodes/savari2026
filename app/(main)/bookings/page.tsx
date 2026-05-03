import { requireOnboardedProfile } from "@/lib/require-profile";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookingPaymentForm } from "@/components/bookings/booking-payment-form";
import { listBookingsForPassenger, ridesMapForIds } from "@/lib/db/queries/bookings.queries";

export default async function BookingsPage() {
  const { user, supabase } = await requireOnboardedProfile();

  const bookings = await listBookingsForPassenger(supabase, user.id);
  const rideIds = [...new Set(bookings.map((b) => b.ride_id))];
  const ridesMap = await ridesMapForIds(supabase, rideIds);

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl tracking-tight">My bookings</h1>
      {!bookings.length ? (
        <p className="text-muted-foreground text-sm">
          No bookings yet.{" "}
          <Link href="/rides" className="text-foreground underline">
            Find a ride
          </Link>
        </p>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => {
            const ride = ridesMap[b.ride_id];
            return (
              <Card key={b.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">
                      {ride ? `${ride.from_area} → ${ride.to_area}` : "Ride"}
                    </CardTitle>
                    <p className="text-muted-foreground text-xs">
                      {ride ? `Departs ${String(ride.departure_time).slice(0, 5)}` : ""}
                    </p>
                  </div>
                  <Badge variant="outline">{b.payment_status}</Badge>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p>
                    Booking status: <span className="font-medium">{b.status}</span>
                  </p>
                  {ride ? (
                    <Link
                      href={`/rides/${ride.id}`}
                      className="inline-flex rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
                    >
                      Ride details
                    </Link>
                  ) : null}
                  {b.payment_status === "unpaid" || b.payment_status === "rejected" ? (
                    <BookingPaymentForm bookingId={b.id} />
                  ) : b.payment_status === "pending_review" ? (
                    <p className="text-muted-foreground text-xs">Payment pending admin confirmation.</p>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
