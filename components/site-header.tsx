import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiteHeader({
  showAuth = true,
  /** Logged-in app shell: dashboard logo, Survey + marketing site links only. */
  appShell = false,
}: {
  showAuth?: boolean;
  appShell?: boolean;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href={appShell ? "/dashboard" : "/"} className="font-heading text-xl tracking-tight text-foreground">
          سواری <span className="text-accent">Savvari</span>
        </Link>

        {!appShell ? (
          <nav className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
            <Link
              href="/survey"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden sm:inline-flex")}
            >
              Survey
            </Link>
            <Link href="/join/driver" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
              Offer a ride
            </Link>
            <Link
              href="/join/passenger"
              className={cn(buttonVariants({ size: "sm" }), "rounded-full bg-primary text-primary-foreground")}
            >
              Need a ride
            </Link>
            {showAuth ? (
              <Link
                href="/login"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-full")}
              >
                Log in
              </Link>
            ) : null}
          </nav>
        ) : (
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/survey"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden sm:inline-flex")}
            >
              Survey
            </Link>
            <Link
              href="/"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-muted-foreground")}
              title="Public Savvari homepage"
            >
              Website
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
