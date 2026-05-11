import { notFound } from "next/navigation";
import Link from "next/link";
import { requireOnboardedProfile } from "@/lib/require-profile";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookRideButton } from "@/components/rides/book-ride-button";
import { SosButton } from "@/components/rides/sos-button";
import { CompleteRideButton } from "@/components/rides/complete-ride-button";
import { RatingForm } from "@/components/rides/rating-form";
import { getRideDetailBundle } from "@/lib/db/queries/rides.queries";

export default async function RideDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, supabase, profile } = await requireOnboardedProfile();

  const bundle = await getRideDetailBundle(supabase, id, user.id);
  if (!bundle) notFound();

  const { ride, driver, myBooking, passengerIds, passengerNames, myRatingToDriver, ratedPassengerIds } = bundle;

  const isDriver = ride.driver_id === user.id;
  const canBook =
    !isDriver &&
    ride.status === "active" &&
    (ride.seats_available ?? 0) > 0 &&
    !myBooking;

  const showSos =
    !!profile.emergency_contact_phone && (isDriver || !!myBooking) && ride.status !== "cancelled";

  const completed = ride.status === "completed";

  const showPhone = (myBooking as { status?: string } | null)?.status === "confirmed" || isDriver;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl tracking-tight">
            {ride.from_area} → {ride.to_area}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Departs {String(ride.departure_time).slice(0, 5)}
            {ride.return_time
              ? ` · Returns ${String(ride.return_time).slice(0, 5)}`
              : ""}
            {" · "}
            {ride.days?.join(", ")}
          </p>
          {ride.meeting_point ? (
            <p className="mt-2 text-sm">
              <span className="font-medium">Meet:</span> {ride.meeting_point}
            </p>
          ) : null}
          {ride.notes ? <p className="text-muted-foreground mt-2 text-sm">{ride.notes}</p> : null}
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="outline">{ride.status}</Badge>
            {ride.women_only ? <Badge variant="secondary">Women only</Badge> : null}
            <Badge variant="secondary">{ride.seats_available} seats left</Badge>
          </div>
        </div>
        <Link
          href="/rides"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "inline-flex shrink-0 rounded-full"
          )}
        >
          Back
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Driver</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p className="font-medium">{driver?.full_name || "Verified driver"}</p>
          {driver?.rating_avg != null && Number(driver.rating_avg) > 0 ? (
            <p className="text-muted-foreground">Rating: {Number(driver.rating_avg).toFixed(1)}</p>
          ) : (
            <p className="text-muted-foreground">New on Savvari</p>
          )}
          {showPhone ? (
            <p className="pt-2">
              <span className="font-medium">Phone:</span>{" "}
              <a className="text-accent underline" href={`tel:${driver?.phone || ""}`}>
                {driver?.phone || "—"}
              </a>
            </p>
          ) : (
            <p className="text-muted-foreground pt-2 text-xs">Phone visible after you book.</p>
          )}
        </CardContent>
      </Card>

      {isDriver && ride.status === "active" ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Driver controls</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <CompleteRideButton rideId={ride.id} />
          </CardContent>
        </Card>
      ) : null}

      {!isDriver && canBook ? (
        <Card>
          <CardContent className="pt-6">
            <BookRideButton rideId={ride.id} />
          </CardContent>
        </Card>
      ) : null}

      {myBooking ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your booking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              Status:{" "}
              <span className="font-medium">{(myBooking as { status?: string }).status}</span>
            </p>
            <p>
              Payment:{" "}
              <span className="font-medium">{(myBooking as { payment_status?: string }).payment_status}</span>
            </p>
            {(myBooking as { payment_status?: string }).payment_status === "unpaid" ||
            (myBooking as { payment_status?: string }).payment_status === "rejected" ? (
              <div className="pt-2">
                <Link
                  href="/bookings"
                  className={cn(
                    buttonVariants({ variant: "secondary", size: "sm" }),
                    "inline-flex rounded-full"
                  )}
                >
                  Pay for this booking
                </Link>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {showSos ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Safety</CardTitle>
          </CardHeader>
          <CardContent>
            <SosButton rideId={ride.id} />
            <p className="text-muted-foreground mt-2 text-xs">
              Sends an SMS to your saved emergency contact with ride details.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {completed ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ratings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isDriver && !myRatingToDriver ? (
              <RatingForm rideId={ride.id} toUserId={ride.driver_id as string} label="your driver" />
            ) : null}
            {isDriver
              ? passengerIds.map((pid) =>
                  ratedPassengerIds.has(pid) ? (
                    <p key={pid} className="text-muted-foreground text-sm">
                      You rated {passengerNames[pid] || "passenger"}.
                    </p>
                  ) : (
                    <RatingForm
                      key={pid}
                      rideId={ride.id}
                      toUserId={pid}
                      label={passengerNames[pid] || "passenger"}
                    />
                  )
                )
              : null}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
