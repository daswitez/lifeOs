"use client";

import { useEffect, useState, useRef, useTransition } from "react";
import { CornerDownLeft, Inbox as InboxIcon, Tag, Link, FileText, Compass, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { captureEntityToDB } from "@/lib/actions/capture";
import {
  LOG_ENERGIES,
  LOG_ENERGY_LABELS,
  NOTE_TYPES,
  NOTE_TYPE_LABELS,
  RESOURCE_TYPES,
  RESOURCE_TYPE_LABELS,
  STORAGE_MODES,
  STORAGE_MODE_LABELS,
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  type LogEnergy,
  type NoteType,
  type ResourceType,
  type StorageMode,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/domain";

type EntityType = "task" | "note" | "resource" | "decision";

export function CaptureModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [entityType, setEntityType] = useState<EntityType>("task");
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [isPending, startTransition] = useTransition();

  // Form states mapping DB enums
  const [taskStatus, setTaskStatus] = useState<TaskStatus>("inbox");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [energy, setEnergy] = useState<LogEnergy>("low");
  const [estMinutes, setEstMinutes] = useState("");
  
  const [noteType, setNoteType] = useState<NoteType>("plain");
  
  const [resStorage, setResStorage] = useState<StorageMode>("external");
  const [resType, setResType] = useState<ResourceType>("link");
  const [resourceLocation, setResourceLocation] = useState("");
  
  const [expectedOutcome, setExpectedOutcome] = useState("");

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) setTimeout(() => inputRef.current?.focus(), 50);
  }, [isOpen]);

  const handleCapture = async () => {
    if (!inputValue.trim()) return;

    startTransition(async () => {
       const res = await captureEntityToDB({
          type: entityType,
          title: inputValue,
          status: taskStatus,
          priority: priority,
          energy: energy,
          estimatedMinutes: estMinutes ? parseInt(estMinutes) : undefined,
          noteType,
          storageMode: resStorage,
          resourceType: resType,
          resourceLocation,
          expectedOutcome
       });

       if (res.success) {
         setInputValue("");
         setResourceLocation("");
         setIsOpen(false); // Close on success
       } else {
         alert("Error capturing data: " + res.error);
       }
    });
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] sm:pt-[20vh] px-4">
      <div className="fixed inset-0 bg-[var(--background)]/60 backdrop-blur-sm transition-opacity" onClick={() => setIsOpen(false)} />

      <div className="relative w-full max-w-2xl bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Navbar */}
        <div className="flex px-2 pt-2 bg-[var(--muted)]/30 border-b border-[var(--border)]">
           <button onClick={() => setEntityType("task")} className={cn("px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors", entityType === "task" ? "border-b-2 border-[var(--foreground)] text-[var(--foreground)]" : "text-[var(--muted-foreground)] border-b-2 border-transparent")}>Task</button>
           <button onClick={() => setEntityType("note")} className={cn("px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors", entityType === "note" ? "border-b-2 border-[var(--foreground)] text-[var(--foreground)]" : "text-[var(--muted-foreground)] border-b-2 border-transparent")}>Note</button>
           <button onClick={() => setEntityType("resource")} className={cn("px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors", entityType === "resource" ? "border-b-2 border-[var(--foreground)] text-[var(--foreground)]" : "text-[var(--muted-foreground)] border-b-2 border-transparent")}>Resource</button>
           <button onClick={() => setEntityType("decision")} className={cn("px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors", entityType === "decision" ? "border-b-2 border-[var(--foreground)] text-[var(--foreground)]" : "text-[var(--muted-foreground)] border-b-2 border-transparent")}>Decision</button>
        </div>

        {/* Input */}
        <div className="flex items-center px-4 py-3 border-b border-[var(--border)] gap-3 bg-[var(--background)]">
          {entityType === "task" && <InboxIcon className="w-5 h-5 text-[var(--muted-foreground)] flex-shrink-0" />}
          {entityType === "note" && <FileText className="w-5 h-5 text-[var(--muted-foreground)] flex-shrink-0" />}
          {entityType === "resource" && <Link className="w-5 h-5 text-[var(--muted-foreground)] flex-shrink-0" />}
          {entityType === "decision" && <Compass className="w-5 h-5 text-[var(--muted-foreground)] flex-shrink-0" />}
          
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none text-xl md:text-2xl outline-none placeholder:text-[var(--muted-foreground)]/50 text-[var(--foreground)] min-w-0"
            placeholder={
              entityType === "task" ? "Create a new action..." : 
              entityType === "note" ? "Draft a fleeting note..." : 
              entityType === "resource" ? "Paste a URL or file name..." :
              "What decision are you facing?"
            }
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCapture()}
          />
        </div>

        {/* Dynamic Fields */}
        <div className="px-4 py-3 bg-[var(--background)] flex flex-wrap gap-3 border-b border-[var(--border)] border-dashed">
          {entityType === "task" && (
            <>
              <select value={taskStatus} onChange={(e) => setTaskStatus(e.target.value as TaskStatus)} className="bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] text-xs rounded-md px-2 py-1.5 focus:outline-none">
                {TASK_STATUSES.map((value) => (
                  <option key={value} value={value}>
                    {`Status: ${TASK_STATUS_LABELS[value]}`}
                  </option>
                ))}
              </select>
              <select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)} className="bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] text-xs rounded-md px-2 py-1.5 focus:outline-none">
                {TASK_PRIORITIES.map((value) => (
                  <option key={value} value={value}>
                    {`Priority: ${TASK_PRIORITY_LABELS[value]}`}
                  </option>
                ))}
              </select>
              <select value={energy} onChange={(e) => setEnergy(e.target.value as LogEnergy)} className="bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] text-xs rounded-md px-2 py-1.5 focus:outline-none">
                {LOG_ENERGIES.map((value) => (
                  <option key={value} value={value}>
                    {`Energy: ${LOG_ENERGY_LABELS[value]}`}
                  </option>
                ))}
              </select>
              <input type="number" placeholder="Est. Mins" value={estMinutes} onChange={e => setEstMinutes(e.target.value)} className="w-24 bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] text-xs rounded-md px-2 py-1.5 outline-none" />
            </>
          )}

          {entityType === "note" && (
            <select value={noteType} onChange={(e) => setNoteType(e.target.value as NoteType)} className="bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] text-xs rounded-md px-2 py-1.5 focus:outline-none">
                {NOTE_TYPES.map((value) => (
                  <option key={value} value={value}>
                    {`Type: ${NOTE_TYPE_LABELS[value]}`}
                  </option>
                ))}
            </select>
          )}

          {entityType === "resource" && (
            <>
              <select value={resStorage} onChange={(e) => setResStorage(e.target.value as StorageMode)} className="bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] text-xs rounded-md px-2 py-1.5 focus:outline-none">
                  {STORAGE_MODES.map((value) => (
                    <option key={value} value={value}>
                      {`Storage: ${STORAGE_MODE_LABELS[value]}`}
                    </option>
                  ))}
              </select>
              <select value={resType} onChange={(e) => setResType(e.target.value as ResourceType)} className="bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] text-xs rounded-md px-2 py-1.5 focus:outline-none">
                  {RESOURCE_TYPES.map((value) => (
                    <option key={value} value={value}>
                      {`Type: ${RESOURCE_TYPE_LABELS[value]}`}
                    </option>
                  ))}
              </select>
              <input
                type="text"
                value={resourceLocation}
                onChange={(e) => setResourceLocation(e.target.value)}
                placeholder={resStorage === "external" ? "https://..." : "storage/path/file.pdf"}
                className="min-w-[220px] flex-1 bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] text-xs rounded-md px-2 py-1.5 outline-none"
              />
            </>
          )}

          {entityType === "decision" && (
            <input type="text" placeholder="Expected outcome..." value={expectedOutcome} onChange={e => setExpectedOutcome(e.target.value)} className="flex-1 min-w-[200px] bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] text-xs rounded-md px-2 py-1.5 outline-none" />
          )}

        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-4 py-3 bg-[var(--card)]">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1.5 rounded bg-[var(--background)]">
               <Tag className="w-3 h-3" /> Auto-Categorizer
            </Button>
          </div>
          
          <div className="flex items-center gap-3">
             <span className="hidden sm:inline-flex text-[10px] font-mono font-medium text-[var(--muted-foreground)]">
                Press Enter to save
             </span>
             <Button size="sm" className="h-8 gap-2 bg-[var(--foreground)] text-[var(--background)] hover:opacity-90" onClick={handleCapture} disabled={isPending || !inputValue.trim() || (entityType === "resource" && !resourceLocation.trim())}>
               {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Save {entityType} <CornerDownLeft className="w-3 h-3 opacity-70" /></>}
             </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
