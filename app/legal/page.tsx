import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Legal · Savvari",
  description: "Terms of service, privacy policy, and community guidelines for Savvari Lahore.",
};

const links = [
  { href: "/legal/terms", title: "Terms of service", blurb: "Platform rules, eligibility, rides, payments, liability, contacts." },
  { href: "/legal/privacy", title: "Privacy policy", blurb: "What we collect, how we use it, CNIC, location, retention, contacts." },
  {
    href: "/legal/community",
    title: "Community & safety guidelines",
    blurb: "Behavior standards for Drivers and Passengers, enforcement, emergencies.",
  },
] as const;

export default function LegalIndexPage() {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-12 sm:py-16">
        <h1 className="font-heading mb-3 text-[clamp(2rem,4vw,2.75rem)] tracking-tight">Legal</h1>
        <p className="text-muted-foreground mb-10 leading-relaxed">
          Official policies for Savvari. Draft placeholders (company name, address, WhatsApp safety line) appear as
          &ldquo;To be published&rdquo; or bracketed cues until finalized.
        </p>
        <ul className="space-y-4">
          {links.map(({ href, title, blurb }) => (
            <li key={href}>
              <Link href={href} className={cn(buttonVariants({ variant: "outline" }), "flex h-auto w-full flex-col items-start gap-1 rounded-xl border-accent/35 py-6 text-left whitespace-normal hover:bg-accent/5")}>
                <span className="font-heading text-base font-semibold text-foreground">{title}</span>
                <span className="font-sans font-normal text-[13px] text-muted-foreground">{blurb}</span>
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/" className={cn(buttonVariants({ variant: "ghost" }), "mx-auto mt-12 block rounded-full underline-offset-4")}>
          Back to home
        </Link>
      </main>
    </div>
  );
}
