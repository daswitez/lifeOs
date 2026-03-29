import { PlayCircle, Circle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ExecutionPanel() {
  const mockTasks = [
    { id: 1, title: "Review Supabase auth webhook", context: "work", energy: "high", done: false },
    { id: 2, title: "Pay AWS hosting bill", context: "finance", energy: "low", done: false },
    { id: 3, title: "Read Chapter 4 of Building a Second Brain", context: "learning", energy: "medium", done: true },
  ];

  return (
    <Card className="flex flex-col h-full bg-[var(--background)]">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-sm uppercase tracking-widest text-[var(--muted-foreground)]">
          Next Actions
        </CardTitle>
        <Badge variant="secondary" className="px-1.5 py-0 uppercase text-[10px]">3 Tasks</Badge>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col gap-3">
        {mockTasks.map((task) => (
          <div 
            key={task.id} 
            className="group flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:border-[var(--muted-foreground)] transition-all cursor-pointer shadow-sm"
          >
            <div className="flex items-start gap-3 flex-1 min-w-0">
               <button className="mt-0.5 flex-shrink-0 text-[var(--muted-foreground)] group-hover:text-[var(--accent)] transition-colors">
                 {task.done ? <PlayCircle className="w-5 h-5 text-green-600/70" /> : <Circle className="w-5 h-5" />}
               </button>
               <span className={`text-sm font-medium truncate ${task.done ? 'line-through text-[var(--muted-foreground)]' : 'text-[var(--foreground)]'}`}>
                 {task.title}
               </span>
            </div>

            <div className="flex items-center gap-2 mt-1 sm:mt-0 ml-8 sm:ml-0">
               <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-dashed rounded font-mono uppercase">
                 @{task.context}
               </Badge>
               {task.energy === 'high' && (
                 <span className="text-[10px] text-orange-500 font-bold uppercase tracking-wider">
                   High Energy
                 </span>
               )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
