import { NOTE_TYPES, NOTE_TYPE_LABELS } from "@/lib/domain";
import { CreateEntityModal } from "@/components/forms/create-entity-modal";
import { EditNoteModal } from "@/components/forms/edit-note-modal";
import { createNoteAction } from "@/server/actions/lifeos";
import { getKnowledgeData } from "@/server/queries/lifeos";
import Link from "next/link";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export default async function KnowledgePage() {
  const data = await getKnowledgeData();

  return (
    <div className="min-h-full bg-[var(--muted)]/10 px-5 py-6 pb-24 sm:px-8 md:px-10 lg:px-12">
      <header className="panel-surface rounded-[32px] p-6 sm:p-8 anim-fade-in-up">
        <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
          <div>
            <div className="kicker-pill">Personal library</div>
            <h1 className="title-balance mt-5 font-serif text-4xl font-semibold text-[var(--foreground)]">Zettelkasten</h1>
            <p className="mt-4 text-base text-[var(--muted-foreground)]">
              Capture ideas, distill notes, and keep within reach what&apos;s worth reusing.
            </p>
          </div>

          <div className="panel-quiet flex flex-col justify-between rounded-[28px] p-5">
            <div>
              <p className="eyebrow">New note</p>
              <h2 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
                Editorial composer
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
                A dedicated creation screen so the library keeps looking like a library, not a form.
              </p>
            </div>

            <div className="mt-6">
              <CreateEntityModal
                title="New note"
                description="Capture an idea, excerpt, or insight with enough context to distill it later."
                triggerLabel="New note"
                submitLabel="Save note"
                pendingLabel="Saving..."
                action={createNoteAction}
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="eyebrow">Title</span>
                    <input
                      name="title"
                      required
                      placeholder="Note title"
                      className="input-ring mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)]"
                    />
                  </label>
                  <label className="block">
                    <span className="eyebrow">Type</span>
                    <select
                      name="type"
                      defaultValue="plain"
                      className="input-ring mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-3 py-4 text-sm text-[var(--foreground)]"
                    >
                      {NOTE_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {NOTE_TYPE_LABELS[type]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block md:col-span-2">
                    <span className="eyebrow">Summary</span>
                    <input
                      name="summary"
                      placeholder="Brief summary"
                      className="input-ring mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)]"
                    />
                  </label>
                  <label className="block md:col-span-2">
                    <span className="eyebrow">Content</span>
                    <textarea
                      name="content"
                      rows={6}
                      placeholder="Write an idea, insight, or excerpt..."
                      className="input-ring mt-3 w-full rounded-[24px] border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)] resize-none"
                    />
                  </label>
                </div>
              </CreateEntityModal>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl pt-8">
        <div className="space-y-8 stagger">
          {data.notes.map((note) => (
            <article key={note.id} className="panel-surface group rounded-[30px] p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="eyebrow">
                    {NOTE_TYPE_LABELS[note.type]}
                  </p>
                  {(note.relationCount ?? 0) > 0 && (
                    <>
                      <span className="rounded-full border border-[var(--border)] px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                        {note.relationCount} connections
                      </span>
                      <span className="rounded-full border border-[var(--border)] px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                        {note.outgoingCount} out · {note.incomingCount} in
                      </span>
                    </>
                  )}
                </div>
                <span className="text-xs font-mono text-[var(--muted-foreground)]">
                  {formatDate(note.updatedAt)}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <h2 className="font-serif text-2xl text-[var(--foreground)]">
                  <Link href={`/knowledge/${note.id}`} className="hover:underline">
                    {note.title}
                  </Link>
                </h2>
                <EditNoteModal
                  note={{
                    id: note.id,
                    title: note.title,
                    content: note.content ?? "",
                    summary: note.summary ?? null,
                    type: note.type,
                    projectId: note.projectId ?? null,
                    isArchived: note.isArchived ?? false,
                  }}
                  projects={data.projects}
                  triggerLabel="Edit"
                  alwaysVisible
                  triggerClassName="h-8 px-3 py-0 text-[11px] tracking-[0.08em] uppercase font-sans"
                />
              </div>
              <p className="mt-4 text-sm leading-relaxed text-[var(--muted-foreground)]">{note.preview}</p>
              {(note.connectedTitles?.length ?? 0) > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {note.connectedTitles?.map((title) => (
                    <span
                      key={`${note.id}-${title}`}
                      className="rounded-full border border-[var(--border)] bg-[var(--accent-soft)]/20 px-3 py-1 text-[11px] text-[var(--muted-foreground)]"
                    >
                      {title}
                    </span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
