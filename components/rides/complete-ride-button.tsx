"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { markRideCompleted } from "@/app/actions/rides";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function CompleteRideButton({ rideId }: { rideId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onClick() {
    setLoading(true);
    const res = await markRideCompleted(rideId);
    setLoading(false);
    if (!res.ok) {
      toast.error(res.message || "Could not update");
      return;
    }
    toast.success("Ride marked complete. You can now rate each other.");
    router.refresh();
  }

  return (
    <Button variant="secondary" className="rounded-full" disabled={loading} onClick={onClick}>
      {loading ? "Updating…" : "Mark ride complete"}
    </Button>
  );
}
