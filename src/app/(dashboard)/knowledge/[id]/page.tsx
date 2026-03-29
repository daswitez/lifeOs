import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { NOTE_TYPE_LABELS, RELATION_KIND_LABELS } from "@/lib/domain";
import { getNoteDetailData } from "@/server/queries/lifeos";
import { EditNoteModal } from "@/components/forms/edit-note-modal";
import { ManageResourceLinksModal } from "@/components/forms/manage-resource-links-modal";
import { ManageNoteRelationsModal } from "@/components/forms/manage-note-relations-modal";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-BO", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default async function NoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let data;

  try {
    data = await getNoteDetailData(id);
  } catch {
    notFound();
  }

  return (
    <div className="min-h-full px-5 py-6 sm:px-8 md:px-10 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <nav className="flex items-center text-sm font-medium text-[var(--muted-foreground)]">
          <Link href="/knowledge" className="flex items-center transition-colors hover:text-[var(--foreground)]">
            <ChevronLeft className="mr-1 h-4 w-4" /> Back to Knowledge
          </Link>
        </nav>

        <section className="panel-surface mt-6 rounded-[32px] p-6 sm:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="kicker-pill">{NOTE_TYPE_LABELS[data.note.type]}</span>
                {data.note.projectTitle && (
                  <span className="text-xs text-[var(--muted-foreground)]">{data.note.projectTitle}</span>
                )}
                {data.note.isArchived && <span className="kicker-pill">Archived</span>}
              </div>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl">
                {data.note.title}
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[var(--muted-foreground)]">
                {data.note.summary || data.note.preview}
              </p>
            </div>

            <div>
              <EditNoteModal
                note={{
                  id: data.note.id,
                  title: data.note.title,
                  content: data.note.content,
                  summary: data.note.summary,
                  type: data.note.type,
                  projectId: data.note.projectId,
                  isArchived: data.note.isArchived,
                }}
                projects={data.projects}
                triggerLabel="Editar nota"
                alwaysVisible
                triggerClassName="h-9 px-4 py-0 text-[11px] tracking-[0.08em] uppercase"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <ManageResourceLinksModal
              entityType="note"
              entityId={data.note.id}
              entityTitle={data.note.title}
              linkedResources={data.linkedResources}
              resourceOptions={data.resourceOptions}
              triggerLabel="Manage references"
            />
            <ManageNoteRelationsModal
              noteId={data.note.id}
              noteTitle={data.note.title}
              noteOptions={data.noteOptions}
              relations={data.noteRelations}
              triggerLabel="Connect notes"
            />
          </div>

          <div className="soft-rule mt-8 grid gap-4 pt-5 md:grid-cols-3">
            <div className="panel-quiet rounded-2xl p-4">
              <p className="eyebrow">Created</p>
              <p className="mt-2 text-sm text-[var(--foreground)]">{formatDate(data.note.createdAt)}</p>
            </div>
            <div className="panel-quiet rounded-2xl p-4">
              <p className="eyebrow">Updated</p>
              <p className="mt-2 text-sm text-[var(--foreground)]">{formatDate(data.note.updatedAt)}</p>
            </div>
            <div className="panel-quiet rounded-2xl p-4">
              <p className="eyebrow">Project</p>
              <p className="mt-2 text-sm text-[var(--foreground)]">{data.note.projectTitle ?? "No project"}</p>
            </div>
          </div>
        </section>

        <article className="panel-surface mt-8 rounded-[32px] p-6 sm:p-8">
          <p className="eyebrow">Content</p>
          <div className="mt-5 whitespace-pre-wrap text-sm leading-7 text-[var(--foreground)]/88">
            {data.note.content || "This note is still empty."}
          </div>
        </article>

        <section className="panel-surface mt-8 rounded-[32px] p-6 sm:p-8">
          <p className="eyebrow">Linked resources</p>
          <div className="mt-5 space-y-3">
            {data.linkedResources.length === 0 && (
              <p className="panel-quiet rounded-2xl p-5 text-sm text-[var(--muted-foreground)]">
                This note has no linked resources yet.
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

        <section className="panel-surface mt-8 rounded-[32px] p-6 sm:p-8">
          <p className="eyebrow">Connected notes</p>
          <div className="mt-5 space-y-3">
            {data.noteRelations.length === 0 && (
              <p className="panel-quiet rounded-2xl p-5 text-sm text-[var(--muted-foreground)]">
                This note has no note-to-note relations yet.
              </p>
            )}

            {data.noteRelations.map((relation) => (
              <Link
                key={relation.id}
                href={`/knowledge/${relation.note.id}`}
                className="panel-quiet block rounded-2xl p-4 transition-all hover:border-[var(--foreground)]/20 hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-[var(--foreground)]">{relation.note.title}</p>
                  <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                    {relation.direction === "outgoing" ? "saliente" : "entrante"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  {RELATION_KIND_LABELS[relation.relation]} · {NOTE_TYPE_LABELS[relation.note.type]}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
