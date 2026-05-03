"use server";

import {
  createSignupMatchFromForm,
  sendMatchSmsForAdmin,
  updateMatchStatusForAdmin,
} from "@/lib/services/admin-service";

export async function createSignupMatch(formData: FormData): Promise<void> {
  await createSignupMatchFromForm(formData);
}

export async function updateMatchStatus(matchId: string, status: string) {
  return updateMatchStatusForAdmin(matchId, status);
}

export async function setMatchStatusFromForm(formData: FormData): Promise<void> {
  const id = formData.get("id") as string;
  const status = formData.get("status") as string;
  if (!id || !status) return;
  await updateMatchStatusForAdmin(id, status);
}

export async function sendMatchSms(toPhoneE164: string, body: string) {
  return sendMatchSmsForAdmin(toPhoneE164, body);
}
