import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { onboardingSchema } from "@/lib/validations";
import { toE164Pakistan } from "@/lib/constants";
import type { OnboardingState } from "@/lib/types/form-states";
import type { User } from "@supabase/supabase-js";
import { revalidateProfileAffected } from "@/lib/services/revalidate-tags";

export async function completeOnboardingForUser(user: User, formData: FormData): Promise<OnboardingState> {
  const supabase = await createClient();

  const raw = {
    full_name: formData.get("full_name"),
    cnic: formData.get("cnic"),
    role: formData.get("role"),
    gender: formData.get("gender"),
    vehicle_make_model: formData.get("vehicle_make_model") || "",
    vehicle_color: formData.get("vehicle_color") || "",
    vehicle_plate: formData.get("vehicle_plate") || "",
    emergency_contact_phone: ((formData.get("emergency_contact_phone") as string) || "").trim(),
  };

  const parsed = onboardingSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message || "Invalid form" };
  }

  const d = parsed.data;

  const { error: pErr } = await supabase
    .from("profiles")
    .update({
      full_name: d.full_name,
      cnic: d.cnic,
      role: d.role,
      gender: d.gender,
      phone: user.phone ?? undefined,
      emergency_contact_phone: toE164Pakistan(d.emergency_contact_phone),
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (pErr) {
    console.error(pErr);
    return { ok: false, message: pErr.message };
  }

  if (d.role === "driver" || d.role === "both") {
    const { error: vErr } = await supabase.from("vehicles").insert({
      driver_id: user.id,
      make_model: d.vehicle_make_model!,
      color: d.vehicle_color!,
      number_plate: d.vehicle_plate!,
      total_seats: 4,
    });
    if (vErr) {
      console.error(vErr);
      return { ok: false, message: vErr.message };
    }
  }

  revalidateProfileAffected(user.id);
  revalidatePath("/", "layout");
  return { ok: true };
}
