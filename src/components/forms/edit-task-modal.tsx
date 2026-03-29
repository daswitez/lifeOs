"use client";

import { EditEntityModal } from "./edit-entity-modal";
import { updateTaskAction } from "@/server/actions/lifeos";
import {
  LOG_ENERGIES,
  LOG_ENERGY_LABELS,
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  TASK_RECURRENCE_LABELS,
} from "@/lib/domain";

type EditTaskModalProps = {
  task: {
    id: string;
    title: string;
    description?: string | null;
    status: string;
    priority: string;
    dueDate: string | null;
    scheduledFor?: string | null;
    energy?: string | null;
    estimatedMinutes?: number | null;
    actualMinutes?: number | null;
    isRecurring?: boolean;
    recurrenceRule?: string | null;
    project_id?: string | null;
    parentTaskId?: string | null;
  };
  projects: { id: string; title: string }[];
  taskOptions: { id: string; title: string; subtitle?: string | null }[];
};

const recurrencePresets = ["daily", "weekdays", "weekly", "monthly"] as const;

export function EditTaskModal({ task, projects, taskOptions }: EditTaskModalProps) {
  const dateValue = task.dueDate ? task.dueDate.split("T")[0] : "";
  const scheduledValue = task.scheduledFor ? task.scheduledFor.split("T")[0] : "";
  const recurrencePreset =
    task.isRecurring && task.recurrenceRule && recurrencePresets.includes(task.recurrenceRule as typeof recurrencePresets[number])
      ? task.recurrenceRule
      : task.isRecurring && task.recurrenceRule
        ? "custom"
        : "none";

  return (
    <EditEntityModal
      title="Edit action"
      description="Refine scope, execution shape, recurrence and tracked effort without leaving the flow."
      submitLabel="Save changes"
      pendingLabel="Saving..."
      action={updateTaskAction}
      className="md:min-w-[640px]"
    >
      <input type="hidden" name="id" value={task.id} />
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block md:col-span-2">
          <span className="eyebrow">Title</span>
          <input
            name="title"
            required
            defaultValue={task.title}
            className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)] outline-none focus:border-[var(--foreground)]/50"
          />
        </label>
        <label className="block md:col-span-2">
          <span className="eyebrow">Description</span>
          <textarea
            name="description"
            rows={4}
            defaultValue={task.description ?? ""}
            placeholder="What does done mean here?"
            className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)] outline-none focus:border-[var(--foreground)]/50"
          />
        </label>
        <label className="block">
          <span className="eyebrow">Status</span>
          <select
            name="status"
            defaultValue={task.status}
            className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-3 py-4 text-sm text-[var(--foreground)] outline-none"
          >
            <option value="inbox">Inbox</option>
            <option value="todo">To do</option>
            <option value="in_progress">In progress</option>
            <option value="done">Done</option>
            <option value="archived">Archived</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>
        <label className="block">
          <span className="eyebrow">Priority</span>
          <select
            name="priority"
            defaultValue={task.priority}
            className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-3 py-4 text-sm text-[var(--foreground)] outline-none"
          >
            {TASK_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {TASK_PRIORITY_LABELS[priority]}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="eyebrow">Energy</span>
          <select
            name="energy"
            defaultValue={task.energy ?? ""}
            className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-3 py-4 text-sm text-[var(--foreground)] outline-none"
          >
            <option value="">No energy signal</option>
            {LOG_ENERGIES.map((energy) => (
              <option key={energy} value={energy}>
                {LOG_ENERGY_LABELS[energy]}
              </option>
            ))}
          </select>
        </label>
        <label className="block md:col-span-2">
          <span className="eyebrow">Project</span>
          <select
            name="project_id"
            defaultValue={task.project_id || ""}
            className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-3 py-4 text-sm text-[var(--foreground)] outline-none"
          >
            <option value="">No project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>
        </label>
        <label className="block md:col-span-2">
          <span className="eyebrow">Parent task</span>
          <select
            name="parent_task_id"
            defaultValue={task.parentTaskId || ""}
            className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-3 py-4 text-sm text-[var(--foreground)] outline-none"
          >
            <option value="">Top-level task</option>
            {taskOptions
              .filter((option) => option.id !== task.id)
              .map((option) => (
                <option key={option.id} value={option.id}>
                  {option.title}
                  {option.subtitle ? ` · ${option.subtitle}` : ""}
                </option>
              ))}
          </select>
        </label>
        <label className="block">
          <span className="eyebrow">Scheduled for</span>
          <input
            name="scheduled_for"
            type="date"
            defaultValue={scheduledValue}
            className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-3 py-4 text-sm text-[var(--foreground)] outline-none"
          />
        </label>
        <label className="block md:col-span-2">
          <span className="eyebrow">Due date</span>
          <input
            name="due_date"
            type="date"
            defaultValue={dateValue}
            className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-3 py-4 text-sm text-[var(--foreground)] outline-none"
          />
        </label>
        <label className="block">
          <span className="eyebrow">Estimated minutes</span>
          <input
            name="estimated_minutes"
            type="number"
            min="0"
            step="5"
            defaultValue={task.estimatedMinutes ?? ""}
            className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-3 py-4 text-sm text-[var(--foreground)] outline-none"
          />
        </label>
        <label className="block">
          <span className="eyebrow">Tracked minutes</span>
          <input
            name="actual_minutes"
            type="number"
            min="0"
            step="5"
            defaultValue={task.actualMinutes ?? ""}
            className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-3 py-4 text-sm text-[var(--foreground)] outline-none"
          />
        </label>
        <label className="block">
          <span className="eyebrow">Recurrence</span>
          <select
            name="recurrence_preset"
            defaultValue={recurrencePreset}
            className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-3 py-4 text-sm text-[var(--foreground)] outline-none"
          >
            <option value="none">Does not repeat</option>
            {Object.entries(TASK_RECURRENCE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="eyebrow">Custom recurrence note</span>
          <input
            name="recurrence_custom"
            defaultValue={recurrencePreset === "custom" ? task.recurrenceRule ?? "" : ""}
            placeholder="Every first Monday, every 2 weeks..."
            className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-3 py-4 text-sm text-[var(--foreground)] outline-none"
          />
        </label>
      </div>
    </EditEntityModal>
  );
}
