import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import "./globals.css";

// Primary sans-serif for the cockpit UI (high legibility)
const fontSans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

// Secondary serif for Zettelkasten and deep-reading contexts (editorial vibe)
const fontSerif = Lora({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "LifeOS | Personal Cockpit",
  description: "Central nervous system for action and knowledge",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fontSans.variable} ${fontSerif.variable} antialiased h-full`}
    >
      {/*
        The body is the main viewport. Flex row assumes a master layout
        of "Collapsible Sidebar + Central Canvas".
      */}
      <body className="min-h-full flex overflow-hidden bg-[var(--background)] text-[var(--foreground)] w-full">
        {/* Main canvas with generous padding for "cognitive air" */}
        <main className="flex-1 w-full relative overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
