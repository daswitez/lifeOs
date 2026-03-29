import {
  LOG_ENERGIES,
  LOG_ENERGY_LABELS,
  type ResourceType,
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  TASK_RECURRENCE_LABELS,
  TASK_STATUS_LABELS,
} from "@/lib/domain";
import { CreateEntityModal } from "@/components/forms/create-entity-modal";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  createTaskAction,
  logTaskTimeAction,
  updateTaskStatusAction,
} from "@/server/actions/lifeos";
import { type ActionTask, getActionsData } from "@/server/queries/lifeos";
import { EditTaskModal } from "@/components/forms/edit-task-modal";
import { ManageResourceLinksModal } from "@/components/forms/manage-resource-links-modal";

function formatDate(value: string | null) {
  if (!value) return null;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function formatMinutes(value: number | null) {
  if (!value) return null;
  if (value < 60) return `${value}m`;

  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
}

function countTasks(tasks: ActionTask[]): number {
  return tasks.reduce((total, task) => total + 1 + countTasks(task.subtasks), 0);
}

function totalTrackedMinutes(tasks: ActionTask[]): number {
  return tasks.reduce(
    (total, task) => total + (task.actualMinutes ?? 0) + totalTrackedMinutes(task.subtasks),
    0
  );
}

function recurrenceLabel(rule: string | null) {
  if (!rule) return null;

  const normalized = rule.trim().toLowerCase();
  if (normalized in TASK_RECURRENCE_LABELS) {
    return TASK_RECURRENCE_LABELS[normalized as keyof typeof TASK_RECURRENCE_LABELS];
  }

  return rule;
}

type TaskCardProps = {
  task: ActionTask;
  projects: { id: string; title: string }[];
  taskOptions: { id: string; title: string; subtitle?: string | null }[];
  resourceOptions: { id: string; title: string; type: ResourceType }[];
  variant: "inbox" | "focus";
  depth?: number;
};

function TaskCard({
  task,
  projects,
  taskOptions,
  resourceOptions,
  variant,
  depth = 0,
}: TaskCardProps) {
  const recurrence = recurrenceLabel(task.recurrenceRule);
  const scheduledLabel = formatDate(task.scheduledFor);
  const dueLabel = formatDate(task.dueDate);
  const estimatedLabel = formatMinutes(task.estimatedMinutes);
  const actualLabel = formatMinutes(task.actualMinutes);
  const canTrackTime = task.status !== "inbox" && task.status !== "done";

  return (
    <article
      className={[
        "panel-quiet rounded-[26px] p-4 sm:p-5",
        depth > 0 ? "border-l border-[var(--border)]/80 bg-[var(--background)]/45 ml-3" : "",
      ].join(" ")}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="kicker-pill">{TASK_STATUS_LABELS[task.status]}</span>
            <span className="text-xs text-[var(--muted-foreground)]">
              {task.projectTitle ?? "No project"}
            </span>
            {task.parentTitle && depth === 0 && (
              <span className="text-xs text-[var(--muted-foreground)]">
                subtask of {task.parentTitle}
              </span>
            )}
          </div>
          <p className="mt-3 text-lg font-semibold text-[var(--foreground)]">{task.title}</p>
          {task.description && (
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
              {task.description}
            </p>
          )}
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            {TASK_PRIORITY_LABELS[task.priority]}
            {task.energy ? ` · ${LOG_ENERGY_LABELS[task.energy]}` : ""}
            {scheduledLabel ? ` · scheduled ${scheduledLabel}` : ""}
            {dueLabel ? ` · due ${dueLabel}` : ""}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {estimatedLabel && <span className="kicker-pill">estimate {estimatedLabel}</span>}
            {actualLabel && <span className="kicker-pill">tracked {actualLabel}</span>}
            {recurrence && <span className="kicker-pill">repeats {recurrence}</span>}
            {task.subtasks.length > 0 && (
              <span className="kicker-pill">{task.subtasks.length} subtasks</span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center md:justify-end">
          {variant === "inbox" && task.status === "inbox" && (
            <form action={updateTaskStatusAction}>
              <input type="hidden" name="id" value={task.id} />
              <input type="hidden" name="status" value="todo" />
              <SubmitButton pendingLabel="Activating..." variant="outline" size="sm" className="rounded-full">
                Activate
              </SubmitButton>
            </form>
          )}
          {task.status !== "in_progress" && task.status !== "done" && (
            <form action={updateTaskStatusAction}>
              <input type="hidden" name="id" value={task.id} />
              <input type="hidden" name="status" value="in_progress" />
              <SubmitButton pendingLabel="Moving..." variant="outline" size="sm" className="rounded-full">
                In progress
              </SubmitButton>
            </form>
          )}
          {task.status !== "done" && (
            <form action={updateTaskStatusAction}>
              <input type="hidden" name="id" value={task.id} />
              <input type="hidden" name="status" value="done" />
              <SubmitButton pendingLabel="Closing..." size="sm" className="rounded-full">
                Mark done
              </SubmitButton>
            </form>
          )}
          {canTrackTime && (
            <>
              <form action={logTaskTimeAction}>
                <input type="hidden" name="id" value={task.id} />
                <input type="hidden" name="minutes" value="15" />
                <SubmitButton pendingLabel="Logging..." variant="ghost" size="sm" className="rounded-full">
                  +15m
                </SubmitButton>
              </form>
              <form action={logTaskTimeAction}>
                <input type="hidden" name="id" value={task.id} />
                <input type="hidden" name="minutes" value="30" />
                <SubmitButton pendingLabel="Logging..." variant="ghost" size="sm" className="rounded-full">
                  +30m
                </SubmitButton>
              </form>
            </>
          )}
          <EditTaskModal
            task={{
              id: task.id,
              title: task.title,
              description: task.description,
              status: task.status,
              priority: task.priority,
              dueDate: task.dueDate,
              scheduledFor: task.scheduledFor,
              energy: task.energy,
              estimatedMinutes: task.estimatedMinutes,
              actualMinutes: task.actualMinutes,
              isRecurring: task.isRecurring,
              recurrenceRule: task.recurrenceRule,
              project_id: task.projectId,
              parentTaskId: task.parentTaskId,
            }}
            projects={projects}
            taskOptions={taskOptions}
          />
          <ManageResourceLinksModal
            entityType="task"
            entityId={task.id}
            entityTitle={task.title}
            linkedResources={task.resources ?? []}
            resourceOptions={resourceOptions}
            compact
          />
        </div>
      </div>

      {(task.resources?.length ?? 0) > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {task.resources?.map((resource) => (
            <span key={resource.id} className="kicker-pill">
              {resource.title}
            </span>
          ))}
        </div>
      )}

      {task.subtasks.length > 0 && (
        <div className="mt-5 space-y-3">
          {task.subtasks.map((subtask) => (
            <TaskCard
              key={subtask.id}
              task={subtask}
              projects={projects}
              taskOptions={taskOptions}
              resourceOptions={resourceOptions}
              variant={variant}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </article>
  );
}

export default async function ActionsPage() {
  const data = await getActionsData();
  const inboxCount = countTasks(data.inboxTasks);
  const focusCount = countTasks(data.focusTasks);
  const trackedMinutes = totalTrackedMinutes([...data.inboxTasks, ...data.focusTasks]);

  return (
    <div className="min-h-full px-5 py-6 sm:px-8 md:px-10 lg:px-12">
      <section className="panel-surface rounded-[32px] p-6 sm:p-8">
        <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
          <div>
            <div className="kicker-pill">Execution engine</div>
            <h1 className="title-balance mt-5 text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl">
              Actions that actually push the system
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[var(--muted-foreground)]">
              This view now handles three deeper execution moves: breaking work into subtasks,
              keeping recurring actions alive and tracking real minutes without leaving the queue.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="panel-quiet rounded-2xl p-4">
                <p className="eyebrow">Operational inbox</p>
                <p className="mt-3 text-3xl font-semibold text-[var(--foreground)]">{inboxCount}</p>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">items waiting for a clear execution shape</p>
              </div>
              <div className="panel-quiet rounded-2xl p-4">
                <p className="eyebrow">Active focus</p>
                <p className="mt-3 text-3xl font-semibold text-[var(--foreground)]">{focusCount}</p>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">actions and subtasks currently in motion</p>
              </div>
              <div className="panel-quiet rounded-2xl p-4">
                <p className="eyebrow">Tracked effort</p>
                <p className="mt-3 text-3xl font-semibold text-[var(--foreground)]">{formatMinutes(trackedMinutes) ?? "0m"}</p>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">logged directly from the execution board</p>
              </div>
            </div>
          </div>

          <div className="panel-quiet flex flex-col justify-between rounded-[28px] p-5">
            <div>
              <p className="eyebrow">Create without clutter</p>
              <h2 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
                Open task composer
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
                Create top-level actions, attach a subtask to an existing lever, define expected effort and leave recurrence ready from day one.
              </p>
            </div>

            <div className="mt-6">
              <CreateEntityModal
                title="New next action"
                description="Capture the action, decide whether it is a parent task or a subtask, and leave timing visible from the start."
                triggerLabel="New task"
                submitLabel="Create task"
                pendingLabel="Creating..."
                action={createTaskAction}
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block md:col-span-2">
                    <span className="eyebrow">Title</span>
                    <input
                      name="title"
                      required
                      placeholder="Describe the physical visible action"
                      className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)] outline-none"
                    />
                  </label>
                  <label className="block md:col-span-2">
                    <span className="eyebrow">Description</span>
                    <textarea
                      name="description"
                      rows={4}
                      placeholder="Clarify what done means, inputs, blockers or setup needed."
                      className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)] outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="eyebrow">Status</span>
                    <select
                      name="status"
                      defaultValue="todo"
                      className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-3 py-4 text-sm text-[var(--foreground)] outline-none"
                    >
                      <option value="inbox">Inbox</option>
                      <option value="todo">To do</option>
                      <option value="in_progress">In progress</option>
                      <option value="waiting">Waiting</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="eyebrow">Priority</span>
                    <select
                      name="priority"
                      defaultValue="medium"
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
                      defaultValue=""
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
                  <label className="block">
                    <span className="eyebrow">Project</span>
                    <select
                      name="project_id"
                      className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-3 py-4 text-sm text-[var(--foreground)] outline-none"
                    >
                      <option value="">No project</option>
                      {data.projects.map((project) => (
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
                      className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-3 py-4 text-sm text-[var(--foreground)] outline-none"
                    >
                      <option value="">Top-level task</option>
                      {data.taskOptions.map((task) => (
                        <option key={task.id} value={task.id}>
                          {task.title}
                          {task.subtitle ? ` · ${task.subtitle}` : ""}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="eyebrow">Scheduled for</span>
                    <input
                      name="scheduled_for"
                      type="date"
                      className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-3 py-4 text-sm text-[var(--foreground)] outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="eyebrow">Due date</span>
                    <input
                      name="due_date"
                      type="date"
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
                      className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-3 py-4 text-sm text-[var(--foreground)] outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="eyebrow">Recurrence</span>
                    <select
                      name="recurrence_preset"
                      defaultValue="none"
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
                      placeholder="Every first Monday, every 2 weeks..."
                      className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-3 py-4 text-sm text-[var(--foreground)] outline-none"
                    />
                  </label>
                </div>
              </CreateEntityModal>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="panel-surface rounded-[30px] p-6">
          <div>
            <p className="eyebrow">Clarify</p>
            <h2 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">Operational inbox</h2>
          </div>

          <div className="mt-6 space-y-3">
            {data.inboxTasks.length === 0 && (
              <p className="panel-quiet rounded-2xl p-5 text-sm text-[var(--muted-foreground)]">
                Clean inbox. Your system is ready to execute.
              </p>
            )}

            {data.inboxTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                projects={data.projects}
                taskOptions={data.taskOptions}
                resourceOptions={data.resourceOptions}
                variant="inbox"
              />
            ))}
          </div>
        </div>

        <div className="panel-surface rounded-[30px] p-6">
          <div>
            <p className="eyebrow">Execute</p>
            <h2 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">Today&apos;s focus</h2>
          </div>

          <div className="mt-6 space-y-3">
            {data.focusTasks.length === 0 && (
              <p className="panel-quiet rounded-2xl p-5 text-sm text-[var(--muted-foreground)]">
                No active focus yet. Promote something from inbox or create the next action with its timing already defined.
              </p>
            )}

            {data.focusTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                projects={data.projects}
                taskOptions={data.taskOptions}
                resourceOptions={data.resourceOptions}
                variant="focus"
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
