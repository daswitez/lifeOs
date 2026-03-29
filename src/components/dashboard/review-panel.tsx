import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart } from "lucide-react";

/**
 * Review Panel
 * Acceso directo al "Weekly Review". Diseño desaturado y tranquilo.
 */
export function ReviewPanel() {
  return (
    <Card className="flex flex-col h-full justify-between bg-gradient-to-br from-[var(--background)] to-[var(--accent-soft)]">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart className="w-5 h-5" />
          Trazabilidad
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
          Tus estadísticas de energía, progreso en áreas y decisiones recientes están listas para revisión.
        </p>
        <Button variant="secondary" className="w-full mt-2 justify-center font-serif italic tracking-wide">
          Iniciar Revisión Semanal
        </Button>
      </CardContent>
    </Card>
  );
}
