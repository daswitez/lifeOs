import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SubmitButton } from "@/components/ui/submit-button";
import { upsertWeeklyReviewAction } from "@/server/actions/lifeos";
import { getReviewData } from "@/server/queries/lifeos";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function formatLongDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
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
        <header className="panel-surface rounded-[32px] p-6 sm:p-8 anim-fade-in-up">
          <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
            <div>
              <div className="kicker-pill">Ceremony space</div>
              <h1 className="title-balance mt-5 font-serif text-4xl text-[var(--foreground)]">Pause &amp; Calibrate</h1>
              <p className="mt-5 text-lg leading-relaxed text-[var(--muted-foreground)]">
                The weekly review isn&apos;t an audit. It&apos;s where you gather signals, remove friction, and convert the week into operational direction.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3 stagger">
              <article className="panel-quiet rounded-[28px] p-5">
                <p className="eyebrow">Active week</p>
                <p className="mt-3 text-base font-semibold text-[var(--foreground)]">
                  {formatDate(data.currentWeek.weekStart)} - {formatDate(data.currentWeek.weekEnd)}
                </p>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                  {currentReview ? "Review already created for this range." : "Ready to close with a real synthesis."}
                </p>
              </article>
              <article className="panel-quiet rounded-[28px] p-5">
                <p className="eyebrow">Avg mood</p>
                <p className="mt-3 text-3xl font-semibold text-[var(--foreground)]">{formatScore(data.currentWeek.moodAverage)}</p>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">{data.currentWeek.logs.length} daily logs this week</p>
              </article>
              <article className="panel-quiet rounded-[28px] p-5">
                <p className="eyebrow">Inbox + decisions</p>
                <p className="mt-3 text-3xl font-semibold text-[var(--foreground)]">{data.inboxCount + data.openDecisions}</p>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">active signals that should inform your focus</p>
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
                <p className="eyebrow">Week review</p>
                <h2 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">Write & close</h2>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--muted-foreground)]">
                  Current range: {formatLongDate(data.currentWeek.weekStart)} to {formatLongDate(data.currentWeek.weekEnd)}.
                </p>
              </div>
              {currentReview ? <div className="kicker-pill">Updating review</div> : <div className="kicker-pill">New review</div>}
            </div>

            <label className="mt-7 block text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
              Week summary
              <textarea
                name="summary"
                rows={4}
                defaultValue={currentReview?.summary ?? ""}
                placeholder="What really happened this week? What changed, what weighed heavy, and what's clear now?"
                className="input-ring mt-3 w-full resize-none rounded-[24px] border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm normal-case tracking-normal text-[var(--foreground)]"
              />
            </label>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="block text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
                Wins
                <textarea
                  name="wins"
                  rows={5}
                  defaultValue={currentReview?.wins ?? ""}
                  placeholder="What went well and should keep going?"
                  className="input-ring mt-3 w-full resize-none rounded-[24px] border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm normal-case tracking-normal text-[var(--foreground)]"
                />
              </label>
              <label className="block text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
                Blockers
                <textarea
                  name="blockers"
                  rows={5}
                  defaultValue={currentReview?.blockers ?? ""}
                  placeholder="What friction or bottlenecks kept repeating?"
                  className="input-ring mt-3 w-full resize-none rounded-[24px] border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm normal-case tracking-normal text-[var(--foreground)]"
                />
              </label>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="block text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
                Lessons
                <textarea
                  name="lessons"
                  rows={5}
                  defaultValue={currentReview?.lessons ?? ""}
                  placeholder="What did you learn about your energy, systems, or decision-making?"
                  className="input-ring mt-3 w-full resize-none rounded-[24px] border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm normal-case tracking-normal text-[var(--foreground)]"
                />
              </label>
              <label className="block text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
                Next focus
                <textarea
                  name="next_focus"
                  rows={5}
                  defaultValue={currentReview?.next_focus ?? ""}
                  placeholder="What deserves energy next week and what should NOT compete with it?"
                  className="input-ring mt-3 w-full resize-none rounded-[24px] border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm normal-case tracking-normal text-[var(--foreground)]"
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
                <p className="eyebrow">Recorded wins</p>
                <p className="mt-2 text-sm text-[var(--foreground)]">{data.currentWeek.winsCount}</p>
              </div>
            </div>

            <div className="soft-rule mt-6 flex flex-col gap-4 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[var(--muted-foreground)]">
                {currentReview ? "Saving will update this week's review." : "Saving will create this week's review and preserve its aggregated metrics."}
              </p>
              <SubmitButton pendingLabel="Saving..." className="rounded-full px-5">
                Save review <ChevronRight className="h-3 w-3" />
              </SubmitButton>
            </div>
          </form>

          <div className="space-y-6">
            <section className="panel-surface rounded-[30px] p-6">
              <p className="eyebrow">System signals</p>
              <h2 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">Writing context</h2>

              <div className="mt-6 grid gap-3 md:grid-cols-3">
                <article className="panel-quiet rounded-2xl p-4">
                  <p className="eyebrow">Inbox</p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{data.inboxCount}</p>
                </article>
                <article className="panel-quiet rounded-2xl p-4">
                  <p className="eyebrow">Active projects</p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{data.activeProjects}</p>
                </article>
                <article className="panel-quiet rounded-2xl p-4">
                  <p className="eyebrow">Open decisions</p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{data.openDecisions}</p>
                </article>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[var(--foreground)]">Tasks still alive</p>
                    <Link href="/actions" className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                      open actions
                    </Link>
                  </div>
                  <div className="mt-3 space-y-2">
                    {data.focusTasks.length === 0 ? (
                      <p className="text-sm text-[var(--muted-foreground)]">No open priority tasks right now.</p>
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
                    <p className="text-sm font-semibold text-[var(--foreground)]">Active projects</p>
                    <Link href="/projects" className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                      open projects
                    </Link>
                  </div>
                  <div className="mt-3 space-y-2">
                    {data.activeProjectList.length === 0 ? (
                      <p className="text-sm text-[var(--muted-foreground)]">No active projects right now.</p>
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
                    <p className="text-sm font-semibold text-[var(--foreground)]">Open decisions</p>
                    <Link href="/decisions" className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                      open decisions
                    </Link>
                  </div>
                  <div className="mt-3 space-y-2">
                    {data.openDecisionList.length === 0 ? (
                      <p className="text-sm text-[var(--muted-foreground)]">No open decisions to review.</p>
                    ) : (
                      data.openDecisionList.map((decision) => (
                        <div key={decision.id} className="panel-quiet rounded-2xl p-4">
                          <p className="text-sm font-medium text-[var(--foreground)]">{decision.title}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                            {decision.reviewDate ? `review ${formatDate(decision.reviewDate)}` : "no review date"}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className="panel-surface rounded-[30px] p-6">
              <p className="eyebrow">Recent rhythm</p>
              <h2 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">Recent daily check-ins</h2>

              <div className="mt-6 space-y-4">
                {data.recentDailyLogs.length === 0 && (
                  <p className="rounded-2xl border border-dashed border-[var(--border)] p-5 text-sm text-[var(--muted-foreground)]">
                    Once you start logging mood, focus, and wins, this view becomes a memory of patterns.
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
                      {log.wins || log.reflections || "No narrative notes yet."}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </section>

        <section className="mt-10 panel-surface rounded-[30px] p-6">
          <p className="eyebrow">History</p>
          <h2 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">Saved reviews</h2>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {data.reviews.length === 0 && (
              <p className="rounded-2xl border border-dashed border-[var(--border)] p-5 text-sm text-[var(--muted-foreground)]">
                No weekly reviews created yet. This form already lets you close that loop from the app.
              </p>
            )}

            {data.reviews.map((review) => (
              <article key={review.id} className="panel-quiet rounded-2xl p-5">
                <p className="eyebrow">
                  {formatDate(review.week_start)} - {formatDate(review.week_end)}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[var(--foreground)]/85">
                  {review.summary || review.next_focus || review.wins || "Review created without a summary yet."}
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
