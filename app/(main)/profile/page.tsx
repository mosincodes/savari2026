import Link from "next/link";
import { requireOnboardedProfile } from "@/lib/require-profile";
import { normalizeCnicDigits, formatCnicDisplay } from "@/lib/constants";
import { formatRoleDisplay } from "@/lib/profile-display";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listRatingsReceived } from "@/lib/db/queries/profiles.queries";

export default async function ProfilePage() {
  const { profile, supabase, user } = await requireOnboardedProfile();

  const ratingsReceived = await listRatingsReceived(supabase, user.id, 20);
  const cnicNorm = normalizeCnicDigits(profile.cnic || "");
  const cnicShown = cnicNorm ? formatCnicDisplay(cnicNorm) : profile.cnic?.trim() || "—";

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="font-heading text-4xl tracking-tight">Your profile</h1>
        <p className="text-muted-foreground text-sm">
          Verified details we use on rides — update via onboarding if anything looks wrong.
        </p>
      </header>

      <Card className="border-accent/30 bg-gradient-to-r from-accent/5 to-background">
        <CardHeader>
          <CardTitle className="text-lg">Account details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="text-muted-foreground">Name:</span>{" "}
            <span className="font-medium">{profile.full_name}</span>
          </p>
          <p>
            <span className="text-muted-foreground">Role:</span>{" "}
            <span className="font-medium">{formatRoleDisplay(profile.role)}</span>
          </p>
          {profile.gender ? (
            <p>
              <span className="text-muted-foreground">Gender:</span>{" "}
              <span className="font-medium capitalize">{profile.gender.replace(/_/g, " ")}</span>
            </p>
          ) : null}
          <p>
            <span className="text-muted-foreground">CNIC number:</span>{" "}
            <span className="font-medium">{cnicShown}</span>
          </p>
          <p>
            <span className="text-muted-foreground">Emergency contact:</span>{" "}
            <span className="font-medium">{profile.emergency_contact_phone || "Not set"}</span>
          </p>
          {profile.reliability_flagged ? (
            <Badge variant="destructive">Reliability review</Badge>
          ) : null}
          <form action="/auth/signout" method="post" className="pt-4">
            <Button type="submit" variant="outline" className="rounded-full" size="sm">
              Sign out
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ratings you received</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {!ratingsReceived?.length ? (
            <p className="text-muted-foreground">No ratings yet.</p>
          ) : (
            ratingsReceived.map((r) => (
              <div key={`${r.from_user_id}-${r.created_at}`} className="border-b border-border pb-2 last:border-0">
                <p className="font-medium">{r.score}/5</p>
                {r.comment ? <p className="text-muted-foreground">{r.comment}</p> : null}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <p className="text-center text-xs">
        <Link href="/onboarding" className="text-muted-foreground underline">
          Re-run onboarding (contact support if stuck)
        </Link>
      </p>
    </div>
  );
}
