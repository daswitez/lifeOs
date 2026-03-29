import { createClient } from "@/lib/supabase/server";
import type {
  AreaType,
  DecisionStatus,
  LogEnergy,
  NoteType,
  PreviewStatus,
  ProjectStatus,
  RelationKind,
  ResourceType,
  StorageMode,
  TaskPriority,
  TaskStatus,
} from "@/lib/domain";

const RESOURCE_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "lifeos-resources";

type TaskRecord = {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  scheduled_for?: string | null;
  energy_required: LogEnergy | null;
  project_id: string | null;
  parent_task_id?: string | null;
  created_at: string;
  completed_at: string | null;
  estimated_minutes: number | null;
  actual_minutes?: number | null;
  is_recurring?: boolean | null;
  recurrence_rule?: string | null;
};

type ProjectRecord = {
  id: string;
  title: string;
  description: string | null;
  status: ProjectStatus;
  priority: TaskPriority;
  area_id: string | null;
  target_date: string | null;
  updated_at: string;
  created_at: string;
};

type AreaRecord = {
  id: string;
  name: string;
  description: string | null;
  type: AreaType;
  color: string | null;
  icon: string | null;
};

type NoteRecord = {
  id: string;
  title: string;
  content: string;
  summary: string | null;
  type: NoteType;
  is_archived?: boolean;
  created_at: string;
  updated_at: string;
  project_id: string | null;
};

type ResourceRecord = {
  id: string;
  title: string;
  description: string | null;
  type: ResourceType;
  storage_mode: StorageMode;
  source_provider?: string | null;
  external_url: string | null;
  internal_path: string | null;
  mime_type?: string | null;
  file_size_bytes?: number | null;
  preview_status: PreviewStatus;
  is_archived?: boolean;
  created_at: string;
  updated_at?: string;
  area_id: string | null;
};

type DecisionRecord = {
  id: string;
  title: string;
  context: string | null;
  expected_outcome: string | null;
  chosen_option: string | null;
  reasoning: string | null;
  review_date: string | null;
  status: DecisionStatus;
  outcome_notes?: string | null;
  project_id?: string | null;
  updated_at?: string;
  created_at: string;
};

type DailyLogRecord = {
  id: string;
  log_date: string;
  mood: number | null;
  focus_score: number | null;
  wins: string | null;
  reflections: string | null;
  energy: LogEnergy | null;
};

type WeeklyReviewRecord = {
  id: string;
  week_start: string;
  week_end: string;
  summary: string | null;
  wins: string | null;
  blockers?: string | null;
  lessons?: string | null;
  next_focus: string | null;
  energy_avg?: number | null;
  mood_avg?: number | null;
  created_at: string;
};

export type SearchScope = "all" | "tasks" | "projects" | "notes" | "resources" | "decisions" | "areas";

export type SearchResultItem = {
  id: string;
  type: Exclude<SearchScope, "all">;
  title: string;
  description: string;
  href: string;
  meta: string;
};

export type ProjectSummary = {
  id: string;
  title: string;
  status: ProjectStatus;
  priority: TaskPriority;
  description: string | null;
  targetDate: string | null;
  areaId: string | null;
  areaName: string;
  updatedAt: string;
  createdAt: string;
  taskCount: number;
  openTaskCount: number;
  completedTaskCount: number;
  progress: number;
};

export type ActionTask = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  scheduledFor: string | null;
  energy: LogEnergy | null;
  createdAt: string;
  estimatedMinutes: number | null;
  actualMinutes: number | null;
  isRecurring: boolean;
  recurrenceRule: string | null;
  parentTaskId: string | null;
  parentTitle: string | null;
  projectId: string | null;
  projectTitle: string | null;
  resources?: LinkedResource[];
  subtasks: ActionTask[];
};

export type LinkedResource = {
  id: string;
  title: string;
  type: ResourceType;
  location: string | null;
};

type KnowledgeEntry = {
  id: string;
  title: string;
  preview: string;
  type: NoteType;
  content?: string;
  summary?: string | null;
  projectId?: string | null;
  isArchived?: boolean;
  createdAt: string;
  updatedAt: string;
  relationCount?: number;
  connectedTitles?: string[];
  incomingCount?: number;
  outgoingCount?: number;
};

type NoteRelationEntry = {
  id: string;
  direction: "outgoing" | "incoming";
  relation: RelationKind;
  note: {
    id: string;
    title: string;
    type: NoteType;
  };
};

type ResourceEntry = {
  id: string;
  title: string;
  description: string | null;
  type: ResourceType;
  storageMode: StorageMode;
  location: string | null;
  mimeType?: string | null;
  fileSizeBytes?: number | null;
  isArchived?: boolean;
  linkedProjects?: EntityOption[];
  linkedTasks?: EntityOption[];
  linkedNotes?: EntityOption[];
  linkedDecisions?: EntityOption[];
  previewStatus: PreviewStatus;
  createdAt: string;
};

type ResourceOption = {
  id: string;
  title: string;
  type: ResourceType;
};

type EntityOption = {
  id: string;
  title: string;
  subtitle?: string | null;
};

type DecisionEntry = {
  id: string;
  title: string;
  context: string | null;
  expectedOutcome: string | null;
  chosenOption: string | null;
  reasoning: string | null;
  reviewDate: string | null;
  status: DecisionStatus;
  createdAt: string;
};

type ProjectDecisionEntry = {
  id: string;
  title: string;
  status: DecisionStatus;
  reviewDate: string | null;
  expectedOutcome: string | null;
};

export type InboxProjectOption = {
  id: string;
  title: string;
};

export type InboxItem = {
  id: string;
  title: string;
  kind: "task" | "note" | "resource" | "decision";
  createdAt: string;
  detail: string;
  href: string;
  task?: {
    status: TaskStatus;
    priority: TaskPriority;
    dueDate: string | null;
    projectId: string | null;
    description: string | null;
  };
  note?: {
    type: NoteType;
    summary: string | null;
    content: string;
    projectId: string | null;
  };
  resource?: {
    type: ResourceType;
    storageMode: StorageMode;
    location: string | null;
    description: string | null;
  };
  decision?: {
    context: string | null;
    expectedOutcome: string | null;
    chosenOption: string | null;
    reasoning: string | null;
    reviewDate: string | null;
    projectId: string | null;
  };
};

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

function groupTasksByProject(tasks: TaskRecord[]) {
  return tasks.reduce<Map<string, TaskRecord[]>>((acc, task) => {
    if (!task.project_id) return acc;
    const current = acc.get(task.project_id) ?? [];
    current.push(task);
    acc.set(task.project_id, current);
    return acc;
  }, new Map());
}

function isOpenTask(status: TaskStatus) {
  return !["done", "cancelled", "archived"].includes(status);
}

function priorityScore(priority: TaskPriority) {
  switch (priority) {
    case "urgent":
      return 4;
    case "high":
      return 3;
    case "medium":
      return 2;
    case "low":
      return 1;
  }
}

function notePreview(note: NoteRecord) {
  const source = note.summary?.trim() || note.content.trim();
  return source ? source.slice(0, 180) : "Nota recien capturada. Lista para destilarse.";
}

function compactText(value: string | null | undefined) {
  return value?.replace(/\s+/g, " ").trim() || "";
}

function previewText(...values: Array<string | null | undefined>) {
  const source = values.map((value) => compactText(value)).find(Boolean);
  return source ? source.slice(0, 180) : "Sin contexto adicional todavia.";
}

