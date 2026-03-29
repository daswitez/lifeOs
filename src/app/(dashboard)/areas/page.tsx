import { Layers, Plus, Target } from "lucide-react";
import { getAreasData } from "@/server/queries/lifeos";
import { createAreaAction } from "@/server/actions/lifeos";
import { AREA_TYPES, AREA_TYPE_LABELS } from "@/lib/domain";
import { SubmitButton } from "@/components/ui/submit-button";
import { ColorPicker } from "@/components/ui/color-picker";

export default async function AreasPage() {
  const { areas } = await getAreasData();

  return (
    <div className="flex min-h-full flex-col gap-8 px-5 py-6 sm:px-8 md:px-10 md:py-8 lg:px-12">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Life Domains</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
            Your Areas
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-[var(--muted-foreground)]">
            Structure your projects and resources by important domains to maintain long-term accountability.
          </p>
        </div>
        <div className="kicker-pill">
          <Layers className="h-3 w-3" />
          {areas.length} areas
        </div>
      </div>

      <section className="grid gap-6 md:grid-cols-[1fr_350px]">
        <div className="order-2 space-y-6 md:order-1">
          {areas.length === 0 && (
            <div className="panel-surface flex flex-col items-center justify-center rounded-3xl py-20 text-center">
              <Layers className="mb-4 h-10 w-10 text-[var(--muted-foreground)]/50" />
              <p className="text-lg font-medium text-[var(--foreground)]">You don't have any areas yet</p>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">Use the side panel to create your first life domain.</p>
            </div>
          )}
          
          <div className="grid gap-4 sm:grid-cols-2">
            {areas.map((area) => (
              <article
                key={area.id}
                className="panel-quiet rounded-[28px] p-6 transition-all hover:-translate-y-0.5 hover:border-[var(--foreground)]/15"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      {area.color && (
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: area.color }} />
                      )}
                      <p className="eyebrow">{AREA_TYPE_LABELS[area.type] || area.type}</p>
                    </div>
                    <h3 className="mt-3 text-xl font-semibold text-[var(--foreground)]">
                      {area.name}
                    </h3>
                  </div>
                </div>

                {area.description && (
                  <p className="mt-4 text-sm leading-relaxed text-[var(--muted-foreground)] line-clamp-2">
                    {area.description}
                  </p>
                )}

                <div className="soft-rule mt-5 flex items-center gap-2 pt-4">
                  <Target className="h-4 w-4 text-[var(--muted-foreground)]" />
                  <span className="text-sm text-[var(--muted-foreground)]">
                    {area.activeProjectsCount} active projects
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="order-1 md:order-2">
          <form action={createAreaAction} className="panel-surface sticky top-24 rounded-[32px] p-6">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">New Area</h2>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">Add a new vital container for your responsibilities.</p>

            <div className="mt-6 space-y-4">
              <label className="block">
                <span className="text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">Name</span>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Health & Fitness"
                  className="mt-3 block w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] outline-none hover:border-[var(--foreground)]/30 focus:border-[var(--foreground)]/80"
                />
              </label>

              <label className="block">
                <span className="text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">Type</span>
                <select
                  name="type"
                  className="mt-3 block w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] outline-none hover:border-[var(--foreground)]/30 focus:border-[var(--foreground)]/80"
                  defaultValue="life"
                >
                  {AREA_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {AREA_TYPE_LABELS[type]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">Description (optional)</span>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="Maintain optimal vitality and energy."
                  className="mt-3 block w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] outline-none hover:border-[var(--foreground)]/30 focus:border-[var(--foreground)]/80"
                />
              </label>
              
              <div className="block">
                <span className="text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">Theme Color (optional)</span>
                <ColorPicker />
              </div>

              <div className="pt-2">
                <SubmitButton pendingLabel="Creating..." className="w-full justify-center rounded-xl py-3 border border-[var(--border)]">
                  <Plus className="mr-2 h-4 w-4" /> Create Area
                </SubmitButton>
              </div>
            </div>
          </form>
        </aside>
      </section>
    </div>
  );
}
