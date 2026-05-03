import Link from "next/link";
import { requireOnboardedProfile } from "@/lib/require-profile";
import { SiteHeader } from "@/components/site-header";

export default async function MainAppLayout({ children }: { children: React.ReactNode }) {
  await requireOnboardedProfile();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader showAuth={false} />
      <div className="border-b border-border bg-muted/20 md:hidden">
        <nav className="mx-auto flex max-w-lg justify-around gap-1 px-2 py-2 text-xs font-medium">
          <Link href="/dashboard" className="rounded-full px-3 py-2 hover:bg-background">
            Home
          </Link>
          <Link href="/rides" className="rounded-full px-3 py-2 hover:bg-background">
            Rides
          </Link>
          <Link href="/rides/new" className="rounded-full px-3 py-2 hover:bg-background">
            Post
          </Link>
          <Link href="/bookings" className="rounded-full px-3 py-2 hover:bg-background">
            Bookings
          </Link>
          <Link href="/profile" className="rounded-full px-3 py-2 hover:bg-background">
            Profile
          </Link>
        </nav>
      </div>
      <div className="mx-auto hidden w-full max-w-5xl gap-6 px-4 py-6 md:flex">
        <aside className="w-48 shrink-0 space-y-1 text-sm">
          <p className="text-muted-foreground mb-2 px-2 text-xs font-semibold uppercase tracking-wider">
            Menu
          </p>
          <Link href="/dashboard" className="block rounded-lg px-2 py-2 hover:bg-muted">
            Dashboard
          </Link>
          <Link href="/rides" className="block rounded-lg px-2 py-2 hover:bg-muted">
            Find rides
          </Link>
          <Link href="/rides/new" className="block rounded-lg px-2 py-2 hover:bg-muted">
            Post a ride
          </Link>
          <Link href="/bookings" className="block rounded-lg px-2 py-2 hover:bg-muted">
            My bookings
          </Link>
          <Link href="/profile" className="block rounded-lg px-2 py-2 hover:bg-muted">
            Profile
          </Link>
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
      <div className="flex-1 px-4 py-6 md:hidden">{children}</div>
    </div>
  );
}
