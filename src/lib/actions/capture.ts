"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type {
  LogEnergy,
  NoteType,
  ResourceType,
  StorageMode,
  TaskPriority,
  TaskStatus,
} from "@/lib/domain"

export type CapturePayload = {
  type: "task" | "note" | "resource" | "decision";
  title: string;
  // Dynamic Fields
  status?: TaskStatus;
  priority?: TaskPriority;
  energy?: LogEnergy;
  estimatedMinutes?: number;
  noteType?: NoteType;
  storageMode?: StorageMode;
  resourceType?: ResourceType;
  resourceLocation?: string;
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
          type: data.noteType || "plain",
          content: "" // Draft is empty by default
        });
        if (noteErr) throw noteErr;
        break;

      case "resource":
        if (!data.resourceLocation?.trim()) {
          throw new Error("Resource location is required.");
        }

        const { error: resErr } = await supabase.from("resources").insert({
           user_id: userId,
           title: data.title,
           storage_mode: data.storageMode || "external",
           type: data.resourceType || "link",
           external_url: data.storageMode === "external" ? data.resourceLocation : null,
           internal_path: data.storageMode === "internal" ? data.resourceLocation : null
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
    
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown capture error";
    console.error("Capture Error:", message);
    return { success: false, error: message };
  }
}
