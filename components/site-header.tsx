import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiteHeader({
  showAuth = true,
}: {
  showAuth?: boolean;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="font-heading text-xl tracking-tight text-foreground">
          سواری <span className="text-accent">Savvari</span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3">
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
          {showAuth && (
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-full")}
            >
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
