'use server'

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type {
  LogEnergy,
  NoteType,
  ResourceType,
  StorageMode,
  TaskPriority,
  TaskStatus,
} from "@/lib/domain";

async function getAuthedContext() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Unauthorized");
  }

  return { supabase, userId: user.id };
}

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function optionalText(formData: FormData, key: string) {
  const value = text(formData, key);
  return value || null;
}

function optionalNumber(formData: FormData, key: string) {
  const value = text(formData, key);
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function optionalTimestampFromDate(formData: FormData, key: string) {
  const value = text(formData, key);
  return value ? new Date(`${value}T12:00:00.000Z`).toISOString() : null;
}

function revalidate(paths: string[]) {
  for (const path of paths) {
    revalidatePath(path);
  }
}

export async function createTaskAction(formData: FormData) {
  const { supabase, userId } = await getAuthedContext();
  const title = text(formData, "title");

  if (!title) {
    throw new Error("Task title is required.");
  }

  const payload = {
    user_id: userId,
    title,
    status: (text(formData, "status") || "inbox") as TaskStatus,
    priority: (text(formData, "priority") || "medium") as TaskPriority,
    energy_required: (text(formData, "energy") || null) as LogEnergy | null,
    estimated_minutes: optionalNumber(formData, "estimated_minutes"),
    due_date: optionalTimestampFromDate(formData, "due_date"),
    project_id: optionalText(formData, "project_id"),
  };

  const { error } = await supabase.from("tasks").insert(payload);
  if (error) throw new Error(error.message);

  revalidate(["/", "/actions", "/inbox", "/projects"]);
}

export async function updateTaskStatusAction(formData: FormData) {
  const { supabase } = await getAuthedContext();
  const id = text(formData, "id");
  const status = text(formData, "status") as TaskStatus;

  if (!id || !status) {
    throw new Error("Task update is incomplete.");
  }

  const patch: { status: TaskStatus; completed_at?: string | null } = { status };
  if (status === "done") {
    patch.completed_at = new Date().toISOString();
  } else {
    patch.completed_at = null;
  }

  const { error } = await supabase.from("tasks").update(patch).eq("id", id);
  if (error) throw new Error(error.message);

  revalidate(["/", "/actions", "/inbox", "/projects"]);
}

export async function updateTaskAction(formData: FormData) {
  const { supabase } = await getAuthedContext();
  const id = text(formData, "id");
  if (!id) throw new Error("Task ID is required.");

  const title = text(formData, "title");
  if (!title) throw new Error("Task title is required.");

  const status = text(formData, "status") as TaskStatus;

  const patch: any = {
    title,
    status,
    priority: text(formData, "priority") as TaskPriority,
    project_id: optionalText(formData, "project_id"),
    due_date: optionalTimestampFromDate(formData, "due_date"),
  };

  if (status === "done") {
    patch.completed_at = new Date().toISOString();
  } else {
    patch.completed_at = null;
  }

  const { error } = await supabase.from("tasks").update(patch).eq("id", id);
  if (error) throw new Error(error.message);

  revalidate(["/", "/actions", "/inbox", "/projects"]);
}

export async function createProjectAction(formData: FormData) {
  const { supabase, userId } = await getAuthedContext();
  const title = text(formData, "title");

  if (!title) {
    throw new Error("Project title is required.");
  }

  const { error } = await supabase.from("projects").insert({
    user_id: userId,
    title,
    description: optionalText(formData, "description"),
    status: text(formData, "status") || "active",
    priority: text(formData, "priority") || "medium",
    target_date: optionalText(formData, "target_date"),
    area_id: optionalText(formData, "area_id"),
  });

  if (error) throw new Error(error.message);

  revalidate(["/", "/projects"]);
}

export async function updateProjectAction(formData: FormData) {
  const { supabase, userId } = await getAuthedContext();
  const id = text(formData, "id");
  const title = text(formData, "title");
  
  if (!id || !title) throw new Error("Project ID and title are required.");

  const patch = {
    title,
    description: optionalText(formData, "description"),
    status: text(formData, "status") || "active",
    priority: text(formData, "priority") || "medium",
    target_date: optionalText(formData, "target_date"),
    area_id: optionalText(formData, "area_id"),
  };

  const { error } = await supabase.from("projects").update(patch).eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);

  revalidate(["/", "/projects", "/actions", "/inbox"]);
}

export async function createNoteAction(formData: FormData) {
  const { supabase, userId } = await getAuthedContext();
  const title = text(formData, "title");

  if (!title) {
    throw new Error("Note title is required.");
  }

  const { error } = await supabase.from("notes").insert({
    user_id: userId,
    title,
    content: text(formData, "content"),
    summary: optionalText(formData, "summary"),
    type: (text(formData, "type") || "plain") as NoteType,
    project_id: optionalText(formData, "project_id"),
  });

  if (error) throw new Error(error.message);

  revalidate(["/", "/knowledge", "/inbox"]);
}

