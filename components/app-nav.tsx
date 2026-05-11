"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { CalendarDays, CirclePlus, LayoutDashboard, Route, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS: { href: string; label: string; shortLabel: string; Icon: LucideIcon }[] = [
  { href: "/dashboard", label: "Dashboard", shortLabel: "Home", Icon: LayoutDashboard },
  { href: "/rides", label: "Find rides", shortLabel: "Browse", Icon: Route },
  { href: "/rides/new", label: "Post a ride", shortLabel: "Post", Icon: CirclePlus },
  { href: "/bookings", label: "My bookings", shortLabel: "Bookings", Icon: CalendarDays },
  { href: "/profile", label: "Profile", shortLabel: "You", Icon: UserCircle },
];

export function navItemIsActive(href: string, pathname: string | null): boolean {
  if (!pathname) return false;
  switch (href) {
    case "/dashboard":
      return pathname === "/dashboard";
    case "/rides":
      return pathname.startsWith("/rides") && !pathname.startsWith("/rides/new");
    case "/rides/new":
      return pathname.startsWith("/rides/new");
    case "/bookings":
      return pathname.startsWith("/bookings");
    case "/profile":
      return pathname.startsWith("/profile");
    default:
      return pathname === href;
  }
}

type AppNavigationProps = {
  orientation: "sidebar" | "bottom";
  className?: string;
};

export function AppNavigation({ orientation, className }: AppNavigationProps) {
  const pathname = usePathname();

  const itemClassName = cn(
    "flex items-center font-medium transition-colors",
    orientation === "sidebar"
      ? "gap-3 rounded-lg px-3 py-2.5 text-sm"
      : "flex-1 flex-col justify-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] leading-tight",
  );

  return (
    <nav
      aria-label="Main app"
      className={cn(orientation === "sidebar" ? "space-y-0.5" : "flex items-stretch gap-1", className)}
    >
      {LINKS.map(({ href, label, shortLabel, Icon }) => {
        const active = navItemIsActive(href, pathname);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              itemClassName,
              active
                ? "bg-accent/15 text-foreground shadow-sm ring-1 ring-accent/35"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className={cn("shrink-0", orientation === "sidebar" ? "h-4 w-4" : "h-5 w-5")} aria-hidden />
            <span>{orientation === "bottom" ? shortLabel : label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
