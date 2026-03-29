import { Compass, FileQuestion, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DecisionsPage() {
  const decisions = [
    { 
      title: "Migrate UI to Monolithic Monolith Design", 
      status: "validated", 
      context: "The app felt clunky with colors.",
      outcome: "Cleaner UI, faster decision-making for the user.",
      date: "Today"
    },
    { 
      title: "Use Supabase instead of Firebase", 
      status: "open", 
      context: "Need complex relational queries for the Zettelkasten.",
      outcome: "PostgreSQL handles foreign keys natively.",
      date: "3 days ago"
    },
    { 
      title: "Cancel AWS Subscription and move to Vercel", 
      status: "invalidated", 
      context: "Cutting infrastructure costs.",
      outcome: "Vercel DB limits were too strict for our image storage needs.",
      date: "Oct 1"
    },
  ];

  return (
    <div className="min-h-full pb-24">
      <header className="sticky top-0 z-10 glass-header px-8 md:px-16 py-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Decision Journal</h1>
          <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider mt-1">
            Strategic Record & Outcomes
          </p>
        </div>
        <Button className="gap-2">
          <Compass className="w-4 h-4" /> Log Decision
        </Button>
      </header>

      <div className="px-8 md:px-16 mt-8 max-w-4xl">
        <div className="flex flex-col gap-6">
          {decisions.map((dec, idx) => (
             <div key={idx} className="flex gap-4">
                
                {/* Timeline Axis */}
                <div className="flex flex-col items-center">
                   <div className="w-3 h-3 rounded-full bg-[var(--border)] mt-1">
                     {dec.status === 'validated' && <div className="w-3 h-3 rounded-full bg-green-500" />}
                     {dec.status === 'open' && <div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse" />}
                     {dec.status === 'invalidated' && <div className="w-3 h-3 rounded-full bg-red-500/50" />}
                   </div>
                   {idx !== decisions.length - 1 && <div className="w-px h-full bg-[var(--border)] mt-2" />}
                </div>

                {/* Card */}
                <div className="flex-1 bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow mb-6">
                   <div className="flex justify-between items-start mb-3">
                     <h3 className="text-lg font-bold text-[var(--foreground)]">{dec.title}</h3>
                     <span className="text-[10px] font-mono text-[var(--muted-foreground)] px-2 py-1 rounded bg-[var(--muted)] border border-[var(--border)] uppercase">
                       {dec.status}
                     </span>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                     <div>
                       <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-1">
                         <FileQuestion className="w-3 h-3" /> Context
                       </h4>
                       <p className="text-sm text-[var(--foreground)]/80 leading-relaxed">
                         {dec.context}
                       </p>
                     </div>
                     <div>
                       <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-1">
                         <MapPin className="w-3 h-3" /> Expected Outcome
                       </h4>
                       <p className="text-sm text-[var(--foreground)]/80 leading-relaxed italic">
                         "{dec.outcome}"
                       </p>
                     </div>
                   </div>

                </div>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
}
