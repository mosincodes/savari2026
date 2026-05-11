import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, Lock, DollarSign, Users } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero section with animated background */}
        <section className="relative overflow-hidden px-4 py-20 sm:py-32">
          {/* Decorative background elements */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-20 right-10 h-72 w-72 rounded-full bg-accent/5 blur-3xl" />
            <div className="absolute bottom-20 left-10 h-96 w-96 rounded-full bg-accent/3 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-block rounded-full bg-accent/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-accent">
              Lahore · 2026
            </div>
            <h1 className="font-heading mb-6 text-5xl leading-tight tracking-tight sm:text-6xl md:text-7xl">
              Peer-to-peer{" "}
              <span className="relative">
                <span className="relative z-10 text-accent">carpooling</span>
                <span className="absolute bottom-2 left-0 h-3 w-full bg-accent/20 -z-10 rounded-sm" />
              </span>{" "}
              for your commute.
            </h1>
            <p className="text-muted-foreground mx-auto mb-10 max-w-2xl text-lg leading-relaxed sm:text-xl">
              Savvari matches verified co-commuters on the same route so you split fuel — not another
              ride-hailing cut. Built for how Lahore actually moves.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/join/driver"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "rounded-full px-8 group relative overflow-hidden font-semibold transition-all hover:shadow-xl hover:-translate-y-0.5"
                )}
              >
                I have a car
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/join/passenger"
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  "rounded-full border-accent/40 px-8 font-semibold hover:border-accent hover:bg-accent/5 transition-all"
                )}
              >
                I need a ride
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <p className="text-muted-foreground mt-10 text-sm">
              Already matched?{" "}
              <Link href="/login" className="font-semibold text-foreground underline-offset-4 hover:underline">
                Log in
              </Link>{" "}
              to manage rides.
            </p>
          </div>
        </section>

        {/* Feature cards section with visual enhancements */}
        <section className="border-t border-border/50 bg-gradient-to-b from-muted/20 to-background px-4 py-20 sm:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <h2 className="font-heading mb-4 text-4xl tracking-tight">Why Savvari</h2>
              <p className="text-muted-foreground">Built on trust, safety, and smarter commuting</p>
            </div>

            <div className="grid gap-8 sm:grid-cols-3">
              {[
                {
                  icon: Users,
                  title: "Pilot-first matching",
                  body: "Humans vet drivers and overlapping routes before we scale automation — fewer bad matches, tighter trust.",
                  color: "from-accent/10 to-accent/5",
                },
                {
                  icon: Lock,
                  title: "Safety by design",
                  body: "Full CNIC onboarding, reachable emergency contact on rides, and women-only postings when riders need them.",
                  color: "from-accent/5 to-transparent",
                },
                {
                  icon: DollarSign,
                  title: "Commuter pricing",
                  body: "Weekly commuter-style fares aimed at costing less than ad-hoc ride-hailing for the same corridor.",
                  color: "from-accent/10 via-accent/5 to-transparent",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="group feature-card-hover hover-lift relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card to-card p-8 backdrop-blur-sm"
                  >
                    {/* Gradient background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-50 group-hover:opacity-100 transition-opacity duration-300 -z-10`} />

                    {/* Icon */}
                    <div className="mb-6 inline-flex rounded-lg bg-accent/10 p-3 text-accent">
                      <Icon className="h-6 w-6" />
                    </div>

                    {/* Content */}
                    <h3 className="font-heading mb-3 text-xl font-semibold">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{item.body}</p>

                    {/* Decorative corner accent */}
                    <div className="absolute top-0 right-0 h-20 w-20 bg-accent/5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500" />
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Survey CTA section */}
        <section className="border-t border-border/50 bg-gradient-to-r from-accent/5 via-background to-accent/5 px-4 py-20 sm:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-heading mb-4 text-3xl tracking-tight">Help shape Savvari</h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Your commute, your frustrations, your dreams for a better Lahore.{" "}
              <span className="font-semibold text-foreground">4-minute survey</span> (Lahore residents only).
            </p>
            <Link
              href="/survey"
              className={cn(
                buttonVariants({ variant: "secondary" }),
                "rounded-full px-8 font-semibold transition-all hover:shadow-lg hover:-translate-y-0.5 group"
              )}
            >
              Open survey
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card py-8 text-center text-xs text-muted-foreground">
        <div className="flex items-center justify-center gap-2">
          <span>Savvari · Lahore · سواری</span>
          <span>©</span>
          <span>{new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}
