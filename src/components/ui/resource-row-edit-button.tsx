"use client";

import { useSyncExternalStore } from "react";
import { EditResourceModal } from "@/components/forms/edit-resource-modal";

type ResourceRowEditButtonProps = {
  resource: {
    id: string;
    title: string;
    description: string | null;
    type: string;
    storageMode: string;
    location: string | null;
    isArchived?: boolean;
    linkedProjects?: { id: string; title: string; subtitle?: string | null }[];
    linkedTasks?: { id: string; title: string; subtitle?: string | null }[];
    linkedNotes?: { id: string; title: string; subtitle?: string | null }[];
    linkedDecisions?: { id: string; title: string; subtitle?: string | null }[];
  };
  relationOptions: {
    projects: { id: string; title: string; subtitle?: string | null }[];
    tasks: { id: string; title: string; subtitle?: string | null }[];
    notes: { id: string; title: string; subtitle?: string | null }[];
    decisions: { id: string; title: string; subtitle?: string | null }[];
  };
};

export function ResourceRowEditButton({ resource, relationOptions }: ResourceRowEditButtonProps) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (!mounted) {
    return <span className="inline-block h-8 min-w-[5.5rem]" aria-hidden="true" />;
  }

  return (
    <EditResourceModal
      resource={resource}
      relationOptions={relationOptions}
      linkedEntities={{
        projects: resource.linkedProjects ?? [],
        tasks: resource.linkedTasks ?? [],
        notes: resource.linkedNotes ?? [],
        decisions: resource.linkedDecisions ?? [],
      }}
      triggerLabel="Edit"
      alwaysVisible
      triggerClassName="h-8 px-3 py-0 text-[11px] tracking-[0.08em] uppercase"
    />
  );
}
