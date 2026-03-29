import { Circle, Flame, Inbox as InboxIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ActionsPage() {
  const inboxTasks = [
    "Think about new database indexing strategy",
    "Call the car insurance company",
  ];

  const todayTasks = [
    { title: "Filter candidates for UX role", ctx: "work", priority: true },
    { title: "Finish Q3 weekly report", ctx: "work", priority: false },
    { title: "Buy tickets to Berlin", ctx: "life", priority: false },
  ];

  return (
    <div className="min-h-full pb-24">
      {/* Sticky Header Glassmorphic */}
      <header className="sticky top-0 z-10 glass-header px-8 md:px-16 py-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Actions</h1>
          <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider mt-1">
            Execution Motor
          </p>
        </div>
        <Button>+ New Task</Button>
      </header>

      <div className="px-8 md:px-16 mt-8 max-w-4xl">
        
        {/* SECTOR 1: INBOX */}
        <section className="mb-12">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--muted-foreground)] mb-4 tracking-widest uppercase">
            <InboxIcon className="w-4 h-4" /> Unprocessed (2)
          </h2>
          <div className="flex flex-col border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--card)] shadow-sm">
            {inboxTasks.map((task, idx) => (
              <div 
                key={idx} 
                className={`group flex items-center gap-4 p-4 hover:bg-[var(--accent-soft)] transition-colors cursor-pointer ${
                  idx !== inboxTasks.length - 1 ? "border-b border-[var(--border)]" : ""
                }`}
              >
                <Circle className="w-5 h-5 text-[var(--muted-foreground)] group-hover:text-[var(--accent)]" />
                <span className="text-[var(--foreground)] font-medium text-sm">{task}</span>
              </div>
            ))}
          </div>
        </section>

        {/* SECTOR 2: TODAY (Premium Focus) */}
        <section>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)] mb-4 tracking-widest uppercase">
            <Flame className="w-4 h-4 text-orange-500/80" /> Today's Focus
          </h2>
          <div className="flex flex-col border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--card)] shadow-sm">
            {todayTasks.map((task, idx) => (
              <div 
                key={idx} 
                className={`group flex items-center justify-between p-4 hover:bg-[var(--accent-soft)] transition-colors cursor-pointer ${
                  idx !== todayTasks.length - 1 ? "border-b border-[var(--border)]" : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  <Circle className="w-5 h-5 text-[var(--muted-foreground)] flex-shrink-0 group-hover:text-[var(--accent)]" />
                  <span className={`font-medium text-sm ${task.priority ? 'text-[var(--foreground)]' : 'text-[var(--foreground)]/80'}`}>
                    {task.title}
                  </span>
                </div>
                
                {/* Meta right-aligned */}
                <div className="flex items-center gap-3">
                  {task.priority && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 border border-orange-500/20">
                      DO IT
                    </span>
                  )}
                  <span className="text-[10px] font-mono text-[var(--muted-foreground)] uppercase px-2 py-1 rounded bg-[var(--background)] border border-[var(--border)]">
                    @{task.ctx}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
