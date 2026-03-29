"use client";

import { useMemo, useState, useTransition } from "react";
import {
  RESOURCE_TYPES,
  RESOURCE_TYPE_LABELS,
  STORAGE_MODES,
  STORAGE_MODE_LABELS,
} from "@/lib/domain";
import { linkResourceToEntityAction, unlinkResourceFromEntityAction, updateResourceAction } from "@/server/actions/lifeos";
import { Button } from "@/components/ui/button";
import { EditEntityModal } from "./edit-entity-modal";

type LinkedEntity = {
  id: string;
  title: string;
  subtitle?: string | null;
};

type EditResourceModalProps = {
  resource: {
    id: string;
    title: string;
    description: string | null;
    type: string;
    storageMode: string;
    location: string | null;
    isArchived?: boolean;
  };
  relationOptions?: {
    projects: LinkedEntity[];
    tasks: LinkedEntity[];
    notes: LinkedEntity[];
    decisions: LinkedEntity[];
  };
  linkedEntities?: {
    projects: LinkedEntity[];
    tasks: LinkedEntity[];
    notes: LinkedEntity[];
    decisions: LinkedEntity[];
  };
  triggerLabel?: string;
  alwaysVisible?: boolean;
  triggerClassName?: string;
};

type LinkSectionProps = {
  label: string;
  entityType: "project" | "task" | "note" | "decision";
  resourceId: string;
  options: LinkedEntity[];
  linked: LinkedEntity[];
  isPending: boolean;
  onAttach: (entityType: "project" | "task" | "note" | "decision", entityId: string) => void;
  onRemove: (entityType: "project" | "task" | "note" | "decision", entityId: string) => void;
};

