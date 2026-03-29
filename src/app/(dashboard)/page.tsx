import { ExecutionPanel } from "@/components/dashboard/execution-panel";
import { ProjectsPanel } from "@/components/dashboard/projects-panel";
import { KnowledgePanel } from "@/components/dashboard/knowledge-panel";
import { Button } from "@/components/ui/button";
import { Smile, Target, ChevronRight } from "lucide-react";

export default function DashboardPage() {
  const dateStr = new Intl.DateTimeFormat('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  }).format(new Date());

  return (
    <div className="flex flex-col min-h-full p-8 md:p-12 lg:p-16 gap-10">
      
      {/* Enhanced English Header with Daily Log Interactive Widget */}
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end border-b border-[var(--border)] pb-8 gap-8">
        <div>
           <h1 className="text-4xl font-semibold tracking-tight text-[var(--foreground)]">
             Good Evening.
           </h1>
           <p className="mt-2 text-sm text-[var(--muted-foreground)] font-mono">
             {dateStr}
           </p>
        </div>
        
        {/* Daily Log Functional Widget (Postgres Schema Alignment) */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-[var(--card)] border border-[var(--border)] rounded-full px-4 py-2 shadow-sm">
             <span className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] mr-3 font-semibold">Mood</span>
             <div className="flex gap-1">
               {[1, 2, 3, 4, 5].map(score => (
                 <button key={score} className={`w-5 h-5 rounded-full text-xs font-mono transition-colors ${score === 4 ? 'bg-[var(--foreground)] text-[var(--background)]' : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--border)]'}`}>
                   {score}
                 </button>
               ))}
             </div>
          </div>
          <div className="flex items-center bg-[var(--card)] border border-[var(--border)] rounded-full px-4 py-2 shadow-sm">
             <span className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] mr-3 font-semibold">Focus</span>
             <div className="flex gap-1">
               {[1, 2, 3, 4, 5].map(score => (
                 <button key={score} className={`w-5 h-5 rounded-full text-xs font-mono transition-colors ${score === 5 ? 'bg-orange-500 text-white' : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--border)]'}`}>
                   {score}
                 </button>
               ))}
             </div>
          </div>
          <Button variant="outline" className="rounded-full px-4 h-9 gap-2">
            Log Wins <ChevronRight className="w-3 h-3" />
          </Button>
        </div>
      </header>

      {/* Strict Monochrome Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-fr">
        
        <div className="lg:col-span-2 flex flex-col gap-8">
           <ExecutionPanel />
           <ProjectsPanel />
        </div>

        <div className="lg:col-span-1 lg:pl-8 lg:border-l border-[var(--border)] border-dashed">
           <KnowledgePanel />
        </div>

      </div>
    </div>
  );
}
