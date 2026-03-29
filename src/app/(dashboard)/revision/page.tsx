import { Activity, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RevisionPage() {
  return (
    <div className="min-h-full flex flex-col">
      {/* Absolute stark minimalism for review mode. No noise. */}
      
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-2xl mx-auto">
        
        <div className="w-16 h-16 bg-[var(--accent-soft)] rounded-full flex items-center justify-center mb-8 shadow-inner">
          <Sparkles className="w-8 h-8 text-[var(--foreground)]" />
        </div>

        <h1 className="text-3xl md:text-4xl font-serif text-[var(--foreground)] mb-4 tracking-tight">
          Pausa y Calibración
        </h1>
        
        <p className="text-lg text-[var(--muted-foreground)] mb-12 font-sans leading-relaxed">
          Es el momento de vaciar tu mente, revisar tus buzones de entrada incompletos, capturar aprendizajes de la semana, y alinear tu próximo enfoque. Cero distracciones.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
           <Button size="lg" className="px-8 text-base">
             Iniciar Revisión Semanal
           </Button>
           <Button variant="outline" size="lg" className="px-8 text-base">
             Ver Historial
           </Button>
        </div>

      </div>

      {/* Mini statusBar at the bottom for aesthetic data */}
      <footer className="w-full border-t border-[var(--border)] p-4 flex justify-between items-center text-xs font-mono text-[var(--muted-foreground)] bg-[var(--background)]">
        <div className="flex items-center gap-2">
          <Activity className="w-3 h-3 text-green-500/80" />
          <span>Última revisión: Hace 6 días</span>
        </div>
        <span>Sistema Limpio: 92%</span>
      </footer>

    </div>
  );
}
