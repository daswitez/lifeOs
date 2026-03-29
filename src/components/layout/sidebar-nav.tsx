"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart,
  CheckSquare,
  CircleUserRound,
  Compass,
  Database,
  FolderKanban,
  Inbox,
  LayoutDashboard,
  Library,
  LogOut,
  Search,
  Settings,
  Layers,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/server/actions/lifeos";

type NavLink = {
  icon: LucideIcon;
  label: string;
  href: string;
  count?: number;
};

type NavItem = NavLink | { divider: true };

const NAV_ITEMS: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Search, label: "Search", href: "/search" },
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
  { icon: Settings, label: "Profile", href: "/profile" },
];

const MOBILE_ITEMS: NavLink[] = [
  { icon: LayoutDashboard, label: "Home", href: "/" },
  { icon: Search, label: "Search", href: "/search" },
  { icon: Inbox, label: "Inbox", href: "/inbox" },
  { icon: CheckSquare, label: "Actions", href: "/actions" },
  { icon: Layers, label: "Areas", href: "/areas" },
  { icon: FolderKanban, label: "Projects", href: "/projects" },
  { icon: CircleUserRound, label: "Profile", href: "/profile" },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarNav({
  inboxCount,
  profile,
}: {
  inboxCount: number;
  profile: {
    fullName: string | null;
    username: string | null;
    email: string | null;
  };
}) {
  const pathname = usePathname();
  const items = NAV_ITEMS.map((item) =>
    "href" in item && item.href === "/inbox"
      ? { ...item, count: inboxCount }
      : item
  );

  return (
    <>
      <aside className="hidden h-full min-h-0 w-72 shrink-0 border-r border-[color:color-mix(in_srgb,var(--border)_70%,transparent)] bg-[color:color-mix(in_srgb,var(--surface-strong)_88%,transparent)] px-4 pb-6 pt-8 backdrop-blur-xl md:flex md:flex-col">
        <div className="mb-10 shrink-0 px-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow">LifeOS</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                Command Center
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2.5 w-2.5 rounded-full bg-[var(--accent-primary)] shadow-[0_0_16px_color-mix(in_srgb,var(--accent-primary)_40%,transparent)] anim-pulse-soft" />
              <Link
                href="/profile"
                aria-label="Open profile"
                className={cn(
                  "inline-flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-200",
                  isActivePath(pathname, "/profile")
                    ? "border-[var(--accent-primary)] bg-[var(--accent-primary)] text-[var(--accent-primary-foreground)] shadow-[var(--shadow-card)]"
                    : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--accent-primary)] hover:text-[var(--foreground)]"
                )}
              >
                <CircleUserRound className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto pr-1">
          <div className="flex flex-col gap-1">
          {items.map((item, idx) => {
            if ("divider" in item) {
              return <div key={`divider-${idx}`} className="my-3 h-px bg-[color:color-mix(in_srgb,var(--border)_60%,transparent)]" />;
            }

            const active = isActivePath(pathname, item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative flex items-center justify-between rounded-2xl px-3 py-2.5 text-sm transition-all duration-200",
                  active
                    ? "bg-[var(--foreground)] text-[var(--background)] shadow-[var(--shadow-card)]"
                    : "text-[var(--muted-foreground)] hover:bg-[var(--accent-soft)]/70 hover:text-[var(--foreground)]"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "h-4 w-4 transition-colors",
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
                        : "bg-[var(--accent-primary)] text-[var(--accent-primary-foreground)]"
                    )}
                  >
                    {item.count}
                  </span>
                )}
              </Link>
            );
          })}
          </div>
        </nav>

        <div className="mt-6 shrink-0 rounded-[24px] border border-[color:color-mix(in_srgb,var(--border)_70%,transparent)] bg-[var(--accent-soft)]/20 p-4">
          <p className="text-sm font-medium text-[var(--foreground)]">
            {profile.fullName || profile.username || "Your space"}
          </p>
          <p className="mt-1 truncate text-xs text-[var(--muted-foreground)]">
            {profile.email || "No email visible"}
          </p>

          <div className="mt-4 flex gap-2">
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-2 text-xs font-medium text-[var(--muted-foreground)] transition-colors hover:border-[var(--foreground)] hover:text-[var(--foreground)]"
            >
              <Settings className="h-3.5 w-3.5" />
              Profile
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-2 text-xs font-medium text-[var(--muted-foreground)] transition-colors hover:border-[var(--foreground)] hover:text-[var(--foreground)]"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
            </form>
          </div>
        </div>

      </aside>

      <nav className="fixed inset-x-3 bottom-3 z-40 rounded-[28px] border border-[var(--border)] bg-[color:color-mix(in_srgb,var(--surface-strong)_88%,transparent)] p-2 shadow-[var(--shadow-soft)] backdrop-blur-xl md:hidden">
        <div className="grid grid-cols-6 gap-1">
          {MOBILE_ITEMS.map((item) => {
            const active = isActivePath(pathname, item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-[60px] flex-col items-center justify-center rounded-2xl px-1 text-[10px] font-medium transition-all duration-200",
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
