import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getGlobalSearchData, type SearchScope } from "@/server/queries/lifeos";

const SEARCH_SCOPES: Array<{ value: SearchScope; label: string }> = [
  { value: "all", label: "Todo" },
  { value: "tasks", label: "Tareas" },
  { value: "projects", label: "Proyectos" },
  { value: "notes", label: "Notas" },
  { value: "resources", label: "Recursos" },
  { value: "decisions", label: "Decisiones" },
  { value: "areas", label: "Areas" },
];

type SearchPageProps = {
  searchParams: Promise<{
    q?: string | string[];
    scope?: string | string[];
  }>;
};

function normalizeSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function sectionLabel(type: Exclude<SearchScope, "all">) {
  switch (type) {
    case "tasks":
      return "Tareas";
    case "projects":
      return "Proyectos";
    case "notes":
      return "Notas";
    case "resources":
      return "Recursos";
    case "decisions":
      return "Decisiones";
    case "areas":
      return "Areas";
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const q = normalizeSearchParam(params.q).trim();
  const rawScope = normalizeSearchParam(params.scope);
  const scope = (SEARCH_SCOPES.some((item) => item.value === rawScope) ? rawScope : "all") as SearchScope;
  const data = await getGlobalSearchData(q, scope);

  const groupedResults = data.results.reduce<Record<Exclude<SearchScope, "all">, typeof data.results>>(
    (acc, result) => {
      acc[result.type].push(result);
      return acc;
    },
    {
      tasks: [],
      projects: [],
      notes: [],
      resources: [],
      decisions: [],
      areas: [],
    }
  );

  return (
    <div className="min-h-full px-5 py-6 sm:px-8 md:px-10 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="panel-surface rounded-[32px] p-6 sm:p-8">
          <div className="grid gap-8 xl:grid-cols-[0.92fr_1.08fr]">
            <div>
              <div className="kicker-pill">Busqueda global</div>
              <h1 className="title-balance mt-5 text-4xl font-semibold text-[var(--foreground)]">Encuentra contexto rapido</h1>
              <p className="mt-4 text-base leading-relaxed text-[var(--muted-foreground)]">
                Busca una sola vez y recupera tareas, proyectos, notas, recursos, decisiones y areas sin recordar en que modulo lo guardaste.
              </p>
            </div>

            <form className="panel-quiet rounded-[28px] p-5" method="get">
              <label className="block">
                <span className="eyebrow">Que estas buscando?</span>
                <div className="mt-3 flex items-center gap-3 rounded-[24px] border border-[var(--border)] bg-[var(--background)] px-4 py-3">
                  <Search className="h-4 w-4 text-[var(--muted-foreground)]" />
                  <input
                    name="q"
                    defaultValue={q}
                    placeholder="ej. odisea, review, lifeos, salud, waiting..."
                    className="w-full bg-transparent text-sm text-[var(--foreground)] outline-none"
                  />
                </div>
              </label>

              <label className="mt-4 block">
                <span className="eyebrow">Tipo</span>
                <select
                  name="scope"
                  defaultValue={scope}
                  className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-3 py-4 text-sm text-[var(--foreground)] outline-none"
                >
                  {SEARCH_SCOPES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="mt-5 flex gap-3">
                <Button type="submit" className="rounded-full px-5">
                  Buscar
                </Button>
                <Link
                  href="/search"
                  className="inline-flex items-center justify-center rounded-full border border-[var(--border)] px-5 text-sm text-[var(--muted-foreground)] transition-colors hover:border-[var(--foreground)] hover:text-[var(--foreground)]"
                >
                  Limpiar
                </Link>
              </div>
            </form>
          </div>
        </header>

        <section className="mt-8 panel-surface rounded-[30px] p-6">
          {!q ? (
            <div className="rounded-[24px] border border-dashed border-[var(--border)] p-6 text-sm text-[var(--muted-foreground)]">
              Escribe una palabra, proyecto, decision o tema para explorar todo el sistema desde un solo punto.
            </div>
          ) : data.total === 0 ? (
            <div className="rounded-[24px] border border-dashed border-[var(--border)] p-6 text-sm text-[var(--muted-foreground)]">
              No encontramos resultados para <span className="text-[var(--foreground)]">{q}</span>. Prueba otro termino o cambia el filtro de tipo.
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="eyebrow">Resultados</p>
                  <h2 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
                    {data.total} coincidencia{data.total === 1 ? "" : "s"} para &quot;{q}&quot;
                  </h2>
                </div>
              </div>

              {(Object.keys(groupedResults) as Array<Exclude<SearchScope, "all">>).map((group) => {
                const items = groupedResults[group];
                if (items.length === 0) return null;

                return (
                  <section key={group}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-[var(--foreground)]">{sectionLabel(group)}</p>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
                        {items.length} resultado{items.length === 1 ? "" : "s"}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3">
                      {items.map((item) => (
                        <Link
                          key={`${item.type}-${item.id}`}
                          href={item.href}
                          className="panel-quiet rounded-[24px] p-5 transition-all hover:-translate-y-0.5 hover:border-[var(--foreground)]/20"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-[var(--foreground)]">{item.title}</p>
                            <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
                              {sectionLabel(item.type)}
                            </span>
                          </div>
                          <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">{item.description}</p>
                          <p className="mt-3 text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">{item.meta}</p>
                        </Link>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
