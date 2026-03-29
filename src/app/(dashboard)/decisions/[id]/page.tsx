import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getDecisionDetailData } from "@/server/queries/lifeos";
import { EditDecisionModal } from "@/components/forms/edit-decision-modal";
import { ManageResourceLinksModal } from "@/components/forms/manage-resource-links-modal";

function formatDate(value: string | null) {
  if (!value) return "No date";
  return new Intl.DateTimeFormat("es-BO", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default async function DecisionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let data;

  try {
    data = await getDecisionDetailData(id);
  } catch {
    notFound();
  }

  return (
    <div className="min-h-full px-5 py-6 sm:px-8 md:px-10 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <nav className="flex items-center text-sm font-medium text-[var(--muted-foreground)]">
          <Link href="/decisions" className="flex items-center transition-colors hover:text-[var(--foreground)]">
            <ChevronLeft className="mr-1 h-4 w-4" /> Back to Decisions
          </Link>
        </nav>

        <section className="panel-surface mt-6 rounded-[32px] p-6 sm:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="kicker-pill">{data.decision.status}</span>
                {data.decision.projectTitle && (
                  <span className="text-xs text-[var(--muted-foreground)]">{data.decision.projectTitle}</span>
                )}
              </div>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl">
                {data.decision.title}
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[var(--muted-foreground)]">
                {data.decision.expectedOutcome || "This decision still needs a clearly defined expected outcome."}
              </p>
            </div>

            <div className="group">
              <EditDecisionModal
                decision={{
                  id: data.decision.id,
                  title: data.decision.title,
                  context: data.decision.context,
                  expectedOutcome: data.decision.expectedOutcome,
                  chosenOption: data.decision.chosenOption,
                  reasoning: data.decision.reasoning,
                  reviewDate: data.decision.reviewDate,
                  status: data.decision.status,
                  projectId: data.decision.projectId,
                }}
                projects={data.projects}
              />
            </div>
          </div>

          <div className="mt-6">
            <ManageResourceLinksModal
              entityType="decision"
              entityId={data.decision.id}
              entityTitle={data.decision.title}
              linkedResources={data.linkedResources}
              resourceOptions={data.resourceOptions}
              triggerLabel="Manage references"
            />
          </div>

          <div className="soft-rule mt-8 grid gap-4 pt-5 md:grid-cols-3">
            <div className="panel-quiet rounded-2xl p-4">
              <p className="eyebrow">Review date</p>
              <p className="mt-2 text-sm text-[var(--foreground)]">{formatDate(data.decision.reviewDate)}</p>
            </div>
            <div className="panel-quiet rounded-2xl p-4">
              <p className="eyebrow">Created</p>
              <p className="mt-2 text-sm text-[var(--foreground)]">{formatDate(data.decision.createdAt)}</p>
            </div>
            <div className="panel-quiet rounded-2xl p-4">
              <p className="eyebrow">Updated</p>
              <p className="mt-2 text-sm text-[var(--foreground)]">{formatDate(data.decision.updatedAt)}</p>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-2">
          <article className="panel-surface rounded-[30px] p-6">
            <p className="eyebrow">Context</p>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[var(--foreground)]/88">
              {data.decision.context || "No context written yet."}
            </p>
          </article>

          <article className="panel-surface rounded-[30px] p-6">
            <p className="eyebrow">Reasoning</p>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[var(--foreground)]/88">
              {data.decision.reasoning || "No reasoning written yet."}
            </p>
          </article>

          <article className="panel-surface rounded-[30px] p-6">
            <p className="eyebrow">Chosen option</p>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[var(--foreground)]/88">
              {data.decision.chosenOption || "No option recorded yet."}
            </p>
          </article>

          <article className="panel-surface rounded-[30px] p-6">
            <p className="eyebrow">Outcome notes</p>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[var(--foreground)]/88">
              {data.decision.outcomeNotes || "No outcome notes yet."}
            </p>
          </article>
        </section>

        <section className="panel-surface mt-8 rounded-[32px] p-6 sm:p-8">
          <p className="eyebrow">Linked resources</p>
          <div className="mt-5 space-y-3">
            {data.linkedResources.length === 0 && (
              <p className="panel-quiet rounded-2xl p-5 text-sm text-[var(--muted-foreground)]">
                This decision has no linked resources yet.
              </p>
            )}

            {data.linkedResources.map((resource) => (
              <Link
                key={resource.id}
                href={`/resources/${resource.id}`}
                className="panel-quiet block rounded-2xl p-4 transition-all hover:border-[var(--foreground)]/20 hover:-translate-y-0.5"
              >
                <p className="text-sm font-medium text-[var(--foreground)]">{resource.title}</p>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">{resource.type}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
