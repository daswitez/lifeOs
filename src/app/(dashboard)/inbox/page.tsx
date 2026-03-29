import Link from "next/link";
import { ChevronRight, Sparkles } from "lucide-react";
import { SubmitButton } from "@/components/ui/submit-button";
import { createTaskAction } from "@/server/actions/lifeos";
import { getInboxData } from "@/server/queries/lifeos";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-BO", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

const KIND_COPY: Record<string, string> = {
  task: "Mover a actions",
  note: "Destilar en knowledge",
  resource: "Completar metadata",
  decision: "Definir razonamiento",
};

export default async function InboxPage() {
  const data = await getInboxData();

  return (
    <div className="min-h-full px-5 py-6 sm:px-8 md:px-10 lg:px-12">
      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="panel-surface rounded-[32px] p-6 sm:p-8">
          <div className="kicker-pill">Universal inbox</div>
          <h1 className="title-balance mt-5 text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl">
            Captura primero. Decide despues.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[var(--muted-foreground)]">
            Esta vista concentra lo que aun no esta bien asentado. No es una lista cualquiera: es la zona donde el sistema convierte ruido en claridad.
          </p>

          <form action={createTaskAction} className="mt-8 panel-quiet rounded-[28px] p-4">
            <input type="hidden" name="status" value="inbox" />
            <label className="block">
              <span className="eyebrow">Quick capture</span>
              <input
                name="title"
                required
                placeholder="Que necesitas sacar de la cabeza?"
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
              <input
                name="due_date"
                type="date"
                className="rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)] outline-none"
              />
              <SubmitButton pendingLabel="Capturando..." className="rounded-2xl px-5">
                Capturar <ChevronRight className="ml-1 h-3 w-3" />
              </SubmitButton>
            </div>
          </form>
        </div>

        <div className="panel-surface rounded-[32px] p-6 sm:p-8">
          <p className="eyebrow">Como procesarlo</p>
          <h2 className="mt-4 text-2xl font-semibold text-[var(--foreground)]">
            Del caos a la siguiente casa
          </h2>
          <div className="mt-6 space-y-4">
            {[
              "Si es accionable, activalo en Actions.",
              "Si es una idea o insight, muevelo a Knowledge.",
              "Si es un enlace o archivo, completalo en Resources.",
              "Si implica trade-offs o apuestas, llevalo a Decisions.",
            ].map((step, index) => (
              <div key={step} className="panel-quiet rounded-2xl p-4">
                <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
                  Paso {index + 1}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[var(--foreground)]/88">{step}</p>
              </div>
            ))}
          </div>

          <div className="soft-rule mt-6 grid gap-3 pt-5 sm:grid-cols-2">
            <div className="panel-quiet rounded-2xl p-4">
              <p className="eyebrow">Conteo</p>
              <p className="mt-3 text-3xl font-semibold text-[var(--foreground)]">{data.items.length}</p>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">items visibles para procesar ahora</p>
            </div>
            <div className="panel-quiet rounded-2xl p-4">
              <p className="eyebrow">Atajo</p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-2 text-sm text-[var(--foreground)]">
                <Sparkles className="h-4 w-4" />
                Ctrl/Cmd + K
              </div>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">captura multimodal desde cualquier vista</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 panel-surface rounded-[32px] p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Needs processing</p>
            <h2 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
              Presion cognitiva visible
            </h2>
          </div>
          <p className="text-sm text-[var(--muted-foreground)]">
            Lo reciente arriba, lo ambiguo al centro, lo importante a un click.
          </p>
        </div>

        <div className="mt-6 space-y-3">
          {data.items.map((item) => (
            <Link
              key={`${item.kind}-${item.id}`}
              href={item.href}
              className="panel-quiet group flex flex-col gap-3 rounded-[26px] p-4 transition-all hover:-translate-y-0.5 hover:border-[var(--foreground)]/15 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="kicker-pill">{item.kind}</span>
                  <span className="text-xs text-[var(--muted-foreground)]">{KIND_COPY[item.kind] ?? "Procesar"}</span>
                </div>
                <p className="mt-3 text-base font-semibold text-[var(--foreground)]">{item.title}</p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">{item.detail}</p>
              </div>
              <div className="flex items-center gap-4 text-sm text-[var(--muted-foreground)]">
                <span className="font-mono">{formatDate(item.createdAt)}</span>
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
