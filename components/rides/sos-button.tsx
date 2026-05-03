"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function SosButton({ rideId }: { rideId: string }) {
  const [loading, setLoading] = useState(false);

  async function onClick() {
    setLoading(true);
    try {
      const r = await fetch("/api/sos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ride_id: rideId }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        toast.error((j as { error?: string }).error || "SOS failed");
        return;
      }
      toast.success("Emergency contact notified via SMS.");
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="destructive" className="rounded-full" disabled={loading} onClick={onClick}>
      {loading ? "Sending…" : "SOS — alert contact"}
    </Button>
  );
}
