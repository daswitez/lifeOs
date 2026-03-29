"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart,
  CheckSquare,
  Compass,
  Database,
  FolderKanban,
  Inbox,
  LayoutDashboard,
  Library,
  Search,
  Layers,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavLink = {
  icon: LucideIcon;
  label: string;
  href: string;
  count?: number;
};

type NavItem = NavLink | { divider: true };

const NAV_ITEMS: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Inbox, label: "Inbox", href: "/inbox" },
  { icon: CheckSquare, label: "Actions", href: "/actions" },
  { icon: Layers, label: "Areas", href: "/areas" },
  { icon: FolderKanban, label: "Projects", href: "/projects" },
  { icon: Compass, label: "Decisions", href: "/decisions" },
  { divider: true },
  { icon: Library, label: "Knowledge", href: "/knowledge" },
  { icon: Database, label: "Vault", href: "/resources" },
  { divider: true },
  { icon: BarChart, label: "Review", href: "/review" },
];

const MOBILE_ITEMS: NavLink[] = [
  { icon: LayoutDashboard, label: "Home", href: "/" },
  { icon: Inbox, label: "Inbox", href: "/inbox" },
  { icon: CheckSquare, label: "Actions", href: "/actions" },
  { icon: Layers, label: "Areas", href: "/areas" },
  { icon: FolderKanban, label: "Projects", href: "/projects" },
  { icon: Search, label: "Know", href: "/knowledge" },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarNav({ inboxCount }: { inboxCount: number }) {
  const pathname = usePathname();
  const items = NAV_ITEMS.map((item) =>
    "href" in item && item.href === "/inbox"
      ? { ...item, count: inboxCount }
      : item
  );

  return (
    <>
      <aside className="hidden h-full w-72 shrink-0 border-r border-[var(--border)] bg-[color:color-mix(in_srgb,var(--surface-strong)_88%,transparent)] px-4 pb-6 pt-8 backdrop-blur-xl md:flex md:flex-col">
        <div className="mb-10 px-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow">LifeOS</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                Command Center
              </h1>
            </div>
            <div className="h-2.5 w-2.5 rounded-full bg-[var(--accent)] shadow-[0_0_20px_rgba(28,63,54,0.45)]" />
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1.5">
          {items.map((item, idx) => {
            if ("divider" in item) {
              return <div key={`divider-${idx}`} className="my-3 h-px bg-[color:color-mix(in_srgb,var(--border)_70%,transparent)]" />;
            }

            const active = isActivePath(pathname, item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group flex items-center justify-between rounded-2xl px-3 py-3 text-sm transition-all",
                  active
                    ? "bg-[var(--foreground)] text-[var(--background)] shadow-[var(--shadow-card)]"
                    : "text-[var(--muted-foreground)] hover:bg-[var(--accent-soft)]/70 hover:text-[var(--foreground)]"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "h-4 w-4",
                      active
                        ? "text-[var(--background)]"
                        : "text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]"
                    )}
                  />
                  <span className="font-medium">{item.label}</span>
                </div>
                {typeof item.count === "number" && item.count > 0 && (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-bold",
                      active
                        ? "bg-[color:color-mix(in_srgb,var(--background)_18%,transparent)] text-[var(--background)]"
                        : "bg-[var(--foreground)] text-[var(--background)]"
                    )}
                  >
                    {item.count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>


      </aside>

      <nav className="fixed inset-x-3 bottom-3 z-40 rounded-[28px] border border-[var(--border)] bg-[color:color-mix(in_srgb,var(--surface-strong)_88%,transparent)] p-2 shadow-[var(--shadow-soft)] backdrop-blur-xl md:hidden">
        <div className="grid grid-cols-5 gap-1">
          {MOBILE_ITEMS.map((item) => {
            const active = isActivePath(pathname, item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-[60px] flex-col items-center justify-center rounded-2xl px-1 text-[10px] font-medium transition-all",
                  active
                    ? "bg-[var(--foreground)] text-[var(--background)]"
                    : "text-[var(--muted-foreground)]"
                )}
              >
                <Icon className="mb-1 h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
