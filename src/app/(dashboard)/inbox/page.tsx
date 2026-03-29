import { Inbox as InboxIcon, CornerDownLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InboxPage() {
  const inboxItems = [
    { title: "Review Supabase documentation for Webhooks", time: "2h ago", type: "thought" },
    { title: "Buy groceries for the weekend", time: "5h ago", type: "task" },
    { title: "https://linear.app/methodology", time: "Yesterday", type: "link" },
  ];

  return (
    <div className="min-h-full pb-24 flex flex-col items-center">
      {/* Massive Capture Input Area */}
      <div className="w-full max-w-4xl px-8 pt-16 md:pt-24 pb-12 flex flex-col gap-4">
        <div className="flex items-center gap-3 text-[var(--muted-foreground)] mb-2">
          <InboxIcon className="w-5 h-5" />
          <h2 className="text-sm font-medium tracking-widest uppercase">Universal Inbox</h2>
        </div>
        
        {/* The Capture Box (Minimalist, Large) */}
        <div className="relative w-full group">
          <textarea 
            placeholder="What's on your mind? Capture a thought, task, or link..."
            className="w-full bg-[var(--background)] border-2 border-[var(--border)] focus:border-[var(--foreground)] rounded-xl p-6 text-xl md:text-2xl font-medium text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/50 focus:outline-none resize-none transition-colors shadow-sm"
            rows={3}
            autoFocus
          />
          <div className="absolute bottom-4 right-4 flex items-center gap-3 text-[var(--muted-foreground)]">
            <span className="hidden md:inline-flex text-xs font-mono font-medium items-center gap-1 border border-[var(--border)] px-2 py-1 rounded bg-[var(--muted)]">
               Press <CornerDownLeft className="w-3 h-3" /> to save
            </span>
            <Button size="sm">Capture</Button>
          </div>
        </div>
      </div>

      {/* Unprocessed Items List */}
      <div className="w-full max-w-4xl px-8">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 mb-6">
          <h3 className="text-lg font-medium text-[var(--foreground)]">Needs Processing (3)</h3>
          <Button variant="ghost" size="sm" className="text-xs h-8">
            <Sparkles className="w-3 h-3 mr-2" />
            Process All
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          {inboxItems.map((item, idx) => (
             <div 
               key={idx} 
               className="group flex items-center justify-between p-4 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-sm hover:border-[var(--muted-foreground)] transition-colors cursor-pointer"
             >
               <span className="font-medium text-[var(--foreground)]">{item.title}</span>
               <div className="flex items-center gap-4">
                 <span className="text-[10px] font-mono text-[var(--muted-foreground)] uppercase px-2 py-0.5 rounded bg-[var(--background)] border border-[var(--border)]">
                   {item.type}
                 </span>
                 <span className="text-xs text-[var(--muted-foreground)] w-16 text-right">{item.time}</span>
               </div>
             </div>
          ))}
          
          {inboxItems.length === 0 && (
            <div className="py-12 text-center text-[var(--muted-foreground)]">
              <p className="text-sm">Inbox Zero. Your mind is clear.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
