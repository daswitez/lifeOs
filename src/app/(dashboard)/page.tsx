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
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function formatTaskTiming(task: ActionTask) {
  if (task.scheduledFor) return `scheduled ${formatShortDate(task.scheduledFor)}`;
  if (task.dueDate) return `due ${formatShortDate(task.dueDate)}`;
  return "no date";
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
  if (hour < 12) return "Good morning.";
  if (hour < 19) return "Good afternoon.";
  return "Good evening.";
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  const workflow = [
    {
      label: "Today",
      value: data.todayTasks.length,
      detail: "tasks landing today",
      href: "/actions",
      icon: CalendarClock,
    },
    {
      label: "This Week",
      value: data.weekTasks.length,
      detail: "items stacking up this week",
      href: "/actions",
      icon: Clock3,
    },
    {
      label: "Inbox",
      value: data.inboxCount,
      detail: "items waiting for clarity",
      href: "/inbox",
      icon: Inbox,
    },
    {
      label: "Active Tasks",
      value: data.focusTasks.length,
      detail: "levers active right now",
      href: "/actions",
      icon: Flame,
    },
    {
      label: "Open Decisions",
      value: data.openDecisionCount,
      detail: "decisions still open",
      href: "/decisions",
      icon: Compass,
    },
    {
      label: "Active Projects",
      value: data.activeProjectCount,
      detail: "projects alive",
      href: "/projects",
      icon: Target,
    },
  ];

  return (
    <div className="flex min-h-full flex-col gap-8 px-5 py-6 sm:px-8 md:px-10 md:py-8 lg:px-12">
      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="panel-surface rounded-[32px] p-6 sm:p-8 anim-fade-in-up">
          <div className="kicker-pill">
            <Sparkles className="h-3 w-3" />
            Your Day
          </div>
          <h1 className="title-balance mt-5 text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl">
            {greeting()}
          </h1>
          <p className="mt-3 font-mono text-sm text-[var(--muted-foreground)]">
            {formatLongDate(new Date())}
          </p>
          <p className="title-balance mt-6 max-w-2xl text-base leading-relaxed text-[var(--muted-foreground)] sm:text-lg">
            Overview of your tasks and open fronts. Keep the system updated to free your mind.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 stagger">
            {workflow.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="panel-quiet group rounded-3xl p-4 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.28em] text-[var(--muted-foreground)]">
                      {item.label}
                    </span>
                    <Icon className="h-4 w-4 text-[var(--muted-foreground)] transition-colors group-hover:text-[var(--accent-primary)]" />
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

        <form action={upsertDailyLogAction} className="panel-surface rounded-[32px] p-6 sm:p-8 anim-fade-in-up" style={{ animationDelay: "80ms" }}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="eyebrow">Daily Log</p>
              <h2 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
                Close the Day
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--muted-foreground)]">
                Log how your focus went and what you achieved today to measure your energy over time.
              </p>
            </div>
            {data.dailyLog && <div className="kicker-pill">Saved today</div>}
          </div>

          <div className="mt-7 grid gap-3 md:grid-cols-3">
            <label className="panel-quiet rounded-2xl p-3 text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
              Mood
              <select
                name="mood"
                defaultValue={data.dailyLog?.mood?.toString() ?? ""}
                className="input-ring mt-3 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-3 text-sm normal-case tracking-normal text-[var(--foreground)]"
              >
                <option value="">Not recorded</option>
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
                className="input-ring mt-3 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-3 text-sm normal-case tracking-normal text-[var(--foreground)]"
              >
                <option value="">Not recorded</option>
                {[1, 2, 3, 4, 5].map((score) => (
                  <option key={score} value={score}>
                    {score}/5
                  </option>
                ))}
              </select>
            </label>

            <label className="panel-quiet rounded-2xl p-3 text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
              Energy
              <select
                name="energy"
                defaultValue={data.dailyLog?.energy ?? ""}
                className="input-ring mt-3 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-3 text-sm normal-case tracking-normal text-[var(--foreground)]"
              >
                <option value="">Not recorded</option>
                {LOG_ENERGIES.map((energy) => (
                  <option key={energy} value={energy}>
                    {LOG_ENERGY_LABELS[energy]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="mt-4 block text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
            Today&apos;s wins
            <textarea
              name="wins"
              defaultValue={data.dailyLog?.wins ?? ""}
              rows={3}
              placeholder="What went well today? What deserves to stay in memory?"
              className="input-ring mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm normal-case tracking-normal text-[var(--foreground)] resize-none"
            />
          </label>

          <div className="soft-rule mt-6 flex flex-col gap-4 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[var(--muted-foreground)]">
              {data.lastWeeklyReview
                ? `Last weekly review: ${formatShortDate(data.lastWeeklyReview.week_end)}`
                : "No weekly review saved yet."}
            </p>
            <SubmitButton pendingLabel="Saving..." className="rounded-full px-5">
              Save check-in <ChevronRight className="h-3 w-3" />
            </SubmitButton>
          </div>
        </form>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <section className="panel-surface rounded-[30px] p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow">Today</p>
                <h2 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
                  Landing Board
                </h2>
              </div>
              <Link href="/actions" className="text-sm font-medium text-[var(--foreground)] hover:underline">
                View all tasks
              </Link>
            </div>

            <div className="mt-6 space-y-3">
              {data.todayTasks.length === 0 && (
                <p className="panel-quiet rounded-2xl p-5 text-sm leading-relaxed text-[var(--muted-foreground)]">
                  Today doesn&apos;t have a clear list yet. Schedule tasks in Actions so the home works as your operational agenda.
                </p>
              )}

              {data.todayTasks.map((task) => (
                <article
                  key={task.id}
                  className="panel-quiet rounded-2xl p-4 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-base font-semibold text-[var(--foreground)]">{task.title}</p>
                      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                        {task.projectTitle ?? "No project"} · {TASK_PRIORITY_LABELS[task.priority]}
                        {task.energy ? ` · ${LOG_ENERGY_LABELS[task.energy]}` : ""}
                        {` · ${formatTaskTiming(task)}`}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {task.isRecurring && (
                          <span className="kicker-pill">
                            <Repeat2 className="h-3 w-3" />
                            {recurrenceLabel(task.recurrenceRule) ?? "Recurring"}
                          </span>
                        )}
                        {task.estimatedMinutes && (
                          <span className="kicker-pill">estimate {task.estimatedMinutes}m</span>
                        )}
                        {task.actualMinutes && (
                          <span className="kicker-pill">actual {task.actualMinutes}m</span>
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
                <p className="eyebrow">Current week</p>
                <h2 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
                  Weekly Horizon
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
                    The week has no visible queue yet. Schedule tasks with a date to turn this into a real radar.
                  </p>
                ) : (
                  data.weekTasks.map((task) => (
                    <article key={task.id} className="panel-quiet rounded-2xl p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[var(--foreground)]">{task.title}</p>
                          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                            {task.projectTitle ?? "No project"} · {formatTaskTiming(task)}
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
                  <p className="eyebrow">Weekly review</p>
                  <h3 className="mt-3 text-lg font-semibold text-[var(--foreground)]">
                    {data.lastWeeklyReview?.next_focus || "Next focus not yet defined"}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
                    {data.lastWeeklyReview?.summary || "The latest review doesn't have a summary saved yet."}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <span className="kicker-pill">{data.overdueCount} overdue</span>
                    <span className="kicker-pill">{data.weeklyDecisionReviews.length} decisions to review</span>
                  </div>
                </article>

                <article className="panel-quiet rounded-[28px] p-5">
                  <p className="eyebrow">Decision reviews</p>
                  <div className="mt-4 space-y-3">
                    {data.weeklyDecisionReviews.length === 0 && (
                      <p className="text-sm text-[var(--muted-foreground)]">
                        No open decisions with an upcoming review date this week.
                      </p>
                    )}
                    {data.weeklyDecisionReviews.map((decision) => (
                      <Link
                        key={decision.id}
                        href={`/decisions/${decision.id}`}
                        className="block rounded-2xl border border-[var(--border)] px-4 py-3 transition-all hover:border-[var(--accent-primary)]/30 hover:shadow-sm"
                      >
                        <p className="text-sm font-semibold text-[var(--foreground)]">{decision.title}</p>
                        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                          review {decision.reviewDate ? formatShortDate(decision.reviewDate) : "no date"}
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
                <p className="eyebrow">Projects</p>
                <h2 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
                  Project Progress
                </h2>
              </div>
              <Link href="/projects" className="text-sm font-medium text-[var(--foreground)] hover:underline">
                View all
              </Link>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {data.projectSummaries.map((project) => (
                <article
                  key={project.id}
                  className="panel-quiet rounded-[28px] p-5 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]"
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
                    {project.openTaskCount} open / {project.taskCount} tasks
                    {project.targetDate ? ` · target ${formatShortDate(project.targetDate)}` : ""}
                  </p>

                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-[var(--accent-soft)]">
                    <div className="progress-bar h-full rounded-full" style={{ width: `${project.progress}%` }} />
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
                <p className="eyebrow">In motion</p>
                <h2 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
                  Priority Tasks
                </h2>
              </div>
              <Flame className="h-5 w-5 text-[var(--muted-foreground)]" />
            </div>

            <div className="mt-6 space-y-3">
              {data.focusTasks.length === 0 && (
                <p className="panel-quiet rounded-2xl p-5 text-sm leading-relaxed text-[var(--muted-foreground)]">
                  No active actions. This is a good time to clarify the inbox or activate a concrete lever.
                </p>
              )}

              {data.focusTasks.map((task) => (
                <article key={task.id} className="panel-quiet rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--foreground)]">{task.title}</p>
                      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                        {task.projectTitle ?? "No project"} · {TASK_STATUS_LABELS[task.status]}
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
                <p className="eyebrow">Knowledge</p>
                <h2 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
                  Recent Knowledge
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
                  Recent Resources
                </h2>
              </div>
              <Library className="h-5 w-5 text-[var(--muted-foreground)]" />
            </div>

            <div className="mt-6 space-y-3">
              {data.resources.map((resource) => (
                <Link
                  key={resource.id}
                  href={`/resources/${resource.id}`}
                  className="block rounded-2xl border border-[var(--border)] px-4 py-4 transition-all hover:border-[var(--accent-primary)]/30 hover:shadow-sm"
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
            <p className="eyebrow">System Metrics</p>
            <h2 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
              System Status
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
              Before running the weekly review, make sure to process everything that&apos;s pending.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3 stagger">
              <div className="panel-quiet rounded-2xl p-4">
                <p className="eyebrow">Inbox</p>
                <p className="mt-3 text-2xl font-semibold text-[var(--foreground)]">{data.inboxCount}</p>
              </div>
              <div className="panel-quiet rounded-2xl p-4">
                <p className="eyebrow">Projects</p>
                <p className="mt-3 text-2xl font-semibold text-[var(--foreground)]">{data.activeProjectCount}</p>
              </div>
              <div className="panel-quiet rounded-2xl p-4">
                <p className="eyebrow">Decisions</p>
                <p className="mt-3 text-2xl font-semibold text-[var(--foreground)]">{data.openDecisionCount}</p>
              </div>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="panel-quiet rounded-2xl p-4">
                <p className="eyebrow">Overdue</p>
                <p className="mt-3 text-2xl font-semibold text-[var(--foreground)]">{data.overdueCount}</p>
              </div>
              <div className="panel-quiet rounded-2xl p-4">
                <p className="eyebrow">Week</p>
                <p className="mt-3 text-2xl font-semibold text-[var(--foreground)]">{data.weekTasks.length}</p>
              </div>
            </div>

            <div className="soft-rule mt-6 flex flex-wrap gap-3 pt-5">
              <Link href="/review" className="inline-flex items-center rounded-full bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-[var(--background)] transition-opacity hover:opacity-90">
                Open weekly review
              </Link>
              <Link href="/inbox" className="inline-flex items-center rounded-full border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--accent-soft)]">
                Clear inbox
              </Link>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
