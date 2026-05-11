"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { submitDriverSignup, type ActionState } from "@/app/actions/signups";
import { LAHORE_AREAS, WEEKDAYS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const initial: ActionState = { ok: false };

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function JoinDriverForm({ onSuccess }: { onSuccess: () => void }) {
  const [state, formAction, pending] = useActionState(submitDriverSignup, initial);
  const [routeFrom, setRouteFrom] = useState("");
  const [routeTo, setRouteTo] = useState("");

  useEffect(() => {
    if (state.ok) {
      toast.success("You’re on the list!");
      onSuccess();
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state, onSuccess]);

  const fe = state.ok === false ? state.fieldErrors : undefined;

  return (
    <Card className="border-border shadow-sm">
      <CardHeader>
        <CardTitle className="font-heading text-2xl">Driver signup</CardTitle>
        <CardDescription>
          Car owners offering rides — we’ll match you with passengers on your route.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="full_name">Full name</Label>
              <Input id="full_name" name="full_name" required minLength={3} placeholder="Your name" />
              {fe?.full_name?.[0] && (
                <p className="text-sm text-destructive">{fe.full_name[0]}</p>
              )}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
              />
              {fe?.email?.[0] && <p className="text-sm text-destructive">{fe.email[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp_phone">WhatsApp number</Label>
              <Input
                id="whatsapp_phone"
                name="whatsapp_phone"
                required
                placeholder="03XXXXXXXXX"
                inputMode="numeric"
                maxLength={11}
                pattern="^03\d{9}$"
                title="Pakistani mobile: 03 followed by 9 digits"
              />
              {fe?.whatsapp_phone?.[0] && (
                <p className="text-sm text-destructive">{fe.whatsapp_phone[0]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cnic">CNIC number</Label>
              <Input
                id="cnic"
                name="cnic"
                required
                maxLength={15}
                inputMode="text"
                autoComplete="off"
                placeholder="35201-1234567-1"
              />
              {fe?.cnic?.[0] && (
                <p className="text-sm text-destructive">{fe.cnic[0]}</p>
              )}
              <p className="text-muted-foreground text-xs">Full 13-digit CNIC — dashes optional.</p>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="car_make_model">Car make &amp; model</Label>
              <Input id="car_make_model" name="car_make_model" placeholder="Honda Civic 2019" required />
              {fe?.car_make_model?.[0] && (
                <p className="text-sm text-destructive">{fe.car_make_model[0]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="car_color">Car color</Label>
              <Input id="car_color" name="car_color" required />
              {fe?.car_color?.[0] && (
                <p className="text-sm text-destructive">{fe.car_color[0]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="number_plate">Number plate</Label>
              <Input id="number_plate" name="number_plate" required />
              {fe?.number_plate?.[0] && (
                <p className="text-sm text-destructive">{fe.number_plate[0]}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="route_from">Route from</Label>
              <select
                id="route_from"
                name="route_from"
                required
                value={routeFrom}
                onChange={(e) => setRouteFrom(e.target.value)}
                className={cn(selectClass)}
              >
                <option value="">Select area</option>
                {LAHORE_AREAS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
              {fe?.route_from?.[0] && (
                <p className="text-sm text-destructive">{fe.route_from[0]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="route_to">Route to</Label>
              <select
                id="route_to"
                name="route_to"
                required
                value={routeTo}
                onChange={(e) => setRouteTo(e.target.value)}
                className={cn(selectClass)}
              >
                <option value="">Select area</option>
                {LAHORE_AREAS.map((a) => (
                  <option key={`t-${a}`} value={a}>
                    {a}
                  </option>
                ))}
              </select>
              {fe?.route_to?.[0] && (
                <p className="text-sm text-destructive">{fe.route_to[0]}</p>
              )}
            </div>
            <div className={cn("space-y-2 sm:col-span-2", routeFrom !== "Other" && "hidden")}>
              <Label htmlFor="route_from_other">Specify departure area</Label>
              <Input id="route_from_other" name="route_from_other" placeholder="Area name" />
              {fe?.route_from_other?.[0] && (
                <p className="text-sm text-destructive">{fe.route_from_other[0]}</p>
              )}
            </div>
            <div className={cn("space-y-2 sm:col-span-2", routeTo !== "Other" && "hidden")}>
              <Label htmlFor="route_to_other">Specify destination area</Label>
              <Input id="route_to_other" name="route_to_other" placeholder="Area name" />
              {fe?.route_to_other?.[0] && (
                <p className="text-sm text-destructive">{fe.route_to_other[0]}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="departure_time">Morning departure</Label>
              <Input id="departure_time" name="departure_time" type="time" required />
              {fe?.departure_time?.[0] && (
                <p className="text-sm text-destructive">{fe.departure_time[0]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="return_time">Return / evening commute</Label>
              <Input id="return_time" name="return_time" type="time" required />
              {fe?.return_time?.[0] && (
                <p className="text-sm text-destructive">{fe.return_time[0]}</p>
              )}
              <p className="text-muted-foreground text-xs">When you usually head back.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="available_seats">Available seats</Label>
              <select id="available_seats" name="available_seats" defaultValue="1" className={cn(selectClass)}>
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">Days available · pick at least one</legend>
            <div className="flex flex-wrap gap-4">
              {WEEKDAYS.map((d) => (
                <label key={d.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="days_available" value={d.id} className="size-4 rounded border-input" />
                  {d.label}
                </label>
              ))}
            </div>
            {fe?.days_available?.[0] && (
              <p className="text-sm text-destructive">{fe.days_available[0]}</p>
            )}
          </fieldset>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea id="notes" name="notes" maxLength={300} rows={3} placeholder="Pickup hints, flexibility…" />
          </div>

          <Button
            type="submit"
            className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
            disabled={pending}
          >
            {pending ? "Submitting…" : "Submit"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
