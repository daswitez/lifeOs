'use server'

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type {
  LogEnergy,
  NoteType,
  RelationKind,
  ResourceType,
  StorageMode,
  TaskPriority,
  TaskStatus,
} from "@/lib/domain";

type InboxKind = "task" | "note" | "resource" | "decision";
type ResourceLinkTarget = "project" | "task" | "note" | "decision";
const RESOURCE_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "lifeos-resources";

type TaskInboxSource = {
  kind: "task";
  id: string;
  created_at: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  project_id: string | null;
};

type NoteInboxSource = {
  kind: "note";
  id: string;
  created_at: string;
  title: string;
  content: string;
  summary: string | null;
  type: NoteType;
  project_id: string | null;
};

type ResourceInboxSource = {
  kind: "resource";
  id: string;
  created_at: string;
  title: string;
  description: string | null;
  type: ResourceType;
  storage_mode: StorageMode;
  external_url: string | null;
  internal_path: string | null;
};

type DecisionInboxSource = {
  kind: "decision";
  id: string;
  created_at: string;
  title: string;
  context: string | null;
  expected_outcome: string | null;
  chosen_option: string | null;
  reasoning: string | null;
  review_date: string | null;
  project_id: string | null;
};

type InboxSourceRecord =
  | TaskInboxSource
  | NoteInboxSource
  | ResourceInboxSource
  | DecisionInboxSource;

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

function boolText(formData: FormData, key: string) {
  return text(formData, key) === "true";
}

function taskRecurrenceFromForm(formData: FormData) {
  const preset = text(formData, "recurrence_preset");

  if (!preset || preset === "none") {
    return { isRecurring: false, recurrenceRule: null as string | null };
  }

  if (preset === "custom") {
    const customRule = optionalText(formData, "recurrence_custom");
    return {
      isRecurring: Boolean(customRule),
      recurrenceRule: customRule,
    };
  }

  return {
    isRecurring: true,
    recurrenceRule: preset,
  };
}

function supportedRecurrenceRule(value: string | null | undefined) {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) return null;

  if (["daily", "weekdays", "weekly", "monthly"].includes(normalized)) {
    return normalized;
  }

  return null;
}

function advanceRecurringTimestamp(timestamp: string | null, rule: string) {
  if (!timestamp) return null;

  const next = new Date(timestamp);
  if (Number.isNaN(next.getTime())) return null;

  switch (rule) {
    case "daily":
      next.setUTCDate(next.getUTCDate() + 1);
      break;
    case "weekdays":
      do {
        next.setUTCDate(next.getUTCDate() + 1);
      } while ([0, 6].includes(next.getUTCDay()));
      break;
    case "weekly":
      next.setUTCDate(next.getUTCDate() + 7);
      break;
    case "monthly":
      next.setUTCMonth(next.getUTCMonth() + 1);
      break;
    default:
      return null;
  }

  return next.toISOString();
}

