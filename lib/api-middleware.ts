import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";
import { ForbiddenError, UnauthorizedError, ValidationApiError } from "@/lib/api-error";
import type { ProfileRow } from "@/lib/require-profile";
import { isPrivilegedAdmin } from "@/lib/auth/admin-policy";

export type AuthenticatedSession = {
  user: User;
  supabase: Awaited<ReturnType<typeof createClient>>;
};

export async function getSessionOptional(): Promise<AuthenticatedSession | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return { user, supabase };
}

export async function requireSession(): Promise<AuthenticatedSession> {
  const session = await getSessionOptional();
  if (!session) throw new UnauthorizedError();
  return session;
}

export async function loadProfileRow(
  supabase: AuthenticatedSession["supabase"],
  userId: string,
): Promise<ProfileRow | null> {
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
  return data ? (data as ProfileRow) : null;
}

export async function requireOnboardedSession(): Promise<
  AuthenticatedSession & {
    profile: ProfileRow;
  }
> {
  const { user, supabase } = await requireSession();
  const profile = await loadProfileRow(supabase, user.id);
  if (!profile?.onboarding_completed) {
    throw new ForbiddenError("Complete onboarding before using this API.");
  }
  return { user, supabase, profile };
}

export async function requireAdminSession(userId: string): Promise<void> {
  const ok = await isPrivilegedAdmin(userId);
  if (!ok) throw new ForbiddenError("Admin only.");
}

export async function readJsonBody(request: NextRequest): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new ValidationApiError("Invalid JSON body.");
  }
}
