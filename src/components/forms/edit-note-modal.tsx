"use client";

import { NOTE_TYPES, NOTE_TYPE_LABELS } from "@/lib/domain";
import { updateNoteAction } from "@/server/actions/lifeos";
import { EditEntityModal } from "./edit-entity-modal";

type EditNoteModalProps = {
  note: {
    id: string;
    title: string;
    content: string;
    summary: string | null;
    type: string;
    projectId?: string | null;
    isArchived?: boolean;
  };
  projects: { id: string; title: string }[];
  triggerLabel?: string;
  alwaysVisible?: boolean;
  triggerClassName?: string;
};

export function EditNoteModal({
  note,
  projects,
  triggerLabel,
  alwaysVisible,
  triggerClassName,
}: EditNoteModalProps) {
  return (
    <EditEntityModal
      title="Edit note"
      description="Refine the note, its summary, and the project context around it."
      submitLabel="Save changes"
      pendingLabel="Saving..."
      action={updateNoteAction}
      className="md:min-w-[560px]"
      triggerLabel={triggerLabel}
      triggerTitle="Edit note"
      alwaysVisible={alwaysVisible}
      triggerClassName={triggerClassName}
    >
      <input type="hidden" name="id" value={note.id} />
      <input type="hidden" name="is_archived" value={note.isArchived ? "true" : "false"} />

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block md:col-span-2">
          <span className="eyebrow">Title</span>
          <input
            name="title"
            required
            defaultValue={note.title}
            className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)] outline-none"
          />
        </label>

        <label className="block">
          <span className="eyebrow">Type</span>
          <select
            name="type"
            defaultValue={note.type}
            className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-3 py-4 text-sm text-[var(--foreground)] outline-none"
          >
            {NOTE_TYPES.map((type) => (
              <option key={type} value={type}>
                {NOTE_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="eyebrow">Project</span>
          <select
            name="project_id"
            defaultValue={note.projectId ?? ""}
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
          <span className="eyebrow">Summary</span>
          <input
            name="summary"
            defaultValue={note.summary ?? ""}
            className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)] outline-none"
          />
        </label>

        <label className="block md:col-span-2">
          <span className="eyebrow">Content</span>
          <textarea
            name="content"
            rows={10}
            defaultValue={note.content}
            className="mt-3 w-full resize-none rounded-[24px] border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)] outline-none"
          />
        </label>
      </div>
    </EditEntityModal>
  );
}