function slugifyFilePart(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

type RecurringTaskSource = {
  title: string;
  description: string | null;
  priority: TaskPriority;
  energy_required: LogEnergy | null;
  due_date: string | null;
  scheduled_for: string | null;
  estimated_minutes: number | null;
  project_id: string | null;
  parent_task_id: string | null;
  is_recurring: boolean | null;
  recurrence_rule: string | null;
};

async function createNextRecurringTask(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  task: RecurringTaskSource
) {
  if (!task.is_recurring) return;

  const rule = supportedRecurrenceRule(task.recurrence_rule);
  if (!rule) return;

  const { error } = await supabase.from("tasks").insert({
    user_id: userId,
    title: task.title,
    description: task.description,
    status: "todo" satisfies TaskStatus,
    priority: task.priority,
    energy_required: task.energy_required,
    due_date: advanceRecurringTimestamp(task.due_date, rule),
    scheduled_for: advanceRecurringTimestamp(task.scheduled_for, rule),
    estimated_minutes: task.estimated_minutes,
    actual_minutes: null,
    project_id: task.project_id,
    parent_task_id: task.parent_task_id,
    is_recurring: true,
    recurrence_rule: task.recurrence_rule,
  });

  if (error) throw new Error(error.message);
}

function inferResourceTypeFromFile(fileName: string, mimeType: string): ResourceType {
  const lowerName = fileName.toLowerCase();
  const lowerMime = mimeType.toLowerCase();

  if (lowerMime.startsWith("image/")) return "image";
  if (lowerMime.startsWith("video/")) return "video";
  if (lowerMime.startsWith("audio/")) return "audio";
  if (lowerMime === "application/pdf" || lowerName.endsWith(".pdf")) return "pdf";
  return "file";
}

function inferPreviewStatus(storageMode: StorageMode, type: ResourceType) {
  if (storageMode === "internal" && ["image", "pdf", "video", "audio"].includes(type)) {
    return "ready";
  }

  return "none";
}

function revalidate(paths: string[]) {
  for (const path of paths) {
    revalidatePath(path);
  }
}

function detailPath(kind: InboxKind, id: string) {
  switch (kind) {
    case "note":
      return `/knowledge/${id}`;
    case "resource":
      return `/resources/${id}`;
    case "decision":
      return `/decisions/${id}`;
    case "task":
      return "/actions";
  }
}

function commonRevalidatePaths() {
  return ["/", "/inbox", "/actions", "/knowledge", "/resources", "/decisions", "/projects", "/review"];
}

function inboxOriginMetadata(source: InboxSourceRecord) {
  return {
    captured_from_kind: source.kind,
    captured_from_id: source.id,
    captured_at: source.created_at,
  };
}

async function getInboxSourceRecord(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  kind: InboxKind,
  id: string
): Promise<InboxSourceRecord> {
  if (kind === "task") {
    const { data, error } = await supabase
      .from("tasks")
      .select("id, created_at, title, description, status, priority, due_date, project_id")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error || !data) throw new Error("Task not found.");
    return { kind, ...data } as TaskInboxSource;
  }

  if (kind === "note") {
    const { data, error } = await supabase
      .from("notes")
      .select("id, created_at, title, content, summary, type, project_id")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error || !data) throw new Error("Note not found.");
    return { kind, ...data } as NoteInboxSource;
  }

  if (kind === "resource") {
    const { data, error } = await supabase
      .from("resources")
      .select("id, created_at, title, description, type, storage_mode, external_url, internal_path")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error || !data) throw new Error("Resource not found.");
    return { kind, ...data } as ResourceInboxSource;
  }

  const { data, error } = await supabase
    .from("decisions")
    .select("id, created_at, title, context, expected_outcome, chosen_option, reasoning, review_date, project_id")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error || !data) throw new Error("Decision not found.");
  return { kind, ...data } as DecisionInboxSource;
}

