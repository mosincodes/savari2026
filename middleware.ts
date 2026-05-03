import { NextResponse } from "next/server";

/**
 * Edge-only noop middleware.
 *
 * Vercel loads `runtime: "nodejs"` middleware via a CJS path, while Next emits
 * ESM `middleware.js` → "Cannot use import statement outside a module".
 * Supabase in middleware also fails on Edge (unsupported realtime/node deps).
 *
 * Auth redirects: `requireOnboardedProfile` / `requireAdminAccess` / `requireUser`.
 * Sessions: Server Components / route handlers call `createClient()` from `@/lib/supabase/server`.
 *
 * Matcher stays explicit path-to-regexp‑safe routes (avoid ColonToken).
 */
export function middleware() {
  return NextResponse.next();
}

export const config = {
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
  ],
};
