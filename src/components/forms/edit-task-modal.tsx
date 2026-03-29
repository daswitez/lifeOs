"use client";

import { EditEntityModal } from "./edit-entity-modal";
import { updateTaskAction } from "@/server/actions/lifeos";
import { TASK_PRIORITIES, TASK_PRIORITY_LABELS } from "@/lib/domain";

type EditTaskModalProps = {
  task: {
    id: string;
    title: string;
    status: string;
    priority: string;
    dueDate: string | null;
    project_id?: string | null;
  };
  projects: { id: string; title: string }[];
};

export function EditTaskModal({ task, projects }: EditTaskModalProps) {
  // Extract date part safely if it's a full ISO string
  const dateValue = task.dueDate ? task.dueDate.split("T")[0] : "";

  return (
    <EditEntityModal
      title="Edit action"
      description="Refine this action or link it to a project container."
      submitLabel="Save changes"
      pendingLabel="Saving..."
      action={updateTaskAction}
      className="md:min-w-[500px]"
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
          <span className="eyebrow">Due date</span>
          <input
            name="due_date"
            type="date"
            defaultValue={dateValue}
            className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-3 py-4 text-sm text-[var(--foreground)] outline-none"
          />
        </label>
      </div>
    </EditEntityModal>
  );
}