async function archiveInboxSource(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  source: InboxSourceRecord
) {
  if (source.kind === "task") {
    const { error } = await supabase
      .from("tasks")
      .update({ status: "archived" })
      .eq("id", source.id)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return;
  }

  if (source.kind === "note") {
    const { error } = await supabase
      .from("notes")
      .update({ is_archived: true })
      .eq("id", source.id)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return;
  }

  if (source.kind === "resource") {
    const { error } = await supabase
      .from("resources")
      .update({ is_archived: true })
      .eq("id", source.id)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return;
  }

  const { error } = await supabase
    .from("decisions")
    .update({ status: "superseded" })
    .eq("id", source.id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
}

function inferTaskDescription(source: InboxSourceRecord) {
  switch (source.kind) {
    case "task":
      return source.description;
    case "note":
      return source.summary ?? source.content ?? null;
    case "resource":
      return source.description ?? source.external_url ?? source.internal_path;
    case "decision":
      return source.context ?? source.expected_outcome;
  }
}

function inferNoteContent(source: InboxSourceRecord) {
  switch (source.kind) {
    case "task":
      return source.description ?? "";
    case "note":
      return source.content;
    case "resource":
      return source.description ?? source.external_url ?? source.internal_path ?? "";
    case "decision":
      return [source.context, source.reasoning, source.expected_outcome].filter(Boolean).join("\n\n");
  }
}

export async function createTaskAction(formData: FormData) {
  const { supabase, userId } = await getAuthedContext();
  const title = text(formData, "title");
  const recurrence = taskRecurrenceFromForm(formData);

  if (!title) {
    throw new Error("Task title is required.");
  }

  const payload = {
    user_id: userId,
    title,
    description: optionalText(formData, "description"),
    status: (text(formData, "status") || "inbox") as TaskStatus,
    priority: (text(formData, "priority") || "medium") as TaskPriority,
    energy_required: (text(formData, "energy") || null) as LogEnergy | null,
    estimated_minutes: optionalNumber(formData, "estimated_minutes"),
    actual_minutes: optionalNumber(formData, "actual_minutes"),
    due_date: optionalTimestampFromDate(formData, "due_date"),
    scheduled_for: optionalTimestampFromDate(formData, "scheduled_for"),
    project_id: optionalText(formData, "project_id"),
    parent_task_id: optionalText(formData, "parent_task_id"),
    is_recurring: recurrence.isRecurring,
    recurrence_rule: recurrence.recurrenceRule,
  };

  const { error } = await supabase.from("tasks").insert(payload);
  if (error) throw new Error(error.message);

  revalidate(["/", "/actions", "/inbox", "/projects"]);
}

export async function updateTaskStatusAction(formData: FormData) {
  const { supabase, userId } = await getAuthedContext();
  const id = text(formData, "id");
  const status = text(formData, "status") as TaskStatus;

  if (!id || !status) {
    throw new Error("Task update is incomplete.");
  }

  const { data: currentTask, error: currentTaskError } = await supabase
    .from("tasks")
    .select("title, description, status, priority, energy_required, due_date, scheduled_for, estimated_minutes, project_id, parent_task_id, is_recurring, recurrence_rule")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (currentTaskError || !currentTask) throw new Error(currentTaskError?.message ?? "Task not found.");

  const patch: { status: TaskStatus; completed_at?: string | null } = { status };
  if (status === "done") {
    patch.completed_at = new Date().toISOString();
  } else {
    patch.completed_at = null;
  }

  const { error } = await supabase.from("tasks").update(patch).eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);

  if (status === "done" && currentTask.status !== "done") {
    await createNextRecurringTask(supabase, userId, currentTask as RecurringTaskSource);
  }

  revalidate(["/", "/actions", "/inbox", "/projects"]);
}

export async function updateTaskAction(formData: FormData) {
  const { supabase, userId } = await getAuthedContext();
  const id = text(formData, "id");
  if (!id) throw new Error("Task ID is required.");

  const title = text(formData, "title");
  if (!title) throw new Error("Task title is required.");

  const status = text(formData, "status") as TaskStatus;
  const recurrence = taskRecurrenceFromForm(formData);

  const { data: currentTask, error: currentTaskError } = await supabase
    .from("tasks")
    .select("title, description, status, priority, energy_required, due_date, scheduled_for, estimated_minutes, project_id, parent_task_id, is_recurring, recurrence_rule")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (currentTaskError || !currentTask) {
    throw new Error(currentTaskError?.message ?? "Task not found.");
  }

  const patch: {
    title: string;
    description: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    energy_required: LogEnergy | null;
    project_id: string | null;
    parent_task_id: string | null;
    due_date: string | null;
    scheduled_for: string | null;
    estimated_minutes: number | null;
    actual_minutes: number | null;
    is_recurring: boolean;
    recurrence_rule: string | null;
    completed_at?: string | null;
  } = {
    title,
    description: optionalText(formData, "description"),
    status,
    priority: text(formData, "priority") as TaskPriority,
    energy_required: (text(formData, "energy") || null) as LogEnergy | null,
    project_id: optionalText(formData, "project_id"),
    parent_task_id: optionalText(formData, "parent_task_id"),
    due_date: optionalTimestampFromDate(formData, "due_date"),
    scheduled_for: optionalTimestampFromDate(formData, "scheduled_for"),
    estimated_minutes: optionalNumber(formData, "estimated_minutes"),
    actual_minutes: optionalNumber(formData, "actual_minutes"),
    is_recurring: recurrence.isRecurring,
    recurrence_rule: recurrence.recurrenceRule,
  };

  if (patch.parent_task_id === id) {
    throw new Error("A task cannot be its own parent.");
  }

  if (status === "done") {
    patch.completed_at = new Date().toISOString();
  } else {
    patch.completed_at = null;
  }

  const { error } = await supabase.from("tasks").update(patch).eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);

  if (status === "done" && currentTask.status !== "done") {
    await createNextRecurringTask(supabase, userId, {
      ...currentTask,
      ...patch,
    } as RecurringTaskSource);
  }

  revalidate(["/", "/actions", "/inbox", "/projects"]);
}

