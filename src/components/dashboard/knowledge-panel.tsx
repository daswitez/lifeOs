import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function KnowledgePanel() {
  const mockNotes = [
    { id: 1, title: "The illusion of urgency", type: "Literature", time: "Today" },
    { id: 2, title: "UI Micro-patterns (PDF)", type: "Reference", time: "Yesterday" },
    { id: 3, title: "Idea: Supabase Realtime Dash", type: "Fleeting", time: "2d ago" },
  ];

  return (
    <Card className="flex flex-col h-full bg-[var(--card)] border-none shadow-none">
      <CardHeader className="pb-4 border-b border-[var(--border)] border-dashed mb-4">
        <CardTitle className="text-sm uppercase tracking-widest font-sans text-[var(--foreground)]">
          Vault / Knowledge
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col gap-5">
        {mockNotes.map((note) => (
          <article 
            key={note.id} 
            className="group flex flex-col gap-1 hover:opacity-70 transition-opacity cursor-pointer"
          >
             <div className="flex justify-between items-center">
               <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--muted-foreground)]">
                 {note.type}
               </span>
               <span className="text-[10px] text-[var(--muted-foreground)]">{note.time}</span>
             </div>
             
             {/* Serif headline for editorial feel */}
             <h4 className="text-base font-serif font-medium text-[var(--foreground)] leading-tight group-hover:underline decoration-[1.5px] underline-offset-4">
               {note.title}
             </h4>
          </article>
        ))}
      </CardContent>
    </Card>
  );
}
