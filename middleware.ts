import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Supabase needs Node middleware (full client is not Edge-safe on Vercel).
 * Matchers below are literal path prefixes with optional `:path*` only — no
 * regex parentheses, so path-to-regexp on Vercel does not trip over ColonToken.
 */
export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  runtime: "nodejs",
  matcher: [
    "/",
    "/login",
    "/survey",
    "/verify",
    "/join/:path*",
    "/onboarding/:path*",
    "/dashboard/:path*",
    "/rides/:path*",
    "/bookings/:path*",
    "/profile/:path*",
    "/admin/:path*",
    "/admin",
    "/auth/:path*",
    "/api/:path*",
  ],
};
