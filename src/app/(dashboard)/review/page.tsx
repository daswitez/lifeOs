import { Activity, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ReviewPage() {
  return (
    <div className="min-h-full flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-2xl mx-auto">
        
        <div className="w-16 h-16 bg-[var(--accent-soft)] rounded-full flex items-center justify-center mb-8 shadow-inner">
          <Sparkles className="w-8 h-8 text-[var(--foreground)]" />
        </div>

        <h1 className="text-3xl md:text-4xl font-serif text-[var(--foreground)] mb-4 tracking-tight">
          Pause & Calibrate
        </h1>
        
        <p className="text-lg text-[var(--muted-foreground)] mb-12 font-sans leading-relaxed">
          It is time to empty your mind, review your unprocessed inboxes, capture the week's learnings, and align your next focus. Zero distractions.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
           <Button size="lg" className="px-8 text-base shadow-lg">
             Start Weekly Review
           </Button>
           <Button variant="outline" size="lg" className="px-8 text-base">
             View History
           </Button>
        </div>

      </div>

      <footer className="w-full border-t border-[var(--border)] p-4 flex justify-between items-center text-xs font-mono text-[var(--muted-foreground)] bg-[var(--background)]">
        <div className="flex items-center gap-2">
          <Activity className="w-3 h-3 text-green-500/80" />
          <span>Last review: 6 days ago</span>
        </div>
        <span>System Clean: 92%</span>
      </footer>

    </div>
  );
}