export async function logTaskTimeAction(formData: FormData) {
  const { supabase, userId } = await getAuthedContext();
  const id = text(formData, "id");
  const minutes = optionalNumber(formData, "minutes");

  if (!id || !minutes || minutes <= 0) {
    throw new Error("Task ID and minutes are required.");
  }

  const { data: currentTask, error: currentTaskError } = await supabase
    .from("tasks")
    .select("actual_minutes")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (currentTaskError || !currentTask) {
    throw new Error(currentTaskError?.message ?? "Task not found.");
  }

  const { error } = await supabase
    .from("tasks")
    .update({ actual_minutes: (currentTask.actual_minutes ?? 0) + minutes })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);

  revalidate(["/", "/actions", "/projects", "/review"]);
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

export async function updateNoteAction(formData: FormData) {
  const { supabase, userId } = await getAuthedContext();
  const id = text(formData, "id");
  const title = text(formData, "title");

  if (!id || !title) {
    throw new Error("Note ID and title are required.");
  }

  const patch = {
    title,
    content: text(formData, "content"),
    summary: optionalText(formData, "summary"),
    type: (text(formData, "type") || "plain") as NoteType,
    project_id: optionalText(formData, "project_id"),
    is_archived: boolText(formData, "is_archived"),
  };

  const { error } = await supabase.from("notes").update(patch).eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);

  revalidate([...commonRevalidatePaths(), detailPath("note", id)]);
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

export async function createUploadedResourceAction(formData: FormData) {
  const { supabase, userId } = await getAuthedContext();
  const fileEntry = formData.get("file");
  const titleInput = text(formData, "title");
  const description = optionalText(formData, "description");

  if (!(fileEntry instanceof File) || fileEntry.size === 0) {
    throw new Error("A file is required.");
  }

  const originalName = fileEntry.name || "uploaded-file";
  const title = titleInput || originalName;
  const resourceType = inferResourceTypeFromFile(originalName, fileEntry.type || "");
  const ext = originalName.includes(".") ? originalName.split(".").pop() : "";
  const baseName = ext ? originalName.slice(0, -(ext.length + 1)) : originalName;
  const path = [
    userId,
    new Date().toISOString().slice(0, 10),
    `${Date.now()}-${slugifyFilePart(baseName)}${ext ? `.${slugifyFilePart(ext)}` : ""}`,
  ].join("/");

  const { error: uploadError } = await supabase.storage.from(RESOURCE_BUCKET).upload(path, fileEntry, {
    contentType: fileEntry.type || undefined,
    upsert: false,
  });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { error } = await supabase.from("resources").insert({
    user_id: userId,
    title,
    description,
    type: resourceType,
    storage_mode: "internal",
    source_provider: "local_upload",
    internal_path: path,
    mime_type: fileEntry.type || null,
    file_size_bytes: fileEntry.size,
    preview_status: inferPreviewStatus("internal", resourceType),
  });

  if (error) throw new Error(error.message);

  revalidate(["/", "/resources", "/inbox"]);
}

