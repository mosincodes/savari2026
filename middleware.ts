import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/** Supabase client pulls `@supabase/realtime-js` etc., which uses Node APIs — incompatible with Edge. */
export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  /** Omit custom regex here — avoids path-to-regexp / Vercel ColonToken quirks; Node runtime allows full Supabase client. */
  runtime: "nodejs",
};
