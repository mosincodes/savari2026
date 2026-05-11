import Link from "next/link";
import { requireOnboardedProfile } from "@/lib/require-profile";
import { adminUserIdsFromEnv } from "@/lib/auth/admin-policy";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { countBookingsForPassenger } from "@/lib/db/queries/bookings.queries";
import { countDriverActiveRides } from "@/lib/db/queries/rides.queries";
import { Plus, MapPin, Calendar } from "lucide-react";

export default async function DashboardPage() {
  const { profile, supabase, user } = await requireOnboardedProfile();

  const admins = adminUserIdsFromEnv();
  const isAdmin = profile.is_admin || admins.has(user.id);

  const [rideCount, bookingCount] = await Promise.all([
    countDriverActiveRides(supabase, profile.id),
    countBookingsForPassenger(supabase, profile.id),
  ]);

  const firstName = profile.full_name?.split(" ")[0] || "";

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="font-heading text-4xl tracking-tight">
          {firstName ? `Welcome back, ${firstName}` : "Welcome back"}
        </h1>
        <p className="text-muted-foreground text-base">
          {profile.role === "both"
            ? "Ready to drive or ride?"
            : profile.role === "driver"
              ? "Let’s post a new ride."
              : "Find your next commute."}
        </p>
      </header>

      {/* Primary action cards */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Your rides card */}
        <Link href="/rides/new">
          <Card className="hover-lift hover:border-accent/50 cursor-pointer h-full transition-all">
            <CardHeader className="relative">
              <div className="absolute top-4 right-4 p-3 rounded-lg bg-accent/10 text-accent">
                <Plus className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">Your rides</CardTitle>
              <CardDescription>
                <span className="text-2xl font-semibold text-foreground">{rideCount ?? 0}</span>{" "}
                active listings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Post a new ride in seconds</p>
            </CardContent>
          </Card>
        </Link>

        {/* Bookings card */}
        <Link href="/bookings">
          <Card className="hover-lift hover:border-accent/50 cursor-pointer h-full transition-all">
            <CardHeader className="relative">
              <div className="absolute top-4 right-4 p-3 rounded-lg bg-accent/10 text-accent">
                <Calendar className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">Your bookings</CardTitle>
              <CardDescription>
                <span className="text-2xl font-semibold text-foreground">{bookingCount ?? 0}</span>{" "}
                confirmed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">View your upcoming trips</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Browse rides CTA */}
      <Link href="/rides">
        <Card className="hover-lift cursor-pointer relative overflow-hidden bg-gradient-to-r from-accent/5 to-accent/0 border-accent/30">
          <CardHeader className="relative z-10">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-accent/10">
                <MapPin className="h-6 w-6 text-accent" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl">Find a seat</CardTitle>
                <CardDescription className="mt-1">
                  Search rides by route and time — discover your next commute
                </CardDescription>
              </div>
              <div className="hidden sm:block shrink-0">
                <span
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "rounded-full bg-accent text-accent-foreground pointer-events-none",
                  )}
                >
                  Browse
                </span>
              </div>
            </div>
          </CardHeader>
          {/* Decorative accent */}
          <div className="absolute top-0 right-0 h-32 w-32 bg-accent/5 rounded-full -mr-16 -mt-16" />
        </Card>
      </Link>

      {/* Admin section */}
      {isAdmin ? (
        <Link href="/admin">
          <Card className="hover-lift cursor-pointer border-amber-600/25 bg-gradient-to-br from-amber-500/[0.08] via-background to-background dark:from-amber-500/[0.12]">
            <CardHeader>
              <CardTitle className="text-lg text-amber-950 dark:text-amber-100">Admin Dashboard</CardTitle>
              <CardDescription>Manage signups, matches, and payments</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      ) : null}
    </div>
  );
}