export async function updateResourceAction(formData: FormData) {
  const { supabase, userId } = await getAuthedContext();
  const id = text(formData, "id");
  const title = text(formData, "title");
  const storageMode = (text(formData, "storage_mode") || "external") as StorageMode;
  const location = text(formData, "location");

  if (!id || !title) {
    throw new Error("Resource ID and title are required.");
  }

  if (!location) {
    throw new Error("Resource location is required.");
  }

  const patch = {
    title,
    description: optionalText(formData, "description"),
    type: (text(formData, "type") || "link") as ResourceType,
    storage_mode: storageMode,
    external_url: storageMode === "external" ? location : null,
    internal_path: storageMode === "internal" ? location : null,
    is_archived: boolText(formData, "is_archived"),
  };

  const { error } = await supabase.from("resources").update(patch).eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);

  revalidate([...commonRevalidatePaths(), detailPath("resource", id)]);
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

export async function updateDecisionAction(formData: FormData) {
  const { supabase, userId } = await getAuthedContext();
  const id = text(formData, "id");
  const title = text(formData, "title");

  if (!id || !title) {
    throw new Error("Decision ID and title are required.");
  }

  const patch = {
    title,
    context: optionalText(formData, "context"),
    expected_outcome: optionalText(formData, "expected_outcome"),
    chosen_option: optionalText(formData, "chosen_option"),
    reasoning: optionalText(formData, "reasoning"),
    review_date: optionalText(formData, "review_date"),
    project_id: optionalText(formData, "project_id"),
    status: text(formData, "status") || "open",
  };

  const { error } = await supabase.from("decisions").update(patch).eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);

  revalidate([...commonRevalidatePaths(), detailPath("decision", id)]);
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

function currentWeekRange() {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const offset = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - offset);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return {
    weekStart: start.toISOString().slice(0, 10),
    weekEnd: end.toISOString().slice(0, 10),
  };
}

export async function upsertWeeklyReviewAction(formData: FormData) {
  const { supabase, userId } = await getAuthedContext();
  const weekStart = text(formData, "week_start");
  const weekEnd = text(formData, "week_end");
  const { weekStart: expectedWeekStart, weekEnd: expectedWeekEnd } = currentWeekRange();

  if (!weekStart || !weekEnd) {
    throw new Error("Weekly review dates are required.");
  }

  if (weekStart !== expectedWeekStart || weekEnd !== expectedWeekEnd) {
    throw new Error("Weekly review dates are out of sync. Refresh and try again.");
  }

  const { data: logs, error: logsError } = await supabase
    .from("daily_logs")
    .select("mood, energy")
    .gte("log_date", weekStart)
    .lte("log_date", weekEnd);

  if (logsError) throw new Error(logsError.message);

  const moodValues = (logs ?? [])
    .map((log) => log.mood)
    .filter((value): value is number => typeof value === "number");

  const energyScale: Record<LogEnergy, number> = {
    very_low: 1,
    low: 2,
    medium: 3,
    high: 4,
    very_high: 5,
  };

  const energyValues = (logs ?? [])
    .map((log) => log.energy)
    .filter((value): value is LogEnergy => typeof value === "string" && value in energyScale)
    .map((value) => energyScale[value]);

  const { error } = await supabase.from("weekly_reviews").upsert(
    {
      user_id: userId,
      week_start: weekStart,
      week_end: weekEnd,
      summary: optionalText(formData, "summary"),
      wins: optionalText(formData, "wins"),
      blockers: optionalText(formData, "blockers"),
      lessons: optionalText(formData, "lessons"),
      next_focus: optionalText(formData, "next_focus"),
      mood_avg:
        moodValues.length > 0
          ? Number((moodValues.reduce((sum, value) => sum + value, 0) / moodValues.length).toFixed(2))
          : null,
      energy_avg:
        energyValues.length > 0
          ? Number((energyValues.reduce((sum, value) => sum + value, 0) / energyValues.length).toFixed(2))
          : null,
    },
    {
      onConflict: "user_id,week_start,week_end",
    }
  );

  if (error) throw new Error(error.message);

  revalidate(["/", "/review"]);
}

