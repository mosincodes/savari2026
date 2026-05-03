"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { JoinPassengerForm } from "@/components/forms/join-passenger-form";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function JoinPassengerPage() {
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="mx-auto flex max-w-lg flex-1 flex-col justify-center px-4 py-16 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-accent">شکریہ</p>
          <h1 className="font-heading mb-4 text-3xl tracking-tight">Thank you!</h1>
          <p className="text-muted-foreground mb-8 text-balance">
            We’ll WhatsApp you when a verified driver matches your route and time.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              className="rounded-full bg-accent text-accent-foreground"
              onClick={() => {
                const text = encodeURIComponent(
                  `Savvari — cheaper Lahore commutes. Drivers: ${typeof window !== "undefined" ? window.location.origin : ""}/join/driver`
                );
                window.open(`https://wa.me/?text=${text}`, "_blank");
              }}
            >
              Share on WhatsApp
            </Button>
            <Link href="/" className={cn(buttonVariants({ variant: "outline" }), "rounded-full")}>
              Back home
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:py-14">
        <JoinPassengerForm onSuccess={() => setDone(true)} />
      </main>
    </div>
  );
}
