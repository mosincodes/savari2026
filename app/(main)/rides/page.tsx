import Link from "next/link";
import { requireOnboardedProfile } from "@/lib/require-profile";
import { LAHORE_AREAS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listActiveRidesForBrowse } from "@/lib/db/queries/rides.queries";
import { ArrowRight, SearchX } from "lucide-react";

const selectClass =
  "focus-ring flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors hover:border-accent/35";

type SearchParams = { from?: string; to?: string; around?: string };

export default async function RidesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { supabase, user } = await requireOnboardedProfile();
  const sp = await searchParams;

  const hasFilters = Boolean(sp.from?.trim() || sp.to?.trim() || sp.around?.trim());

  const { rows: filtered } = await listActiveRidesForBrowse(supabase, {
    excludeDriverId: user.id,
    from_area: sp.from || undefined,
    to_area: sp.to || undefined,
    around_time: sp.around || undefined,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-4xl tracking-tight">Find your ride</h1>
        <p className="text-muted-foreground mt-2 max-w-xl text-sm sm:text-base">
          We match departures (and return times, when listed) within about 15 minutes of the time you pick.
        </p>
      </div>

      <Card className="border-accent/30 bg-gradient-to-r from-accent/5 to-transparent">
        <CardHeader>
          <CardTitle className="text-lg">Search filters</CardTitle>
        </CardHeader>
        <CardContent>
          <form method="get" className="grid gap-4 sm:grid-cols-[1fr_1fr_1fr_auto]">
            <div className="space-y-1.5">
              <label htmlFor="filter-from" className="text-muted-foreground block text-xs font-medium">
                From area
              </label>
              <select id="filter-from" name="from" defaultValue={sp.from || ""} className={cn(selectClass)}>
                <option value="">Any</option>
                {LAHORE_AREAS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="filter-to" className="text-muted-foreground block text-xs font-medium">
                To area
              </label>
              <select id="filter-to" name="to" defaultValue={sp.to || ""} className={cn(selectClass)}>
                <option value="">Any</option>
                {LAHORE_AREAS.map((a) => (
                  <option key={`t-${a}`} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="filter-around" className="text-muted-foreground block text-xs font-medium">
                Around departure
              </label>
              <input
                id="filter-around"
                name="around"
                type="time"
                defaultValue={sp.around || ""}
                className={cn(selectClass)}
              />
            </div>
            <div className="flex gap-2 sm:flex-col sm:justify-end">
              <Button type="submit" className="focus-ring w-full rounded-full sm:h-10">
                Apply
              </Button>
              {hasFilters ? (
                <Link
                  href="/rides"
                  className={cn(
                    buttonVariants({ variant: "ghost" }),
                    "focus-ring w-full whitespace-nowrap rounded-full text-muted-foreground",
                  )}
                >
                  Reset
                </Link>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <Card className="border-muted">
            <CardContent className="flex flex-col items-center gap-4 py-14 text-center sm:flex-row sm:justify-center sm:text-left">
              <div className="bg-accent/10 text-accent rounded-full p-4">
                <SearchX className="h-8 w-8" aria-hidden />
              </div>
              <div className="max-w-md space-y-2">
                <p className="font-heading text-lg">No rides match yet</p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {hasFilters
                    ? "Try clearing one filter — especially time — or check again closer to weekday mornings."
                    : "New listings appear as drivers post. You can widen filters once more routes show up."}
                </p>
                <div className="flex flex-wrap justify-center gap-2 pt-2 sm:justify-start">
                  {hasFilters ? (
                    <Link href="/rides" className={cn(buttonVariants({ variant: "outline" }), "rounded-full")}>
                      Clear filters
                    </Link>
                  ) : null}
                  <Link
                    href="/rides/new"
                    className={cn(buttonVariants({ variant: "secondary" }), "rounded-full")}
                  >
                    Post if you&apos;re driving
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <ul role="list" className="space-y-4">
            {filtered.map((r) => (
              <li key={r.id}>
                <Link href={`/rides/${r.id}`} className="group block rounded-2xl">
                  <Card className="hover-lift hover:border-accent/40 border-border/70 transition-colors">
                    <CardContent className="flex gap-4 py-5">
                      <div className="bg-accent/10 pointer-events-none flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-accent">
                        <ArrowRight className="h-6 w-6 -rotate-45" aria-hidden />
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="text-lg font-semibold leading-snug group-hover:text-accent">
                          {r.from_area}{" "}
                          <span className="text-muted-foreground px-1 font-normal" aria-hidden>
                            →
                          </span>
                          {" "}{r.to_area}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          Departs {String(r.departure_time).slice(0, 5)}
                          {r.return_time ? (
                            <>
                              {" "}
                              &middot; Returns {String(r.return_time).slice(0, 5)}
                            </>
                          ) : null}
                          {r.days?.length ? <> &middot; {r.days.join(", ")}</> : null} &middot; {r.seats_available}{" "}
                          seats
                        </p>
                        {r.meeting_point ? (
                          <p className="text-muted-foreground line-clamp-2 text-xs">Meet at {r.meeting_point}</p>
                        ) : null}
                        {r.women_only ? (
                          <div className="pt-2">
                            <Badge variant="secondary">Women only</Badge>
                          </div>
                        ) : null}
                      </div>
                      <ArrowRight className="text-muted-foreground group-hover:text-accent mt-2 h-5 w-5 shrink-0 opacity-70 transition-colors group-hover:translate-x-0.5 motion-safe:transition-transform" />
                    </CardContent>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
