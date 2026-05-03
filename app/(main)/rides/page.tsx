import Link from "next/link";
import { requireOnboardedProfile } from "@/lib/require-profile";
import { LAHORE_AREAS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listActiveRidesForBrowse } from "@/lib/db/queries/rides.queries";

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm";

type SearchParams = { from?: string; to?: string; around?: string };

export default async function RidesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { supabase, user } = await requireOnboardedProfile();
  const sp = await searchParams;

  const { rows: filtered } = await listActiveRidesForBrowse(supabase, {
    excludeDriverId: user.id,
    from_area: sp.from || undefined,
    to_area: sp.to || undefined,
    around_time: sp.around || undefined,
  });

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl tracking-tight">Find rides</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <form method="get" className="grid gap-3 sm:grid-cols-4">
            <div>
              <label className="text-muted-foreground mb-1 block text-xs">From</label>
              <select name="from" defaultValue={sp.from || ""} className={cn(selectClass)}>
                <option value="">Any</option>
                {LAHORE_AREAS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-muted-foreground mb-1 block text-xs">To</label>
              <select name="to" defaultValue={sp.to || ""} className={cn(selectClass)}>
                <option value="">Any</option>
                {LAHORE_AREAS.map((a) => (
                  <option key={`t-${a}`} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-muted-foreground mb-1 block text-xs">Around</label>
              <input
                name="around"
                type="time"
                defaultValue={sp.around || ""}
                className={cn(selectClass)}
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full rounded-full">
                Apply
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <p className="text-muted-foreground text-sm">No rides match. Try widening filters.</p>
        ) : (
          filtered.map((r) => (
            <Card key={r.id}>
              <CardContent className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">
                    {r.from_area} → {r.to_area}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Departs {String(r.departure_time).slice(0, 5)} · {r.days?.join(", ")} ·{" "}
                    {r.seats_available} seats
                  </p>
                  {r.meeting_point ? (
                    <p className="text-muted-foreground mt-1 text-xs">Meet: {r.meeting_point}</p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {r.women_only ? <Badge variant="secondary">Women only</Badge> : null}
                  </div>
                </div>
                <Link
                  href={`/rides/${r.id}`}
                  className={cn(buttonVariants({ variant: "default" }), "rounded-full shrink-0")}
                >
                  View
                </Link>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