export async function updateProfileAction(formData: FormData) {
  const { supabase, userId } = await getAuthedContext();

  const patch = {
    full_name: optionalText(formData, "full_name"),
    username: optionalText(formData, "username"),
    avatar_url: optionalText(formData, "avatar_url"),
    bio: optionalText(formData, "bio"),
    timezone: text(formData, "timezone") || "America/La_Paz",
    locale: text(formData, "locale") || "es",
  };

  const { error } = await supabase.from("profiles").update(patch).eq("id", userId);
  if (error) throw new Error(error.message);

  revalidate(["/", "/profile"]);
}

export async function logoutAction() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
  redirect("/login");
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

export async function clarifyInboxItemAction(formData: FormData) {
  const { supabase, userId } = await getAuthedContext();
  const id = text(formData, "id");
  const sourceKind = text(formData, "source_kind") as InboxKind;
  const targetKind = text(formData, "target_kind") as InboxKind;
  const title = text(formData, "title");

  if (!id || !sourceKind || !targetKind || !title) {
    throw new Error("Inbox clarification is incomplete.");
  }

  const source = await getInboxSourceRecord(supabase, userId, sourceKind, id);

  if (sourceKind === targetKind) {
    if (targetKind === "task") {
      const status = (text(formData, "status") || "todo") as TaskStatus;
      const patch = {
        title,
        description: optionalText(formData, "description") ?? inferTaskDescription(source),
        status,
        priority: (text(formData, "priority") || "medium") as TaskPriority,
        project_id: optionalText(formData, "project_id"),
        due_date: optionalTimestampFromDate(formData, "due_date"),
        completed_at: status === "done" ? new Date().toISOString() : null,
      };

      const { error } = await supabase.from("tasks").update(patch).eq("id", id).eq("user_id", userId);
      if (error) throw new Error(error.message);
    } else if (targetKind === "note") {
      const patch = {
        title,
        summary: optionalText(formData, "summary"),
        content: text(formData, "content"),
        type: (text(formData, "type") || "atomic") as NoteType,
        project_id: optionalText(formData, "project_id"),
      };

      const { error } = await supabase.from("notes").update(patch).eq("id", id).eq("user_id", userId);
      if (error) throw new Error(error.message);
    } else if (targetKind === "resource") {
      const storageMode = (text(formData, "storage_mode") || "external") as StorageMode;
      const location = text(formData, "location");

      if (!location) throw new Error("Resource location is required.");

      const patch = {
        title,
        description: optionalText(formData, "description"),
        type: (text(formData, "type") || "link") as ResourceType,
        storage_mode: storageMode,
        external_url: storageMode === "external" ? location : null,
        internal_path: storageMode === "internal" ? location : null,
      };

      const { error } = await supabase.from("resources").update(patch).eq("id", id).eq("user_id", userId);
      if (error) throw new Error(error.message);
    } else if (targetKind === "decision") {
      const patch = {
        title,
        context: optionalText(formData, "context"),
        expected_outcome: optionalText(formData, "expected_outcome"),
        chosen_option: optionalText(formData, "chosen_option"),
        reasoning: optionalText(formData, "reasoning"),
        review_date: optionalText(formData, "review_date"),
        project_id: optionalText(formData, "project_id"),
        status: "open",
      };

      const { error } = await supabase.from("decisions").update(patch).eq("id", id).eq("user_id", userId);
      if (error) throw new Error(error.message);
    }

    revalidate([...commonRevalidatePaths(), detailPath(targetKind, id)]);
    return;
  }

  if (targetKind === "task") {
    const status = (text(formData, "status") || "todo") as TaskStatus;
    const payload = {
      user_id: userId,
      title,
      description: optionalText(formData, "description") ?? inferTaskDescription(source),
      status,
      priority: (text(formData, "priority") || "medium") as TaskPriority,
      project_id: optionalText(formData, "project_id"),
      due_date: optionalTimestampFromDate(formData, "due_date"),
      created_at: source.created_at,
      completed_at: status === "done" ? new Date().toISOString() : null,
      metadata: inboxOriginMetadata(source),
    };

    const { data, error } = await supabase.from("tasks").insert(payload).select("id").single();
    if (error || !data) throw new Error(error?.message ?? "Could not create task.");

    await archiveInboxSource(supabase, userId, source);
    revalidate([...commonRevalidatePaths(), detailPath("task", data.id)]);
    return;
  }

  if (targetKind === "note") {
    const payload = {
      user_id: userId,
      title,
      content: text(formData, "content") || inferNoteContent(source),
      summary: optionalText(formData, "summary"),
      type: (text(formData, "type") || "atomic") as NoteType,
      project_id: optionalText(formData, "project_id"),
      created_at: source.created_at,
      metadata: inboxOriginMetadata(source),
    };

    const { data, error } = await supabase.from("notes").insert(payload).select("id").single();
    if (error || !data) throw new Error(error?.message ?? "Could not create note.");

    await archiveInboxSource(supabase, userId, source);
    revalidate([...commonRevalidatePaths(), detailPath("note", data.id)]);
    return;
  }

  if (targetKind === "resource") {
    const storageMode = (text(formData, "storage_mode") || "external") as StorageMode;
    const location = text(formData, "location");

    if (!location) throw new Error("Resource location is required.");

    const payload = {
      user_id: userId,
      title,
      description: optionalText(formData, "description"),
      type: (text(formData, "type") || "link") as ResourceType,
      storage_mode: storageMode,
      external_url: storageMode === "external" ? location : null,
      internal_path: storageMode === "internal" ? location : null,
      created_at: source.created_at,
      metadata: inboxOriginMetadata(source),
    };

    const { data, error } = await supabase.from("resources").insert(payload).select("id").single();
    if (error || !data) throw new Error(error?.message ?? "Could not create resource.");

    await archiveInboxSource(supabase, userId, source);
    revalidate([...commonRevalidatePaths(), detailPath("resource", data.id)]);
    return;
  }

  const payload = {
    user_id: userId,
    title,
    context: optionalText(formData, "context"),
    expected_outcome: optionalText(formData, "expected_outcome"),
    chosen_option: optionalText(formData, "chosen_option"),
    reasoning: optionalText(formData, "reasoning"),
    review_date: optionalText(formData, "review_date"),
    project_id: optionalText(formData, "project_id"),
    status: "open",
    created_at: source.created_at,
    metadata: inboxOriginMetadata(source),
  };

  const { data, error } = await supabase.from("decisions").insert(payload).select("id").single();
  if (error || !data) throw new Error(error?.message ?? "Could not create decision.");

  await archiveInboxSource(supabase, userId, source);
  revalidate([...commonRevalidatePaths(), detailPath("decision", data.id)]);
}

