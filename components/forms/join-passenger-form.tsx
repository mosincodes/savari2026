"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { submitPassengerSignup, type ActionState } from "@/app/actions/signups";
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

export function JoinPassengerForm({ onSuccess }: { onSuccess: () => void }) {
  const [state, formAction, pending] = useActionState(submitPassengerSignup, initial);

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
        <CardTitle className="font-heading text-2xl">Passenger signup</CardTitle>
        <CardDescription>Looking for a seat — we’ll match you with drivers on your route.</CardDescription>
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
              />
              {fe?.whatsapp_phone?.[0] && (
                <p className="text-sm text-destructive">{fe.whatsapp_phone[0]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cnic_last4">CNIC last 4 digits</Label>
              <Input
                id="cnic_last4"
                name="cnic_last4"
                required
                maxLength={4}
                inputMode="numeric"
                placeholder="1234"
              />
              {fe?.cnic_last4?.[0] && (
                <p className="text-sm text-destructive">{fe.cnic_last4[0]}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="route_from">Route from</Label>
              <select id="route_from" name="route_from" required className={cn(selectClass)}>
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
              <select id="route_to" name="route_to" required className={cn(selectClass)}>
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
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="route_from_other">If &quot;Other&quot; — from (specify)</Label>
              <Input id="route_from_other" name="route_from_other" placeholder="Area name" />
              {fe?.route_from_other?.[0] && (
                <p className="text-sm text-destructive">{fe.route_from_other[0]}</p>
              )}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="route_to_other">If &quot;Other&quot; — to (specify)</Label>
              <Input id="route_to_other" name="route_to_other" placeholder="Area name" />
              {fe?.route_to_other?.[0] && (
                <p className="text-sm text-destructive">{fe.route_to_other[0]}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="preferred_time">Preferred time</Label>
              <Input id="preferred_time" name="preferred_time" type="time" required />
              {fe?.preferred_time?.[0] && (
                <p className="text-sm text-destructive">{fe.preferred_time[0]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="seats_needed">Seats needed</Label>
              <select id="seats_needed" name="seats_needed" defaultValue="1" className={cn(selectClass)}>
                <option value={1}>1</option>
                <option value={2}>2</option>
              </select>
            </div>
          </div>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">Days needed (Mon–Sat)</legend>
            <div className="flex flex-wrap gap-4">
              {WEEKDAYS.map((d) => (
                <label key={d.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="days_needed" value={d.id} className="size-4 rounded border-input" />
                  {d.label}
                </label>
              ))}
            </div>
            {fe?.days_needed?.[0] && (
              <p className="text-sm text-destructive">{fe.days_needed[0]}</p>
            )}
          </fieldset>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea id="notes" name="notes" maxLength={300} rows={3} placeholder="Timing flexibility, landmarks…" />
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
