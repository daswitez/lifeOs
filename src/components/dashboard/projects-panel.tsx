import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ProjectsPanel() {
  const mockProjects = [
    { id: 1, title: "Launch LifeOS v1", area: "Personal", progress: 65 },
    { id: 2, title: "Move to Madrid", area: "Life", progress: 20 },
    { id: 3, title: "AWS Solutions Architect", area: "Learning", progress: 90 },
  ];

  return (
    <Card className="flex flex-col h-full bg-[var(--background)]">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-sm uppercase tracking-widest text-[var(--muted-foreground)] flex items-center gap-2">
          Projects Radar
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-5">
        {mockProjects.map((project) => (
          <div key={project.id} className="flex flex-col gap-1.5">
            <div className="flex justify-between items-end">
              <span className="text-sm font-bold text-[var(--foreground)] truncate pr-2">
                {project.title}
              </span>
              <span className="text-[10px] text-[var(--muted-foreground)] font-mono tabular-nums">
                {project.progress}%
              </span>
            </div>
            
            <div className="w-full h-[3px] bg-[var(--accent-soft)] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[var(--accent)] rounded-full transition-all duration-700 ease-out" 
                style={{ width: `${project.progress}%` }} 
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
