import { NOTE_TYPES, NOTE_TYPE_LABELS } from "@/lib/domain";
import { CreateEntityModal } from "@/components/forms/create-entity-modal";
import { createNoteAction } from "@/server/actions/lifeos";
import { getKnowledgeData } from "@/server/queries/lifeos";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-BO", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export default async function KnowledgePage() {
  const data = await getKnowledgeData();

  return (
    <div className="min-h-full bg-[var(--muted)]/10 px-5 py-6 pb-24 sm:px-8 md:px-10 lg:px-12">
      <header className="panel-surface rounded-[32px] p-6 sm:p-8">
        <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
          <div>
            <div className="kicker-pill">Biblioteca personal</div>
            <h1 className="title-balance mt-5 font-serif text-4xl font-semibold text-[var(--foreground)]">Zettelkasten</h1>
            <p className="mt-4 text-base text-[var(--muted-foreground)]">
              Captura ideas, destila notas y manten a mano lo que vale la pena reutilizar.
            </p>
          </div>

          <div className="panel-quiet flex flex-col justify-between rounded-[28px] p-5">
            <div>
              <p className="eyebrow">Nueva nota</p>
              <h2 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
                Composer editorial
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
                Abrimos una pantalla de creación para que la biblioteca siga viéndose como biblioteca y no como formulario.
              </p>
            </div>

            <div className="mt-6">
              <CreateEntityModal
                title="Nueva nota"
                description="Captura una idea, extracto o insight con suficiente contexto para que luego puedas destilarla."
                triggerLabel="Nueva nota"
                submitLabel="Guardar nota"
                pendingLabel="Guardando..."
                action={createNoteAction}
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="eyebrow">Titulo</span>
                    <input
                      name="title"
                      required
                      placeholder="Titulo de la nota"
                      className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)] outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="eyebrow">Tipo</span>
                    <select
                      name="type"
                      defaultValue="plain"
                      className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-3 py-4 text-sm text-[var(--foreground)] outline-none"
                    >
                      {NOTE_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {NOTE_TYPE_LABELS[type]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block md:col-span-2">
                    <span className="eyebrow">Resumen</span>
                    <input
                      name="summary"
                      placeholder="Resumen breve"
                      className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)] outline-none"
                    />
                  </label>
                  <label className="block md:col-span-2">
                    <span className="eyebrow">Contenido</span>
                    <textarea
                      name="content"
                      rows={6}
                      placeholder="Escribe una idea, insight o extracto..."
                      className="mt-3 w-full rounded-[24px] border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)] outline-none resize-none"
                    />
                  </label>
                </div>
              </CreateEntityModal>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl pt-8">
        <div className="space-y-8">
          {data.notes.map((note) => (
            <article key={note.id} className="panel-surface group rounded-[30px] p-6">
              <div className="flex items-center justify-between gap-3">
                <p className="eyebrow">
                  {NOTE_TYPE_LABELS[note.type]}
                </p>
                <span className="text-xs font-mono text-[var(--muted-foreground)]">
                  {formatDate(note.updatedAt)}
                </span>
              </div>
              <h2 className="mt-4 font-serif text-2xl text-[var(--foreground)]">{note.title}</h2>
              <p className="mt-4 text-sm leading-relaxed text-[var(--muted-foreground)]">{note.preview}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
