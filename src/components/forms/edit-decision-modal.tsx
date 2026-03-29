"use client";

import { DECISION_STATUSES } from "@/lib/domain";
import { updateDecisionAction } from "@/server/actions/lifeos";
import { EditEntityModal } from "./edit-entity-modal";

type EditDecisionModalProps = {
  decision: {
    id: string;
    title: string;
    context: string | null;
    expectedOutcome: string | null;
    chosenOption: string | null;
    reasoning: string | null;
    reviewDate: string | null;
    status: string;
    projectId?: string | null;
  };
  projects: { id: string; title: string }[];
};

export function EditDecisionModal({ decision, projects }: EditDecisionModalProps) {
  return (
    <EditEntityModal
      title="Edit decision"
      description="Complete the context, reasoning, and review horizon for this decision."
      submitLabel="Save changes"
      pendingLabel="Saving..."
      action={updateDecisionAction}
      className="md:min-w-[620px]"
    >
      <input type="hidden" name="id" value={decision.id} />

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block md:col-span-2">
          <span className="eyebrow">Title</span>
          <input
            name="title"
            required
            defaultValue={decision.title}
            className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)] outline-none"
          />
        </label>

        <label className="block">
          <span className="eyebrow">Status</span>
          <select
            name="status"
            defaultValue={decision.status}
            className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-3 py-4 text-sm text-[var(--foreground)] outline-none"
          >
            {DECISION_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status.replace("_", " ")}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="eyebrow">Review date</span>
          <input
            type="date"
            name="review_date"
            defaultValue={decision.reviewDate ?? ""}
            className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-3 py-4 text-sm text-[var(--foreground)] outline-none"
          />
        </label>

        <label className="block md:col-span-2">
          <span className="eyebrow">Project</span>
          <select
            name="project_id"
            defaultValue={decision.projectId ?? ""}
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
          <span className="eyebrow">Expected outcome</span>
          <input
            name="expected_outcome"
            defaultValue={decision.expectedOutcome ?? ""}
            className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)] outline-none"
          />
        </label>

        <label className="block md:col-span-2">
          <span className="eyebrow">Chosen option</span>
          <input
            name="chosen_option"
            defaultValue={decision.chosenOption ?? ""}
            className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)] outline-none"
          />
        </label>

        <label className="block md:col-span-2">
          <span className="eyebrow">Context</span>
          <textarea
            name="context"
            rows={5}
            defaultValue={decision.context ?? ""}
            className="mt-3 w-full resize-none rounded-[24px] border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)] outline-none"
          />
        </label>

        <label className="block md:col-span-2">
          <span className="eyebrow">Reasoning</span>
          <textarea
            name="reasoning"
            rows={6}
            defaultValue={decision.reasoning ?? ""}
            className="mt-3 w-full resize-none rounded-[24px] border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)] outline-none"
          />
        </label>
      </div>
    </EditEntityModal>
  );
}
