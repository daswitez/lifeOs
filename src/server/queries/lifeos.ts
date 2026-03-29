import { createClient } from "@/lib/supabase/server";
import type {
  DecisionStatus,
  LogEnergy,
  NoteType,
  PreviewStatus,
  ProjectStatus,
  ResourceType,
  StorageMode,
  TaskPriority,
  TaskStatus,
} from "@/lib/domain";

type TaskRecord = {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  energy_required: LogEnergy | null;
  project_id: string | null;
  created_at: string;
  completed_at: string | null;
  estimated_minutes: number | null;
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
};

type NoteRecord = {
  id: string;
  title: string;
  content: string;
  summary: string | null;
  type: NoteType;
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
  external_url: string | null;
  internal_path: string | null;
  preview_status: PreviewStatus;
  created_at: string;
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
  next_focus: string | null;
  created_at: string;
};

type ProjectSummary = {
  id: string;
  title: string;
  description: string | null;
  status: ProjectStatus;
  priority: TaskPriority;
  areaName: string;
  targetDate: string | null;
  updatedAt: string;
  createdAt: string;
  taskCount: number;
  openTaskCount: number;
  completedTaskCount: number;
  progress: number;
};

type ActionTask = {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  energy: LogEnergy | null;
  createdAt: string;
  estimatedMinutes: number | null;
  projectTitle: string | null;
};

type KnowledgeEntry = {
  id: string;
  title: string;
  preview: string;
  type: NoteType;
  createdAt: string;
  updatedAt: string;
};

