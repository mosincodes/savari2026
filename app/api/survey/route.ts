import { ValidationApiError } from "@/lib/api-error";
import { jsonCreated, runApi } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import { surveySubmitBodySchema } from "@/lib/validations";

/** Anonymous commuter survey persistence (runs from public/survey.html). */
export async function POST(request: Request) {
  return runApi(async () => {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new ValidationApiError("Invalid JSON body");
    }
    const parsed = surveySubmitBodySchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationApiError(parsed.error.issues[0]?.message ?? "Invalid payload");
    }

    const supabase = await createClient();
    const { error } = await supabase.from("survey_responses").insert({
      contact: parsed.data.contact.trim(),
      payload: parsed.data.answers as Record<string, unknown>,
    });
    if (error) {
      console.error("[survey]", error.message);
      throw new ValidationApiError("Could not save survey. Try again later.");
    }

    return jsonCreated({ saved: true });
  });
}
