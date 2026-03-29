import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function KnowledgePage() {
  const notes = [
    { title: "On Writing Well: Principles", preview: "The essence of writing is rewriting. Clutter is the disease...", tags: ["Book", "Writing"], date: "Oct 12" },
    { title: "Semantic Search with pgvector", preview: "In PostgreSQL, storing 1536-dimensional embeddings allows...", tags: ["Tech", "DB"], date: "Yesterday" },
    { title: "The 'Cognitive Air' Concept", preview: "Interfaces that respect empty space prevent decision fatigue in...", tags: ["Design", "UX"], date: "Today" },
    { title: "Reflection: Urgency vs Importance", preview: "Eisenhower failed to predict that the modern inbox would...", tags: ["Journal"], date: "Oct 05" },
  ];

  return (
    <div className="min-h-full pb-24 bg-[var(--muted)]/20">
      <header className="sticky top-0 z-10 glass-header px-8 md:px-16 py-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-bold tracking-tight text-[var(--foreground)]">Zettelkasten</h1>
          <p className="text-xs font-sans text-[var(--muted-foreground)] uppercase tracking-wider mt-1">
            Knowledge & Reflection Motor
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="icon" className="rounded-full">
            <Search className="w-4 h-4" />
          </Button>
          <Button>
            New Note
          </Button>
        </div>
      </header>

      <div className="px-8 md:px-16 mt-8 max-w-3xl mx-auto">
        <div className="flex flex-col gap-8">
          {notes.map((note, idx) => (
            <article 
              key={idx} 
              className="group flex flex-col gap-3 py-6 border-b border-[var(--border)] border-dashed cursor-pointer"
            >
               <div className="flex justify-between items-baseline">
                <div className="flex gap-2">
                  {note.tags.map(t => (
                    <span key={t} className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)]">
                      {t}
                    </span>
                  ))}
                </div>
                <span className="text-[10px] font-mono text-[var(--muted-foreground)]">
                  {note.date}
                </span>
               </div>

               <h2 className="text-xl md:text-2xl font-serif text-[var(--foreground)] group-hover:text-[var(--muted-foreground)] transition-colors leading-snug">
                 {note.title}
               </h2>

               <p className="text-sm font-sans text-[var(--muted-foreground)] leading-relaxed line-clamp-2">
                 {note.preview}
               </p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
