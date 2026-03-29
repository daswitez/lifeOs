import Link from "next/link";
import { ChevronRight, Sparkles } from "lucide-react";
import { SubmitButton } from "@/components/ui/submit-button";
import { createTaskAction } from "@/server/actions/lifeos";
import { getInboxData } from "@/server/queries/lifeos";
import { InboxProcessorForm } from "@/components/ui/inbox-processor";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

const KIND_COPY: Record<string, string> = {
  task: "Move to actions",
  note: "Distill in knowledge",
  resource: "Complete metadata",
  decision: "Define reasoning",
};

export default async function InboxPage() {
  const data = await getInboxData();

  return (
    <div className="min-h-full px-5 py-6 sm:px-8 md:px-10 lg:px-12">
      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="panel-surface rounded-[32px] p-6 sm:p-8">
          <div className="kicker-pill">Universal inbox</div>
          <h1 className="title-balance mt-5 text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl">
            Capture first. Decide later.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[var(--muted-foreground)]">
            This view gathers what is not yet settled. It's not just a list: it's the zone where the system converts noise into clarity.
          </p>

          <form action={createTaskAction} className="mt-8 panel-quiet rounded-[28px] p-4">
            <input type="hidden" name="status" value="inbox" />
            <label className="block">
              <span className="eyebrow">Quick capture</span>
              <input
                name="title"
                required
                placeholder="What do you need to get out of your head?"
                className="mt-4 w-full rounded-[24px] border-2 border-[var(--border)] bg-[var(--background)] px-5 py-5 text-xl text-[var(--foreground)] outline-none"
              />
            </label>

            <div className="mt-4 grid gap-3 md:grid-cols-[0.9fr_0.9fr_auto]">
              <select
                name="priority"
                defaultValue="medium"
                className="rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)] outline-none"
              >
                <option value="low">Low priority</option>
                <option value="medium">Medium priority</option>
                <option value="high">High priority</option>
                <option value="urgent">Urgent priority</option>
              </select>
              <select
                name="project_id"
                className="rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)] outline-none"
              >
                <option value="">No project</option>
                {data.projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </select>
              <input
                name="due_date"
                type="date"
                className="rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)] outline-none"
              />
              <SubmitButton pendingLabel="Capturing..." className="rounded-2xl px-5">
                Capture <ChevronRight className="ml-1 h-3 w-3" />
              </SubmitButton>
            </div>
          </form>
        </div>

        <div className="panel-surface rounded-[32px] p-6 sm:p-8">
          <p className="eyebrow">How to process it</p>
          <h2 className="mt-4 text-2xl font-semibold text-[var(--foreground)]">
            From chaos to its next home
          </h2>
          <div className="mt-6 space-y-4">
            {[
              "If it's actionable, activate it in Actions.",
              "If it's an idea or insight, move it to Knowledge.",
              "If it's a link or file, complete it in Resources.",
              "If it involves trade-offs or bets, take it to Decisions.",
            ].map((step, index) => (
              <div key={step} className="panel-quiet rounded-2xl p-4">
                <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
                  Step {index + 1}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[var(--foreground)]/88">{step}</p>
              </div>
            ))}
          </div>

          <div className="soft-rule mt-6 grid gap-3 pt-5 sm:grid-cols-2">
            <div className="panel-quiet rounded-2xl p-4">
              <p className="eyebrow">Count</p>
              <p className="mt-3 text-3xl font-semibold text-[var(--foreground)]">{data.items.length}</p>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">items visible to process now</p>
            </div>
            <div className="panel-quiet rounded-2xl p-4">
              <p className="eyebrow">Shortcut</p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-2 text-sm text-[var(--foreground)]">
                <Sparkles className="h-4 w-4" />
                Ctrl/Cmd + K
              </div>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">multimodal capture from any view</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 panel-surface rounded-[32px] p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Needs processing</p>
            <h2 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
              Visible cognitive load
            </h2>
          </div>
          <p className="text-sm text-[var(--muted-foreground)]">
            The recent on top, the ambiguous in the center, the important one click away.
          </p>
        </div>

        <div className="mt-6 space-y-3">
          {data.items.map((item) => (
            <InboxProcessorForm 
              key={`${item.kind}-${item.id}`} 
              item={item} 
              kindCopy={KIND_COPY[item.kind] ?? "Process"} 
              dateStr={formatDate(item.createdAt)} 
            />
          ))}
        </div>
      </section>
    </div>
  );
}
