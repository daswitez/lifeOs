"use client";

import { EditEntityModal } from "./edit-entity-modal";
import { updateProjectAction } from "@/server/actions/lifeos";
import { PROJECT_STATUSES, TASK_PRIORITIES, TASK_PRIORITY_LABELS } from "@/lib/domain";

type EditProjectModalProps = {
  project: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    targetDate: string | null;
    area_id?: string | null;
  };
  areas: { id: string; name: string }[];
};

export function EditProjectModal({ project, areas }: EditProjectModalProps) {
  // Extract date part safely if it's a full ISO string
  const dateValue = project.targetDate ? project.targetDate.split("T")[0] : "";

  return (
    <EditEntityModal
      title="Edit project"
      description="Update project milestones or assign it to an area."
      submitLabel="Save changes"
      pendingLabel="Saving..."
      action={updateProjectAction}
      className="md:min-w-[500px]"
    >
      <input type="hidden" name="id" value={project.id} />
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block md:col-span-2">
          <span className="eyebrow">Title</span>
          <input
            name="title"
            required
            defaultValue={project.title}
            className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)] outline-none focus:border-[var(--foreground)]/50"
          />
        </label>
        <label className="block md:col-span-2">
          <span className="eyebrow">Area</span>
          <select
            name="area_id"
            defaultValue={project.area_id || ""}
            className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-3 py-4 text-sm text-[var(--foreground)] outline-none"
          >
            <option value="">No area</option>
            {areas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block md:col-span-2">
          <span className="eyebrow">Description</span>
          <input
            name="description"
            defaultValue={project.description || ""}
            className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)] outline-none focus:border-[var(--foreground)]/50"
          />
        </label>
        <label className="block">
          <span className="eyebrow">Status</span>
          <select
            name="status"
            defaultValue={project.status}
            className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-3 py-4 text-sm text-[var(--foreground)] outline-none"
          >
            {PROJECT_STATUSES.map(s => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="eyebrow">Priority</span>
          <select
            name="priority"
            defaultValue={project.priority}
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
          <span className="eyebrow">Target date</span>
          <input
            name="target_date"
            type="date"
            defaultValue={dateValue}
            className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-3 py-4 text-sm text-[var(--foreground)] outline-none"
          />
        </label>
      </div>
    </EditEntityModal>
  );
}
