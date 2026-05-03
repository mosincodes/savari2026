import { createAdminClient } from "@/lib/supabase/admin";
import { createSignupMatch, setMatchStatusFromForm } from "@/app/actions/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  listRecentMatches,
  listRecentSignupDrivers,
  listRecentSignupPassengers,
} from "@/lib/db/queries/matches.queries";

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm";

export default async function AdminMatchesPage() {
  let drivers: { id: string; full_name: string; whatsapp_phone: string; route_from: string; route_to: string }[] =
    [];
  let passengers: { id: string; full_name: string; whatsapp_phone: string; route_from: string; route_to: string }[] =
    [];
  let matches: Record<string, unknown>[] = [];
  let err: string | null = null;

  try {
    const admin = createAdminClient();
    const [dRes, pRes, mRes] = await Promise.all([
      listRecentSignupDrivers(admin, 100),
      listRecentSignupPassengers(admin, 100),
      listRecentMatches(admin, 100),
    ]);
    drivers = dRes;
    passengers = pRes;
    matches = mRes;
  } catch (e: unknown) {
    err = e instanceof Error ? e.message : "Error";
  }

  if (err) {
    return <p className="text-destructive text-sm">{err}</p>;
  }

  return (
    <div className="space-y-8">
      <h1 className="font-heading text-3xl tracking-tight">Manual matches</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Log a new match</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createSignupMatch} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>Driver signup</Label>
              <select name="driver_signup_id" required className={cn(selectClass)}>
                <option value="">Select</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.full_name} · {d.route_from}→{d.route_to} · {d.whatsapp_phone}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Passenger signup</Label>
              <select name="passenger_signup_id" required className={cn(selectClass)}>
                <option value="">Select</option>
                {passengers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name} · {p.route_from}→{p.route_to} · {p.whatsapp_phone}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Input id="notes" name="notes" placeholder="Pickup time, confirmations…" />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" className="rounded-full">
                Save match
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent matches</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Driver signup</TableHead>
                <TableHead>Passenger signup</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {matches.map((m) => (
                <TableRow key={String(m.id)}>
                  <TableCell>{String(m.status)}</TableCell>
                  <TableCell className="max-w-[120px] truncate font-mono text-xs">
                    {String(m.driver_signup_id || "—")}
                  </TableCell>
                  <TableCell className="max-w-[120px] truncate font-mono text-xs">
                    {String(m.passenger_signup_id || "—")}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">{String(m.notes || "")}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <form action={setMatchStatusFromForm}>
                        <input type="hidden" name="id" value={String(m.id)} />
                        <input type="hidden" name="status" value="confirmed" />
                        <Button type="submit" size="sm" variant="outline" className="rounded-full">
                          Confirmed
                        </Button>
                      </form>
                      <form action={setMatchStatusFromForm}>
                        <input type="hidden" name="id" value={String(m.id)} />
                        <input type="hidden" name="status" value="completed" />
                        <Button type="submit" size="sm" variant="outline" className="rounded-full">
                          Completed
                        </Button>
                      </form>
                      <form action={setMatchStatusFromForm}>
                        <input type="hidden" name="id" value={String(m.id)} />
                        <input type="hidden" name="status" value="no_show" />
                        <Button type="submit" size="sm" variant="destructive" className="rounded-full">
                          No-show
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
