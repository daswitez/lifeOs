import { PROJECT_STATUSES, TASK_PRIORITIES, TASK_PRIORITY_LABELS } from "@/lib/domain";
import { CreateEntityModal } from "@/components/forms/create-entity-modal";
import { createProjectAction } from "@/server/actions/lifeos";
import { getProjectsData } from "@/server/queries/lifeos";
import Link from "next/link";
import { EditProjectModal } from "@/components/forms/edit-project-modal";

function formatDate(value: string | null) {
  if (!value) return "No target";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export default async function ProjectsPage() {
  const data = await getProjectsData();
  const activeCount = data.projects.filter((project) => project.status === "active").length;
  const pausedCount = data.projects.filter((project) => project.status === "on_hold").length;

  return (
    <div className="min-h-full px-5 py-6 sm:px-8 md:px-10 lg:px-12">
      <section className="panel-surface rounded-[32px] p-6 sm:p-8 anim-fade-in-up">
        <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <div>
            <div className="kicker-pill">Vision & traction</div>
            <h1 className="title-balance mt-5 text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl">
              Projects with clear direction
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-[var(--muted-foreground)]">
              Each card should quickly answer three questions: what outcome it pursues, how much energy remains, and whether it still deserves traction.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="panel-quiet rounded-2xl p-4">
                <p className="eyebrow">Active</p>
                <p className="mt-3 text-3xl font-semibold text-[var(--foreground)]">{activeCount}</p>
              </div>
              <div className="panel-quiet rounded-2xl p-4">
                <p className="eyebrow">On hold</p>
                <p className="mt-3 text-3xl font-semibold text-[var(--foreground)]">{pausedCount}</p>
              </div>
            </div>
          </div>

          <div className="panel-quiet flex flex-col justify-between rounded-[28px] p-5">
            <div>
              <p className="eyebrow">Project composer</p>
              <h2 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
                Create from a dedicated screen
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
                The list stays clean and the project card keeps dominating the reading. Creating doesn&apos;t compete with scanning.
              </p>
            </div>

            <div className="mt-6">
              <CreateEntityModal
                title="New project"
                description="Create a work front with expected outcome, priority and visible target."
                triggerLabel="New project"
                submitLabel="Create project"
                pendingLabel="Creating..."
                action={createProjectAction}
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="eyebrow">Title</span>
                    <input
                      name="title"
                      required
                      placeholder="Project name"
                      className="input-ring mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)]"
                    />
                  </label>
                  <label className="block">
                    <span className="eyebrow">Target date</span>
                    <input
                      name="target_date"
                      type="date"
                      className="input-ring mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-3 py-4 text-sm text-[var(--foreground)]"
                    />
                  </label>
                  <label className="block md:col-span-2">
                    <span className="eyebrow">Description</span>
                    <input
                      name="description"
                      placeholder="Expected outcome or work front"
                      className="input-ring mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)]"
                    />
                  </label>
                  <label className="block">
                    <span className="eyebrow">Status</span>
                    <select
                      name="status"
                      defaultValue="active"
                      className="input-ring mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-3 py-4 text-sm text-[var(--foreground)]"
                    >
                      {PROJECT_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="eyebrow">Area</span>
                    <select
                      name="area_id"
                      className="input-ring mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-3 py-4 text-sm text-[var(--foreground)]"
                    >
                      <option value="">No area</option>
                      {data.areas.map((area) => (
                        <option key={area.id} value={area.id}>
                          {area.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="eyebrow">Priority</span>
                    <select
                      name="priority"
                      defaultValue="medium"
                      className="input-ring mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-3 py-4 text-sm text-[var(--foreground)]"
                    >
                      {TASK_PRIORITIES.map((priority) => (
                        <option key={priority} value={priority}>
                          {TASK_PRIORITY_LABELS[priority]}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </CreateEntityModal>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3 stagger">
        {data.projects.map((project) => (
          <article
            key={project.id}
            className="panel-surface group flex h-full flex-col rounded-[30px] p-6 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)] relative"
          >
            <div className="flex items-start justify-between gap-3 relative z-10">
              <div>
                <p className="eyebrow">{project.areaName}</p>
                <div className="flex items-center gap-2 mt-3">
                  <Link href={`/projects/${project.id}`} className="text-xl font-semibold text-[var(--foreground)] hover:underline">
                    {project.title}
                  </Link>
                  <EditProjectModal project={{
                    id: project.id,
                    title: project.title,
                    description: project.description,
                    status: project.status,
                    priority: project.priority,
                    targetDate: project.targetDate,
                    area_id: project.areaId
                  }} areas={data.areas} />
                </div>
              </div>
              <span className="kicker-pill">{project.status.replace('_', ' ')}</span>
            </div>

            <p className="mt-5 min-h-[72px] text-sm leading-relaxed text-[var(--muted-foreground)]">
              {project.description || "Project without description yet. Define the final outcome to clarify direction."}
            </p>

            <div className="soft-rule mt-5 pt-5">
              <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
                <span>{project.openTaskCount} open</span>
                <span>{project.completedTaskCount} closed</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--accent-soft)]">
                <div className="progress-bar h-full rounded-full" style={{ width: `${project.progress}%` }} />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="panel-quiet rounded-2xl p-3">
                <p className="eyebrow">Target</p>
                <p className="mt-2 text-sm text-[var(--foreground)]">{formatDate(project.targetDate)}</p>
              </div>
              <div className="panel-quiet rounded-2xl p-3">
                <p className="eyebrow">Priority</p>
                <p className="mt-2 text-sm text-[var(--foreground)]">{TASK_PRIORITY_LABELS[project.priority as keyof typeof TASK_PRIORITY_LABELS] ?? project.priority}</p>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
