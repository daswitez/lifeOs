import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ConocimientoPage() {
  const notes = [
    { title: "On Writing Well: Principios", preview: "La esencia de escribir es reescribir. El desorden es la enfermedad...", tags: ["Book", "Writing"], date: "Oct 12" },
    { title: "Búsqueda Semántica con pgvector", preview: "En PostgreSQL, almacenar embeddings de 1536 dimensiones permite...", tags: ["Tech", "DB"], date: "Ayer" },
    { title: "El concepto de 'Aire Cognitivo'", preview: "Interfaces que respetan el espacio vacío previenen la fatiga de decisión en...", tags: ["Design", "UX"], date: "Hoy" },
    { title: "Reflexión: Urgencia vs Importancia", preview: "Eisenhower fallaba en predecir que la bandeja de entrada moderna...", tags: ["Journal"], date: "Oct 05" },
  ];

  return (
    <div className="min-h-full pb-24 bg-[var(--muted)]/20">
      {/* Sticky Header Glassmorphic (Editorial) */}
      <header className="sticky top-0 z-10 glass-header px-8 md:px-16 py-6 flex justify-between items-center">
        <div>
          {/* Serif font in header directly translates "reading/library" vibe */}
          <h1 className="text-2xl font-serif font-bold tracking-tight text-[var(--foreground)]">Zettelkasten</h1>
          <p className="text-xs font-sans text-[var(--muted-foreground)] uppercase tracking-wider mt-1">
            Motor de Conocimiento y Reflexión
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="icon" className="rounded-full">
            <Search className="w-4 h-4" />
          </Button>
          <Button>
            Nueva Nota
          </Button>
        </div>
      </header>

      {/* Masonry-like List (Brutalista y enfocada en Serif) */}
      <div className="px-8 md:px-16 mt-8 max-w-3xl mx-auto">
        
        <div className="flex flex-col gap-8">
          {notes.map((note, idx) => (
            <article 
              key={idx} 
              className="group flex flex-col gap-3 py-6 border-b border-[var(--border)] border-dashed cursor-pointer"
            >
               <div className="flex justify-between items-baseline">
                {/* Meta-information minimal */}
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

               {/* Headline en Serif puro, estilo periodístico / blog premium */}
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