function searchPattern(query: string) {
  return `%${query.replace(/[,%()]/g, " ").trim()}%`;
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

function isDirectPreviewableResource(type: ResourceType) {
  return ["image", "pdf", "video", "audio"].includes(type);
}

async function getResourceOptions(
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  const { data } = await supabase
    .from("resources")
    .select("id, title, type")
    .eq("is_archived", false)
    .order("title", { ascending: true })
    .limit(200);

  return (data ?? []) as ResourceOption[];
}

async function getProjectOptions(
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  const { data } = await supabase
    .from("projects")
    .select("id, title, status")
    .order("title", { ascending: true })
    .limit(200);

  return ((data ?? []) as Array<{ id: string; title: string; status: ProjectStatus }>).map<EntityOption>((project) => ({
    id: project.id,
    title: project.title,
    subtitle: project.status,
  }));
}

async function getTaskOptions(
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  const { data } = await supabase
    .from("tasks")
    .select("id, title, status")
    .neq("status", "archived")
    .neq("status", "cancelled")
    .order("title", { ascending: true })
    .limit(200);

  return ((data ?? []) as Array<{ id: string; title: string; status: TaskStatus }>).map<EntityOption>((task) => ({
    id: task.id,
    title: task.title,
    subtitle: task.status,
  }));
}

async function getNoteOptions(
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  const { data } = await supabase
    .from("notes")
    .select("id, title, type")
    .eq("is_archived", false)
    .order("updated_at", { ascending: false })
    .limit(200);

  return ((data ?? []) as Array<{ id: string; title: string; type: NoteType }>).map<EntityOption>((note) => ({
    id: note.id,
    title: note.title,
    subtitle: note.type,
  }));
}

async function getDecisionOptions(
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  const { data } = await supabase
    .from("decisions")
    .select("id, title, status")
    .order("title", { ascending: true })
    .limit(200);

  return ((data ?? []) as Array<{ id: string; title: string; status: DecisionStatus }>).map<EntityOption>((decision) => ({
    id: decision.id,
    title: decision.title,
    subtitle: decision.status,
  }));
}

async function getResourcesByIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  ids: string[]
) {
  if (ids.length === 0) return [];

  const { data } = await supabase
    .from("resources")
    .select("id, title, type, external_url, internal_path, created_at")
    .in("id", ids)
    .order("created_at", { ascending: false });

  return ((data ?? []) as Array<{
    id: string;
    title: string;
    type: ResourceType;
    external_url: string | null;
    internal_path: string | null;
  }>).map<LinkedResource>((resource) => ({
    id: resource.id,
    title: resource.title,
    type: resource.type,
    location: resource.external_url ?? resource.internal_path,
  }));
}

function buildProjectSummaries(
  projects: ProjectRecord[],
  tasks: TaskRecord[],
  areas: AreaRecord[]
) {
  const areaById = new Map(areas.map((area) => [area.id, area.name]));
  const tasksByProject = groupTasksByProject(tasks);

  return projects.map<ProjectSummary>((project) => {
    const relatedTasks = tasksByProject.get(project.id) ?? [];
    const completedTaskCount = relatedTasks.filter((task) => task.status === "done").length;
    const openTaskCount = relatedTasks.filter((task) => isOpenTask(task.status)).length;
    const taskCount = relatedTasks.length;
    const progress = taskCount === 0 ? 0 : Math.round((completedTaskCount / taskCount) * 100);

    return {
      id: project.id,
      title: project.title,
      description: project.description,
      status: project.status,
      priority: project.priority,
      areaId: project.area_id,
      areaName: project.area_id ? areaById.get(project.area_id) ?? "Sin area" : "Sin area",
      targetDate: project.target_date,
      updatedAt: project.updated_at,
      createdAt: project.created_at,
      taskCount,
      openTaskCount,
      completedTaskCount,
      progress,
    };
  });
}

function buildActionTasks(tasks: TaskRecord[], projects: ProjectRecord[]) {
  const projectById = new Map(projects.map((project) => [project.id, project.title]));
  const taskTitleById = new Map(tasks.map((task) => [task.id, task.title]));

  return tasks.map<ActionTask>((task) => ({
    id: task.id,
    title: task.title,
    description: task.description ?? null,
    status: task.status,
    priority: task.priority,
    dueDate: task.due_date,
    scheduledFor: task.scheduled_for ?? null,
    energy: task.energy_required,
    createdAt: task.created_at,
    estimatedMinutes: task.estimated_minutes,
    actualMinutes: task.actual_minutes ?? null,
    isRecurring: Boolean(task.is_recurring),
    recurrenceRule: task.recurrence_rule ?? null,
    parentTaskId: task.parent_task_id ?? null,
    parentTitle: task.parent_task_id ? taskTitleById.get(task.parent_task_id) ?? null : null,
    projectId: task.project_id,
    projectTitle: task.project_id ? projectById.get(task.project_id) ?? null : null,
    subtasks: [],
  }));
}

