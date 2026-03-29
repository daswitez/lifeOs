"use client";

import { useEffect, useState, useTransition, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Settings2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EditEntityModalProps = {
  title: string;
  description: string;
  submitLabel: string;
  pendingLabel: string;
  action: (formData: FormData) => Promise<void>;
  children: ReactNode;
  className?: string;
  triggerIcon?: ReactNode;
  triggerLabel?: string;
  triggerTitle?: string;
  alwaysVisible?: boolean;
  triggerClassName?: string;
};

export function EditEntityModal({
  title,
  description,
  submitLabel,
  pendingLabel,
  action,
  children,
  className,
  triggerIcon = <Settings2 className="h-4 w-4" />,
  triggerLabel,
  triggerTitle = "Edit settings",
  alwaysVisible = false,
  triggerClassName,
}: EditEntityModalProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      try {
        await action(formData);
        setOpen(false);
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "Failed to save");
      }
    });
  };

  return (
    <>
      {mounted ? (
        <button
          type="button"
          title={triggerTitle}
          className={cn(
            "transition-colors",
            triggerLabel
              ? "inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--muted-foreground)] hover:border-[var(--foreground)] hover:text-[var(--foreground)]"
              : "h-6 w-6 rounded-full border border-[var(--border)] bg-transparent flex items-center justify-center text-[var(--muted-foreground)] hover:border-[var(--foreground)] hover:text-[var(--foreground)]",
            !triggerLabel && !alwaysVisible && "opacity-0 group-hover:opacity-100",
            !triggerLabel && alwaysVisible && "opacity-100",
            triggerClassName
          )}
          onClick={() => setOpen(true)}
        >
          {triggerIcon}
          {triggerLabel ? <span>{triggerLabel}</span> : null}
        </button>
      ) : triggerLabel ? (
        <span className={cn("inline-block h-8 min-w-[5.5rem]", triggerClassName)} aria-hidden="true" />
      ) : (
        <span className={cn("inline-block h-6 w-6", triggerClassName)} aria-hidden="true" />
      )}

      {open && mounted && createPortal(
        <div className="fixed inset-0 z-[100] overflow-y-auto px-4 py-4 sm:py-6">
          <button
            type="button"
            aria-label="Close modal"
            className="absolute inset-0 bg-[color:color-mix(in_srgb,var(--foreground)_28%,transparent)] backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          <div className="relative z-10 flex min-h-full items-start justify-center">
            <div
              className={cn(
                "panel-surface my-auto flex w-full max-w-3xl flex-col overflow-hidden rounded-[32px] p-6 text-left max-h-[calc(100dvh-2rem)] sm:p-8 sm:max-h-[calc(100dvh-3rem)]",
                className
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">Settings</p>
                  <h2 className="mt-3 text-3xl font-semibold text-[var(--foreground)]">{title}</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--muted-foreground)]">
                    {description}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-[var(--border)] p-2 text-[var(--muted-foreground)] transition-colors hover:bg-[var(--accent-soft)] hover:text-[var(--foreground)]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form action={handleSubmit} className="mt-8 flex min-h-0 flex-1 flex-col">
                <div className="min-h-0 flex-1 space-y-5 overflow-y-auto pr-1">
                  {children}

                  {error && (
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-sm text-red-600">
                      {error}
                    </div>
                  )}
                </div>

                <div className="soft-rule mt-6 flex flex-col gap-3 pt-5 sm:flex-row sm:items-center sm:justify-end">
                  <div className="flex gap-3">
                    <Button type="button" variant="outline" className="rounded-full px-5" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="rounded-full px-5 text-[var(--background)] bg-[var(--foreground)] hover:bg-[var(--foreground)]/90" disabled={isPending}>
                      {isPending ? pendingLabel : submitLabel}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