type ResourceEntry = {
  id: string;
  title: string;
  description: string | null;
  type: ResourceType;
  storageMode: StorageMode;
  location: string | null;
  previewStatus: PreviewStatus;
  createdAt: string;
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

type InboxItem = {
  id: string;
  title: string;
  kind: "task" | "note" | "resource" | "decision";
  createdAt: string;
  detail: string;
  href: string;
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

  return tasks.map<ActionTask>((task) => ({
    id: task.id,
    title: task.title,
    status: task.status,
    priority: task.priority,
    dueDate: task.due_date,
    energy: task.energy_required,
    createdAt: task.created_at,
    estimatedMinutes: task.estimated_minutes,
    projectTitle: task.project_id ? projectById.get(task.project_id) ?? null : null,
  }));
}

export async function getSidebarData() {
  const { supabase } = await getAuthedContext();
  const { count } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .eq("status", "inbox");

  return {
    inboxCount: count ?? 0,
  };
}

export async function getDashboardData() {
  const { supabase } = await getAuthedContext();
  const today = new Date().toISOString().slice(0, 10);

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
        "id, title, status, priority, due_date, energy_required, project_id, created_at, completed_at, estimated_minutes"
      )
      .in("status", ["inbox", "todo", "in_progress", "waiting", "done"])
      .order("created_at", { ascending: false })
      .limit(80),
    supabase
      .from("projects")
      .select("id, title, description, status, priority, area_id, target_date, updated_at, created_at")
      .in("status", ["active", "on_hold"])
      .order("updated_at", { ascending: false })
      .limit(20),
    supabase.from("areas").select("id, name").order("name"),
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

  const focusTasks = buildActionTasks(
    tasks.filter((task) => ["todo", "in_progress", "waiting"].includes(task.status)),
    projects
  )
    .sort((a, b) => {
      const priorityDiff = priorityScore(b.priority) - priorityScore(a.priority);
      if (priorityDiff !== 0) return priorityDiff;
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .slice(0, 6);

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

  return {
    dailyLog,
    lastWeeklyReview,
    focusTasks,
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
  };
}

export async function getActionsData() {
  const { supabase } = await getAuthedContext();
  const [tasksResponse, projectsResponse] = await Promise.all([
    supabase
      .from("tasks")
      .select(
        "id, title, status, priority, due_date, energy_required, project_id, created_at, completed_at, estimated_minutes"
      )
      .in("status", ["inbox", "todo", "in_progress", "waiting"])
      .order("created_at", { ascending: false })
      .limit(60),
    supabase.from("projects").select("id, title, description, status, priority, area_id, target_date, updated_at, created_at"),
  ]);

  const tasks = (tasksResponse.data ?? []) as TaskRecord[];
  const projects = (projectsResponse.data ?? []) as ProjectRecord[];
  const allTasks = buildActionTasks(tasks, projects);

  return {
    inboxTasks: allTasks.filter((task) => task.status === "inbox"),
    focusTasks: allTasks
      .filter((task) => task.status !== "inbox")
      .sort((a, b) => {
        const priorityDiff = priorityScore(b.priority) - priorityScore(a.priority);
        if (priorityDiff !== 0) return priorityDiff;
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }),
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
    supabase.from("areas").select("id, name"),
  ]);

  return {
    projects: buildProjectSummaries(
      (projectsResponse.data ?? []) as ProjectRecord[],
      (tasksResponse.data ?? []) as TaskRecord[],
      (areasResponse.data ?? []) as AreaRecord[]
    ),
  };
}

export async function getKnowledgeData() {
  const { supabase } = await getAuthedContext();
  const { data } = await supabase
    .from("notes")
    .select("id, title, content, summary, type, created_at, updated_at, project_id")
    .order("updated_at", { ascending: false })
    .limit(40);

  const notes = (data ?? []) as NoteRecord[];

  return {
    notes: notes.map<KnowledgeEntry>((note) => ({
      id: note.id,
      title: note.title,
      preview: notePreview(note),
      type: note.type,
      createdAt: note.created_at,
      updatedAt: note.updated_at,
    })),
  };
}

export async function getResourcesData() {
  const { supabase } = await getAuthedContext();
  const { data } = await supabase
    .from("resources")
    .select("id, title, description, type, storage_mode, external_url, internal_path, preview_status, created_at, area_id")
    .order("created_at", { ascending: false })
    .limit(40);

  const resources = (data ?? []) as ResourceRecord[];

  return {
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
  const [reviewsResponse, dailyLogsResponse, inboxCountResponse, openProjectsResponse, openDecisionsResponse] =
    await Promise.all([
      supabase
        .from("weekly_reviews")
        .select("id, week_start, week_end, summary, wins, next_focus, created_at")
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
    ]);

  return {
    reviews: ((reviewsResponse.data ?? []) as WeeklyReviewRecord[]),
    recentDailyLogs: ((dailyLogsResponse.data ?? []) as DailyLogRecord[]),
    inboxCount: inboxCountResponse.count ?? 0,
    activeProjects: openProjectsResponse.count ?? 0,
    openDecisions: openDecisionsResponse.count ?? 0,
  };
}

export async function getInboxData() {
  const { supabase } = await getAuthedContext();
  const [tasksResponse, notesResponse, resourcesResponse, decisionsResponse] = await Promise.all([
    supabase
      .from("tasks")
      .select(
        "id, title, status, priority, due_date, energy_required, project_id, created_at, completed_at, estimated_minutes"
      )
      .eq("status", "inbox")
      .order("created_at", { ascending: false })
      .limit(16),
    supabase
      .from("notes")
      .select("id, title, content, summary, type, created_at, updated_at, project_id")
      .in("type", ["plain", "idea"])
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("resources")
      .select("id, title, description, type, storage_mode, external_url, internal_path, preview_status, created_at, area_id")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("decisions")
      .select("id, title, context, expected_outcome, chosen_option, reasoning, review_date, status, created_at")
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const tasks = (tasksResponse.data ?? []) as TaskRecord[];
  const notes = (notesResponse.data ?? []) as NoteRecord[];
  const resources = (resourcesResponse.data ?? []) as ResourceRecord[];
  const decisions = (decisionsResponse.data ?? []) as DecisionRecord[];

  const items: InboxItem[] = [
    ...tasks.map((task) => ({
      id: task.id,
      title: task.title,
      kind: "task" as const,
      createdAt: task.created_at,
      detail: `${task.priority} priority`,
      href: "/actions",
    })),
    ...notes.map((note) => ({
      id: note.id,
      title: note.title,
      kind: "note" as const,
      createdAt: note.created_at,
      detail: note.type,
      href: "/knowledge",
    })),
    ...resources
      .filter((resource) => !resource.description)
      .map((resource) => ({
        id: resource.id,
        title: resource.title,
        kind: "resource" as const,
        createdAt: resource.created_at,
        detail: resource.storage_mode,
        href: "/resources",
      })),
    ...decisions
      .filter((decision) => !decision.reasoning && !decision.chosen_option)
      .map((decision) => ({
        id: decision.id,
        title: decision.title,
        kind: "decision" as const,
        createdAt: decision.created_at,
        detail: decision.status,
        href: "/decisions",
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
  };
}
