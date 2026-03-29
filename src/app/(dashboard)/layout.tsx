import { Sidebar } from "@/components/layout/sidebar";
import { CaptureModal } from "@/components/forms/capture-modal";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Reemplaza el flex del layout raíz con esta estructura de 2 columnas donde Sidebar tiene ancho fijo
    <div className="flex h-screen w-full overflow-hidden bg-[var(--background)]">
      {/* Sidebar - Ocultable en móbiles y visible en md+ */}
      <Sidebar />

      {/* Main Canvas - Ocupa todo el espacio restante con scroll independiente */}
      <main className="flex-1 relative overflow-y-auto">
        <div className="mx-auto max-w-6xl w-full h-full">
          {children}
        </div>
        
        {/* Componente Global Oculto que se activa con atajos o botones */}
        <CaptureModal />
      </main>
    </div>
  );
}
