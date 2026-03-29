"use client";

import { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { ArchiveX, CheckCircle2, Settings2, X } from "lucide-react";
import Link from "next/link";
import { processInboxItemAction, clarifyInboxItemAction } from "@/server/actions/lifeos";
import { cn } from "@/lib/utils";
import {
  DECISION_STATUSES,
  NOTE_TYPES,
  NOTE_TYPE_LABELS,
  RESOURCE_TYPES,
  RESOURCE_TYPE_LABELS,
  STORAGE_MODES,
  STORAGE_MODE_LABELS,
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
} from "@/lib/domain";
import { Button } from "./button";

type InboxProjectOption = {
  id: string;
  title: string;
};

type InboxItem = {
  id: string;
  title: string;
  kind: "task" | "note" | "resource" | "decision";
  createdAt: string;
  detail: string;
  href: string;
  task?: {
    status: string;
    priority: string;
    dueDate: string | null;
    projectId: string | null;
    description: string | null;
  };
  note?: {
    type: string;
    summary: string | null;
    content: string;
    projectId: string | null;
  };
  resource?: {
    type: string;
    storageMode: string;
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

type InboxProcessorProps = {
  item: InboxItem;
  kindCopy: string;
  dateStr: string;
  projects: InboxProjectOption[];
};

function inferredTaskDescription(item: InboxItem) {
  if (item.task?.description) return item.task.description;
  if (item.note?.summary) return item.note.summary;
  if (item.note?.content) return item.note.content;
  if (item.resource?.description) return item.resource.description;
  if (item.resource?.location) return item.resource.location;
  if (item.decision?.context) return item.decision.context;
  if (item.decision?.expectedOutcome) return item.decision.expectedOutcome;
  return "";
}

function inferredNoteContent(item: InboxItem) {
  if (item.note?.content) return item.note.content;

  const parts = [
    item.task?.description,
    item.resource?.description,
    item.resource?.location,
    item.decision?.context,
    item.decision?.reasoning,
    item.decision?.expectedOutcome,
  ].filter(Boolean);

  return parts.join("\n\n");
}

function inferredDecisionContext(item: InboxItem) {
  return item.decision?.context ?? item.note?.summary ?? item.task?.description ?? item.resource?.description ?? "";
}

function inferredDecisionOutcome(item: InboxItem) {
  return item.decision?.expectedOutcome ?? "";
}

export function InboxProcessorForm({ item, kindCopy, dateStr, projects }: InboxProcessorProps) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [targetKind, setTargetKind] = useState<InboxItem["kind"]>(item.kind);
  const [error, setError] = useState<string | null>(null);

  const handleProcess = (actionType: "activate" | "archive") => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("id", item.id);
      formData.append("kind", item.kind);
      formData.append("actionType", actionType);
      await processInboxItemAction(formData);
    });
  };

  const handleClarify = async (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      try {
        await clarifyInboxItemAction(formData);
        setOpen(false);
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "Could not clarify this inbox item.");
      }
    });
  };

  const openClarifyModal = () => {
    setTargetKind(item.kind);
    setError(null);
    setOpen(true);
  };

  return (
    <>
      <div
        className={cn(
          "panel-quiet group relative flex flex-col gap-3 rounded-[26px] p-4 transition-all hover:border-[var(--foreground)]/15 sm:flex-row sm:items-center sm:justify-between",
          isPending && "pointer-events-none opacity-50"
        )}
      >
        <Link href={item.href} className="min-w-0 flex-1 pr-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="kicker-pill">{item.kind}</span>
            <span className="text-xs text-[var(--muted-foreground)]">{kindCopy}</span>
          </div>
          <p className="mt-3 text-base font-semibold text-[var(--foreground)] hover:underline">{item.title}</p>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">{item.detail}</p>
        </Link>

        <div className="mt-2 flex items-center justify-between gap-2 border-t border-[var(--border)] pt-3 text-sm text-[var(--muted-foreground)] sm:mt-0 sm:justify-end sm:border-0 sm:pt-0">
          <span className="block font-mono sm:hidden">{dateStr}</span>

          <div className="flex flex-wrap items-center gap-2 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
            {["task", "note"].includes(item.kind) && (
              <button
                onClick={() => handleProcess("activate")}
                disabled={isPending}
                className="flex items-center gap-1.5 rounded-full bg-[var(--foreground)] px-3 py-1.5 text-xs font-medium text-[var(--background)] shadow-sm transition-transform hover:scale-105 disabled:opacity-50"
                title="Quick activate"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">Activate</span>
              </button>
            )}

            <button
              onClick={openClarifyModal}
              disabled={isPending}
              className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-xs font-medium text-[var(--muted-foreground)] transition-colors hover:border-[var(--foreground)] hover:text-[var(--foreground)] disabled:opacity-50"
              title="Clarify"
            >
              <Settings2 className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">Clarify</span>
            </button>

            <button
              onClick={() => handleProcess("archive")}
              disabled={isPending}
              className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-xs font-medium text-[var(--muted-foreground)] transition-colors hover:border-[var(--foreground)] hover:text-[var(--foreground)] disabled:opacity-50"
              title="Archive"
            >
              <ArchiveX className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">Archive</span>
            </button>

            <Link
              href={item.href}
              className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--background)] p-1.5 text-[var(--muted-foreground)] transition-colors hover:border-[var(--foreground)] hover:text-[var(--foreground)]"
              title="Open details"
            >
              <Settings2 className="h-3.5 w-3.5" />
            </Link>
          </div>

          <span className="ml-2 hidden font-mono sm:block">{dateStr}</span>
        </div>
      </div>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6">
            <button
              type="button"
              aria-label="Close clarify modal"
              className="absolute inset-0 bg-[color:color-mix(in_srgb,var(--foreground)_28%,transparent)] backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            <div className="panel-surface relative z-10 max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[32px] p-6 text-left sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">Clarify inbox item</p>
                  <h2 className="mt-3 text-3xl font-semibold text-[var(--foreground)]">{item.title}</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--muted-foreground)]">
                    Decide what this really is, complete the minimum metadata, and send it to its proper home.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-[var(--border)] p-2 text-[var(--muted-foreground)] transition-colors hover:bg-[var(--accent-soft)] hover:text-[var(--foreground)]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form action={handleClarify} className="mt-8">
                <input type="hidden" name="id" value={item.id} />
                <input type="hidden" name="source_kind" value={item.kind} />
                <input type="hidden" name="target_kind" value={targetKind} />

                <div className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block md:col-span-2">
                      <span className="eyebrow">Destination</span>
                      <select
                        name="target_kind_selector"
                        value={targetKind}
                        onChange={(event) => setTargetKind(event.target.value as InboxItem["kind"])}
                        className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-3 py-4 text-sm text-[var(--foreground)] outline-none"
                      >
                        <option value="task">Task</option>
                        <option value="note">Note</option>
                        <option value="resource">Resource</option>
                        <option value="decision">Decision</option>
                      </select>
                    </label>

                    <label className="block md:col-span-2">
                      <span className="eyebrow">Title</span>
                      <input
                        name="title"
                        required
                        defaultValue={item.title}
                        className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)] outline-none"
                      />
                    </label>
                  </div>

                  <div key={targetKind}>
                    {targetKind === "task" && (
                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="block md:col-span-2">
                          <span className="eyebrow">Description</span>
                          <textarea
                            name="description"
                            rows={4}
                            defaultValue={inferredTaskDescription(item)}
                            className="mt-3 w-full resize-none rounded-[24px] border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)] outline-none"
                          />
                        </label>

                        <label className="block">
                          <span className="eyebrow">Status</span>
                          <select
                            name="status"
                            defaultValue={item.task?.status ?? "todo"}
                            className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-3 py-4 text-sm text-[var(--foreground)] outline-none"
                          >
                            {TASK_STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {TASK_STATUS_LABELS[status]}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="block">
                          <span className="eyebrow">Priority</span>
                          <select
                            name="priority"
                            defaultValue={item.task?.priority ?? "medium"}
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
                          <span className="eyebrow">Project</span>
                          <select
                            name="project_id"
                            defaultValue={item.task?.projectId ?? item.note?.projectId ?? item.decision?.projectId ?? ""}
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

                        <label className="block">
                          <span className="eyebrow">Due date</span>
                          <input
                            type="date"
                            name="due_date"
                            defaultValue={item.task?.dueDate?.split("T")[0] ?? ""}
                            className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-3 py-4 text-sm text-[var(--foreground)] outline-none"
                          />
                        </label>
                      </div>
                    )}

                    {targetKind === "note" && (
                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="block">
                          <span className="eyebrow">Type</span>
                          <select
                            name="type"
                            defaultValue={item.note?.type ?? "atomic"}
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
                            defaultValue={item.note?.projectId ?? item.task?.projectId ?? item.decision?.projectId ?? ""}
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
                            defaultValue={item.note?.summary ?? ""}
                            className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)] outline-none"
                          />
                        </label>

                        <label className="block md:col-span-2">
                          <span className="eyebrow">Content</span>
                          <textarea
                            name="content"
                            rows={8}
                            defaultValue={inferredNoteContent(item)}
                            className="mt-3 w-full resize-none rounded-[24px] border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)] outline-none"
                          />
                        </label>
                      </div>
                    )}

                    {targetKind === "resource" && (
                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="block">
                          <span className="eyebrow">Storage</span>
                          <select
                            name="storage_mode"
                            defaultValue={item.resource?.storageMode ?? "external"}
                            className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-3 py-4 text-sm text-[var(--foreground)] outline-none"
                          >
                            {STORAGE_MODES.map((mode) => (
                              <option key={mode} value={mode}>
                                {STORAGE_MODE_LABELS[mode]}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="block">
                          <span className="eyebrow">Type</span>
                          <select
                            name="type"
                            defaultValue={item.resource?.type ?? "link"}
                            className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-3 py-4 text-sm text-[var(--foreground)] outline-none"
                          >
                            {RESOURCE_TYPES.map((type) => (
                              <option key={type} value={type}>
                                {RESOURCE_TYPE_LABELS[type]}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="block md:col-span-2">
                          <span className="eyebrow">Location</span>
                          <input
                            name="location"
                            required
                            defaultValue={item.resource?.location ?? ""}
                            className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)] outline-none"
                          />
                        </label>

                        <label className="block md:col-span-2">
                          <span className="eyebrow">Description</span>
                          <textarea
                            name="description"
                            rows={6}
                            defaultValue={item.resource?.description ?? ""}
                            className="mt-3 w-full resize-none rounded-[24px] border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)] outline-none"
                          />
                        </label>
                      </div>
                    )}

                    {targetKind === "decision" && (
                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="block">
                          <span className="eyebrow">Status</span>
                          <select
                            name="status"
                            defaultValue="open"
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
                            defaultValue={item.decision?.reviewDate ?? ""}
                            className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-3 py-4 text-sm text-[var(--foreground)] outline-none"
                          />
                        </label>

                        <label className="block md:col-span-2">
                          <span className="eyebrow">Project</span>
                          <select
                            name="project_id"
                            defaultValue={item.decision?.projectId ?? item.task?.projectId ?? item.note?.projectId ?? ""}
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
                            defaultValue={inferredDecisionOutcome(item)}
                            className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)] outline-none"
                          />
                        </label>

                        <label className="block md:col-span-2">
                          <span className="eyebrow">Chosen option</span>
                          <input
                            name="chosen_option"
                            defaultValue={item.decision?.chosenOption ?? ""}
                            className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)] outline-none"
                          />
                        </label>

                        <label className="block md:col-span-2">
                          <span className="eyebrow">Context</span>
                          <textarea
                            name="context"
                            rows={5}
                            defaultValue={inferredDecisionContext(item)}
                            className="mt-3 w-full resize-none rounded-[24px] border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)] outline-none"
                          />
                        </label>

                        <label className="block md:col-span-2">
                          <span className="eyebrow">Reasoning</span>
                          <textarea
                            name="reasoning"
                            rows={6}
                            defaultValue={item.decision?.reasoning ?? ""}
                            className="mt-3 w-full resize-none rounded-[24px] border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)] outline-none"
                          />
                        </label>
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-sm text-red-600">
                      {error}
                    </div>
                  )}
                </div>

                <div className="soft-rule mt-8 flex flex-col gap-3 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Clarify first, then let the rest of the system take over.
                  </p>
                  <div className="flex gap-3">
                    <Button type="button" variant="outline" className="rounded-full px-5" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="rounded-full px-5" disabled={isPending}>
                      {isPending ? "Clarifying..." : "Save clarification"}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
