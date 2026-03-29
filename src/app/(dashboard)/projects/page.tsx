import { Plus, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProjectsPage() {
  const projects = [
    { title: "Launch LifeOS v1 app", area: "Personal", status: "Active", meta: "3 tasks left", progress: 80 },
    { title: "Move to Madrid", area: "Life", status: "Active", meta: "Strategic pause", progress: 20 },
    { title: "AWS Solutions Architect Cert", area: "Learning", status: "Active", meta: "Exam in 2 weeks", progress: 65 },
    { title: "Investment Portfolio Restructure", area: "Finance", status: "On Hold", meta: "Waiting for annual balance", progress: 10 },
  ];

  return (
    <div className="min-h-full pb-24">
      <header className="sticky top-0 z-10 glass-header px-8 md:px-16 py-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Projects</h1>
          <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider mt-1">
            Vision & Strategy Motor
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Plus className="w-4 h-4" /> New Project
        </Button>
      </header>

      <div className="px-8 md:px-16 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map((proj, idx) => (
            <div 
              key={idx} 
              className={`group flex flex-col p-6 rounded-2xl border transition-all cursor-pointer shadow-sm hover:shadow-md ${
                proj.status === 'Active' 
                  ? 'bg-[var(--card)] border-[var(--border)] hover:border-[var(--muted-foreground)]/40' 
                  : 'bg-[var(--background)] border-dashed border-[var(--border)] opacity-80'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold tracking-widest uppercase text-[var(--muted-foreground)]">
                  {proj.area}
                </span>
                <Target className="w-4 h-4 text-[var(--muted-foreground)] opacity-50 stroke-[1.5]" />
              </div>

              <h3 className="text-lg font-semibold text-[var(--foreground)] leading-tight mb-2 group-hover:text-[var(--accent)] transition-colors">
                {proj.title}
              </h3>
              
              <p className="text-xs text-[var(--muted-foreground)] mb-6 flex-1">
                {proj.meta}
              </p>

              <div className="mt-auto">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-medium text-[var(--foreground)] uppercase">{proj.status}</span>
                  <span className="text-[10px] font-mono text-[var(--muted-foreground)]">{proj.progress}%</span>
                </div>
                <div className="w-full h-1 bg-[var(--accent-soft)] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[var(--foreground)] transition-all duration-700" 
                    style={{ width: `${proj.progress}%` }} 
                  />
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
