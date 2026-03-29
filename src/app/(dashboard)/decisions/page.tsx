import { DECISION_STATUSES } from "@/lib/domain";
import { CreateEntityModal } from "@/components/forms/create-entity-modal";
import { createDecisionAction } from "@/server/actions/lifeos";
import { getDecisionsData } from "@/server/queries/lifeos";

function formatDate(value: string | null) {
  if (!value) return "Sin fecha";
  return new Intl.DateTimeFormat("es-BO", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export default async function DecisionsPage() {
  const data = await getDecisionsData();

  return (
    <div className="min-h-full px-5 py-6 pb-24 sm:px-8 md:px-10 lg:px-12">
      <header className="panel-surface rounded-[32px] p-6 sm:p-8">
        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <div>
            <div className="kicker-pill">Memoria estrategica</div>
            <h1 className="title-balance mt-5 text-4xl font-semibold text-[var(--foreground)]">Decision Journal</h1>
            <p className="mt-4 text-base text-[var(--muted-foreground)]">
              Registra contexto, resultado esperado y fecha de chequeo para no decidir dos veces lo mismo.
            </p>
          </div>

          <div className="panel-quiet flex flex-col justify-between rounded-[28px] p-5">
            <div>
              <p className="eyebrow">Nueva decision</p>
              <h2 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
                Composer estrategico
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
                La bitacora de decisiones gana claridad cuando escribir y leer no compiten en la misma superficie.
              </p>
            </div>

            <div className="mt-6">
              <CreateEntityModal
                title="Nueva decision"
                description="Registra el punto de decision, el resultado esperado y una fecha de chequeo para crear memoria estrategica."
                triggerLabel="Nueva decision"
                submitLabel="Guardar decision"
                pendingLabel="Guardando..."
                action={createDecisionAction}
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="eyebrow">Titulo</span>
                    <input
                      name="title"
                      required
                      placeholder="Decision a registrar"
                      className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)] outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="eyebrow">Review date</span>
                    <input
                      name="review_date"
                      type="date"
                      className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-3 py-4 text-sm text-[var(--foreground)] outline-none"
                    />
                  </label>
                  <label className="block md:col-span-2">
                    <span className="eyebrow">Resultado esperado</span>
                    <input
                      name="expected_outcome"
                      placeholder="Resultado esperado"
                      className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)] outline-none"
                    />
                  </label>
                  <label className="block md:col-span-2">
                    <span className="eyebrow">Contexto</span>
                    <textarea
                      name="context"
                      rows={6}
                      placeholder="Que esta pasando, que señales ves, que trade-offs hay?"
                      className="mt-3 w-full rounded-[24px] border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)] outline-none resize-none"
                    />
                  </label>
                </div>
              </CreateEntityModal>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl pt-8">
        <div className="space-y-6">
          {data.decisions.map((decision) => (
            <article key={decision.id} className="panel-surface rounded-[30px] p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="eyebrow">
                    {decision.status}
                  </p>
                  <h2 className="mt-3 text-xl font-semibold text-[var(--foreground)]">{decision.title}</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {DECISION_STATUSES.includes(decision.status) && (
                    <span className="rounded-full border border-[var(--border)] px-3 py-1 text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
                      revisar {formatDate(decision.reviewDate)}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--muted-foreground)]">Contexto</p>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--foreground)]/85">
                    {decision.context || "Sin contexto aun. Conviene anotar que informacion mueve esta decision."}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--muted-foreground)]">Resultado esperado</p>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--foreground)]/85">
                    {decision.expectedOutcome || "Sin resultado esperado aun."}
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
