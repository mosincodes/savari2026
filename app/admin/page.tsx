import { getCachedAdminDashboardCounts } from "@/lib/db/queries/admin.queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminHomePage() {
  let drivers = 0;
  let passengers = 0;
  let matches = 0;
  let err: string | null = null;

  try {
    const counts = await getCachedAdminDashboardCounts();
    drivers = counts.drivers;
    passengers = counts.passengers;
    matches = counts.matches;
  } catch (e: unknown) {
    err = e instanceof Error ? e.message : "Config error";
  }

  if (err) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Admin</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-destructive">
          <p>{err}</p>
          <p className="text-muted-foreground mt-2 text-xs">
            Set <code className="rounded bg-muted px-1">SUPABASE_SERVICE_ROLE_KEY</code> in .env.local
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl tracking-tight">Operations</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Driver signups</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{drivers}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Passenger signups</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{passengers}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Matches logged</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{matches}</CardContent>
        </Card>
      </div>
    </div>
  );
}
