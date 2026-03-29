import { PROJECT_STATUSES, TASK_PRIORITIES, TASK_PRIORITY_LABELS } from "@/lib/domain";
import { CreateEntityModal } from "@/components/forms/create-entity-modal";
import { createProjectAction } from "@/server/actions/lifeos";
import { getProjectsData } from "@/server/queries/lifeos";

function formatDate(value: string | null) {
  if (!value) return "Sin target";
  return new Intl.DateTimeFormat("es-BO", {
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
      <section className="panel-surface rounded-[32px] p-6 sm:p-8">
        <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <div>
            <div className="kicker-pill">Vision y traccion</div>
            <h1 className="title-balance mt-5 text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl">
              Proyectos con direccion legible
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-[var(--muted-foreground)]">
              Cada tarjeta debe responder rapido tres preguntas: que resultado persigue, cuanta energia queda y si sigue mereciendo traccion.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="panel-quiet rounded-2xl p-4">
                <p className="eyebrow">Activos</p>
                <p className="mt-3 text-3xl font-semibold text-[var(--foreground)]">{activeCount}</p>
              </div>
              <div className="panel-quiet rounded-2xl p-4">
                <p className="eyebrow">En pausa</p>
                <p className="mt-3 text-3xl font-semibold text-[var(--foreground)]">{pausedCount}</p>
              </div>
            </div>
          </div>

          <div className="panel-quiet flex flex-col justify-between rounded-[28px] p-5">
            <div>
              <p className="eyebrow">Composer de proyecto</p>
              <h2 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
                Crear desde una pantalla dedicada
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
                El listado queda limpio y la tarjeta de proyecto sigue dominando la lectura. Crear no compite con escanear.
              </p>
            </div>

            <div className="mt-6">
              <CreateEntityModal
                title="Nuevo proyecto"
                description="Crea un frente de trabajo con resultado esperado, prioridad y target visible."
                triggerLabel="Nuevo proyecto"
                submitLabel="Crear proyecto"
                pendingLabel="Creando..."
                action={createProjectAction}
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="eyebrow">Titulo</span>
                    <input
                      name="title"
                      required
                      placeholder="Nombre del proyecto"
                      className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)] outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="eyebrow">Target date</span>
                    <input
                      name="target_date"
                      type="date"
                      className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-3 py-4 text-sm text-[var(--foreground)] outline-none"
                    />
                  </label>
                  <label className="block md:col-span-2">
                    <span className="eyebrow">Descripcion</span>
                    <input
                      name="description"
                      placeholder="Resultado esperado o frente de trabajo"
                      className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)] outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="eyebrow">Estado</span>
                    <select
                      name="status"
                      defaultValue="active"
                      className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-3 py-4 text-sm text-[var(--foreground)] outline-none"
                    >
                      {PROJECT_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="eyebrow">Prioridad</span>
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
                </div>
              </CreateEntityModal>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {data.projects.map((project) => (
          <article
            key={project.id}
            className="panel-surface group flex flex-col rounded-[30px] p-6 transition-all hover:-translate-y-0.5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="eyebrow">{project.areaName}</p>
                <h2 className="mt-3 text-xl font-semibold text-[var(--foreground)]">{project.title}</h2>
              </div>
              <span className="kicker-pill">{project.status}</span>
            </div>

            <p className="mt-5 min-h-[72px] text-sm leading-relaxed text-[var(--muted-foreground)]">
              {project.description || "Proyecto sin descripcion aun. Define el resultado final para clarificar el rumbo."}
            </p>

            <div className="soft-rule mt-5 pt-5">
              <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
                <span>{project.openTaskCount} abiertas</span>
                <span>{project.completedTaskCount} cerradas</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--accent-soft)]">
                <div className="h-full bg-[var(--foreground)]" style={{ width: `${project.progress}%` }} />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="panel-quiet rounded-2xl p-3">
                <p className="eyebrow">Target</p>
                <p className="mt-2 text-sm text-[var(--foreground)]">{formatDate(project.targetDate)}</p>
              </div>
              <div className="panel-quiet rounded-2xl p-3">
                <p className="eyebrow">Priority</p>
                <p className="mt-2 text-sm text-[var(--foreground)]">{project.priority}</p>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
