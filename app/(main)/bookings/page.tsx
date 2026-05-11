import { requireOnboardedProfile } from "@/lib/require-profile";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookingPaymentForm } from "@/components/bookings/booking-payment-form";
import { listBookingsForPassenger, ridesMapForIds } from "@/lib/db/queries/bookings.queries";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Calendar, Route } from "lucide-react";

function paymentTone(status: string): "default" | "secondary" | "destructive" | "outline" {
  if (status === "paid" || status === "confirmed") return "secondary";
  if (status === "unpaid" || status === "rejected") return "destructive";
  if (status === "pending_review") return "outline";
  return "outline";
}

export default async function BookingsPage() {
  const { user, supabase } = await requireOnboardedProfile();

  const bookings = await listBookingsForPassenger(supabase, user.id);
  const rideIds = [...new Set(bookings.map((b) => b.ride_id))];
  const ridesMap = await ridesMapForIds(supabase, rideIds);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-4xl tracking-tight">Your bookings</h1>
        <p className="text-muted-foreground mt-2">
          Confirmed rides, payment status, and links back to the listing.
        </p>
      </div>

      {!bookings.length ? (
        <Card className="border-muted">
          <CardContent className="flex flex-col items-center gap-4 py-14 text-center sm:flex-row sm:justify-center sm:text-left">
            <div className="bg-accent/10 text-accent rounded-full p-4">
              <Calendar className="h-8 w-8" aria-hidden />
            </div>
            <div className="max-w-md space-y-2">
              <p className="font-heading text-lg">No trips booked yet</p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Browse open seats and confirm with the driver — your bookings will collect here automatically.
              </p>
              <Link href="/rides" className={cn(buttonVariants({ size: "lg" }), "mt-4 inline-flex rounded-full")}>
                Find a ride
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <ul role="list" className="space-y-5">
          {bookings.map((b) => {
            const ride = ridesMap[b.ride_id];
            return (
              <li key={b.id}>
                <Card className="hover-lift border-border/70 transition-colors">
                  <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 space-y-2">
                      <div className="flex items-start gap-2">
                        <div className="bg-accent/10 text-accent mt-0.5 shrink-0 rounded-lg p-2">
                          <Route className="h-4 w-4" aria-hidden />
                        </div>
                        <CardTitle className="text-xl font-semibold leading-snug">
                          {ride ? `${ride.from_area} → ${ride.to_area}` : "Ride"}
                        </CardTitle>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        Departs{" "}
                        <span className="text-foreground font-medium tabular-nums">
                          {ride ? `${String(ride.departure_time).slice(0, 5)}` : "—"}
                        </span>
                      </p>
                    </div>
                    <Badge variant={paymentTone(b.payment_status ?? "")}>{b.payment_status}</Badge>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      <p>
                        <span className="text-muted-foreground">Booking&nbsp;</span>
                        <span className="font-medium capitalize">{b.status}</span>
                      </p>
                      {ride ? (
                        <Link
                          href={`/rides/${ride.id}`}
                          className={cn(buttonVariants({ variant: "outline" }), "rounded-full")}
                        >
                          View ride listing
                        </Link>
                      ) : null}
                    </div>
                    {b.payment_status === "unpaid" || b.payment_status === "rejected" ? (
                      <BookingPaymentForm bookingId={b.id} />
                    ) : b.payment_status === "pending_review" ? (
                      <p className="text-muted-foreground text-xs italic">
                        Payment sent — awaiting admin confirmation. We&apos;ll update this row when it clears.
                      </p>
                    ) : null}
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
