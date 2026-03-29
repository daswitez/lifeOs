"use client";

import { useEffect, useState, useTransition, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CreateEntityModalProps = {
  title: string;
  description: string;
  triggerLabel: string;
  submitLabel: string;
  pendingLabel: string;
  action: (formData: FormData) => Promise<void>;
  children: ReactNode;
  className?: string;
};

export function CreateEntityModal({
  title,
  description,
  triggerLabel,
  submitLabel,
  pendingLabel,
  action,
  children,
  className,
}: CreateEntityModalProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

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
        setError(submitError instanceof Error ? submitError.message : "Could not save");
      }
    });
  };

  return (
    <>
      <Button className="rounded-full px-5" onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        {triggerLabel}
      </Button>

      {open && typeof document !== "undefined" && createPortal(
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
                "panel-surface my-auto flex w-full max-w-3xl flex-col overflow-hidden rounded-[32px] p-6 max-h-[calc(100dvh-2rem)] sm:p-8 sm:max-h-[calc(100dvh-3rem)]",
                className
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">Create</p>
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

                <div className="soft-rule mt-6 flex flex-col gap-3 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Keeps the canvas clean and leaves the main context visible until you decide to create.
                  </p>
                  <div className="flex gap-3">
                    <Button type="button" variant="outline" className="rounded-full px-5" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="rounded-full px-5" disabled={isPending}>
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
