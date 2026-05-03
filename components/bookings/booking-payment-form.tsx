"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { submitBookingPayment, type BookingState } from "@/app/actions/bookings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const initial: BookingState = { ok: false };

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function BookingPaymentForm({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(submitBookingPayment, initial);

  useEffect(() => {
    if (state.ok) {
      toast.success("Payment details submitted for review.");
      router.refresh();
    } else if (!state.ok && state.message) {
      toast.error(state.message);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-3 rounded-lg border border-dashed border-border p-3">
      <input type="hidden" name="booking_id" value={bookingId} />
      <p className="text-sm font-medium">Pay via JazzCash / EasyPaisa / bank</p>
      <div className="space-y-1">
        <Label htmlFor={`method-${bookingId}`}>Method</Label>
        <select id={`method-${bookingId}`} name="payment_method" required className={cn(selectClass)}>
          <option value="jazzcash">JazzCash</option>
          <option value="easypaisa">EasyPaisa</option>
          <option value="bank">Bank transfer</option>
        </select>
      </div>
      <div className="space-y-1">
        <Label htmlFor={`ref-${bookingId}`}>Reference / txn ID</Label>
        <Input id={`ref-${bookingId}`} name="payment_ref" required placeholder="Transaction reference" />
      </div>
      <Button type="submit" size="sm" className="rounded-full" disabled={pending}>
        {pending ? "Submitting…" : "Submit payment proof"}
      </Button>
    </form>
  );
}
