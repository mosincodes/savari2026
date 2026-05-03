"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { submitRating, type BookingState } from "@/app/actions/bookings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const initial: BookingState = { ok: false };

export function RatingForm({
  rideId,
  toUserId,
  label,
}: {
  rideId: string;
  toUserId: string;
  label: string;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(submitRating, initial);

  useEffect(() => {
    if (state.ok) {
      toast.success("Thanks for rating!");
      router.refresh();
    } else if (!state.ok && state.message) {
      toast.error(state.message);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="mt-2 space-y-2 rounded-lg border border-border p-3">
      <input type="hidden" name="ride_id" value={rideId} />
      <input type="hidden" name="to_user_id" value={toUserId} />
      <p className="text-sm font-medium">Rate {label}</p>
      <div className="space-y-1">
        <Label htmlFor={`score-${toUserId}`}>Score 1–5</Label>
        <Input id={`score-${toUserId}`} name="score" type="number" min={1} max={5} defaultValue={5} required />
      </div>
      <div className="space-y-1">
        <Label htmlFor={`comment-${toUserId}`}>Comment (optional)</Label>
        <Textarea id={`comment-${toUserId}`} name="comment" rows={2} />
      </div>
      <Button type="submit" size="sm" className="rounded-full" disabled={pending}>
        Submit rating
      </Button>
    </form>
  );
}
