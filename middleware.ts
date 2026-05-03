import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Edge Runtime middleware - just pass through requests
  // Session management is handled at the layout level
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|_vercel|favicon\\.ico).*)",
  ],
};