export async function linkResourceToEntityAction(formData: FormData) {
  const { supabase, userId } = await getAuthedContext();
  const entityType = text(formData, "entity_type") as ResourceLinkTarget;
  const entityId = text(formData, "entity_id");
  const resourceId = text(formData, "resource_id");

  if (!entityType || !entityId || !resourceId) {
    throw new Error("Resource link parameters are incomplete.");
  }

  if (entityType === "project") {
    const { error } = await supabase.from("project_resources").upsert(
      {
        project_id: entityId,
        resource_id: resourceId,
        user_id: userId,
        relation: "references",
      },
      {
        onConflict: "project_id,resource_id",
        ignoreDuplicates: true,
      }
    );
    if (error) throw new Error(error.message);
  } else if (entityType === "task") {
    const { error } = await supabase.from("task_resources").upsert(
      {
        task_id: entityId,
        resource_id: resourceId,
        user_id: userId,
        relation: "references",
      },
      {
        onConflict: "task_id,resource_id",
        ignoreDuplicates: true,
      }
    );
    if (error) throw new Error(error.message);
  } else if (entityType === "note") {
    const { error } = await supabase.from("note_resources").upsert(
      {
        note_id: entityId,
        resource_id: resourceId,
        user_id: userId,
        relation: "references",
      },
      {
        onConflict: "note_id,resource_id",
        ignoreDuplicates: true,
      }
    );
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("decision_resources").upsert(
      {
        decision_id: entityId,
        resource_id: resourceId,
        user_id: userId,
      },
      {
        onConflict: "decision_id,resource_id",
        ignoreDuplicates: true,
      }
    );
    if (error) throw new Error(error.message);
  }

  revalidate(commonRevalidatePaths());
}

