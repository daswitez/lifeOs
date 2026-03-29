"use client";

import { ArchiveX, CheckCircle2, Settings2 } from "lucide-react";
import Link from "next/link";
import { useTransition } from "react";
import { processInboxItemAction } from "@/server/actions/lifeos";
import { cn } from "@/lib/utils";

type InboxProcessorProps = {
  item: {
    id: string;
    title: string;
    kind: "task" | "note" | "resource" | "decision";
    createdAt: string;
    detail: string;
    href: string;
  };
  kindCopy: string;
  dateStr: string;
};

export function InboxProcessorForm({ item, kindCopy, dateStr }: InboxProcessorProps) {
  const [isPending, startTransition] = useTransition();

  const handleProcess = (actionType: "activate" | "archive") => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("id", item.id);
      formData.append("kind", item.kind);
      formData.append("actionType", actionType);
      await processInboxItemAction(formData);
    });
  };

  return (
    <div className={cn(
      "panel-quiet group relative flex flex-col gap-3 rounded-[26px] p-4 sm:flex-row sm:items-center sm:justify-between transition-all hover:border-[var(--foreground)]/15",
      isPending && "opacity-50 pointer-events-none"
    )}>
      <Link href={item.href} className="flex-1 min-w-0 pr-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="kicker-pill">{item.kind}</span>
          <span className="text-xs text-[var(--muted-foreground)]">{kindCopy}</span>
        </div>
        <p className="mt-3 text-base font-semibold text-[var(--foreground)] hover:underline">{item.title}</p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">{item.detail}</p>
      </Link>
      
      <div className="flex items-center justify-between sm:justify-end gap-2 text-sm text-[var(--muted-foreground)] border-t border-[var(--border)] sm:border-0 pt-3 sm:pt-0 mt-2 sm:mt-0">
        <span className="font-mono sm:hidden block">{dateStr}</span>
        
        <div className="flex flex-wrap items-center gap-2 sm:opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
          {['task', 'note'].includes(item.kind) && (
            <button
              onClick={() => handleProcess("activate")}
              disabled={isPending}
              className="flex items-center gap-1.5 rounded-full bg-[var(--foreground)] px-3 py-1.5 text-xs font-medium text-[var(--background)] shadow-sm transition-transform hover:scale-105 disabled:opacity-50"
              title="Activate / Move to Todo"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">Activate</span>
            </button>
          )}

          <button
            onClick={() => handleProcess("archive")}
            disabled={isPending}
            className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-xs font-medium text-[var(--muted-foreground)] transition-colors hover:border-[var(--foreground)] hover:text-[var(--foreground)] disabled:opacity-50"
            title="Archive"
          >
            <ArchiveX className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">Archive</span>
          </button>
          
          <Link 
            href={item.href} 
            className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--background)] p-1.5 text-[var(--muted-foreground)] transition-colors hover:border-[var(--foreground)] hover:text-[var(--foreground)]"
            title="Open Details"
          >
            <Settings2 className="h-3.5 w-3.5" />
          </Link>
        </div>
        
        <span className="font-mono hidden sm:block ml-2">{dateStr}</span>
      </div>
    </div>
  );
}
