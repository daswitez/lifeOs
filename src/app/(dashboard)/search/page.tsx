import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getGlobalSearchData, type SearchScope } from "@/server/queries/lifeos";

const SEARCH_SCOPES: Array<{ value: SearchScope; label: string }> = [
  { value: "all", label: "All" },
  { value: "tasks", label: "Tasks" },
  { value: "projects", label: "Projects" },
  { value: "notes", label: "Notes" },
  { value: "resources", label: "Resources" },
  { value: "decisions", label: "Decisions" },
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
      return "Tasks";
    case "projects":
      return "Projects";
    case "notes":
      return "Notes";
    case "resources":
      return "Resources";
    case "decisions":
      return "Decisions";
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
        <header className="panel-surface rounded-[32px] p-6 sm:p-8 anim-fade-in-up">
          <div className="grid gap-8 xl:grid-cols-[0.92fr_1.08fr]">
            <div>
              <div className="kicker-pill">Global search</div>
              <h1 className="title-balance mt-5 text-4xl font-semibold text-[var(--foreground)]">Find context fast</h1>
              <p className="mt-4 text-base leading-relaxed text-[var(--muted-foreground)]">
                Search once and retrieve tasks, projects, notes, resources, decisions, and areas without remembering which module holds them.
              </p>
            </div>

            <form className="panel-quiet rounded-[28px] p-5" method="get">
              <label className="block">
                <span className="eyebrow">What are you looking for?</span>
                <div className="mt-3 flex items-center gap-3 rounded-[24px] border border-[var(--border)] bg-[var(--background)] px-4 py-3 transition-all focus-within:border-[var(--ring)] focus-within:shadow-[0_0_0_3px_color-mix(in_srgb,var(--ring)_18%,transparent)]">
                  <Search className="h-4 w-4 text-[var(--muted-foreground)]" />
                  <input
                    name="q"
                    defaultValue={q}
                    placeholder="e.g. odyssey, review, lifeos, health, waiting..."
                    className="w-full bg-transparent text-sm text-[var(--foreground)] outline-none"
                  />
                </div>
              </label>

              <label className="mt-4 block">
                <span className="eyebrow">Type</span>
                <select
                  name="scope"
                  defaultValue={scope}
                  className="input-ring mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-3 py-4 text-sm text-[var(--foreground)]"
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
                  Search
                </Button>
                <Link
                  href="/search"
                  className="inline-flex items-center justify-center rounded-full border border-[var(--border)] px-5 text-sm text-[var(--muted-foreground)] transition-colors hover:border-[var(--foreground)] hover:text-[var(--foreground)]"
                >
                  Clear
                </Link>
              </div>
            </form>
          </div>
        </header>

        <section className="mt-8 panel-surface rounded-[30px] p-6">
          {!q ? (
            <div className="rounded-[24px] border border-dashed border-[var(--border)] p-6 text-sm text-[var(--muted-foreground)]">
              Type a word, project, decision, or topic to explore the entire system from a single point.
            </div>
          ) : data.total === 0 ? (
            <div className="rounded-[24px] border border-dashed border-[var(--border)] p-6 text-sm text-[var(--muted-foreground)]">
              No results found for <span className="text-[var(--foreground)]">{q}</span>. Try a different term or change the type filter.
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="eyebrow">Results</p>
                  <h2 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
                    {data.total} match{data.total === 1 ? "" : "es"} for &quot;{q}&quot;
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
                        {items.length} result{items.length === 1 ? "" : "s"}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3">
                      {items.map((item) => (
                        <Link
                          key={`${item.type}-${item.id}`}
                          href={item.href}
                          className="panel-quiet rounded-[24px] p-5 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]"
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
