import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Middleware on Edge Runtime cannot use Node.js APIs (like @supabase/ssr)
  // Session updates will be handled at the layout level instead
  return undefined;
}

export const config = {
  matcher: [
    "/((?!_next|_vercel|favicon\\.ico).*)",
  ],
};
