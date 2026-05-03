import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

/**
 * Middleware runs only on navigations/HTML — avoids matching static assets without
 * non-capture groups `(?:...)`, which can break newer path-to-regexp parsers.
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
