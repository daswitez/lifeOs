"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type CapturePayload = {
  type: "task" | "note" | "resource" | "decision";
  title: string;
  // Dynamic Fields
  status?: string;
  priority?: string;
  energy?: string;
  estimatedMinutes?: number;
  noteType?: string;
  storageMode?: string;
  resourceType?: string;
  expectedOutcome?: string;
}

export async function captureEntityToDB(data: CapturePayload) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Unauthorized to capture data.");
  }

  const userId = user.id;

  try {
    switch (data.type) {
      case "task":
        const { error: taskErr } = await supabase.from("tasks").insert({
          user_id: userId,
          title: data.title,
          status: data.status || "inbox",
          priority: data.priority || "medium",
          energy_required: data.energy || "low",
          estimated_minutes: data.estimatedMinutes || null
        });
        if (taskErr) throw taskErr;
        break;

      case "note":
        const { error: noteErr } = await supabase.from("notes").insert({
          user_id: userId,
          title: data.title,
          type: data.noteType || "fleeting",
          content: "" // Draft is empty by default
        });
        if (noteErr) throw noteErr;
        break;

      case "resource":
        const { error: resErr } = await supabase.from("resources").insert({
           user_id: userId,
           title: data.title,
           storage_mode: data.storageMode || "external",
           type: data.resourceType || "link",
           external_url: data.storageMode === "external" ? "https://example.com" : null,
           internal_path: data.storageMode === "internal" ? "/placeholder" : null
        });
        if (resErr) throw resErr;
        break;

      case "decision":
        const { error: decErr } = await supabase.from("decisions").insert({
          user_id: userId,
          title: data.title,
          expected_outcome: data.expectedOutcome,
          status: "open"
        });
        if (decErr) throw decErr;
        break;
    }

    // Refresh context
    revalidatePath("/", "layout");
    return { success: true };
    
  } catch (error: any) {
    console.error("Capture Error:", error.message);
    return { success: false, error: error.message };
  }
}
