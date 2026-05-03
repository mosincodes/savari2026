import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listPassengerSignupsTable } from "@/lib/db/queries/admin.queries";

export default async function AdminPassengersPage() {
  let rows: Record<string, unknown>[] = [];
  let err: string | null = null;
  try {
    const admin = createAdminClient();
    rows = await listPassengerSignupsTable(admin, 200);
  } catch (e: unknown) {
    err = e instanceof Error ? e.message : "Error";
  }

  if (err) {
    return <p className="text-destructive text-sm">{err}</p>;
  }

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-3xl tracking-tight">Passenger signups</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Latest 200</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Seats</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={String(r.id)}>
                  <TableCell className="font-medium">{String(r.full_name)}</TableCell>
                  <TableCell>{String(r.whatsapp_phone)}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {String(r.route_from)} → {String(r.route_to)}
                  </TableCell>
                  <TableCell>{String(r.preferred_time).slice(0, 5)}</TableCell>
                  <TableCell className="max-w-[140px] truncate">
                    {Array.isArray(r.days_needed) ? (r.days_needed as string[]).join(", ") : ""}
                  </TableCell>
                  <TableCell>{String(r.seats_needed)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
