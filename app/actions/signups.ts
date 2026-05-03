"use server";

import type { SignupActionState as ActionState } from "@/lib/types/form-states";
import {
  submitDriverSignupFromForm,
  submitPassengerSignupFromForm,
} from "@/lib/services/signups-service";

export type { SignupActionState as ActionState } from "@/lib/types/form-states";

export async function submitDriverSignup(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  return submitDriverSignupFromForm(_prev, formData);
}

export async function submitPassengerSignup(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  return submitPassengerSignupFromForm(_prev, formData);
}