function LinkSection({ label, entityType, resourceId, options, linked, isPending, onAttach, onRemove }: LinkSectionProps) {
  const [selectedId, setSelectedId] = useState("");
  const availableOptions = useMemo(
    () => options.filter((option) => !linked.some((linkedEntity) => linkedEntity.id === option.id)),
    [linked, options]
  );

  return (
    <div className="rounded-[24px] border border-[var(--border)] bg-[var(--muted)]/20 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="eyebrow">{label}</p>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Conecta este recurso con {label.toLowerCase()} para no perder contexto.
          </p>
        </div>
        <span className="rounded-full border border-[var(--border)] px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
          {linked.length}
        </span>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
        <select
          value={selectedId}
          onChange={(event) => setSelectedId(event.target.value)}
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-3 py-4 text-sm text-[var(--foreground)] outline-none"
        >
          <option value="">Selecciona un item para vincular</option>
          {availableOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.title}
              {option.subtitle ? ` · ${option.subtitle}` : ""}
            </option>
          ))}
        </select>
        <Button
          type="button"
          className="rounded-full px-5"
          disabled={!selectedId || isPending}
          onClick={() => {
            onAttach(entityType, selectedId);
            setSelectedId("");
          }}
        >
          {isPending ? "Guardando..." : "Vincular"}
        </Button>
      </div>

      <div className="mt-4 space-y-2">
        {linked.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">Todavia no hay relaciones.</p>
        ) : (
          linked.map((entity) => (
            <div key={`${resourceId}-${entityType}-${entity.id}`} className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[var(--foreground)]">{entity.title}</p>
                {entity.subtitle ? (
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--muted-foreground)]">{entity.subtitle}</p>
                ) : null}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="rounded-full"
                disabled={isPending}
                onClick={() => onRemove(entityType, entity.id)}
              >
                Quitar
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function EditResourceModal({
  resource,
  relationOptions,
  linkedEntities,
  triggerLabel,
  alwaysVisible,
  triggerClassName,
}: EditResourceModalProps) {
  const [linkError, setLinkError] = useState<string | null>(null);
  const [isLinkPending, startLinkTransition] = useTransition();

  const attachLink = (entityType: "project" | "task" | "note" | "decision", entityId: string) => {
    startLinkTransition(async () => {
      setLinkError(null);

      try {
        const formData = new FormData();
        formData.append("entity_type", entityType);
        formData.append("entity_id", entityId);
        formData.append("resource_id", resource.id);
        await linkResourceToEntityAction(formData);
      } catch (submitError) {
        setLinkError(submitError instanceof Error ? submitError.message : "No se pudo vincular.");
      }
    });
  };

  const removeLink = (entityType: "project" | "task" | "note" | "decision", entityId: string) => {
    startLinkTransition(async () => {
      setLinkError(null);

      try {
        const formData = new FormData();
        formData.append("entity_type", entityType);
        formData.append("entity_id", entityId);
        formData.append("resource_id", resource.id);
        await unlinkResourceFromEntityAction(formData);
      } catch (submitError) {
        setLinkError(submitError instanceof Error ? submitError.message : "No se pudo quitar el vinculo.");
      }
    });
  };

  return (
    <EditEntityModal
      title="Edit resource"
      description="Complete the metadata so this reference stays understandable over time."
      submitLabel="Save changes"
      pendingLabel="Saving..."
      action={updateResourceAction}
      className="md:min-w-[560px]"
      triggerLabel={triggerLabel}
      triggerTitle="Editar recurso"
      alwaysVisible={alwaysVisible}
      triggerClassName={triggerClassName}
    >
      <input type="hidden" name="id" value={resource.id} />
      <input type="hidden" name="is_archived" value={resource.isArchived ? "true" : "false"} />

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block md:col-span-2">
          <span className="eyebrow">Title</span>
          <input
            name="title"
            required
            defaultValue={resource.title}
            className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)] outline-none"
          />
        </label>

        <label className="block">
          <span className="eyebrow">Storage</span>
          <select
            name="storage_mode"
            defaultValue={resource.storageMode}
            className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-3 py-4 text-sm text-[var(--foreground)] outline-none"
          >
            {STORAGE_MODES.map((mode) => (
              <option key={mode} value={mode}>
                {STORAGE_MODE_LABELS[mode]}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="eyebrow">Type</span>
          <select
            name="type"
            defaultValue={resource.type}
            className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-3 py-4 text-sm text-[var(--foreground)] outline-none"
          >
            {RESOURCE_TYPES.map((type) => (
              <option key={type} value={type}>
                {RESOURCE_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </label>

        <label className="block md:col-span-2">
          <span className="eyebrow">Location</span>
          <input
            name="location"
            required
            defaultValue={resource.location ?? ""}
            className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)] outline-none"
          />
        </label>

        <label className="block md:col-span-2">
          <span className="eyebrow">Description</span>
          <textarea
            name="description"
            rows={6}
            defaultValue={resource.description ?? ""}
            className="mt-3 w-full resize-none rounded-[24px] border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)] outline-none"
          />
        </label>

        {relationOptions && linkedEntities ? (
          <div className="md:col-span-2">
            <div className="soft-rule mb-5 pt-5">
              <p className="eyebrow">Connections</p>
              <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                Desde aqui puedes conectar el recurso con proyectos, tareas, notas y decisiones sin salir del vault.
              </p>
            </div>

            <div className="grid gap-4">
              <LinkSection
                label="Proyectos"
                entityType="project"
                resourceId={resource.id}
                options={relationOptions.projects}
                linked={linkedEntities.projects}
                isPending={isLinkPending}
                onAttach={attachLink}
                onRemove={removeLink}
              />
              <LinkSection
                label="Tareas"
                entityType="task"
                resourceId={resource.id}
                options={relationOptions.tasks}
                linked={linkedEntities.tasks}
                isPending={isLinkPending}
                onAttach={attachLink}
                onRemove={removeLink}
              />
              <LinkSection
                label="Notas"
                entityType="note"
                resourceId={resource.id}
                options={relationOptions.notes}
                linked={linkedEntities.notes}
                isPending={isLinkPending}
                onAttach={attachLink}
                onRemove={removeLink}
              />
              <LinkSection
                label="Decisiones"
                entityType="decision"
                resourceId={resource.id}
                options={relationOptions.decisions}
                linked={linkedEntities.decisions}
                isPending={isLinkPending}
                onAttach={attachLink}
                onRemove={removeLink}
              />

              {linkError ? (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-sm text-red-600">
                  {linkError}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </EditEntityModal>
  );
}
