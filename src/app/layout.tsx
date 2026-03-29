import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import "./globals.css";

// Fuente Sans Serif para Cockpit (Alta legibilidad UI)
const fontSans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

// Fuente Serif Secundaria para Zettelkasten y Lectura Profunda (Vibe Editorial)
const fontSerif = Lora({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "LifeOS | Personal Cockpit",
  description: "Sistema Nervioso Central para Acción y Conocimiento",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      // El antialiased es mandatorio para "limpiar borde" de fuentes
      className={`${fontSans.variable} ${fontSerif.variable} antialiased h-full`}
    >
      {/* 
        El body es la pantalla principal. Flex row asume un layout maestro
        tipo "Sidebar Ocultable + Canvas Central".
      */}
      <body className="min-h-full flex overflow-hidden bg-[var(--background)] text-[var(--foreground)] w-full">
        {/* Placeholder para barra lateral persistente - Se separará a cliente / RSC futuro */}
        
        {/* Lienzo Principal con padding muy generoso para "el aire cognitivo" */}
        <main className="flex-1 w-full relative overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
