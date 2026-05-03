import Link from "next/link";
import { requireOnboardedProfile } from "@/lib/require-profile";
import { adminUserIdsFromEnv } from "@/lib/auth/admin-policy";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { countBookingsForPassenger } from "@/lib/db/queries/bookings.queries";
import { countDriverActiveRides } from "@/lib/db/queries/rides.queries";

export default async function DashboardPage() {
  const { profile, supabase, user } = await requireOnboardedProfile();

  const admins = adminUserIdsFromEnv();
  const isAdmin = profile.is_admin || admins.has(user.id);

  const [rideCount, bookingCount] = await Promise.all([
    countDriverActiveRides(supabase, profile.id),
    countBookingsForPassenger(supabase, profile.id),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl tracking-tight">
          Hello{profile.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Role: <span className="text-foreground font-medium capitalize">{profile.role}</span>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your rides</CardTitle>
            <CardDescription>{rideCount ?? 0} active listings</CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/rides/new"
              className={cn(buttonVariants({ variant: "secondary" }), "inline-flex rounded-full")}
            >
              Post a ride
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Bookings</CardTitle>
            <CardDescription>{bookingCount ?? 0} total</CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/bookings"
              className={cn(buttonVariants({ variant: "secondary" }), "inline-flex rounded-full")}
            >
              View bookings
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Find a seat</CardTitle>
          <CardDescription>Search by route and time (±15 minutes).</CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/rides"
            className={cn(
              buttonVariants({ variant: "default" }),
              "rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
            )}
          >
            Browse rides
          </Link>
        </CardContent>
      </Card>

      {isAdmin ? (
        <Card className="border-accent/30">
          <CardHeader>
            <CardTitle className="text-lg">Admin</CardTitle>
            <CardDescription>Signups, matches, and payment confirmations.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/admin"
              className={cn(buttonVariants({ variant: "outline" }), "inline-flex rounded-full")}
            >
              Open admin dashboard
            </Link>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
