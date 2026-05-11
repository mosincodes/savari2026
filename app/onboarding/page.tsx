"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { completeOnboarding, type OnboardingState } from "@/app/actions/onboarding";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const initial: OnboardingState = { ok: false };

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default function OnboardingPage() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(completeOnboarding, initial);

  useEffect(() => {
    if (state.ok) {
      toast.success("Profile ready!");
      router.push("/dashboard");
      router.refresh();
    } else if (!state.ok && state.message) {
      toast.error(state.message);
    }
  }, [state, router]);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-2xl">Complete your profile</CardTitle>
            <CardDescription>One step before you can post or book rides.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="flex flex-col gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full name</Label>
                <Input id="full_name" name="full_name" required minLength={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnic">CNIC number</Label>
                <Input
                  id="cnic"
                  name="cnic"
                  required
                  placeholder="XXXXX-XXXXXXX-X"
                  maxLength={19}
                  autoComplete="off"
                  title="13-digit CNIC (dashes optional)"
                />
                <p className="text-muted-foreground text-xs">All 13 digits — we verify against your signup.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <select id="gender" name="gender" required className={cn(selectClass)} defaultValue="">
                  <option value="" disabled>
                    Select…
                  </option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="prefer_not_say">Prefer not to say</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">How will you use Savvari?</Label>
                <select id="role" name="role" required className={cn(selectClass)} defaultValue="both">
                  <option value="passenger">Passenger only</option>
                  <option value="driver">Driver only</option>
                  <option value="both">Driver &amp; passenger</option>
                </select>
              </div>
              <div className="space-y-2 rounded-lg border border-dashed border-border p-4">
                <p className="text-sm font-medium">Your car</p>
                <p className="text-muted-foreground text-xs">
                  Required if you drive or use both modes. Leave blank if you are passenger-only.
                </p>
                <Input name="vehicle_make_model" placeholder="Make &amp; model (e.g. Honda Civic 2019)" />
                <Input name="vehicle_color" placeholder="Color" />
                <Input name="vehicle_plate" placeholder="Number plate" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_phone">Emergency contact (WhatsApp-capable)</Label>
                <Input
                  id="emergency_contact_phone"
                  name="emergency_contact_phone"
                  required
                  placeholder="03XXXXXXXXX (not your own signup number)"
                  maxLength={11}
                  pattern="^03\d{9}$"
                  inputMode="numeric"
                  title="11 digits starting with 03"
                />
                <p className="text-muted-foreground text-xs">Used only for SOS alerts from active rides.</p>
              </div>
              <Button type="submit" className="rounded-full" disabled={pending}>
                {pending ? "Saving…" : "Continue"}
              </Button>
              <p className="text-muted-foreground text-center text-xs">
                <Link href="/" className="underline">
                  Back home
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
