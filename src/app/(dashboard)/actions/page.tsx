import { TASK_PRIORITIES, TASK_PRIORITY_LABELS } from "@/lib/domain";
import { CreateEntityModal } from "@/components/forms/create-entity-modal";
import { SubmitButton } from "@/components/ui/submit-button";
import { createTaskAction, updateTaskStatusAction } from "@/server/actions/lifeos";
import { getActionsData } from "@/server/queries/lifeos";

function formatDate(value: string | null) {
  if (!value) return "Sin fecha";
  return new Intl.DateTimeFormat("es-BO", {
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
            <div className="kicker-pill">Motor de ejecucion</div>
            <h1 className="title-balance mt-5 text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl">
              Acciones que si empujan el sistema
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-[var(--muted-foreground)]">
              Esta vista separa claramente dos momentos: aclarar lo ambiguo y ejecutar lo que ya tiene forma.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="panel-quiet rounded-2xl p-4">
                <p className="eyebrow">Inbox operacional</p>
                <p className="mt-3 text-3xl font-semibold text-[var(--foreground)]">{data.inboxTasks.length}</p>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">items esperando volverse accion real</p>
              </div>
              <div className="panel-quiet rounded-2xl p-4">
                <p className="eyebrow">Foco activo</p>
                <p className="mt-3 text-3xl font-semibold text-[var(--foreground)]">{data.focusTasks.length}</p>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">palancas ya listas para mover hoy</p>
              </div>
            </div>
          </div>

          <div className="panel-quiet flex flex-col justify-between rounded-[28px] p-5">
            <div>
              <p className="eyebrow">Crear sin ensuciar el canvas</p>
              <h2 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
                Abrir composer de tarea
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
                La creacion vive en modal para que la lista siga siendo protagonista y la jerarquia no se rompa.
              </p>
            </div>

            <div className="mt-6">
              <CreateEntityModal
                title="Nueva siguiente accion"
                description="Describe una accion fisica y visible. Si aun no sabes ejecutarla, dejala en inbox; si ya esta clara, activala directo."
                triggerLabel="Nueva tarea"
                submitLabel="Crear tarea"
                pendingLabel="Creando..."
                action={createTaskAction}
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="eyebrow">Titulo</span>
                    <input
                      name="title"
                      required
                      placeholder="Describe la accion fisica visible"
                      className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)] outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="eyebrow">Estado</span>
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
            <p className="eyebrow">Clarificar</p>
            <h2 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">Inbox operacional</h2>
          </div>

          <div className="mt-6 space-y-3">
            {data.inboxTasks.length === 0 && (
              <p className="panel-quiet rounded-2xl p-5 text-sm text-[var(--muted-foreground)]">
                Inbox limpio. Tu sistema esta listo para ejecutar.
              </p>
            )}

            {data.inboxTasks.map((task) => (
              <article key={task.id} className="panel-quiet rounded-[26px] p-4">
                <p className="text-base font-semibold text-[var(--foreground)]">{task.title}</p>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                  capturada {formatDate(task.createdAt)} · prioridad {task.priority}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <form action={updateTaskStatusAction}>
                    <input type="hidden" name="id" value={task.id} />
                    <input type="hidden" name="status" value="todo" />
                    <SubmitButton pendingLabel="Activando..." variant="outline" size="sm" className="rounded-full">
                      Activar
                    </SubmitButton>
                  </form>
                  <form action={updateTaskStatusAction}>
                    <input type="hidden" name="id" value={task.id} />
                    <input type="hidden" name="status" value="done" />
                    <SubmitButton pendingLabel="Cerrando..." size="sm" className="rounded-full">
                      Cerrar
                    </SubmitButton>
                  </form>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="panel-surface rounded-[30px] p-6">
          <div>
            <p className="eyebrow">Ejecutar</p>
            <h2 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">Foco de hoy</h2>
          </div>

          <div className="mt-6 space-y-3">
            {data.focusTasks.map((task) => (
              <article key={task.id} className="panel-quiet rounded-[26px] p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="kicker-pill">{task.status}</span>
                      <span className="text-xs text-[var(--muted-foreground)]">
                        {task.projectTitle ?? "Sin proyecto"}
                      </span>
                    </div>
                    <p className="mt-3 text-lg font-semibold text-[var(--foreground)]">{task.title}</p>
                    <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                      {task.priority}
                      {task.energy ? ` · ${task.energy}` : ""}
                      {task.dueDate ? ` · vence ${formatDate(task.dueDate)}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {task.status !== "in_progress" && (
                      <form action={updateTaskStatusAction}>
                        <input type="hidden" name="id" value={task.id} />
                        <input type="hidden" name="status" value="in_progress" />
                        <SubmitButton pendingLabel="Moviendo..." variant="outline" size="sm" className="rounded-full">
                          En progreso
                        </SubmitButton>
                      </form>
                    )}
                    <form action={updateTaskStatusAction}>
                      <input type="hidden" name="id" value={task.id} />
                      <input type="hidden" name="status" value="done" />
                      <SubmitButton pendingLabel="Cerrando..." size="sm" className="rounded-full">
                        Marcar done
                      </SubmitButton>
                    </form>
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
