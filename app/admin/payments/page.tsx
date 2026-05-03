import { createAdminClient } from "@/lib/supabase/admin";
import { confirmPaymentFromForm } from "@/app/actions/bookings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listPendingPaymentBookings } from "@/lib/db/queries/admin.queries";

export default async function AdminPaymentsPage() {
  let rows: {
    id: string;
    payment_ref: string | null;
    payment_method: string | null;
    passenger_id: string;
    ride_id: string;
  }[] = [];
  let err: string | null = null;

  try {
    const admin = createAdminClient();
    rows = await listPendingPaymentBookings(admin, 200);
  } catch (e: unknown) {
    err = e instanceof Error ? e.message : "Error";
  }

  if (err) {
    return <p className="text-destructive text-sm">{err}</p>;
  }

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-3xl tracking-tight">Payments to confirm</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pending review</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {rows.length === 0 ? (
            <p className="text-muted-foreground text-sm">No pending payments.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking</TableHead>
                  <TableHead>Ride</TableHead>
                  <TableHead>Passenger</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{r.id}</TableCell>
                    <TableCell className="font-mono text-xs">{r.ride_id}</TableCell>
                    <TableCell className="font-mono text-xs">{r.passenger_id}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{r.payment_method}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[180px] truncate">{r.payment_ref}</TableCell>
                    <TableCell>
                      <form action={confirmPaymentFromForm}>
                        <input type="hidden" name="booking_id" value={r.id} />
                        <Button type="submit" size="sm" className="rounded-full">
                          Mark paid
                        </Button>
                      </form>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
