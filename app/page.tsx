import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Lock,
  DollarSign,
  Users,
  MapPin,
  Sparkles,
  Car,
  ClipboardList,
} from "lucide-react";

function HeroRouteGraphic() {
  return (
    <div
      className="relative aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2rem] border border-border/80 bg-card shadow-[0_40px_100px_-20px_rgb(15_15_15/0.12)] lg:aspect-square lg:max-w-none dark:shadow-none"
      aria-hidden
    >
      <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.12] via-transparent to-accent/[0.06]" />
      <div className="absolute left-10 top-8 h-32 w-32 rounded-full bg-accent/15 blur-2xl" />
      <div className="absolute bottom-16 right-6 h-40 w-40 rounded-full bg-foreground/[0.04] blur-3xl" />

      <div className="relative flex h-full flex-col p-8">
        <div className="mb-8 flex items-center justify-between gap-3">
          <div>
            <p className="text-muted-foreground text-[10px] font-semibold uppercase tracking-[0.2em]">
              Today · Mon
            </p>
            <p className="font-heading mt-1 text-xl tracking-tight">Your corridor</p>
          </div>
          <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
            4 seats · split fuel
          </span>
        </div>

        <div className="relative mx-auto mb-10 flex flex-1 flex-col items-center justify-center">
          <svg viewBox="0 0 200 260" className="text-accent h-auto w-[min(240px,100%)] opacity-95">
            <path
              d="M100 36 C 148 92, 52 148, 100 204"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="12 14"
              className="text-accent"
            />
            <circle cx="100" cy="36" r="12" fill="currentColor" className="text-foreground/90" />
            <circle cx="100" cy="204" r="12" fill="currentColor" className="text-accent" />
            <text x="100" y="22" fill="#6b6b6b" fontSize="11" fontFamily="inherit" textAnchor="middle">
              Origin
            </text>
            <text x="100" y="246" fill="#6b6b6b" fontSize="11" fontFamily="inherit" textAnchor="middle">
              Workplace
            </text>
          </svg>
          <p className="text-muted-foreground absolute bottom-[-2.5rem] max-w-[12rem] text-center text-[11px] leading-relaxed">
            DHA Defence → Gulberg · departs&nbsp;07:55
          </p>
        </div>

        <div className="relative mt-auto rounded-2xl border border-border/60 bg-muted/40 p-4 backdrop-blur-sm">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex -space-x-2">
              <span className="bg-accent ring-background inline-flex h-9 w-9 items-center justify-center rounded-full ring-2 text-xs font-semibold">
                UW
              </span>
              <span className="bg-foreground ring-background inline-flex h-9 w-9 items-center justify-center rounded-full ring-2 text-[10px] font-medium text-primary-foreground">
                +3
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">Same route, recurring days</p>
              <p className="text-muted-foreground truncate text-[11px]">Verified · women-only seats available</p>
            </div>
            <Sparkles className="text-accent h-5 w-5 shrink-0" />
          </div>
          <div className="via-accent/35 h-px w-full rounded-full bg-gradient-to-r from-transparent to-transparent opacity-70" />
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const year = new Date().getFullYear();

  return (
    <div className="bg-background relative flex min-h-screen flex-col">
      {/* Ambient backdrop */}
      <div className="pointer-events-none fixed inset-0 -z-30 overflow-hidden">
        <div className="bg-grid-fade absolute inset-0 opacity-[0.45]" />
        <div className="absolute -left-[20%] top-[-10%] h-[70vh] w-[70vh] rounded-full bg-accent/[0.07] blur-[100px]" />
        <div className="absolute -right-[15%] top-[35%] h-[55vh] w-[55vh] rounded-full bg-foreground/[0.03] blur-[90px]" />
      </div>

      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative isolate px-4 pb-16 pt-16 sm:pb-24 sm:pt-20 lg:pb-28 lg:pt-24">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-6 lg:pb-8">
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
                <span className="bg-accent rounded-full px-2 py-0.5 text-[10px] text-accent-foreground">
                  Lahore pilot
                </span>
                <span className="text-foreground">2026 commuter trial</span>
              </div>

              <h1 className="font-heading text-foreground text-[clamp(2.5rem,6vw,4.75rem)] font-normal leading-[0.98] tracking-tight">
                The commute Lahore deserved — split fuel with people on{" "}
                <span className="relative inline-block">
                  <span className="from-accent bg-gradient-to-r via-[#d4bc86] to-accent bg-clip-text text-transparent">
                    your corridor
                  </span>
                  <span className="bg-accent/25 absolute -bottom-2 left-0 right-1 h-[0.52rem] skew-x-[2deg]" />
                </span>
              </h1>

              <p className="text-muted-foreground mt-8 max-w-xl text-[1.0625rem] leading-relaxed sm:text-lg">
                Savvari introduces verified neighbours who{" "}
                <span className="text-foreground font-medium underline decoration-accent decoration-2 underline-offset-4">
                  actually share your route and window
                </span>
                — not another surge-priced detour across town.
              </p>

              <div className="mt-11 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link
                  href="/join/driver"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "group rounded-full px-9 py-7 text-[15px] font-semibold shadow-lg shadow-black/12 transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/14 sm:py-6",
                  )}
                >
                  I have a car
                  <ArrowRight className="ml-2 h-[18px] w-[18px] transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/join/passenger"
                  className={cn(
                    buttonVariants({ size: "lg", variant: "outline" }),
                    "hover:border-accent/60 group rounded-full border-2 px-9 py-7 text-[15px] font-semibold backdrop-blur-sm transition-colors hover:bg-accent/[0.08] sm:py-6",
                  )}
                >
                  I need a ride
                  <ArrowRight className="ml-2 h-[18px] w-[18px] transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              <div className="text-muted-foreground mt-11 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border/60 pt-8 text-sm">
                <div className="flex items-center gap-2">
                  <Sparkles className="text-accent h-4 w-4" />
                  <span>
                    Returning user?{" "}
                    <Link href="/login" className="text-foreground font-semibold underline-offset-4 hover:underline">
                      Log in
                    </Link>
                  </span>
                </div>
              </div>
            </div>

            <div className="relative z-0 mx-auto flex w-full max-w-md flex-col gap-8 lg:col-span-6 lg:mx-0 lg:max-w-none lg:justify-center lg:self-end lg:pb-6">
              <div className="relative w-full">
                <HeroRouteGraphic />
              </div>

              {/* Below the demo card so the card footer stays fully visible (no overlap). */}
              <figure className="border-border/60 bg-muted/25 font-heading relative w-full max-w-md rounded-xl border px-6 py-4 text-[13px] italic leading-snug shadow-sm lg:text-sm xl:self-end">
                <span
                  aria-hidden
                  className="border-border/60 bg-muted/25 absolute -top-[7px] left-10 size-3 rotate-45 border-l border-t"
                />
                <blockquote className="relative text-muted-foreground">
                  &ldquo;Two weeks in, fuel split with two colleagues on the Ring Road corridor — effortless.&rdquo;
                </blockquote>
                <figcaption className="text-muted-foreground relative mt-3 text-[11px] font-sans font-medium not-italic tracking-wide">
                  Commuter pilot · Ring Road corridor
                </figcaption>
              </figure>
            </div>
          </div>

          {/* Metric strip */}
          <div className="mx-auto mt-20 grid max-w-6xl gap-4 sm:mt-28 sm:grid-cols-3">
            {[
              {
                stat: "Route-first",
                sub: "We match overlaps, not vague “nearby” pins.",
              },
              {
                stat: "CNIC + SOS",
                sub: "Onboarding built for predictable trip safety.",
              },
              {
                stat: "Commuter math",
                sub: "Designed to beat one-off hail pricing on your stretch.",
              },
            ].map((m) => (
              <div
                key={m.stat}
                className="rounded-2xl border border-border/70 bg-muted/35 px-6 py-5 backdrop-blur-sm transition-[border-color,background] hover:border-accent/35 hover:bg-muted/50 sm:py-6"
              >
                <p className="font-heading text-lg font-normal tracking-tight sm:text-xl">{m.stat}</p>
                <p className="text-muted-foreground mt-1 text-[13px] leading-relaxed sm:text-sm">{m.sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="relative border-y border-border/60 bg-muted/25 px-4 py-20 sm:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="mb-14 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="font-heading text-4xl tracking-tight sm:text-5xl">From signup to seat</h2>
                <p className="text-muted-foreground mt-3 max-w-lg text-[15px]">
                  Straightforward pathways — drivers list recurring windows, riders filter by corridor and clock.
                </p>
              </div>
              <ClipboardList className="text-accent/40 hidden sm:block sm:h-10 sm:w-10" aria-hidden />
            </div>

            <ol className="grid gap-10 md:grid-cols-3 md:gap-6">
              {[
                {
                  step: "01",
                  title: "Tell us your corridor",
                  body: "Area-to-area signup with optional times — pilots hand-match serious overlaps.",
                  icon: MapPin,
                },
                {
                  step: "02",
                  title: "Get paired carefully",
                  body: "Fewer frantic pings: we bias toward repeat windows and clearer meet points.",
                  icon: Users,
                },
                {
                  step: "03",
                  title: "Split fuel weekly",
                  body: "Weekly-style commuter fares — transparent and aimed at recurring trust.",
                  icon: DollarSign,
                },
              ].map(({ step, title, body, icon: Icon }) => (
                <li
                  key={step}
                  className="group relative rounded-3xl border border-border/70 bg-background/80 p-8 shadow-sm backdrop-blur-sm md:pt-10"
                >
                  <span className="bg-accent text-accent-foreground absolute right-8 top-8 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide">
                    {step}
                  </span>
                  <Icon className="text-accent mb-6 h-7 w-7 transition-transform md:group-hover:scale-110" />
                  <h3 className="font-heading pr-14 text-xl font-normal tracking-tight sm:text-[1.35rem]">{title}</h3>
                  <p className="text-muted-foreground mt-3 text-[14px] leading-relaxed">{body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Why Savvari */}
        <section className="px-4 py-20 sm:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <h2 className="font-heading text-4xl tracking-tight sm:text-5xl">Why Savvari wins trust</h2>
              <p className="text-muted-foreground mt-4">
                Lahore‑shaped safeguards and pricing — nothing generic pasted from Silicon Valley decks.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-12 md:gap-5">
              {[
                {
                  icon: Users,
                  title: "Pilot‑first matching",
                  body: "Humans sanity‑check overlaps before scaling automation.",
                  span: "md:col-span-7",
                },
                {
                  icon: Lock,
                  title: "Safety spine",
                  body: "CNIC, emergency SOS path, optional women‑only listings.",
                  span: "md:col-span-5",
                },
                {
                  icon: Car,
                  title: "Commuter corridors",
                  body: "Fuel split on repeatable routes — mornings and returns when your city actually moves.",
                  span: "md:col-span-12",
                  wide: true,
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <article
                    key={item.title}
                    className={cn(
                      "group feature-card-hover hover-lift relative overflow-hidden rounded-3xl border border-border/60 bg-card p-8 md:p-10",
                      item.span,
                      item.wide && "md:flex md:flex-row md:items-center md:gap-12",
                    )}
                  >
                    <div className="from-accent/[0.12] absolute inset-0 bg-gradient-to-br to-transparent opacity-50 transition-opacity group-hover:opacity-100 md:opacity-40" />

                    <div className={cn("relative flex flex-col", item.wide && "md:max-w-md")}>
                      <div className="mb-7 inline-flex w-fit rounded-2xl border border-accent/30 bg-accent/10 p-3.5 text-accent">
                        <Icon className="h-7 w-7" aria-hidden />
                      </div>

                      <h3 className="font-heading mb-4 text-[1.4rem] font-normal tracking-tight sm:text-2xl">{item.title}</h3>

                      <p className="text-muted-foreground text-[15px] leading-relaxed">{item.body}</p>
                    </div>

                    {item.wide ? (
                      <div className="text-accent/35 relative mt-10 hidden shrink-0 font-mono text-xs leading-loose opacity-70 md:block md:mt-0 md:text-sm">
                        DHA ──●─┬─●─┬────────●── Gulberg<br />
                        └─ Lake City ── Johar ── Walton
                      </div>
                    ) : (
                      <div className="bg-accent pointer-events-none absolute -right-6 -top-10 h-32 w-32 rounded-full opacity-[0.08] blur-2xl transition-transform md:group-hover:scale-110" />
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Survey — high contrast */}
        <section className="px-4 pb-20 sm:pb-28">
          <div className="border-accent/35 relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] border-2 bg-foreground px-8 py-14 shadow-[0_32px_80px_-20px_rgb(0_0_0/0.35)] sm:px-14 sm:py-16 lg:rounded-[2.25rem]">
            <div className="from-accent/[0.15] absolute -right-[20%] top-[-40%] h-[120%] w-[65%] rounded-full blur-[100px]" />
            <div className="relative flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
              <div className="max-w-xl text-primary-foreground">
                <span className="inline-flex rounded-full border border-accent/50 bg-accent/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-accent">
                  Research survey
                </span>
                <h2 className="font-heading mt-5 text-3xl tracking-tight sm:text-4xl">
                  Four minutes&nbsp;that steer the whole product
                </h2>
                <p className="mt-5 text-[15px] leading-relaxed text-neutral-400">
                  Karachi Road traffic, Walton loops, varsity runs — Lahore‑only commuter signal. Responses land in
                  our secure pipeline and optionally mirror to our Google Form workflow.
                </p>
              </div>
              <Link
                href="/survey"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "group shrink-0 rounded-full border-2 border-accent bg-accent px-10 py-7 text-accent-foreground shadow-lg transition-[transform] hover:bg-accent hover:shadow-xl sm:py-6",
                )}
              >
                Open commuter survey
                <ArrowRight className="ml-2 h-[18px] w-[18px] transition-transform group-hover:translate-x-1.5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative border-t border-border/70 bg-muted/35 py-10 text-xs text-muted-foreground">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:gap-2">
          <div className="flex flex-wrap justify-center gap-4 font-medium">
            <span>Savvari · Lahore · سواری</span>
            <span>© {year}</span>
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link href="/legal" className="hover:text-accent transition-colors">
              Legal
            </Link>
            <Link href="/survey" className="hover:text-accent transition-colors">
              Survey
            </Link>
            <Link href="/login" className="hover:text-accent transition-colors">
              Log in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