function compareActionTasks(a: ActionTask, b: ActionTask) {
  const priorityDiff = priorityScore(b.priority) - priorityScore(a.priority);
  if (priorityDiff !== 0) return priorityDiff;

  const aDate = a.scheduledFor ?? a.dueDate;
  const bDate = b.scheduledFor ?? b.dueDate;

  if (aDate && bDate) {
    return new Date(aDate).getTime() - new Date(bDate).getTime();
  }

  if (aDate) return -1;
  if (bDate) return 1;
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

function buildActionTaskTree(tasks: ActionTask[]) {
  const clones = tasks.map<ActionTask>((task) => ({
    ...task,
    resources: task.resources ?? [],
    subtasks: [],
  }));
  const taskById = new Map(clones.map((task) => [task.id, task]));
  const roots: ActionTask[] = [];

  for (const task of clones) {
    if (task.parentTaskId) {
      const parent = taskById.get(task.parentTaskId);
      if (parent) {
        parent.subtasks.push(task);
        continue;
      }
    }

    roots.push(task);
  }

  const sortTree = (items: ActionTask[]) => {
    items.sort(compareActionTasks);
    for (const item of items) {
      if (item.subtasks.length > 0) {
        sortTree(item.subtasks);
      }
    }
    return items;
  };

  return sortTree(roots);
}

export async function getSidebarData() {
  const { supabase, userId } = await getAuthedContext();
  const [inboxCountResponse, profileResponse] = await Promise.all([
    supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("status", "inbox"),
    supabase
      .from("profiles")
      .select("full_name, username, email")
      .eq("id", userId)
      .maybeSingle(),
  ]);

  return {
    inboxCount: inboxCountResponse.count ?? 0,
    profile: {
      fullName: profileResponse.data?.full_name ?? null,
      username: profileResponse.data?.username ?? null,
      email: profileResponse.data?.email ?? null,
    },
  };
}

export async function getProfileData() {
  const { supabase, userId } = await getAuthedContext();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, username, avatar_url, bio, timezone, locale, created_at, updated_at")
    .eq("id", userId)
    .single();

  if (error || !data) {
    throw new Error("Profile not found");
  }

  return {
    profile: {
      id: data.id,
      email: data.email ?? "",
      fullName: data.full_name ?? "",
      username: data.username ?? "",
      avatarUrl: data.avatar_url ?? "",
      bio: data.bio ?? "",
      timezone: data.timezone ?? "America/La_Paz",
      locale: data.locale ?? "es",
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    },
  };
}

export async function getGlobalSearchData(query: string, scope: SearchScope = "all") {
  const { supabase } = await getAuthedContext();
  const cleanQuery = query.trim();

  if (!cleanQuery) {
    return {
      query: "",
      scope,
      total: 0,
      results: [] as SearchResultItem[],
    };
  }

  const pattern = searchPattern(cleanQuery);
  const shouldSearch = (target: Exclude<SearchScope, "all">) => scope === "all" || scope === target;

  const [
    tasksResponse,
    projectsResponse,
    notesResponse,
    resourcesResponse,
    decisionsResponse,
    areasResponse,
  ] = await Promise.all([
    shouldSearch("tasks")
      ? supabase
          .from("tasks")
          .select("id, title, description, status, priority, due_date")
          .or(`title.ilike.${pattern},description.ilike.${pattern}`)
          .order("created_at", { ascending: false })
          .limit(12)
      : Promise.resolve({ data: [] as Array<{ id: string; title: string; description: string | null; status: TaskStatus; priority: TaskPriority; due_date: string | null }> }),
    shouldSearch("projects")
      ? supabase
          .from("projects")
          .select("id, title, description, status, priority, target_date")
          .or(`title.ilike.${pattern},description.ilike.${pattern}`)
          .order("updated_at", { ascending: false })
          .limit(12)
      : Promise.resolve({ data: [] as Array<{ id: string; title: string; description: string | null; status: ProjectStatus; priority: TaskPriority; target_date: string | null }> }),
    shouldSearch("notes")
      ? supabase
          .from("notes")
          .select("id, title, summary, content, type, updated_at")
          .or(`title.ilike.${pattern},summary.ilike.${pattern},content.ilike.${pattern}`)
          .order("updated_at", { ascending: false })
          .limit(12)
      : Promise.resolve({ data: [] as Array<{ id: string; title: string; summary: string | null; content: string; type: NoteType; updated_at: string }> }),
    shouldSearch("resources")
      ? supabase
          .from("resources")
          .select("id, title, description, type, storage_mode, external_url, internal_path")
          .or(`title.ilike.${pattern},description.ilike.${pattern},external_url.ilike.${pattern},internal_path.ilike.${pattern}`)
          .order("created_at", { ascending: false })
          .limit(12)
      : Promise.resolve({ data: [] as Array<{ id: string; title: string; description: string | null; type: ResourceType; storage_mode: StorageMode; external_url: string | null; internal_path: string | null }> }),
    shouldSearch("decisions")
      ? supabase
          .from("decisions")
          .select("id, title, context, expected_outcome, reasoning, status, review_date")
          .or(`title.ilike.${pattern},context.ilike.${pattern},expected_outcome.ilike.${pattern},reasoning.ilike.${pattern}`)
          .order("created_at", { ascending: false })
          .limit(12)
      : Promise.resolve({ data: [] as Array<{ id: string; title: string; context: string | null; expected_outcome: string | null; reasoning: string | null; status: DecisionStatus; review_date: string | null }> }),
    shouldSearch("areas")
      ? supabase
          .from("areas")
          .select("id, name, description, type")
          .or(`name.ilike.${pattern},description.ilike.${pattern}`)
          .order("name", { ascending: true })
          .limit(12)
      : Promise.resolve({ data: [] as Array<{ id: string; name: string; description: string | null; type: AreaType }> }),
  ]);

  const results: SearchResultItem[] = [
    ...(((tasksResponse.data ?? []) as Array<{ id: string; title: string; description: string | null; status: TaskStatus; priority: TaskPriority; due_date: string | null }>).map((task) => ({
      id: task.id,
      type: "tasks" as const,
      title: task.title,
      description: previewText(task.description),
      href: "/actions",
      meta: `${task.status} · ${task.priority}${task.due_date ? ` · vence ${task.due_date.slice(0, 10)}` : ""}`,
    }))),
    ...(((projectsResponse.data ?? []) as Array<{ id: string; title: string; description: string | null; status: ProjectStatus; priority: TaskPriority; target_date: string | null }>).map((project) => ({
      id: project.id,
      type: "projects" as const,
      title: project.title,
      description: previewText(project.description),
      href: `/projects/${project.id}`,
      meta: `${project.status} · ${project.priority}${project.target_date ? ` · target ${project.target_date}` : ""}`,
    }))),
    ...(((notesResponse.data ?? []) as Array<{ id: string; title: string; summary: string | null; content: string; type: NoteType; updated_at: string }>).map((note) => ({
      id: note.id,
      type: "notes" as const,
      title: note.title,
      description: previewText(note.summary, note.content),
      href: `/knowledge/${note.id}`,
      meta: `${note.type} · actualizado ${note.updated_at.slice(0, 10)}`,
    }))),
    ...(((resourcesResponse.data ?? []) as Array<{ id: string; title: string; description: string | null; type: ResourceType; storage_mode: StorageMode; external_url: string | null; internal_path: string | null }>).map((resource) => ({
      id: resource.id,
      type: "resources" as const,
      title: resource.title,
      description: previewText(resource.description, resource.external_url, resource.internal_path),
      href: `/resources/${resource.id}`,
      meta: `${resource.type} · ${resource.storage_mode}`,
    }))),
    ...(((decisionsResponse.data ?? []) as Array<{ id: string; title: string; context: string | null; expected_outcome: string | null; reasoning: string | null; status: DecisionStatus; review_date: string | null }>).map((decision) => ({
      id: decision.id,
      type: "decisions" as const,
      title: decision.title,
      description: previewText(decision.context, decision.expected_outcome, decision.reasoning),
      href: `/decisions/${decision.id}`,
      meta: `${decision.status}${decision.review_date ? ` · review ${decision.review_date.slice(0, 10)}` : ""}`,
    }))),
    ...(((areasResponse.data ?? []) as Array<{ id: string; name: string; description: string | null; type: AreaType }>).map((area) => ({
      id: area.id,
      type: "areas" as const,
      title: area.name,
      description: previewText(area.description),
      href: "/areas",
      meta: area.type,
    }))),
  ];

  return {
    query: cleanQuery,
    scope,
    total: results.length,
    results,
  };
}

export async function getDashboardData() {
  const { supabase } = await getAuthedContext();
  const today = new Date().toISOString().slice(0, 10);
  const { weekStart, weekEnd } = currentWeekRange();

  const [
    tasksResponse,
    projectsResponse,
    areasResponse,
    notesResponse,
    resourcesResponse,
    decisionsResponse,
    dailyLogResponse,
    weeklyReviewResponse,
  ] = await Promise.all([
    supabase
      .from("tasks")
      .select(
        "id, title, description, status, priority, due_date, scheduled_for, energy_required, project_id, parent_task_id, created_at, completed_at, estimated_minutes, actual_minutes, is_recurring, recurrence_rule"
      )
      .in("status", ["inbox", "todo", "in_progress", "waiting", "done"])
      .order("created_at", { ascending: false })
      .limit(120),
    supabase
      .from("projects")
      .select("id, title, description, status, priority, area_id, target_date, updated_at, created_at")
      .in("status", ["active", "on_hold"])
      .order("updated_at", { ascending: false })
      .limit(20),
    supabase.from("areas").select("id, name, description, type, color, icon").order("name"),
    supabase
      .from("notes")
      .select("id, title, content, summary, type, created_at, updated_at, project_id")
      .order("updated_at", { ascending: false })
      .limit(6),
    supabase
      .from("resources")
      .select("id, title, description, type, storage_mode, external_url, internal_path, preview_status, created_at, area_id")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("decisions")
      .select("id, title, context, expected_outcome, chosen_option, reasoning, review_date, status, created_at")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("daily_logs")
      .select("id, log_date, mood, focus_score, wins, reflections, energy")
      .eq("log_date", today)
      .maybeSingle(),
    supabase
      .from("weekly_reviews")
      .select("id, week_start, week_end, summary, wins, next_focus, created_at")
      .order("week_end", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const tasks = (tasksResponse.data ?? []) as TaskRecord[];
  const projects = (projectsResponse.data ?? []) as ProjectRecord[];
  const areas = (areasResponse.data ?? []) as AreaRecord[];
  const notes = (notesResponse.data ?? []) as NoteRecord[];
  const resources = (resourcesResponse.data ?? []) as ResourceRecord[];
  const decisions = (decisionsResponse.data ?? []) as DecisionRecord[];
  const dailyLog = (dailyLogResponse.data ?? null) as DailyLogRecord | null;
  const lastWeeklyReview = (weeklyReviewResponse.data ?? null) as WeeklyReviewRecord | null;

  const projectSummaries = buildProjectSummaries(projects, tasks, areas)
    .sort((a, b) => {
      if (a.status !== b.status) {
        return a.status === "active" ? -1 : 1;
      }
      return new Date(a.updatedAt).getTime() < new Date(b.updatedAt).getTime() ? 1 : -1;
    })
    .slice(0, 5);

  const openActionTasks = buildActionTasks(
    tasks.filter((task) => ["todo", "in_progress", "waiting"].includes(task.status)),
    projects
  ).sort(compareActionTasks);

  const sameDay = (value: string | null, target: string) => value?.slice(0, 10) === target;
  const withinWeek = (value: string | null) => {
    if (!value) return false;
    const date = value.slice(0, 10);
    return date >= weekStart && date <= weekEnd;
  };

  const focusTasks = openActionTasks.slice(0, 6);
  const todayTasks = openActionTasks
    .filter((task) =>
      task.status === "in_progress" ||
      sameDay(task.scheduledFor, today) ||
      sameDay(task.dueDate, today)
    )
    .slice(0, 6);
  const weekTasks = openActionTasks
    .filter((task) =>
      !todayTasks.some((todayTask) => todayTask.id === task.id) &&
      (withinWeek(task.scheduledFor) || withinWeek(task.dueDate) || task.isRecurring)
    )
    .slice(0, 8);

  const recentKnowledge = notes.slice(0, 5).map<KnowledgeEntry>((note) => ({
    id: note.id,
    title: note.title,
    preview: notePreview(note),
    type: note.type,
    createdAt: note.created_at,
    updatedAt: note.updated_at,
  }));

  const inboxCount = tasks.filter((task) => task.status === "inbox").length;
  const overdueCount = tasks.filter(
    (task) => isOpenTask(task.status) && task.due_date && new Date(task.due_date).getTime() < Date.now()
  ).length;
  const openDecisionCount = decisions.filter((decision) => decision.status === "open").length;
  const activeProjectCount = projectSummaries.filter((project) => project.status === "active").length;
  const weeklyDecisionReviews = decisions
    .filter(
      (decision) =>
        decision.status === "open" &&
        decision.review_date &&
        decision.review_date.slice(0, 10) >= weekStart &&
        decision.review_date.slice(0, 10) <= weekEnd
    )
    .sort((a, b) => {
      if (!a.review_date || !b.review_date) return 0;
      return new Date(a.review_date).getTime() - new Date(b.review_date).getTime();
    })
    .slice(0, 5);

  return {
    dailyLog,
    lastWeeklyReview,
    focusTasks,
    todayTasks,
    weekTasks,
    projectSummaries,
    recentKnowledge,
    resources: resources.map<ResourceEntry>((resource) => ({
      id: resource.id,
      title: resource.title,
      description: resource.description,
      type: resource.type,
      storageMode: resource.storage_mode,
      location: resource.external_url ?? resource.internal_path,
      previewStatus: resource.preview_status,
      createdAt: resource.created_at,
    })),
    inboxCount,
    overdueCount,
    openDecisionCount,
    activeProjectCount,
    currentWeek: {
      weekStart,
      weekEnd,
    },
    weeklyDecisionReviews: weeklyDecisionReviews.map((decision) => ({
      id: decision.id,
      title: decision.title,
      status: decision.status,
      reviewDate: decision.review_date,
      expectedOutcome: decision.expected_outcome,
    })),
  };
}

export async function getActionsData() {
  const { supabase } = await getAuthedContext();
  const [tasksResponse, projectsResponse, taskResourcesResponse, resourceOptions, taskOptions] = await Promise.all([
    supabase
      .from("tasks")
      .select(
        "id, title, description, status, priority, due_date, scheduled_for, energy_required, project_id, parent_task_id, created_at, completed_at, estimated_minutes, actual_minutes, is_recurring, recurrence_rule"
      )
      .in("status", ["inbox", "todo", "in_progress", "waiting"])
      .order("created_at", { ascending: false })
      .limit(60),
    supabase.from("projects").select("id, title, description, status, priority, area_id, target_date, updated_at, created_at"),
    supabase.from("task_resources").select("task_id, resource_id"),
    getResourceOptions(supabase),
    getTaskOptions(supabase),
  ]);

  const tasks = (tasksResponse.data ?? []) as TaskRecord[];
  const projects = (projectsResponse.data ?? []) as ProjectRecord[];
  const taskResourceRows = (taskResourcesResponse.data ?? []) as { task_id: string; resource_id: string }[];
  const taskResourceIds = [...new Set(taskResourceRows.map((row) => row.resource_id))];
  const linkedResources = await getResourcesByIds(supabase, taskResourceIds);
  const linkedResourceById = new Map(linkedResources.map((resource) => [resource.id, resource]));
  const resourcesByTaskId = taskResourceRows.reduce<Map<string, LinkedResource[]>>((acc, row) => {
    const resource = linkedResourceById.get(row.resource_id);
    if (!resource) return acc;
    const current = acc.get(row.task_id) ?? [];
    current.push(resource);
    acc.set(row.task_id, current);
    return acc;
  }, new Map());

  const attachResources = (items: ActionTask[]): ActionTask[] =>
    items.map((task) => ({
      ...task,
      resources: resourcesByTaskId.get(task.id) ?? [],
    }));

  const flatTasks = attachResources(buildActionTasks(tasks, projects));
  const allTasks = buildActionTaskTree(flatTasks);

  return {
    inboxTasks: allTasks.filter((task) => task.status === "inbox").sort(compareActionTasks),
    focusTasks: allTasks
      .filter((task) => task.status !== "inbox")
      .sort(compareActionTasks),
    projects: projects.filter(p => p.status === "active" || p.status === "on_hold"),
    resourceOptions,
    taskOptions,
  };
}

export async function getProjectsData() {
  const { supabase } = await getAuthedContext();
  const [projectsResponse, tasksResponse, areasResponse] = await Promise.all([
    supabase
      .from("projects")
      .select("id, title, description, status, priority, area_id, target_date, updated_at, created_at")
      .order("updated_at", { ascending: false })
      .limit(30),
    supabase
      .from("tasks")
      .select("id, title, status, priority, due_date, energy_required, project_id, created_at, completed_at, estimated_minutes")
      .not("project_id", "is", null)
      .limit(200),
    supabase.from("areas").select("id, name, description, type, color, icon"),
  ]);

  return {
    projects: buildProjectSummaries(
      (projectsResponse.data ?? []) as ProjectRecord[],
      (tasksResponse.data ?? []) as TaskRecord[],
      (areasResponse.data ?? []) as AreaRecord[]
    ),
    areas: (areasResponse.data ?? []) as AreaRecord[],
  };
}

export async function getKnowledgeData() {
  const { supabase } = await getAuthedContext();
  const [notesResponse, projectsResponse] = await Promise.all([
    supabase
      .from("notes")
      .select("id, title, content, summary, type, created_at, updated_at, project_id, is_archived")
      .order("updated_at", { ascending: false })
      .limit(40),
    supabase.from("projects").select("id, title").order("title", { ascending: true }),
  ]);

  const notes = (notesResponse.data ?? []) as NoteRecord[];
  const noteIds = notes.map((note) => note.id);
  const [outgoingRelationsRes, incomingRelationsRes] = await Promise.all([
    noteIds.length > 0
      ? supabase.from("note_relations").select("from_note_id, to_note_id").in("from_note_id", noteIds)
      : Promise.resolve({ data: [] as Array<{ from_note_id: string; to_note_id: string }> }),
    noteIds.length > 0
      ? supabase.from("note_relations").select("from_note_id, to_note_id").in("to_note_id", noteIds)
      : Promise.resolve({ data: [] as Array<{ from_note_id: string; to_note_id: string }> }),
  ]);

  const relatedNoteIds = [
    ...((outgoingRelationsRes.data ?? []) as Array<{ to_note_id: string }>).map((row) => row.to_note_id),
    ...((incomingRelationsRes.data ?? []) as Array<{ from_note_id: string }>).map((row) => row.from_note_id),
  ];
  const uniqueRelatedNoteIds = [...new Set(relatedNoteIds)];
  const relatedNotesRes =
    uniqueRelatedNoteIds.length > 0
      ? await supabase.from("notes").select("id, title").in("id", uniqueRelatedNoteIds)
      : { data: [] as Array<{ id: string; title: string }> };
  const relatedNoteById = new Map((((relatedNotesRes.data ?? []) as Array<{ id: string; title: string }>)).map((note) => [note.id, note.title]));

  const outgoingByNoteId = ((outgoingRelationsRes.data ?? []) as Array<{ from_note_id: string; to_note_id: string }>).reduce<Map<string, string[]>>(
    (acc, row) => {
      const current = acc.get(row.from_note_id) ?? [];
      current.push(row.to_note_id);
      acc.set(row.from_note_id, current);
      return acc;
    },
    new Map()
  );

  const incomingByNoteId = ((incomingRelationsRes.data ?? []) as Array<{ from_note_id: string; to_note_id: string }>).reduce<Map<string, string[]>>(
    (acc, row) => {
      const current = acc.get(row.to_note_id) ?? [];
      current.push(row.from_note_id);
      acc.set(row.to_note_id, current);
      return acc;
    },
    new Map()
  );

  return {
    notes: notes.map<KnowledgeEntry>((note) => ({
      id: note.id,
      title: note.title,
      preview: notePreview(note),
      type: note.type,
      content: note.content,
      summary: note.summary,
      projectId: note.project_id,
      isArchived: note.is_archived ?? false,
      createdAt: note.created_at,
      updatedAt: note.updated_at,
      relationCount: new Set([...(outgoingByNoteId.get(note.id) ?? []), ...(incomingByNoteId.get(note.id) ?? [])]).size,
      connectedTitles: [...new Set([...(outgoingByNoteId.get(note.id) ?? []), ...(incomingByNoteId.get(note.id) ?? [])])]
        .map((relatedId) => relatedNoteById.get(relatedId))
        .filter((value): value is string => Boolean(value))
        .slice(0, 3),
      incomingCount: (incomingByNoteId.get(note.id) ?? []).length,
      outgoingCount: (outgoingByNoteId.get(note.id) ?? []).length,
    })),
    projects: (projectsResponse.data ?? []) as InboxProjectOption[],
  };
}

export async function getResourcesData() {
  const { supabase } = await getAuthedContext();
  const { data } = await supabase
    .from("resources")
    .select("id, title, description, type, storage_mode, external_url, internal_path, mime_type, file_size_bytes, preview_status, is_archived, created_at, area_id")
    .order("created_at", { ascending: false })
    .limit(40);

  const resources = (data ?? []) as ResourceRecord[];
  const resourceIds = resources.map((resource) => resource.id);

  const [
    projectOptions,
    taskOptions,
    noteOptions,
    decisionOptions,
    projectLinksRes,
    taskLinksRes,
    noteLinksRes,
    decisionLinksRes,
  ] = await Promise.all([
    getProjectOptions(supabase),
    getTaskOptions(supabase),
    getNoteOptions(supabase),
    getDecisionOptions(supabase),
    resourceIds.length > 0
      ? supabase.from("project_resources").select("resource_id, project_id").in("resource_id", resourceIds)
      : Promise.resolve({ data: [] as Array<{ resource_id: string; project_id: string }> }),
    resourceIds.length > 0
      ? supabase.from("task_resources").select("resource_id, task_id").in("resource_id", resourceIds)
      : Promise.resolve({ data: [] as Array<{ resource_id: string; task_id: string }> }),
    resourceIds.length > 0
      ? supabase.from("note_resources").select("resource_id, note_id").in("resource_id", resourceIds)
      : Promise.resolve({ data: [] as Array<{ resource_id: string; note_id: string }> }),
    resourceIds.length > 0
      ? supabase.from("decision_resources").select("resource_id, decision_id").in("resource_id", resourceIds)
      : Promise.resolve({ data: [] as Array<{ resource_id: string; decision_id: string }> }),
  ]);

  const projectOptionById = new Map(projectOptions.map((item) => [item.id, item]));
  const taskOptionById = new Map(taskOptions.map((item) => [item.id, item]));
  const noteOptionById = new Map(noteOptions.map((item) => [item.id, item]));
  const decisionOptionById = new Map(decisionOptions.map((item) => [item.id, item]));

  const linkedProjectsByResourceId = ((projectLinksRes.data ?? []) as Array<{ resource_id: string; project_id: string }>).reduce<
    Map<string, EntityOption[]>
  >((acc, row) => {
    const project = projectOptionById.get(row.project_id);
    if (!project) return acc;
    const current = acc.get(row.resource_id) ?? [];
    current.push(project);
    acc.set(row.resource_id, current);
    return acc;
  }, new Map());

  const linkedTasksByResourceId = ((taskLinksRes.data ?? []) as Array<{ resource_id: string; task_id: string }>).reduce<
    Map<string, EntityOption[]>
  >((acc, row) => {
    const task = taskOptionById.get(row.task_id);
    if (!task) return acc;
    const current = acc.get(row.resource_id) ?? [];
    current.push(task);
    acc.set(row.resource_id, current);
    return acc;
  }, new Map());

  const linkedNotesByResourceId = ((noteLinksRes.data ?? []) as Array<{ resource_id: string; note_id: string }>).reduce<
    Map<string, EntityOption[]>
  >((acc, row) => {
    const note = noteOptionById.get(row.note_id);
    if (!note) return acc;
    const current = acc.get(row.resource_id) ?? [];
    current.push(note);
    acc.set(row.resource_id, current);
    return acc;
  }, new Map());

  const linkedDecisionsByResourceId = ((decisionLinksRes.data ?? []) as Array<{ resource_id: string; decision_id: string }>).reduce<
    Map<string, EntityOption[]>
  >((acc, row) => {
    const decision = decisionOptionById.get(row.decision_id);
    if (!decision) return acc;
    const current = acc.get(row.resource_id) ?? [];
    current.push(decision);
    acc.set(row.resource_id, current);
    return acc;
  }, new Map());

  return {
    resources: resources.map<ResourceEntry>((resource) => ({
      id: resource.id,
      title: resource.title,
      description: resource.description,
      type: resource.type,
      storageMode: resource.storage_mode,
      location: resource.external_url ?? resource.internal_path,
      mimeType: resource.mime_type ?? null,
      fileSizeBytes: resource.file_size_bytes ?? null,
      isArchived: resource.is_archived ?? false,
      linkedProjects: linkedProjectsByResourceId.get(resource.id) ?? [],
      linkedTasks: linkedTasksByResourceId.get(resource.id) ?? [],
      linkedNotes: linkedNotesByResourceId.get(resource.id) ?? [],
      linkedDecisions: linkedDecisionsByResourceId.get(resource.id) ?? [],
      previewStatus: resource.preview_status,
      createdAt: resource.created_at,
    })),
    relationOptions: {
      projects: projectOptions,
      tasks: taskOptions,
      notes: noteOptions,
      decisions: decisionOptions,
    },
  };
}

export async function getDecisionsData() {
  const { supabase } = await getAuthedContext();
  const { data } = await supabase
    .from("decisions")
    .select("id, title, context, expected_outcome, chosen_option, reasoning, review_date, status, created_at")
    .order("created_at", { ascending: false })
    .limit(30);

  const decisions = (data ?? []) as DecisionRecord[];

  return {
    decisions: decisions.map<DecisionEntry>((decision) => ({
      id: decision.id,
      title: decision.title,
      context: decision.context,
      expectedOutcome: decision.expected_outcome,
      chosenOption: decision.chosen_option,
      reasoning: decision.reasoning,
      reviewDate: decision.review_date,
      status: decision.status,
      createdAt: decision.created_at,
    })),
  };
}

export async function getReviewData() {
  const { supabase } = await getAuthedContext();
  const { weekStart, weekEnd } = currentWeekRange();
  const [reviewsResponse, dailyLogsResponse, inboxCountResponse, openProjectsResponse, openDecisionsResponse, currentWeekReviewResponse, currentWeekLogsResponse, focusTasksResponse, activeProjectsResponse, openDecisionsListResponse] =
    await Promise.all([
      supabase
        .from("weekly_reviews")
        .select("id, week_start, week_end, summary, wins, blockers, lessons, next_focus, energy_avg, mood_avg, created_at")
        .order("week_end", { ascending: false })
        .limit(8),
      supabase
        .from("daily_logs")
        .select("id, log_date, mood, focus_score, wins, reflections, energy")
        .order("log_date", { ascending: false })
        .limit(7),
      supabase.from("tasks").select("*", { count: "exact", head: true }).eq("status", "inbox"),
      supabase.from("projects").select("*", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("decisions").select("*", { count: "exact", head: true }).eq("status", "open"),
      supabase
        .from("weekly_reviews")
        .select("id, week_start, week_end, summary, wins, blockers, lessons, next_focus, energy_avg, mood_avg, created_at")
        .eq("week_start", weekStart)
        .eq("week_end", weekEnd)
        .maybeSingle(),
      supabase
        .from("daily_logs")
        .select("id, log_date, mood, focus_score, wins, reflections, energy")
        .gte("log_date", weekStart)
        .lte("log_date", weekEnd)
        .order("log_date", { ascending: false }),
      supabase
        .from("tasks")
        .select("id, title, status, priority, due_date, energy_required, project_id, created_at, completed_at, estimated_minutes")
        .in("status", ["todo", "in_progress", "waiting"])
        .order("created_at", { ascending: false })
        .limit(6),
      supabase
        .from("projects")
        .select("id, title, status, priority, area_id, description, target_date, updated_at, created_at")
        .eq("status", "active")
        .order("updated_at", { ascending: false })
        .limit(5),
      supabase
        .from("decisions")
        .select("id, title, context, expected_outcome, chosen_option, reasoning, review_date, status, created_at")
        .eq("status", "open")
        .order("review_date", { ascending: true, nullsFirst: false })
        .limit(5),
    ]);

  const projectsForTasksResponse = await supabase
    .from("projects")
    .select("id, title, description, status, priority, area_id, target_date, updated_at, created_at");

  const currentWeekLogs = ((currentWeekLogsResponse.data ?? []) as DailyLogRecord[]);
  const moodSamples = currentWeekLogs.map((log) => log.mood).filter((value): value is number => value !== null);
  const focusSamples = currentWeekLogs.map((log) => log.focus_score).filter((value): value is number => value !== null);
  const winsCount = currentWeekLogs.filter((log) => Boolean(log.wins?.trim())).length;

  return {
    reviews: ((reviewsResponse.data ?? []) as WeeklyReviewRecord[]),
    recentDailyLogs: ((dailyLogsResponse.data ?? []) as DailyLogRecord[]),
    inboxCount: inboxCountResponse.count ?? 0,
    activeProjects: openProjectsResponse.count ?? 0,
    openDecisions: openDecisionsResponse.count ?? 0,
    currentWeek: {
      weekStart,
      weekEnd,
      review: (currentWeekReviewResponse.data ?? null) as WeeklyReviewRecord | null,
      logs: currentWeekLogs,
      moodAverage:
        moodSamples.length > 0 ? Number((moodSamples.reduce((sum, value) => sum + value, 0) / moodSamples.length).toFixed(2)) : null,
      focusAverage:
        focusSamples.length > 0 ? Number((focusSamples.reduce((sum, value) => sum + value, 0) / focusSamples.length).toFixed(2)) : null,
      winsCount,
    },
    focusTasks: buildActionTasks(
      ((focusTasksResponse.data ?? []) as TaskRecord[]),
      ((projectsForTasksResponse.data ?? []) as ProjectRecord[])
    ),
    activeProjectList: ((activeProjectsResponse.data ?? []) as ProjectRecord[]).map((project) => ({
      id: project.id,
      title: project.title,
      priority: project.priority,
      targetDate: project.target_date,
    })),
    openDecisionList: ((openDecisionsListResponse.data ?? []) as DecisionRecord[]).map((decision) => ({
      id: decision.id,
      title: decision.title,
      reviewDate: decision.review_date,
      expectedOutcome: decision.expected_outcome,
    })),
  };
}

export async function getInboxData() {
  const { supabase } = await getAuthedContext();
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();

  const [tasksResponse, notesResponse, resourcesResponse, decisionsResponse, projectsResponse] = await Promise.all([
    supabase
      .from("tasks")
      .select(
        "id, title, description, status, priority, due_date, energy_required, project_id, created_at, completed_at, estimated_minutes"
      )
      .eq("status", "inbox")
      .order("created_at", { ascending: false })
      .limit(16),
    supabase
      .from("notes")
      .select("id, title, content, summary, type, created_at, updated_at, project_id")
      .in("type", ["plain", "idea"])
      .gte("created_at", threeDaysAgo)
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("resources")
      .select("id, title, description, type, storage_mode, external_url, internal_path, preview_status, created_at, area_id")
      .gte("created_at", threeDaysAgo)
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("decisions")
      .select("id, title, context, expected_outcome, chosen_option, reasoning, review_date, status, project_id, created_at")
      .eq("status", "open")
      .gte("created_at", threeDaysAgo)
      .order("created_at", { ascending: false })
      .limit(8),
    supabase.from("projects").select("id, title").in("status", ["active", "on_hold"]),
  ]);

  const tasks = (tasksResponse.data ?? []) as TaskRecord[];
  const notes = (notesResponse.data ?? []) as NoteRecord[];
  const resources = (resourcesResponse.data ?? []) as ResourceRecord[];
  const decisions = (decisionsResponse.data ?? []) as DecisionRecord[];
  const projects = (projectsResponse.data ?? []) as InboxProjectOption[];

  const items: InboxItem[] = [
    ...tasks.map((task) => ({
      id: task.id,
      title: task.title,
      kind: "task" as const,
      createdAt: task.created_at,
      detail: `${task.priority} priority`,
      href: "/actions",
      task: {
        status: task.status,
        priority: task.priority,
        dueDate: task.due_date,
        projectId: task.project_id,
        description: task.description ?? null,
      },
    })),
    ...notes.map((note) => ({
      id: note.id,
      title: note.title,
      kind: "note" as const,
      createdAt: note.created_at,
      detail: note.type,
      href: `/knowledge/${note.id}`,
      note: {
        type: note.type,
        summary: note.summary,
        content: note.content,
        projectId: note.project_id,
      },
    })),
    ...resources
      .filter((resource) => !resource.description)
      .map((resource) => ({
        id: resource.id,
        title: resource.title,
        kind: "resource" as const,
        createdAt: resource.created_at,
        detail: resource.storage_mode,
        href: `/resources/${resource.id}`,
        resource: {
          type: resource.type,
          storageMode: resource.storage_mode,
          location: resource.external_url ?? resource.internal_path,
          description: resource.description,
        },
      })),
    ...decisions
      .filter((decision) => !decision.reasoning && !decision.chosen_option)
      .map((decision) => ({
        id: decision.id,
        title: decision.title,
        kind: "decision" as const,
        createdAt: decision.created_at,
        detail: decision.status,
        href: `/decisions/${decision.id}`,
        decision: {
          context: decision.context,
          expectedOutcome: decision.expected_outcome,
          chosenOption: decision.chosen_option,
          reasoning: decision.reasoning,
          reviewDate: decision.review_date,
          projectId: decision.project_id ?? null,
        },
      })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 20);

  return {
    items,
    counts: {
      tasks: tasks.length,
      notes: notes.length,
      resources: resources.filter((resource) => !resource.description).length,
      decisions: decisions.filter((decision) => !decision.reasoning && !decision.chosen_option).length,
    },
    projects,
  };
}

export async function getAreasData() {
  const { supabase } = await getAuthedContext();
  const [areasResponse, projectsResponse] = await Promise.all([
    supabase
      .from("areas")
      .select("id, name, description, type, color, icon")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
    supabase.from("projects").select("id, area_id").in("status", ["active", "on_hold"]),
  ]);

  const areas = (areasResponse.data ?? []) as AreaRecord[];
  const projects = projectsResponse.data ?? [];

  return {
    areas: areas.map((area) => ({
      ...area,
      activeProjectsCount: projects.filter((p) => p.area_id === area.id).length,
    })),
  };
}

export async function getProjectDetailData(id: string) {
  const { supabase } = await getAuthedContext();

  const [projectRes, tasksRes, notesRes, projectResourcesRes, decisionsRes, resourceOptions, taskOptions] = await Promise.all([
    supabase
      .from("projects")
      .select("id, title, description, status, priority, area_id, target_date, updated_at, created_at")
      .eq("id", id)
      .single(),
    supabase
      .from("tasks")
      .select("id, title, status, priority, due_date, energy_required, project_id, created_at, completed_at, estimated_minutes")
      .eq("project_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("notes")
      .select("id, title, content, summary, type, created_at, updated_at, project_id")
      .eq("project_id", id)
      .order("updated_at", { ascending: false }),
    supabase
      .from("project_resources")
      .select("resource_id")
      .eq("project_id", id),
    supabase
      .from("decisions")
      .select("id, title, status, review_date, expected_outcome")
      .eq("project_id", id)
      .order("created_at", { ascending: false }),
    getResourceOptions(supabase),
    getTaskOptions(supabase),
  ]);

  if (projectRes.error || !projectRes.data) {
    throw new Error("Project not found");
  }

  const project = projectRes.data as ProjectRecord;
  const tasks = (tasksRes.data ?? []) as TaskRecord[];
  const notes = (notesRes.data ?? []) as NoteRecord[];
  const decisions = (decisionsRes.data ?? []) as Array<{
    id: string;
    title: string;
    status: DecisionStatus;
    review_date: string | null;
    expected_outcome: string | null;
  }>;
  
  // Calculate stats
  const completedTaskCount = tasks.filter((task) => task.status === "done").length;
  const openTaskCount = tasks.filter((task) => isOpenTask(task.status)).length;
  const taskCount = tasks.length;
  const progress = taskCount === 0 ? 0 : Math.round((completedTaskCount / taskCount) * 100);

  let areaData = { name: "No area", color: null as string | null };
  if (project.area_id) {
    const { data } = await supabase
      .from("areas")
      .select("name, color")
      .eq("id", project.area_id)
      .maybeSingle();
    if (data) {
      areaData = { name: data.name, color: data.color };
    }
  }

  const resourceIds = projectResourcesRes.data?.map((pr) => pr.resource_id) || [];
  let resources: ResourceRecord[] = [];
  
  if (resourceIds.length > 0) {
    const { data: resData } = await supabase
      .from("resources")
      .select("id, title, description, type, storage_mode, external_url, internal_path, preview_status, created_at, area_id")
      .in("id", resourceIds)
      .order("created_at", { ascending: false });
    if (resData) {
      resources = resData as ResourceRecord[];
    }
  }

  return {
    project: {
      id: project.id,
      title: project.title,
      description: project.description,
      status: project.status,
      priority: project.priority,
      targetDate: project.target_date,
      updatedAt: project.updated_at,
      createdAt: project.created_at,
      areaId: project.area_id,
      areaName: areaData.name,
      areaColor: areaData.color,
      progress,
      openTaskCount,
      completedTaskCount
    },
    tasks: buildActionTasks(tasks, [project]),
    notes: notes.map<KnowledgeEntry>((note) => ({
      id: note.id,
      title: note.title,
      preview: notePreview(note),
      type: note.type,
      createdAt: note.created_at,
      updatedAt: note.updated_at,
    })),
    resources: resources.map<ResourceEntry>((resource) => ({
      id: resource.id,
      title: resource.title,
      description: resource.description,
      type: resource.type,
      storageMode: resource.storage_mode,
      location: resource.external_url ?? resource.internal_path,
      previewStatus: resource.preview_status,
      createdAt: resource.created_at,
    })),
    decisions: decisions.map<ProjectDecisionEntry>((decision) => ({
      id: decision.id,
      title: decision.title,
      status: decision.status,
      reviewDate: decision.review_date,
      expectedOutcome: decision.expected_outcome,
    })),
    resourceOptions,
    taskOptions,
  };
}

export async function getNoteDetailData(id: string) {
  const { supabase } = await getAuthedContext();

  const [noteRes, projectsRes, noteResourcesRes, resourceOptions, noteOptionsRes, outgoingRelationsRes, incomingRelationsRes] = await Promise.all([
    supabase
      .from("notes")
      .select("id, title, content, summary, type, is_archived, created_at, updated_at, project_id, source_resource_id")
      .eq("id", id)
      .single(),
    supabase.from("projects").select("id, title").order("title", { ascending: true }),
    supabase.from("note_resources").select("resource_id").eq("note_id", id),
    getResourceOptions(supabase),
    supabase
      .from("notes")
      .select("id, title, type")
      .neq("id", id)
      .eq("is_archived", false)
      .order("title", { ascending: true })
      .limit(200),
    supabase
      .from("note_relations")
      .select("id, relation, to_note_id")
      .eq("from_note_id", id),
    supabase
      .from("note_relations")
      .select("id, relation, from_note_id")
      .eq("to_note_id", id),
  ]);

  if (noteRes.error || !noteRes.data) {
    throw new Error("Note not found");
  }

  const note = noteRes.data as NoteRecord;
  const projects = (projectsRes.data ?? []) as InboxProjectOption[];
  const projectTitle = note.project_id ? projects.find((project) => project.id === note.project_id)?.title ?? null : null;
  const relationResourceIds = (noteResourcesRes.data ?? []).map((row) => row.resource_id);
  const resourceIds = [...new Set([...relationResourceIds, noteRes.data.source_resource_id].filter(Boolean) as string[])];
  const linkedResources = await getResourcesByIds(supabase, resourceIds);
  const noteOptions = ((noteOptionsRes.data ?? []) as Array<{ id: string; title: string; type: NoteType }>).map((entry) => ({
    id: entry.id,
    title: entry.title,
    type: entry.type,
  }));
  const relatedNoteIds = [
    ...((outgoingRelationsRes.data ?? []) as Array<{ to_note_id: string }>).map((row) => row.to_note_id),
    ...((incomingRelationsRes.data ?? []) as Array<{ from_note_id: string }>).map((row) => row.from_note_id),
  ];
  const uniqueRelatedNoteIds = [...new Set(relatedNoteIds)];
  const relatedNotesRes =
    uniqueRelatedNoteIds.length > 0
      ? await supabase.from("notes").select("id, title, type").in("id", uniqueRelatedNoteIds)
      : { data: [] as Array<{ id: string; title: string; type: NoteType }> };
  const relatedNoteById = new Map(
    (((relatedNotesRes.data ?? []) as Array<{ id: string; title: string; type: NoteType }>)).map((entry) => [entry.id, entry])
  );

  const outgoingRelations = ((outgoingRelationsRes.data ?? []) as Array<{ id: string; relation: RelationKind; to_note_id: string }>).flatMap<NoteRelationEntry>((relation) => {
    const related = relatedNoteById.get(relation.to_note_id);
    if (!related) return [];
    return [{
      id: relation.id,
      direction: "outgoing",
      relation: relation.relation,
      note: {
        id: related.id,
        title: related.title,
        type: related.type,
      },
    }];
  });

  const incomingRelations = ((incomingRelationsRes.data ?? []) as Array<{ id: string; relation: RelationKind; from_note_id: string }>).flatMap<NoteRelationEntry>((relation) => {
    const related = relatedNoteById.get(relation.from_note_id);
    if (!related) return [];
    return [{
      id: relation.id,
      direction: "incoming",
      relation: relation.relation,
      note: {
        id: related.id,
        title: related.title,
        type: related.type,
      },
    }];
  });

  return {
    note: {
      id: note.id,
      title: note.title,
      content: note.content,
      summary: note.summary,
      type: note.type,
      createdAt: note.created_at,
      updatedAt: note.updated_at,
      projectId: note.project_id,
      projectTitle,
      isArchived: note.is_archived ?? false,
      preview: notePreview(note),
    },
    projects,
    linkedResources,
    resourceOptions,
    noteOptions,
    noteRelations: [...outgoingRelations, ...incomingRelations],
  };
}

export async function getResourceDetailData(id: string) {
  const { supabase } = await getAuthedContext();

  const [resourceRes, projectLinksRes, noteLinksRes, taskLinksRes, decisionLinksRes] = await Promise.all([
    supabase
      .from("resources")
      .select(
        "id, title, description, type, storage_mode, source_provider, external_url, internal_path, mime_type, file_size_bytes, preview_status, is_archived, created_at, updated_at, area_id"
      )
      .eq("id", id)
      .single(),
    supabase.from("project_resources").select("project_id").eq("resource_id", id),
    supabase.from("note_resources").select("note_id").eq("resource_id", id),
    supabase.from("task_resources").select("task_id").eq("resource_id", id),
    supabase.from("decision_resources").select("decision_id").eq("resource_id", id),
  ]);

  if (resourceRes.error || !resourceRes.data) {
    throw new Error("Resource not found");
  }

  const resource = resourceRes.data as ResourceRecord;
  let signedUrl: string | null = null;

  if (resource.storage_mode === "internal" && resource.internal_path) {
    const signedUrlResponse = await supabase.storage
      .from(RESOURCE_BUCKET)
      .createSignedUrl(resource.internal_path, 60 * 60);

    if (!signedUrlResponse.error) {
      signedUrl = signedUrlResponse.data.signedUrl;
    }
  }

  const projectIds = (projectLinksRes.data ?? []).map((row) => row.project_id);
  const noteIds = (noteLinksRes.data ?? []).map((row) => row.note_id);
  const taskIds = (taskLinksRes.data ?? []).map((row) => row.task_id);
  const decisionIds = (decisionLinksRes.data ?? []).map((row) => row.decision_id);

  const [projectsRes, notesRes, tasksRes, decisionsRes] = await Promise.all([
    projectIds.length > 0
      ? supabase.from("projects").select("id, title").in("id", projectIds).order("updated_at", { ascending: false })
      : Promise.resolve({ data: [] as Array<{ id: string; title: string }> }),
    noteIds.length > 0
      ? supabase.from("notes").select("id, title").in("id", noteIds).order("updated_at", { ascending: false })
      : Promise.resolve({ data: [] as Array<{ id: string; title: string }> }),
    taskIds.length > 0
      ? supabase.from("tasks").select("id, title, status").in("id", taskIds).order("updated_at", { ascending: false })
      : Promise.resolve({ data: [] as Array<{ id: string; title: string; status: TaskStatus }> }),
    decisionIds.length > 0
      ? supabase.from("decisions").select("id, title, status").in("id", decisionIds).order("updated_at", { ascending: false })
      : Promise.resolve({ data: [] as Array<{ id: string; title: string; status: DecisionStatus }> }),
  ]);

  return {
    resource: {
      id: resource.id,
      title: resource.title,
      description: resource.description,
      type: resource.type,
      storageMode: resource.storage_mode,
      location: resource.external_url ?? resource.internal_path,
      sourceProvider: resource.source_provider ?? null,
      mimeType: resource.mime_type ?? null,
      fileSizeBytes: resource.file_size_bytes ?? null,
      previewStatus: resource.preview_status,
      signedUrl,
      previewUrl: signedUrl && isDirectPreviewableResource(resource.type) ? signedUrl : null,
      isArchived: resource.is_archived ?? false,
      createdAt: resource.created_at,
      updatedAt: resource.updated_at ?? resource.created_at,
    },
    backlinks: {
      projects: projectsRes.data ?? [],
      notes: notesRes.data ?? [],
      tasks: tasksRes.data ?? [],
      decisions: decisionsRes.data ?? [],
    },
  };
}

export async function getDecisionDetailData(id: string) {
  const { supabase } = await getAuthedContext();

  const [decisionRes, projectsRes, decisionResourcesRes, resourceOptions] = await Promise.all([
    supabase
      .from("decisions")
      .select(
        "id, title, context, expected_outcome, chosen_option, reasoning, review_date, status, outcome_notes, project_id, created_at, updated_at"
      )
      .eq("id", id)
      .single(),
    supabase.from("projects").select("id, title").order("title", { ascending: true }),
    supabase.from("decision_resources").select("resource_id").eq("decision_id", id),
    getResourceOptions(supabase),
  ]);

  if (decisionRes.error || !decisionRes.data) {
    throw new Error("Decision not found");
  }

  const decision = decisionRes.data as DecisionRecord;
  const projects = (projectsRes.data ?? []) as InboxProjectOption[];
  const projectTitle =
    decision.project_id ? projects.find((project) => project.id === decision.project_id)?.title ?? null : null;
  const resourceIds = (decisionResourcesRes.data ?? []).map((row) => row.resource_id);
  const linkedResources = await getResourcesByIds(supabase, resourceIds);

  return {
    decision: {
      id: decision.id,
      title: decision.title,
      context: decision.context,
      expectedOutcome: decision.expected_outcome,
      chosenOption: decision.chosen_option,
      reasoning: decision.reasoning,
      reviewDate: decision.review_date,
      status: decision.status,
      outcomeNotes: decision.outcome_notes ?? null,
      projectId: decision.project_id ?? null,
      projectTitle,
      createdAt: decision.created_at,
      updatedAt: decision.updated_at ?? decision.created_at,
    },
    projects,
    linkedResources,
    resourceOptions,
  };
}
