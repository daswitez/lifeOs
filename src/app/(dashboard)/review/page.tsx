import { getReviewData } from "@/server/queries/lifeos";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-BO", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export default async function ReviewPage() {
  const data = await getReviewData();

  return (
    <div className="min-h-full px-5 py-6 sm:px-8 md:px-10 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="panel-surface max-w-4xl rounded-[32px] p-6 sm:p-8">
          <div className="kicker-pill">Entorno ceremonial</div>
          <h1 className="title-balance mt-5 font-serif text-4xl text-[var(--foreground)]">Pause &amp; Calibrate</h1>
          <p className="mt-5 text-lg leading-relaxed text-[var(--muted-foreground)]">
            La revision semanal no es una auditoria. Es un espacio para vaciar friccion, recuperar perspectiva y decidir que merece energia la proxima semana.
          </p>
        </header>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          <article className="panel-surface rounded-[30px] p-6">
            <p className="eyebrow">Inbox</p>
            <p className="mt-3 text-3xl font-semibold text-[var(--foreground)]">{data.inboxCount}</p>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">items pendientes de aclarar</p>
          </article>
          <article className="panel-surface rounded-[30px] p-6">
            <p className="eyebrow">Proyectos activos</p>
            <p className="mt-3 text-3xl font-semibold text-[var(--foreground)]">{data.activeProjects}</p>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">frentes que requieren traccion</p>
          </article>
          <article className="panel-surface rounded-[30px] p-6">
            <p className="eyebrow">Decisiones abiertas</p>
            <p className="mt-3 text-3xl font-semibold text-[var(--foreground)]">{data.openDecisions}</p>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">puntos que aun merecen una mirada</p>
          </article>
        </section>

        <section className="mt-10 grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="panel-surface rounded-[30px] p-6">
            <p className="eyebrow">Historial</p>
            <h2 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">Revisiones guardadas</h2>

            <div className="mt-6 space-y-4">
              {data.reviews.length === 0 && (
                <p className="rounded-2xl border border-dashed border-[var(--border)] p-5 text-sm text-[var(--muted-foreground)]">
                  Aun no hay revisiones semanales creadas. Ya tienes el cockpit listo para que esa sea la siguiente capa.
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
                </article>
              ))}
            </div>
          </div>

          <div className="panel-surface rounded-[30px] p-6">
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
          </div>
        </section>
      </div>
    </div>
  );
}
