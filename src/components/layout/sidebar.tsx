import Link from "next/link";
import { 
  Inbox, 
  LayoutDashboard, 
  CheckSquare, 
  FolderKanban, 
  Compass,
  Database,
  Library, 
  BarChart, 
  Settings 
} from "lucide-react";

/**
 * Global Sidebar Navigation (Aligned to Full Database Schema)
 */
const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Inbox, label: "Inbox", href: "/inbox", count: 3 },
  { icon: CheckSquare, label: "Actions", href: "/actions" },
  { icon: FolderKanban, label: "Projects", href: "/projects" },
  { icon: Compass, label: "Decisions", href: "/decisions" }, // <-- New
  { divider: true },
  { icon: Library, label: "Zettelkasten", href: "/knowledge" },
  { icon: Database, label: "Vault", href: "/resources" }, // <-- New
  { divider: true },
  { icon: BarChart, label: "Weekly Review", href: "/review" },
];

export function Sidebar() {
  return (
    <aside className="w-64 h-full border-r border-[var(--border)] bg-[var(--background)] flex flex-col pt-8 pb-6 px-4 hidden md:flex shrink-0">
      
      {/* Brand */}
      <div className="mb-10 px-2 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--foreground)]">LifeOS</h1>
          <p className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-widest mt-1">
            Cockpit Mode
          </p>
        </div>
        <div className="w-2 h-2 rounded-full bg-green-500/80 shadow-[0_0_8px_rgba(34,197,94,0.4)]" title="System Online"></div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1">
        {NAV_ITEMS.map((item, idx) => {
          if (item.divider) {
            return <div key={`div-${idx}`} className="w-full h-px bg-[var(--border)]/50 my-3" />;
          }

          return (
            <Link
              key={item.href}
              href={item.href!}
              className="group flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent-soft)] transition-colors"
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4 text-[var(--muted-foreground)] opacity-70 group-hover:opacity-100 group-hover:text-[var(--foreground)] transition-all" />
                {item.label}
              </div>
              {item.count && (
                <span className="bg-[var(--foreground)] text-[var(--background)] text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {item.count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Settings */}
      <div className="pt-4 border-t border-[var(--border)] mt-auto space-y-1">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent-soft)] transition-colors"
        >
          <Settings className="w-4 h-4 opacity-70" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
