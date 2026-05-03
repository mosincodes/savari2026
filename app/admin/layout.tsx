import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="bg-muted/30 border-b border-border">
        <nav className="mx-auto flex max-w-5xl flex-wrap gap-2 px-4 py-3 text-sm font-medium">
          <Link href="/admin" className="rounded-full px-3 py-1 hover:bg-background">
            Overview
          </Link>
          <Link href="/admin/drivers" className="rounded-full px-3 py-1 hover:bg-background">
            Driver signups
          </Link>
          <Link href="/admin/passengers" className="rounded-full px-3 py-1 hover:bg-background">
            Passenger signups
          </Link>
          <Link href="/admin/matches" className="rounded-full px-3 py-1 hover:bg-background">
            Matches
          </Link>
          <Link href="/admin/payments" className="rounded-full px-3 py-1 hover:bg-background">
            Payments
          </Link>
          <Link href="/dashboard" className="text-muted-foreground ml-auto rounded-full px-3 py-1 hover:bg-background">
            Exit admin
          </Link>
        </nav>
      </div>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
