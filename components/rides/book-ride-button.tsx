"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { bookRide } from "@/app/actions/bookings";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function BookRideButton({ rideId, disabled }: { rideId: string; disabled?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onClick() {
    setLoading(true);
    const res = await bookRide(rideId, 1);
    setLoading(false);
    if (!res.ok) {
      toast.error(res.message);
      return;
    }
    toast.success("Seat booked!");
    router.refresh();
  }

  return (
    <Button
      className="rounded-full bg-accent text-accent-foreground"
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? "Booking…" : "Book a seat"}
    </Button>
  );
}
