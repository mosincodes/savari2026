/**
 * Middleware must avoid importing local modules via `@/…` unless fully bundled —
 * Vercel’s Node middleware entry can emit raw ESM with unresolved aliases.
 * Keep all handler logic here; deps are only `next/server` + `@supabase/ssr`.
 */
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  const isProtectedApp =
    path.startsWith("/dashboard") ||
    path.startsWith("/rides") ||
    path.startsWith("/bookings") ||
    path.startsWith("/profile") ||
    path.startsWith("/onboarding");

  if (isProtectedApp && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", path);
    return NextResponse.redirect(redirectUrl);
  }

  if (path.startsWith("/admin") && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", path);
    return NextResponse.redirect(redirectUrl);
  }

  if (path.startsWith("/admin") && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    const adminIds = (process.env.ADMIN_USER_IDS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const isAdmin = profile?.is_admin === true || adminIds.includes(user.id);

    if (!isAdmin) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/";
      return NextResponse.redirect(redirectUrl);
    }
  }

  return supabaseResponse;
}

/** Node middleware (Supabase is not Edge-safe). Matchers avoid ColonToken-prone regex. */
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
