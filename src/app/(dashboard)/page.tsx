import Link from "next/link";
import {
  CalendarClock,
  Clock3,
  ChevronRight,
  Compass,
  Flame,
  Inbox,
  Library,
  Repeat2,
  Sparkles,
  Target,
} from "lucide-react";
import {
  LOG_ENERGIES,
  LOG_ENERGY_LABELS,
  TASK_PRIORITY_LABELS,
  TASK_RECURRENCE_LABELS,
  TASK_STATUS_LABELS,
} from "@/lib/domain";
import { SubmitButton } from "@/components/ui/submit-button";
import { type ActionTask, getDashboardData } from "@/server/queries/lifeos";
import { upsertDailyLogAction } from "@/server/actions/lifeos";

function formatLongDate(value: string | Date) {
  return new Intl.DateTimeFormat("es-BO", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("es-BO", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function formatTaskTiming(task: ActionTask) {
  if (task.scheduledFor) return `programada ${formatShortDate(task.scheduledFor)}`;
  if (task.dueDate) return `vence ${formatShortDate(task.dueDate)}`;
  return "sin fecha";
}

function recurrenceLabel(rule: string | null) {
  if (!rule) return null;
  const normalized = rule.trim().toLowerCase();
  if (normalized in TASK_RECURRENCE_LABELS) {
    return TASK_RECURRENCE_LABELS[normalized as keyof typeof TASK_RECURRENCE_LABELS];
  }
  return rule;
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos dias.";
  if (hour < 19) return "Buenas tardes.";
  return "Buenas noches.";
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  const workflow = [
    {
      label: "Hoy",
      value: data.todayTasks.length,
      detail: "tareas aterrizan hoy",
      href: "/actions",
      icon: CalendarClock,
    },
    {
      label: "Esta Semana",
      value: data.weekTasks.length,
      detail: "cosas se acumulan esta semana",
      href: "/actions",
      icon: Clock3,
    },
    {
      label: "Bandeja de Entrada",
      value: data.inboxCount,
      detail: "items esperan aclaracion",
      href: "/inbox",
      icon: Inbox,
    },
    {
      label: "Tareas Activas",
      value: data.focusTasks.length,
      detail: "palancas activas hoy",
      href: "/actions",
      icon: Flame,
    },
    {
      label: "Decisiones Abiertas",
      value: data.openDecisionCount,
      detail: "decisiones abiertas",
      href: "/decisions",
      icon: Compass,
    },
    {
      label: "Proyectos en Curso",
      value: data.activeProjectCount,
      detail: "proyectos estan vivos",
      href: "/projects",
      icon: Target,
    },
  ];

  return (
    <div className="flex min-h-full flex-col gap-8 px-5 py-6 sm:px-8 md:px-10 md:py-8 lg:px-12">
      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="panel-surface rounded-[32px] p-6 sm:p-8">
          <div className="kicker-pill">
            <Sparkles className="h-3 w-3" />
            Tu Día
          </div>
          <h1 className="title-balance mt-5 text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl">
            {greeting()}
          </h1>
          <p className="mt-3 font-mono text-sm text-[var(--muted-foreground)]">
            {formatLongDate(new Date())}
          </p>
          <p className="title-balance mt-6 max-w-2xl text-base leading-relaxed text-[var(--muted-foreground)] sm:text-lg">
            Vistazo general de tus tareas y frentes abiertos. Manten el sistema actualizado para liberar tu mente.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {workflow.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="panel-quiet group rounded-3xl p-4 transition-all hover:-translate-y-0.5 hover:border-[var(--foreground)]/20"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.28em] text-[var(--muted-foreground)]">
                      {item.label}
                    </span>
                    <Icon className="h-4 w-4 text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]" />
                  </div>
                  <p className="mt-4 text-3xl font-semibold text-[var(--foreground)]">{item.value}</p>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
                    {item.detail}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>

        <form action={upsertDailyLogAction} className="panel-surface rounded-[32px] p-6 sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="eyebrow">Registro Diario</p>
              <h2 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
                Cerrar el día
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--muted-foreground)]">
                Registra cómo estuvo tu foco y qué lograste hoy para medir tu energía a largo plazo.
              </p>
            </div>
            {data.dailyLog && <div className="kicker-pill">Guardado hoy</div>}
          </div>

          <div className="mt-7 grid gap-3 md:grid-cols-3">
            <label className="panel-quiet rounded-2xl p-3 text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
              Mood
              <select
                name="mood"
                defaultValue={data.dailyLog?.mood?.toString() ?? ""}
                className="mt-3 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-3 text-sm normal-case tracking-normal text-[var(--foreground)] outline-none"
              >
                <option value="">Sin registro</option>
                {[1, 2, 3, 4, 5].map((score) => (
                  <option key={score} value={score}>
                    {score}/5
                  </option>
                ))}
              </select>
            </label>

            <label className="panel-quiet rounded-2xl p-3 text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
              Focus
              <select
                name="focus_score"
                defaultValue={data.dailyLog?.focus_score?.toString() ?? ""}
                className="mt-3 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-3 text-sm normal-case tracking-normal text-[var(--foreground)] outline-none"
              >
                <option value="">Sin registro</option>
                {[1, 2, 3, 4, 5].map((score) => (
                  <option key={score} value={score}>
                    {score}/5
                  </option>
                ))}
              </select>
            </label>

            <label className="panel-quiet rounded-2xl p-3 text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
              Energia
              <select
                name="energy"
                defaultValue={data.dailyLog?.energy ?? ""}
                className="mt-3 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-3 text-sm normal-case tracking-normal text-[var(--foreground)] outline-none"
              >
                <option value="">Sin registro</option>
                {LOG_ENERGIES.map((energy) => (
                  <option key={energy} value={energy}>
                    {LOG_ENERGY_LABELS[energy]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="mt-4 block text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
            Wins del dia
            <textarea
              name="wins"
              defaultValue={data.dailyLog?.wins ?? ""}
              rows={3}
              placeholder="Que salio bien hoy? Que merece quedarse en memoria?"
              className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm normal-case tracking-normal text-[var(--foreground)] outline-none resize-none"
            />
          </label>

          <div className="soft-rule mt-6 flex flex-col gap-4 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[var(--muted-foreground)]">
              {data.lastWeeklyReview
                ? `Ultima revision semanal: ${formatShortDate(data.lastWeeklyReview.week_end)}`
                : "Aun no hay revision semanal guardada."}
            </p>
            <SubmitButton pendingLabel="Guardando..." className="rounded-full px-5">
              Guardar check-in <ChevronRight className="h-3 w-3" />
            </SubmitButton>
          </div>
        </form>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <section className="panel-surface rounded-[30px] p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow">Hoy</p>
                <h2 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
                  Tablero de aterrizaje
                </h2>
              </div>
              <Link href="/actions" className="text-sm font-medium text-[var(--foreground)] hover:underline">
                Ver todas las tareas
              </Link>
            </div>

            <div className="mt-6 space-y-3">
              {data.todayTasks.length === 0 && (
                <p className="panel-quiet rounded-2xl p-5 text-sm leading-relaxed text-[var(--muted-foreground)]">
                  Hoy no tiene una lista clara todavía. Programa tareas en `Actions` para que la home funcione como agenda operativa.
                </p>
              )}

              {data.todayTasks.map((task) => (
                <article
                  key={task.id}
                  className="panel-quiet rounded-2xl p-4 transition-all hover:-translate-y-0.5 hover:border-[var(--foreground)]/15"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-base font-semibold text-[var(--foreground)]">{task.title}</p>
                      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                        {task.projectTitle ?? "Sin proyecto"} · {TASK_PRIORITY_LABELS[task.priority]}
                        {task.energy ? ` · ${LOG_ENERGY_LABELS[task.energy]}` : ""}
                        {` · ${formatTaskTiming(task)}`}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {task.isRecurring && (
                          <span className="kicker-pill">
                            <Repeat2 className="h-3 w-3" />
                            {recurrenceLabel(task.recurrenceRule) ?? "Recurrente"}
                          </span>
                        )}
                        {task.estimatedMinutes && (
                          <span className="kicker-pill">estimado {task.estimatedMinutes}m</span>
                        )}
                        {task.actualMinutes && (
                          <span className="kicker-pill">real {task.actualMinutes}m</span>
                        )}
                      </div>
                    </div>
                    <span className="kicker-pill">{TASK_STATUS_LABELS[task.status]}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="panel-surface rounded-[30px] p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow">Semana actual</p>
                <h2 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
                  Horizonte semanal
                </h2>
              </div>
              <p className="text-sm text-[var(--muted-foreground)]">
                {formatShortDate(data.currentWeek.weekStart)} - {formatShortDate(data.currentWeek.weekEnd)}
              </p>
            </div>

            <div className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-3">
                {data.weekTasks.length === 0 ? (
                  <p className="panel-quiet rounded-2xl p-5 text-sm leading-relaxed text-[var(--muted-foreground)]">
                    La semana no tiene cola visible todavía. Puedes programar tareas con `scheduled_for` para convertir esto en un radar real.
                  </p>
                ) : (
                  data.weekTasks.map((task) => (
                    <article key={task.id} className="panel-quiet rounded-2xl p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[var(--foreground)]">{task.title}</p>
                          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                            {task.projectTitle ?? "Sin proyecto"} · {formatTaskTiming(task)}
                          </p>
                        </div>
                        <span className="kicker-pill">{TASK_PRIORITY_LABELS[task.priority]}</span>
                      </div>
                    </article>
                  ))
                )}
              </div>

              <div className="space-y-3">
                <article className="panel-quiet rounded-[28px] p-5">
                  <p className="eyebrow">Revision semanal</p>
                  <h3 className="mt-3 text-lg font-semibold text-[var(--foreground)]">
                    {data.lastWeeklyReview?.next_focus || "Todavia no definiste el siguiente foco"}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
                    {data.lastWeeklyReview?.summary || "La ultima review todavia no tiene un resumen guardado."}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <span className="kicker-pill">{data.overdueCount} vencidas</span>
                    <span className="kicker-pill">{data.weeklyDecisionReviews.length} decisiones para revisar</span>
                  </div>
                </article>

                <article className="panel-quiet rounded-[28px] p-5">
                  <p className="eyebrow">Decision reviews</p>
                  <div className="mt-4 space-y-3">
                    {data.weeklyDecisionReviews.length === 0 && (
                      <p className="text-sm text-[var(--muted-foreground)]">
                        Esta semana no hay decisiones abiertas con review_date cercana.
                      </p>
                    )}
                    {data.weeklyDecisionReviews.map((decision) => (
                      <Link
                        key={decision.id}
                        href={`/decisions/${decision.id}`}
                        className="block rounded-2xl border border-[var(--border)] px-4 py-3 transition-all hover:border-[var(--foreground)]/15"
                      >
                        <p className="text-sm font-semibold text-[var(--foreground)]">{decision.title}</p>
                        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                          review {decision.reviewDate ? formatShortDate(decision.reviewDate) : "sin fecha"}
                        </p>
                      </Link>
                    ))}
                  </div>
                </article>
              </div>
            </div>
          </section>

          <section className="panel-surface rounded-[30px] p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow">Proyectos</p>
                <h2 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
                  Progreso de Proyectos
                </h2>
              </div>
              <Link href="/projects" className="text-sm font-medium text-[var(--foreground)] hover:underline">
                Ver todos
              </Link>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {data.projectSummaries.map((project) => (
                <article
                  key={project.id}
                  className="panel-quiet rounded-[28px] p-5 transition-all hover:-translate-y-0.5 hover:border-[var(--foreground)]/15"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="eyebrow">{project.areaName}</p>
                      <h3 className="mt-3 text-lg font-semibold text-[var(--foreground)]">
                        {project.title}
                      </h3>
                    </div>
                    <span className="kicker-pill">{project.status}</span>
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-[var(--muted-foreground)]">
                    {project.openTaskCount} abiertas / {project.taskCount} tareas
                    {project.targetDate ? ` · target ${formatShortDate(project.targetDate)}` : ""}
                  </p>

                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-[var(--accent-soft)]">
                    <div className="h-full bg-[var(--foreground)]" style={{ width: `${project.progress}%` }} />
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="panel-surface rounded-[30px] p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="eyebrow">En movimiento</p>
                <h2 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
                  Tareas Prioritarias
                </h2>
              </div>
              <Flame className="h-5 w-5 text-[var(--muted-foreground)]" />
            </div>

            <div className="mt-6 space-y-3">
              {data.focusTasks.length === 0 && (
                <p className="panel-quiet rounded-2xl p-5 text-sm leading-relaxed text-[var(--muted-foreground)]">
                  No hay acciones activas. Este es un buen momento para clarificar el inbox o activar una palanca concreta.
                </p>
              )}

              {data.focusTasks.map((task) => (
                <article key={task.id} className="panel-quiet rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--foreground)]">{task.title}</p>
                      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                        {task.projectTitle ?? "Sin proyecto"} · {TASK_STATUS_LABELS[task.status]}
                      </p>
                    </div>
                    <span className="kicker-pill">{TASK_PRIORITY_LABELS[task.priority]}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="panel-surface rounded-[30px] p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="eyebrow">Conocimiento</p>
                <h2 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
                  Conocimiento Reciente
                </h2>
              </div>
              <Library className="h-5 w-5 text-[var(--muted-foreground)]" />
            </div>

            <div className="mt-6 space-y-4">
              {data.recentKnowledge.map((note) => (
                <article key={note.id} className="border-b border-dashed border-[var(--border)] pb-4 last:border-none last:pb-0">
                  <p className="eyebrow">
                    {note.type} · {formatShortDate(note.updatedAt)}
                  </p>
                  <h3 className="mt-3 font-serif text-xl text-[var(--foreground)]">{note.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
                    {note.preview}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="panel-surface rounded-[30px] p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="eyebrow">Vault</p>
                <h2 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
                  Recursos Recientes
                </h2>
              </div>
              <Library className="h-5 w-5 text-[var(--muted-foreground)]" />
            </div>

            <div className="mt-6 space-y-3">
              {data.resources.map((resource) => (
                <Link
                  key={resource.id}
                  href={`/resources/${resource.id}`}
                  className="block rounded-2xl border border-[var(--border)] px-4 py-4 transition-all hover:border-[var(--foreground)]/15"
                >
                  <p className="text-sm font-semibold text-[var(--foreground)]">{resource.title}</p>
                  <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                    {resource.type} · {formatShortDate(resource.createdAt)}
                  </p>
                </Link>
              ))}
            </div>
          </section>

          <section className="panel-surface rounded-[30px] p-6">
            <p className="eyebrow">Métricas del Sistema</p>
            <h2 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
              Estado de tu Sistema
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
              Antes de hacer la review semanal, asegúrate de procesar todo lo que está pendiente.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="panel-quiet rounded-2xl p-4">
                <p className="eyebrow">Inbox</p>
                <p className="mt-3 text-2xl font-semibold text-[var(--foreground)]">{data.inboxCount}</p>
              </div>
              <div className="panel-quiet rounded-2xl p-4">
                <p className="eyebrow">Proyectos</p>
                <p className="mt-3 text-2xl font-semibold text-[var(--foreground)]">{data.activeProjectCount}</p>
              </div>
              <div className="panel-quiet rounded-2xl p-4">
                <p className="eyebrow">Decisiones</p>
                <p className="mt-3 text-2xl font-semibold text-[var(--foreground)]">{data.openDecisionCount}</p>
              </div>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="panel-quiet rounded-2xl p-4">
                <p className="eyebrow">Vencidas</p>
                <p className="mt-3 text-2xl font-semibold text-[var(--foreground)]">{data.overdueCount}</p>
              </div>
              <div className="panel-quiet rounded-2xl p-4">
                <p className="eyebrow">Semana</p>
                <p className="mt-3 text-2xl font-semibold text-[var(--foreground)]">{data.weekTasks.length}</p>
              </div>
            </div>

            <div className="soft-rule mt-6 flex flex-wrap gap-3 pt-5">
              <Link href="/review" className="inline-flex items-center rounded-full bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-[var(--background)] hover:opacity-90">
                Abrir revision semanal
              </Link>
              <Link href="/inbox" className="inline-flex items-center rounded-full border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--background)]">
                Vaciar inbox
              </Link>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
