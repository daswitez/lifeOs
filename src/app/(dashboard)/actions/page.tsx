import { TASK_PRIORITIES, TASK_PRIORITY_LABELS } from "@/lib/domain";
import { CreateEntityModal } from "@/components/forms/create-entity-modal";
import { SubmitButton } from "@/components/ui/submit-button";
import { createTaskAction, updateTaskStatusAction } from "@/server/actions/lifeos";
import { getActionsData } from "@/server/queries/lifeos";
import { EditTaskModal } from "@/components/forms/edit-task-modal";

function formatDate(value: string | null) {
  if (!value) return "No date";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export default async function ActionsPage() {
  const data = await getActionsData();

  return (
    <div className="min-h-full px-5 py-6 sm:px-8 md:px-10 lg:px-12">
      <section className="panel-surface rounded-[32px] p-6 sm:p-8">
        <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <div>
            <div className="kicker-pill">Execution engine</div>
            <h1 className="title-balance mt-5 text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl">
              Actions that actually push the system
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-[var(--muted-foreground)]">
              This view clearly separates two moments: clarifying the ambiguous and executing what already has form.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="panel-quiet rounded-2xl p-4">
                <p className="eyebrow">Operational inbox</p>
                <p className="mt-3 text-3xl font-semibold text-[var(--foreground)]">{data.inboxTasks.length}</p>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">items waiting to become real actions</p>
              </div>
              <div className="panel-quiet rounded-2xl p-4">
                <p className="eyebrow">Active focus</p>
                <p className="mt-3 text-3xl font-semibold text-[var(--foreground)]">{data.focusTasks.length}</p>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">levers ready to pull today</p>
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
                Creation lives in a modal so the list remains the protagonist and the hierarchy doesn't break.
              </p>
            </div>

            <div className="mt-6">
              <CreateEntityModal
                title="New next action"
                description="Describe a physical and visible action. If you don't know how to execute it yet, leave it in the inbox; if it's clear, activate it."
                triggerLabel="New task"
                submitLabel="Create task"
                pendingLabel="Creating..."
                action={createTaskAction}
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="eyebrow">Title</span>
                    <input
                      name="title"
                      required
                      placeholder="Describe the physical visible action"
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
                  <label className="block">
                    <span className="eyebrow">Due date</span>
                    <input
                      name="due_date"
                      type="date"
                      className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-3 py-4 text-sm text-[var(--foreground)] outline-none"
                    />
                  </label>
                </div>
              </CreateEntityModal>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
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
              <article key={task.id} className="panel-quiet rounded-[26px] p-4">
                <p className="text-base font-semibold text-[var(--foreground)]">{task.title}</p>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                  captured {formatDate(task.createdAt)} · priority {task.priority}
                </p>
                <div className="mt-4 flex flex-wrap gap-2 items-center">
                  <form action={updateTaskStatusAction}>
                    <input type="hidden" name="id" value={task.id} />
                    <input type="hidden" name="status" value="todo" />
                    <SubmitButton pendingLabel="Activating..." variant="outline" size="sm" className="rounded-full">
                      Activate
                    </SubmitButton>
                  </form>
                  <form action={updateTaskStatusAction}>
                    <input type="hidden" name="id" value={task.id} />
                    <input type="hidden" name="status" value="done" />
                    <SubmitButton pendingLabel="Closing..." size="sm" className="rounded-full">
                      Close
                    </SubmitButton>
                  </form>
                  <EditTaskModal task={{
                    id: task.id,
                    title: task.title,
                    status: task.status,
                    priority: task.priority,
                    dueDate: task.dueDate,
                    project_id: task.projectId
                  }} projects={data.projects} />
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="panel-surface rounded-[30px] p-6">
          <div>
            <p className="eyebrow">Execute</p>
            <h2 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">Today's focus</h2>
          </div>

          <div className="mt-6 space-y-3">
            {data.focusTasks.map((task) => (
              <article key={task.id} className="panel-quiet rounded-[26px] p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="kicker-pill">{task.status}</span>
                      <span className="text-xs text-[var(--muted-foreground)]">
                        {task.projectTitle ?? "No project"}
                      </span>
                    </div>
                    <p className="mt-3 text-lg font-semibold text-[var(--foreground)]">{task.title}</p>
                    <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                      {task.priority}
                      {task.energy ? ` · ${task.energy}` : ""}
                      {task.dueDate ? ` · due ${formatDate(task.dueDate)}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    {task.status !== "in_progress" && (
                      <form action={updateTaskStatusAction}>
                        <input type="hidden" name="id" value={task.id} />
                        <input type="hidden" name="status" value="in_progress" />
                        <SubmitButton pendingLabel="Moving..." variant="outline" size="sm" className="rounded-full">
                          In progress
                        </SubmitButton>
                      </form>
                    )}
                    <form action={updateTaskStatusAction}>
                      <input type="hidden" name="id" value={task.id} />
                      <input type="hidden" name="status" value="done" />
                      <SubmitButton pendingLabel="Closing..." size="sm" className="rounded-full">
                        Mark done
                      </SubmitButton>
                    </form>
                    <EditTaskModal task={{
                      id: task.id,
                      title: task.title,
                      status: task.status,
                      priority: task.priority,
                      dueDate: task.dueDate,
                      project_id: task.projectId
                    }} projects={data.projects} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
