import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SubmitButton } from "@/components/ui/submit-button";
import { upsertWeeklyReviewAction } from "@/server/actions/lifeos";
import { getReviewData } from "@/server/queries/lifeos";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-BO", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function formatLongDate(value: string) {
  return new Intl.DateTimeFormat("es-BO", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

function formatScore(value: number | null | undefined) {
  return value === null || value === undefined ? "-" : value.toFixed(2);
}

export default async function ReviewPage() {
  const data = await getReviewData();
  const currentReview = data.currentWeek.review;

  return (
    <div className="min-h-full px-5 py-6 sm:px-8 md:px-10 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="panel-surface rounded-[32px] p-6 sm:p-8">
          <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
            <div>
              <div className="kicker-pill">Entorno ceremonial</div>
              <h1 className="title-balance mt-5 font-serif text-4xl text-[var(--foreground)]">Pause &amp; Calibrate</h1>
              <p className="mt-5 text-lg leading-relaxed text-[var(--muted-foreground)]">
                La revision semanal no es una auditoria. Es donde juntas senales, limpias friccion y conviertes la semana en direccion operativa.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <article className="panel-quiet rounded-[28px] p-5">
                <p className="eyebrow">Semana activa</p>
                <p className="mt-3 text-base font-semibold text-[var(--foreground)]">
                  {formatDate(data.currentWeek.weekStart)} - {formatDate(data.currentWeek.weekEnd)}
                </p>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                  {currentReview ? "Revision ya creada para este rango." : "Lista para cerrar con una sintesis real."}
                </p>
              </article>
              <article className="panel-quiet rounded-[28px] p-5">
                <p className="eyebrow">Mood promedio</p>
                <p className="mt-3 text-3xl font-semibold text-[var(--foreground)]">{formatScore(data.currentWeek.moodAverage)}</p>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">{data.currentWeek.logs.length} registros diarios esta semana</p>
              </article>
              <article className="panel-quiet rounded-[28px] p-5">
                <p className="eyebrow">Inbox + decisiones</p>
                <p className="mt-3 text-3xl font-semibold text-[var(--foreground)]">{data.inboxCount + data.openDecisions}</p>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">senales activas que deberian informar tu foco</p>
              </article>
            </div>
          </div>
        </header>

        <section className="mt-10 grid gap-8 xl:grid-cols-[1.08fr_0.92fr]">
          <form action={upsertWeeklyReviewAction} className="panel-surface rounded-[30px] p-6">
            <input type="hidden" name="week_start" value={data.currentWeek.weekStart} />
            <input type="hidden" name="week_end" value={data.currentWeek.weekEnd} />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="eyebrow">Revision de la semana</p>
                <h2 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">Escribir y cerrar</h2>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--muted-foreground)]">
                  Rango actual: {formatLongDate(data.currentWeek.weekStart)} a {formatLongDate(data.currentWeek.weekEnd)}.
                </p>
              </div>
              {currentReview ? <div className="kicker-pill">Actualizando revision</div> : <div className="kicker-pill">Nueva revision</div>}
            </div>

            <label className="mt-7 block text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
              Resumen de la semana
              <textarea
                name="summary"
                rows={4}
                defaultValue={currentReview?.summary ?? ""}
                placeholder="Que paso de verdad esta semana? Que cambió, que pesó y que queda claro ahora?"
                className="mt-3 w-full resize-none rounded-[24px] border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm normal-case tracking-normal text-[var(--foreground)] outline-none"
              />
            </label>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="block text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
                Wins
                <textarea
                  name="wins"
                  rows={5}
                  defaultValue={currentReview?.wins ?? ""}
                  placeholder="Que salio bien y conviene seguir haciendo?"
                  className="mt-3 w-full resize-none rounded-[24px] border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm normal-case tracking-normal text-[var(--foreground)] outline-none"
                />
              </label>
              <label className="block text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
                Bloqueos
                <textarea
                  name="blockers"
                  rows={5}
                  defaultValue={currentReview?.blockers ?? ""}
                  placeholder="Que friccion o cuellos de botella se repitieron?"
                  className="mt-3 w-full resize-none rounded-[24px] border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm normal-case tracking-normal text-[var(--foreground)] outline-none"
                />
              </label>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="block text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
                Lecciones
                <textarea
                  name="lessons"
                  rows={5}
                  defaultValue={currentReview?.lessons ?? ""}
                  placeholder="Que aprendiste sobre tu energia, tus sistemas o tu forma de decidir?"
                  className="mt-3 w-full resize-none rounded-[24px] border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm normal-case tracking-normal text-[var(--foreground)] outline-none"
                />
              </label>
              <label className="block text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
                Siguiente foco
                <textarea
                  name="next_focus"
                  rows={5}
                  defaultValue={currentReview?.next_focus ?? ""}
                  placeholder="Que merece energia la proxima semana y que NO deberia competir con eso?"
                  className="mt-3 w-full resize-none rounded-[24px] border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm normal-case tracking-normal text-[var(--foreground)] outline-none"
                />
              </label>
            </div>

            <div className="soft-rule mt-6 grid gap-4 pt-5 md:grid-cols-3">
              <div className="panel-quiet rounded-2xl p-4">
                <p className="eyebrow">Mood avg</p>
                <p className="mt-2 text-sm text-[var(--foreground)]">{formatScore(data.currentWeek.moodAverage)}</p>
              </div>
              <div className="panel-quiet rounded-2xl p-4">
                <p className="eyebrow">Focus avg</p>
                <p className="mt-2 text-sm text-[var(--foreground)]">{formatScore(data.currentWeek.focusAverage)}</p>
              </div>
              <div className="panel-quiet rounded-2xl p-4">
                <p className="eyebrow">Wins registrados</p>
                <p className="mt-2 text-sm text-[var(--foreground)]">{data.currentWeek.winsCount}</p>
              </div>
            </div>

            <div className="soft-rule mt-6 flex flex-col gap-4 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[var(--muted-foreground)]">
                {currentReview ? "Guardar actualiza la revision de esta semana." : "Guardar crea la revision de esta semana y conserva sus metricas agregadas."}
              </p>
              <SubmitButton pendingLabel="Guardando..." className="rounded-full px-5">
                Guardar review <ChevronRight className="h-3 w-3" />
              </SubmitButton>
            </div>
          </form>

          <div className="space-y-6">
            <section className="panel-surface rounded-[30px] p-6">
              <p className="eyebrow">Senales del sistema</p>
              <h2 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">Contexto para escribir</h2>

              <div className="mt-6 grid gap-3 md:grid-cols-3">
                <article className="panel-quiet rounded-2xl p-4">
                  <p className="eyebrow">Inbox</p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{data.inboxCount}</p>
                </article>
                <article className="panel-quiet rounded-2xl p-4">
                  <p className="eyebrow">Proyectos activos</p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{data.activeProjects}</p>
                </article>
                <article className="panel-quiet rounded-2xl p-4">
                  <p className="eyebrow">Decisiones abiertas</p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{data.openDecisions}</p>
                </article>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[var(--foreground)]">Tareas que siguen vivas</p>
                    <Link href="/actions" className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                      abrir acciones
                    </Link>
                  </div>
                  <div className="mt-3 space-y-2">
                    {data.focusTasks.length === 0 ? (
                      <p className="text-sm text-[var(--muted-foreground)]">No hay tareas abiertas prioritarias ahora mismo.</p>
                    ) : (
                      data.focusTasks.map((task) => (
                        <div key={task.id} className="panel-quiet rounded-2xl p-4">
                          <p className="text-sm font-medium text-[var(--foreground)]">{task.title}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                            {task.status} · {task.priority}
                            {task.projectTitle ? ` · ${task.projectTitle}` : ""}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[var(--foreground)]">Proyectos activos</p>
                    <Link href="/projects" className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                      abrir proyectos
                    </Link>
                  </div>
                  <div className="mt-3 space-y-2">
                    {data.activeProjectList.length === 0 ? (
                      <p className="text-sm text-[var(--muted-foreground)]">No hay proyectos activos ahora mismo.</p>
                    ) : (
                      data.activeProjectList.map((project) => (
                        <div key={project.id} className="panel-quiet rounded-2xl p-4">
                          <p className="text-sm font-medium text-[var(--foreground)]">{project.title}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                            {project.priority}
                            {project.targetDate ? ` · target ${formatDate(project.targetDate)}` : ""}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[var(--foreground)]">Decisiones abiertas</p>
                    <Link href="/decisions" className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                      abrir decisiones
                    </Link>
                  </div>
                  <div className="mt-3 space-y-2">
                    {data.openDecisionList.length === 0 ? (
                      <p className="text-sm text-[var(--muted-foreground)]">No hay decisiones abiertas por revisar.</p>
                    ) : (
                      data.openDecisionList.map((decision) => (
                        <div key={decision.id} className="panel-quiet rounded-2xl p-4">
                          <p className="text-sm font-medium text-[var(--foreground)]">{decision.title}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                            {decision.reviewDate ? `review ${formatDate(decision.reviewDate)}` : "sin fecha de review"}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className="panel-surface rounded-[30px] p-6">
              <p className="eyebrow">Ritmo reciente</p>
              <h2 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">Ultimos check-ins diarios</h2>

              <div className="mt-6 space-y-4">
                {data.recentDailyLogs.length === 0 && (
                  <p className="rounded-2xl border border-dashed border-[var(--border)] p-5 text-sm text-[var(--muted-foreground)]">
                    Cuando empieces a registrar mood, foco y wins, esta vista se vuelve una memoria de patrones.
                  </p>
                )}

                {data.recentDailyLogs.map((log) => (
                  <article key={log.id} className="panel-quiet rounded-2xl p-5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-[var(--foreground)]">{formatDate(log.log_date)}</p>
                      <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
                        mood {log.mood ?? "-"} · focus {log.focus_score ?? "-"}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
                      {log.wins || log.reflections || "Sin notas narrativas todavia."}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </section>

        <section className="mt-10 panel-surface rounded-[30px] p-6">
          <p className="eyebrow">Historial</p>
          <h2 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">Revisiones guardadas</h2>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {data.reviews.length === 0 && (
              <p className="rounded-2xl border border-dashed border-[var(--border)] p-5 text-sm text-[var(--muted-foreground)]">
                Aun no hay revisiones semanales creadas. Este formulario ya deja cerrar ese loop desde la app.
              </p>
            )}

            {data.reviews.map((review) => (
              <article key={review.id} className="panel-quiet rounded-2xl p-5">
                <p className="eyebrow">
                  {formatDate(review.week_start)} - {formatDate(review.week_end)}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[var(--foreground)]/85">
                  {review.summary || review.next_focus || review.wins || "Revision creada sin resumen aun."}
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                  <span className="rounded-full border border-[var(--border)] px-2 py-1">mood {formatScore(review.mood_avg)}</span>
                  <span className="rounded-full border border-[var(--border)] px-2 py-1">energy {formatScore(review.energy_avg)}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