export async function unlinkResourceFromEntityAction(formData: FormData) {
  const { supabase, userId } = await getAuthedContext();
  const entityType = text(formData, "entity_type") as ResourceLinkTarget;
  const entityId = text(formData, "entity_id");
  const resourceId = text(formData, "resource_id");

  if (!entityType || !entityId || !resourceId) {
    throw new Error("Resource unlink parameters are incomplete.");
  }

  if (entityType === "project") {
    const { error } = await supabase
      .from("project_resources")
      .delete()
      .eq("project_id", entityId)
      .eq("resource_id", resourceId)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
  } else if (entityType === "task") {
    const { error } = await supabase
      .from("task_resources")
      .delete()
      .eq("task_id", entityId)
      .eq("resource_id", resourceId)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
  } else if (entityType === "note") {
    const { error } = await supabase
      .from("note_resources")
      .delete()
      .eq("note_id", entityId)
      .eq("resource_id", resourceId)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from("decision_resources")
      .delete()
      .eq("decision_id", entityId)
      .eq("resource_id", resourceId)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
  }

  revalidate(commonRevalidatePaths());
}

export async function linkNoteRelationAction(formData: FormData) {
  const { supabase, userId } = await getAuthedContext();
  const fromNoteId = text(formData, "from_note_id");
  const toNoteId = text(formData, "to_note_id");
  const relation = (text(formData, "relation") || "related_to") as RelationKind;

  if (!fromNoteId || !toNoteId) {
    throw new Error("Note relation parameters are incomplete.");
  }

  if (fromNoteId === toNoteId) {
    throw new Error("A note cannot relate to itself.");
  }

  const { error } = await supabase.from("note_relations").upsert(
    {
      user_id: userId,
      from_note_id: fromNoteId,
      to_note_id: toNoteId,
      relation,
    },
    {
      onConflict: "from_note_id,to_note_id,relation",
      ignoreDuplicates: true,
    }
  );

  if (error) throw new Error(error.message);

  revalidate([...commonRevalidatePaths(), detailPath("note", fromNoteId), detailPath("note", toNoteId)]);
}

export async function unlinkNoteRelationAction(formData: FormData) {
  const { supabase, userId } = await getAuthedContext();
  const relationId = text(formData, "relation_id");
  const fromNoteId = text(formData, "from_note_id");
  const toNoteId = text(formData, "to_note_id");

  if (!relationId) {
    throw new Error("Relation id is required.");
  }

  const { error } = await supabase
    .from("note_relations")
    .delete()
    .eq("id", relationId)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);

  revalidate([
    ...commonRevalidatePaths(),
    ...(fromNoteId ? [detailPath("note", fromNoteId)] : []),
    ...(toNoteId ? [detailPath("note", toNoteId)] : []),
  ]);
}
