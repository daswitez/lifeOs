import { DECISION_STATUSES } from "@/lib/domain";
import { CreateEntityModal } from "@/components/forms/create-entity-modal";
import { createDecisionAction } from "@/server/actions/lifeos";
import { getDecisionsData } from "@/server/queries/lifeos";
import Link from "next/link";

function formatDate(value: string | null) {
  if (!value) return "No date";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export default async function DecisionsPage() {
  const data = await getDecisionsData();

  return (
    <div className="min-h-full px-5 py-6 pb-24 sm:px-8 md:px-10 lg:px-12">
      <header className="panel-surface rounded-[32px] p-6 sm:p-8 anim-fade-in-up">
        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <div>
            <div className="kicker-pill">Strategic memory</div>
            <h1 className="title-balance mt-5 text-4xl font-semibold text-[var(--foreground)]">Decision Journal</h1>
            <p className="mt-4 text-base text-[var(--muted-foreground)]">
              Log context, expected outcome, and a review date so you never decide the same thing twice.
            </p>
          </div>

          <div className="panel-quiet flex flex-col justify-between rounded-[28px] p-5">
            <div>
              <p className="eyebrow">New decision</p>
              <h2 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
                Strategic composer
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
                The decision journal gains clarity when writing and reading don&apos;t compete on the same surface.
              </p>
            </div>

            <div className="mt-6">
              <CreateEntityModal
                title="New decision"
                description="Log the decision point, expected outcome, and a review date to build strategic memory."
                triggerLabel="New decision"
                submitLabel="Save decision"
                pendingLabel="Saving..."
                action={createDecisionAction}
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="eyebrow">Title</span>
                    <input
                      name="title"
                      required
                      placeholder="Decision to record"
                      className="input-ring mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)]"
                    />
                  </label>
                  <label className="block">
                    <span className="eyebrow">Review date</span>
                    <input
                      name="review_date"
                      type="date"
                      className="input-ring mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-3 py-4 text-sm text-[var(--foreground)]"
                    />
                  </label>
                  <label className="block md:col-span-2">
                    <span className="eyebrow">Expected outcome</span>
                    <input
                      name="expected_outcome"
                      placeholder="Expected outcome"
                      className="input-ring mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)]"
                    />
                  </label>
                  <label className="block md:col-span-2">
                    <span className="eyebrow">Context</span>
                    <textarea
                      name="context"
                      rows={6}
                      placeholder="What's happening, what signals do you see, what trade-offs are there?"
                      className="input-ring mt-3 w-full rounded-[24px] border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)] resize-none"
                    />
                  </label>
                </div>
              </CreateEntityModal>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl pt-8">
        <div className="space-y-6 stagger">
          {data.decisions.map((decision) => (
            <article key={decision.id} className="panel-surface rounded-[30px] p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="eyebrow">
                    {decision.status.replace('_', ' ')}
                  </p>
                  <h2 className="mt-3 text-xl font-semibold text-[var(--foreground)]">
                    <Link href={`/decisions/${decision.id}`} className="hover:underline">
                      {decision.title}
                    </Link>
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {DECISION_STATUSES.includes(decision.status) && (
                    <span className="rounded-full border border-[var(--border)] px-3 py-1 text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
                      review {formatDate(decision.reviewDate)}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--muted-foreground)]">Context</p>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--foreground)]/85">
                    {decision.context || "No context yet. Consider noting what information drives this decision."}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--muted-foreground)]">Expected outcome</p>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--foreground)]/85">
                    {decision.expectedOutcome || "No expected outcome yet."}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
