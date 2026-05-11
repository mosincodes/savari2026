"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createRide, type RideActionState } from "@/app/actions/rides";
import { LAHORE_AREAS, WEEKDAYS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const initial: RideActionState = { ok: false };

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function NewRideForm({
  vehicles,
}: {
  vehicles: { id: string; make_model: string; number_plate: string }[];
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createRide, initial);
  const [fromArea, setFromArea] = useState("");
  const [toArea, setToArea] = useState("");

  useEffect(() => {
    if (state.ok && "id" in state && state.id) {
      toast.success("Ride posted!");
      router.push(`/rides/${state.id}`);
    } else if (!state.ok && state.message) {
      toast.error(state.message);
    }
  }, [state, router]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Route & schedule</CardTitle>
        <CardDescription>Passengers see this in search (±15 min time window).</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          {vehicles.length > 0 ? (
            <div className="space-y-2">
              <Label htmlFor="vehicle_id">Vehicle</Label>
              <select id="vehicle_id" name="vehicle_id" className={cn(selectClass)}>
                <option value="">Select</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.make_model} · {v.number_plate}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="from_area">From</Label>
              <select
                id="from_area"
                name="from_area"
                required
                className={cn(selectClass)}
                value={fromArea}
                onChange={(e) => setFromArea(e.target.value)}
              >
                <option value="">Area</option>
                {LAHORE_AREAS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="to_area">To</Label>
              <select
                id="to_area"
                name="to_area"
                required
                className={cn(selectClass)}
                value={toArea}
                onChange={(e) => setToArea(e.target.value)}
              >
                <option value="">Area</option>
                {LAHORE_AREAS.map((a) => (
                  <option key={`t-${a}`} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
            <div className={cn("space-y-2 sm:col-span-2", fromArea !== "Other" && "hidden")}>
              <Label htmlFor="from_area_other">Specify from area</Label>
              <Input id="from_area_other" name="from_area_other" />
            </div>
            <div className={cn("space-y-2 sm:col-span-2", toArea !== "Other" && "hidden")}>
              <Label htmlFor="to_area_other">Specify destination area</Label>
              <Input id="to_area_other" name="to_area_other" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="departure_time">Morning departure</Label>
              <Input id="departure_time" name="departure_time" type="time" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="return_time">Return trip (evening)</Label>
              <Input id="return_time" name="return_time" type="time" />
              <p className="text-muted-foreground text-xs">Optional — shown in search alongside departure.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="seats_available">Seats</Label>
              <select id="seats_available" name="seats_available" defaultValue="1" className={cn(selectClass)}>
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Days · pick at least one</legend>
            <div className="flex flex-wrap gap-3">
              {WEEKDAYS.map((d) => (
                <label key={d.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="days" value={d.id} className="size-4 rounded border-input" />
                  {d.id}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="space-y-2">
            <Label htmlFor="meeting_point">Meeting point (optional)</Label>
            <Input id="meeting_point" name="meeting_point" placeholder="Landmark / gate" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="women_only" name="women_only" className="size-4 rounded border-input" />
            <Label htmlFor="women_only" className="font-normal">
              Women-only ride
            </Label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" rows={3} />
          </div>
          <Button type="submit" className="rounded-full" disabled={pending}>
            {pending ? "Posting…" : "Post ride"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
