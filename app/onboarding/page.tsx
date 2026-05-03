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
                <Label htmlFor="cnic_last4">CNIC last 4 digits</Label>
                <Input id="cnic_last4" name="cnic_last4" required maxLength={4} inputMode="numeric" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">How will you use Savvari?</Label>
                <select id="role" name="role" required className={cn(selectClass)} defaultValue="both">
                  <option value="passenger">Passenger only</option>
                  <option value="driver">Driver only</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <div className="space-y-2 rounded-lg border border-dashed border-border p-4">
                <p className="text-sm font-medium">Vehicle (drivers / both)</p>
                <Input name="vehicle_make_model" placeholder="Honda Civic 2019" />
                <Input name="vehicle_color" placeholder="Color" />
                <Input name="vehicle_plate" placeholder="Number plate" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_phone">Emergency contact (optional)</Label>
                <Input
                  id="emergency_contact_phone"
                  name="emergency_contact_phone"
                  placeholder="03XXXXXXXXX for SOS SMS"
                  maxLength={11}
                />
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
