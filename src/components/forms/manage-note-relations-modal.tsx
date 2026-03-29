"use client";

import { useMemo, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { Link2, Trash2, X } from "lucide-react";
import { linkNoteRelationAction, unlinkNoteRelationAction } from "@/server/actions/lifeos";
import { Button } from "@/components/ui/button";
import { NOTE_TYPE_LABELS, RELATION_KINDS, RELATION_KIND_LABELS, type NoteType, type RelationKind } from "@/lib/domain";

type NoteOption = {
  id: string;
  title: string;
  type: NoteType;
};

type NoteRelationEntry = {
  id: string;
  direction: "outgoing" | "incoming";
  relation: RelationKind;
  note: {
    id: string;
    title: string;
    type: NoteType;
  };
};

type ManageNoteRelationsModalProps = {
  noteId: string;
  noteTitle: string;
  noteOptions: NoteOption[];
  relations: NoteRelationEntry[];
  triggerLabel?: string;
};

export function ManageNoteRelationsModal({
  noteId,
  noteTitle,
  noteOptions,
  relations,
  triggerLabel = "Connect notes",
}: ManageNoteRelationsModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState("");
  const [selectedRelation, setSelectedRelation] = useState<RelationKind>("related_to");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const availableNotes = useMemo(() => {
    const outgoingIds = new Set(relations.filter((relation) => relation.direction === "outgoing").map((relation) => relation.note.id));
    return noteOptions.filter((note) => !outgoingIds.has(note.id));
  }, [noteOptions, relations]);

  const attachRelation = () => {
    if (!selectedNoteId) return;

    startTransition(async () => {
      setError(null);
      try {
        const formData = new FormData();
        formData.append("from_note_id", noteId);
        formData.append("to_note_id", selectedNoteId);
        formData.append("relation", selectedRelation);
        await linkNoteRelationAction(formData);
        setSelectedNoteId("");
        setSelectedRelation("related_to");
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "Could not link note.");
      }
    });
  };

  const removeRelation = (relationId: string, relatedNoteId: string) => {
    startTransition(async () => {
      setError(null);
      try {
        const formData = new FormData();
        formData.append("relation_id", relationId);
        formData.append("from_note_id", noteId);
        formData.append("to_note_id", relatedNoteId);
        await unlinkNoteRelationAction(formData);
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "Could not unlink note relation.");
      }
    });
  };

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        className="rounded-full px-5"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
      >
        <Link2 className="mr-2 h-4 w-4" />
        {triggerLabel}
      </Button>

      {open && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[100] overflow-y-auto px-4 py-4 sm:py-6">
          <button
            type="button"
            aria-label="Close note relations modal"
            className="absolute inset-0 bg-[color:color-mix(in_srgb,var(--foreground)_28%,transparent)] backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          <div className="relative z-10 flex min-h-full items-start justify-center">
            <div className="panel-surface my-auto flex w-full max-w-3xl flex-col overflow-hidden rounded-[32px] p-6 text-left max-h-[calc(100dvh-2rem)] sm:p-8 sm:max-h-[calc(100dvh-3rem)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">Knowledge graph lite</p>
                  <h2 className="mt-3 text-3xl font-semibold text-[var(--foreground)]">{noteTitle}</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--muted-foreground)]">
                    Connect this note with other ideas so knowledge doesn't stay isolated in a single card.
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

              <div className="mt-8 flex min-h-0 flex-1 flex-col">
                <div className="min-h-0 flex-1 space-y-5 overflow-y-auto pr-1">
                  <div className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
                    <select
                      value={selectedNoteId}
                      onChange={(event) => setSelectedNoteId(event.target.value)}
                      className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-3 py-4 text-sm text-[var(--foreground)] outline-none"
                    >
                      <option value="">Select another note</option>
                      {availableNotes.map((note) => (
                        <option key={note.id} value={note.id}>
                          {note.title} · {NOTE_TYPE_LABELS[note.type]}
                        </option>
                      ))}
                    </select>

                    <select
                      value={selectedRelation}
                      onChange={(event) => setSelectedRelation(event.target.value as RelationKind)}
                      className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-3 py-4 text-sm text-[var(--foreground)] outline-none"
                    >
                      {RELATION_KINDS.map((relation) => (
                        <option key={relation} value={relation}>
                          {RELATION_KIND_LABELS[relation]}
                        </option>
                      ))}
                    </select>

                    <Button type="button" className="rounded-full px-5" onClick={attachRelation} disabled={!selectedNoteId || isPending}>
                      {isPending ? "Saving..." : "Connect"}
                    </Button>
                  </div>

                  {error && (
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-sm text-red-600">
                      {error}
                    </div>
                  )}

                  <div className="space-y-3">
                    {relations.length === 0 && (
                      <div className="panel-quiet rounded-2xl p-5 text-sm text-[var(--muted-foreground)]">
                        No connections between this note and others yet.
                      </div>
                    )}

                    {relations.map((relation) => (
                      <div key={relation.id} className="panel-quiet flex items-center justify-between gap-3 rounded-2xl p-4">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-[var(--foreground)]">{relation.note.title}</p>
                          <p className="mt-1 truncate text-xs text-[var(--muted-foreground)]">
                            {relation.direction === "outgoing" ? "outgoing" : "incoming"} · {RELATION_KIND_LABELS[relation.relation]} · {NOTE_TYPE_LABELS[relation.note.type]}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="rounded-full"
                          onClick={() => removeRelation(relation.id, relation.note.id)}
                          disabled={isPending}
                        >
                          <Trash2 className="mr-1 h-3.5 w-3.5" />
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
