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
      <button
        type="button"
        title="Edit settings"
        className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 rounded-full border border-[var(--border)] bg-transparent flex items-center justify-center text-[var(--muted-foreground)] hover:border-[var(--foreground)] hover:text-[var(--foreground)]"
        onClick={() => setOpen(true)}
      >
        {triggerIcon}
      </button>

      {open && mounted && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6">
          <button
            type="button"
            aria-label="Close modal"
            className="absolute inset-0 bg-[color:color-mix(in_srgb,var(--foreground)_28%,transparent)] backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          <div className={cn("panel-surface relative z-10 w-full max-w-3xl rounded-[32px] p-6 sm:p-8 text-left", className)}>
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

            <form action={handleSubmit} className="mt-8">
              <div className="space-y-5">{children}</div>

              {error && (
                <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="soft-rule mt-8 flex flex-col gap-3 pt-5 sm:flex-row sm:items-center sm:justify-end">
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
        </div>,
        document.body
      )}
    </>
  );
}
