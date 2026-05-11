import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border bg-gradient-to-b from-background to-muted/30 px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Lahore · 2026
            </p>
            <h1 className="font-heading text-4xl leading-tight tracking-tight sm:text-5xl md:text-6xl">
              Peer-to-peer carpooling for{" "}
              <em className="text-accent not-italic">your</em> commute.
            </h1>
            <p className="text-muted-foreground mx-auto mt-6 max-w-xl text-lg leading-relaxed">
              Savvari matches verified co-commuters on the same route so you split fuel — not another
              ride-hailing cut. Built for how Lahore actually moves.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/join/driver"
                className={cn(buttonVariants({ size: "lg" }), "rounded-full px-8")}
              >
                I have a car
              </Link>
              <Link
                href="/join/passenger"
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  "rounded-full border-accent/40 px-8"
                )}
              >
                I need a ride
              </Link>
            </div>
            <p className="text-muted-foreground mt-8 text-sm">
              Already matched?{" "}
              <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
                Log in
              </Link>{" "}
              to manage rides.
            </p>
          </div>
        </section>

        <section className="mx-auto grid max-w-5xl gap-8 px-4 py-16 sm:grid-cols-3">
          {[
            {
              title: "Pilot-first matching",
              body: "Humans vet drivers and overlapping routes before we scale automation — fewer bad matches, tighter trust.",
            },
            {
              title: "Safety by design",
              body: "Full CNIC onboarding, reachable emergency contact on rides, and women-only postings when riders need them.",
            },
            {
              title: "Commuter pricing",
              body: "Weekly commuter-style fares aimed at costing less than ad-hoc ride-hailing for the same corridor.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="font-heading mb-2 text-xl">{item.title}</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">{item.body}</p>
            </div>
          ))}
        </section>

        <section className="border-t border-border bg-muted/20 px-4 py-14">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
            <h2 className="font-heading text-2xl">Research survey</h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Help us shape Savvari — 4-minute commuter survey (Lahore residents).
            </p>
            <Link
              href="/survey"
              className={cn(buttonVariants({ variant: "secondary" }), "rounded-full")}
            >
              Open survey
            </Link>
          </div>
        </section>
      </main>
      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        Savvari · Lahore · سواری © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
