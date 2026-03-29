import { Sidebar } from "@/components/layout/sidebar";
import { CaptureModal } from "@/components/forms/capture-modal";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />

      <main className="relative flex-1 overflow-y-auto">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-x-0 top-0 h-64 bg-[var(--glow)]" />
          <div className="absolute left-[10%] top-20 h-40 w-40 rounded-full bg-[color:color-mix(in_srgb,var(--accent)_10%,transparent)] blur-3xl" />
          <div className="absolute bottom-24 right-[12%] h-48 w-48 rounded-full bg-[color:color-mix(in_srgb,var(--foreground)_6%,transparent)] blur-3xl" />
        </div>

        <div className="glass-header sticky top-0 z-30 flex items-center justify-between px-5 py-3 md:hidden">
          <div>
            <p className="eyebrow">LifeOS</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">Capture to clarity</p>
          </div>
          <div className="kicker-pill">Ctrl/Cmd + K</div>
        </div>

        <div className="relative mx-auto min-h-full w-full max-w-[1180px] pb-28 md:pb-10">
          {children}
        </div>

        <CaptureModal />
      </main>
    </div>
  );
}