export async function createResourceAction(formData: FormData) {
  const { supabase, userId } = await getAuthedContext();
  const title = text(formData, "title");
  const storageMode = (text(formData, "storage_mode") || "external") as StorageMode;
  const location = text(formData, "location");

  if (!title) {
    throw new Error("Resource title is required.");
  }

  if (!location) {
    throw new Error("Resource location is required.");
  }

  const { error } = await supabase.from("resources").insert({
    user_id: userId,
    title,
    description: optionalText(formData, "description"),
    type: (text(formData, "type") || "link") as ResourceType,
    storage_mode: storageMode,
    external_url: storageMode === "external" ? location : null,
    internal_path: storageMode === "internal" ? location : null,
  });

  if (error) throw new Error(error.message);

  revalidate(["/", "/resources", "/inbox"]);
}

export async function createDecisionAction(formData: FormData) {
  const { supabase, userId } = await getAuthedContext();
  const title = text(formData, "title");

  if (!title) {
    throw new Error("Decision title is required.");
  }

  const { error } = await supabase.from("decisions").insert({
    user_id: userId,
    title,
    context: optionalText(formData, "context"),
    expected_outcome: optionalText(formData, "expected_outcome"),
    review_date: optionalText(formData, "review_date"),
    status: "open",
  });

  if (error) throw new Error(error.message);

  revalidate(["/", "/decisions", "/inbox"]);
}

export async function upsertDailyLogAction(formData: FormData) {
  const { supabase, userId } = await getAuthedContext();
  const today = new Date().toISOString().slice(0, 10);

  const { error } = await supabase.from("daily_logs").upsert(
    {
      user_id: userId,
      log_date: today,
      mood: optionalNumber(formData, "mood"),
      focus_score: optionalNumber(formData, "focus_score"),
      wins: optionalText(formData, "wins"),
      reflections: optionalText(formData, "reflections"),
      energy: (text(formData, "energy") || null) as LogEnergy | null,
    },
    {
      onConflict: "user_id,log_date",
    }
  );

  if (error) throw new Error(error.message);

  revalidate(["/", "/review"]);
}

export async function createAreaAction(formData: FormData) {
  const { supabase, userId } = await getAuthedContext();
  const name = text(formData, "name");

  if (!name) {
    throw new Error("Area name is required.");
  }

  const { error } = await supabase.from("areas").insert({
    user_id: userId,
    name,
    description: optionalText(formData, "description"),
    type: (text(formData, "type") || "other") as import("@/lib/domain").AreaType,
    color: optionalText(formData, "color"),
    icon: optionalText(formData, "icon"),
  });

  if (error) throw new Error(error.message);

  revalidate(["/", "/areas", "/projects", "/inbox"]);
}

export async function processInboxItemAction(formData: FormData) {
  const { supabase, userId } = await getAuthedContext();
  const id = text(formData, "id");
  const kind = text(formData, "kind");
  const actionType = text(formData, "actionType"); // 'activate' | 'archive'

  if (!id || !kind || !actionType) {
    throw new Error("Missing processing parameters required");
  }

  let error = null;

  if (actionType === "activate") {
    if (kind === "task") {
      const { error: err } = await supabase.from("tasks").update({ status: "todo" }).eq("id", id).eq("user_id", userId);
      error = err;
    } else if (kind === "note") {
      // Activating an idea note makes it an atomic note for active knowledge
      const { error: err } = await supabase.from("notes").update({ type: "atomic" }).eq("id", id).eq("user_id", userId);
      error = err;
    }
  } else if (actionType === "archive") {
    if (kind === "task") {
      const { error: err } = await supabase.from("tasks").update({ status: "archived" }).eq("id", id).eq("user_id", userId);
      error = err;
    } else if (kind === "note") {
      const { error: err } = await supabase.from("notes").update({ is_archived: true }).eq("id", id).eq("user_id", userId);
      error = err;
    } else if (kind === "resource") {
      const { error: err } = await supabase.from("resources").update({ is_archived: true }).eq("id", id).eq("user_id", userId);
      error = err;
    } else if (kind === "decision") {
      const { error: err } = await supabase.from("decisions").update({ status: "superseded" }).eq("id", id).eq("user_id", userId);
      error = err;
    }
  }

  if (error) throw new Error(error.message);

  revalidate(["/", "/inbox", "/actions", "/knowledge", "/resources", "/decisions"]);
}
