"use client";

import { useMemo, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { Link2, Trash2, X } from "lucide-react";
import { linkResourceToEntityAction, unlinkResourceFromEntityAction } from "@/server/actions/lifeos";
import { Button } from "@/components/ui/button";
import { RESOURCE_TYPE_LABELS, type ResourceType } from "@/lib/domain";

type ResourceOption = {
  id: string;
  title: string;
  type: ResourceType;
};

type LinkedResource = {
  id: string;
  title: string;
  type: ResourceType;
  location: string | null;
};

type ManageResourceLinksModalProps = {
  entityType: "project" | "task" | "note" | "decision";
  entityId: string;
  entityTitle: string;
  linkedResources: LinkedResource[];
  resourceOptions: ResourceOption[];
  triggerLabel?: string;
  compact?: boolean;
};

export function ManageResourceLinksModal({
  entityType,
  entityId,
  entityTitle,
  linkedResources,
  resourceOptions,
  triggerLabel = "Resources",
  compact = false,
}: ManageResourceLinksModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedResourceId, setSelectedResourceId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const availableResources = useMemo(
    () => resourceOptions.filter((resource) => !linkedResources.some((linked) => linked.id === resource.id)),
    [linkedResources, resourceOptions]
  );

  const attachResource = () => {
    if (!selectedResourceId) return;

    startTransition(async () => {
      setError(null);
      try {
        const formData = new FormData();
        formData.append("entity_type", entityType);
        formData.append("entity_id", entityId);
        formData.append("resource_id", selectedResourceId);
        await linkResourceToEntityAction(formData);
        setSelectedResourceId("");
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "Could not link resource.");
      }
    });
  };

  const removeResource = (resourceId: string) => {
    startTransition(async () => {
      setError(null);
      try {
        const formData = new FormData();
        formData.append("entity_type", entityType);
        formData.append("entity_id", entityId);
        formData.append("resource_id", resourceId);
        await unlinkResourceFromEntityAction(formData);
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "Could not unlink resource.");
      }
    });
  };

  return (
    <>
      <Button
        type="button"
        variant={compact ? "outline" : "secondary"}
        size={compact ? "sm" : "default"}
        className={compact ? "rounded-full" : "rounded-full px-5"}
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
      >
        <Link2 className="mr-2 h-4 w-4" />
        {triggerLabel}
      </Button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6">
            <button
              type="button"
              aria-label="Close resource links modal"
              className="absolute inset-0 bg-[color:color-mix(in_srgb,var(--foreground)_28%,transparent)] backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            <div className="panel-surface relative z-10 max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[32px] p-6 text-left sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">Connected resources</p>
                  <h2 className="mt-3 text-3xl font-semibold text-[var(--foreground)]">{entityTitle}</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--muted-foreground)]">
                    Attach references that support this item so the context stays close to the work.
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

              <div className="mt-8 grid gap-3 md:grid-cols-[1fr_auto]">
                <select
                  value={selectedResourceId}
                  onChange={(event) => setSelectedResourceId(event.target.value)}
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-3 py-4 text-sm text-[var(--foreground)] outline-none"
                >
                  <option value="">Select a resource to attach</option>
                  {availableResources.map((resource) => (
                    <option key={resource.id} value={resource.id}>
                      {resource.title} · {RESOURCE_TYPE_LABELS[resource.type]}
                    </option>
                  ))}
                </select>
                <Button type="button" className="rounded-full px-5" onClick={attachResource} disabled={!selectedResourceId || isPending}>
                  {isPending ? "Saving..." : "Attach"}
                </Button>
              </div>

              {error && (
                <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="mt-8 space-y-3">
                {linkedResources.length === 0 && (
                  <div className="panel-quiet rounded-2xl p-5 text-sm text-[var(--muted-foreground)]">
                    No linked resources yet.
                  </div>
                )}

                {linkedResources.map((resource) => (
                  <div key={resource.id} className="panel-quiet flex items-center justify-between gap-3 rounded-2xl p-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[var(--foreground)]">{resource.title}</p>
                      <p className="mt-1 truncate text-xs text-[var(--muted-foreground)]">
                        {RESOURCE_TYPE_LABELS[resource.type]}
                        {resource.location ? ` · ${resource.location}` : ""}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="rounded-full"
                      onClick={() => removeResource(resource.id)}
                      disabled={isPending}
                    >
                      <Trash2 className="mr-1 h-3.5 w-3.5" />
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
