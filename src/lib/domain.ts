export const AREA_TYPES = [
  "life",
  "work",
  "health",
  "learning",
  "finance",
  "relationships",
  "personal",
  "other",
] as const;

export const PROJECT_STATUSES = [
  "active",
  "on_hold",
  "completed",
  "archived",
  "cancelled",
] as const;

export const TASK_STATUSES = [
  "inbox",
  "todo",
  "in_progress",
  "waiting",
  "done",
  "cancelled",
  "archived",
] as const;

export const TASK_PRIORITIES = ["low", "medium", "high", "urgent"] as const;

export const NOTE_TYPES = [
  "plain",
  "atomic",
  "literature",
  "meeting",
  "journal",
  "summary",
  "idea",
  "reference",
] as const;

export const RESOURCE_TYPES = [
  "link",
  "pdf",
  "image",
  "video",
  "book",
  "paper",
  "article",
  "course",
  "audio",
  "file",
  "other",
] as const;

export const STORAGE_MODES = ["internal", "external"] as const;

export const PREVIEW_STATUSES = ["none", "pending", "ready", "failed"] as const;

export const DECISION_STATUSES = [
  "open",
  "validated",
  "invalidated",
  "mixed",
  "superseded",
] as const;

export const LOG_ENERGIES = [
  "very_low",
  "low",
  "medium",
  "high",
  "very_high",
] as const;

export const RELATION_KINDS = [
  "inspired_by",
  "supports",
  "blocks",
  "references",
  "derived_from",
  "related_to",
] as const;

export type AreaType = (typeof AREA_TYPES)[number];
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];
export type TaskStatus = (typeof TASK_STATUSES)[number];
export type TaskPriority = (typeof TASK_PRIORITIES)[number];
export type NoteType = (typeof NOTE_TYPES)[number];
export type ResourceType = (typeof RESOURCE_TYPES)[number];
export type StorageMode = (typeof STORAGE_MODES)[number];
export type PreviewStatus = (typeof PREVIEW_STATUSES)[number];
export type DecisionStatus = (typeof DECISION_STATUSES)[number];
export type LogEnergy = (typeof LOG_ENERGIES)[number];
export type RelationKind = (typeof RELATION_KINDS)[number];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  inbox: "Inbox",
  todo: "To Do",
  in_progress: "In Progress",
  waiting: "Waiting",
  done: "Done",
  cancelled: "Cancelled",
  archived: "Archived",
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const NOTE_TYPE_LABELS: Record<NoteType, string> = {
  plain: "Plain",
  atomic: "Atomic",
  literature: "Literature",
  meeting: "Meeting",
  journal: "Journal",
  summary: "Summary",
  idea: "Idea",
  reference: "Reference",
};

export const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  link: "Link",
  pdf: "PDF",
  image: "Image",
  video: "Video",
  book: "Book",
  paper: "Paper",
  article: "Article",
  course: "Course",
  audio: "Audio",
  file: "File",
  other: "Other",
};

export const STORAGE_MODE_LABELS: Record<StorageMode, string> = {
  internal: "Internal",
  external: "External",
};

export const LOG_ENERGY_LABELS: Record<LogEnergy, string> = {
  very_low: "Very Low",
  low: "Low",
  medium: "Medium",
  high: "High",
  very_high: "Very High",
};

export const AREA_TYPE_LABELS: Record<AreaType, string> = {
  life: "Life",
  work: "Work",
  health: "Health",
  learning: "Learning",
  finance: "Finance",
  relationships: "Relationships",
  personal: "Personal",
  other: "Other",
};
