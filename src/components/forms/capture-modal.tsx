"use client";

import { useEffect, useState, useRef, useTransition } from "react";
import { CornerDownLeft, Inbox as InboxIcon, Tag, Link, FileText, Compass, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { captureEntityToDB } from "@/lib/actions/capture";

type EntityType = "task" | "note" | "resource" | "decision";

export function CaptureModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [entityType, setEntityType] = useState<EntityType>("task");
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [isPending, startTransition] = useTransition();

  // Form states mapping DB enums
  const [taskStatus, setTaskStatus] = useState("inbox");
  const [priority, setPriority] = useState("medium");
  const [energy, setEnergy] = useState("low");
  const [estMinutes, setEstMinutes] = useState("");
  
  const [noteType, setNoteType] = useState("fleeting");
  
  const [resStorage, setResStorage] = useState("external");
  const [resType, setResType] = useState("link");
  
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
          expectedOutcome
       });

       if (res.success) {
         setInputValue("");
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
              <select value={taskStatus} onChange={e => setTaskStatus(e.target.value)} className="bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] text-xs rounded-md px-2 py-1.5 focus:outline-none">
                <option value="inbox">Status: Inbox</option>
                <option value="todo">Status: To Do</option>
                <option value="in_progress">Status: In Progress</option>
              </select>
              <select value={priority} onChange={e => setPriority(e.target.value)} className="bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] text-xs rounded-md px-2 py-1.5 focus:outline-none">
                <option value="low">Priority: Low</option>
                <option value="medium">Priority: Medium</option>
                <option value="high">Priority: High</option>
                <option value="urgent">Priority: Urgent ⚡</option>
              </select>
              <select value={energy} onChange={e => setEnergy(e.target.value)} className="bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] text-xs rounded-md px-2 py-1.5 focus:outline-none">
                <option value="low">Energy: Low</option>
                <option value="medium">Energy: Medium</option>
                <option value="high">Energy: High</option>
              </select>
              <input type="number" placeholder="Est. Mins" value={estMinutes} onChange={e => setEstMinutes(e.target.value)} className="w-24 bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] text-xs rounded-md px-2 py-1.5 outline-none" />
            </>
          )}

          {entityType === "note" && (
            <select value={noteType} onChange={e => setNoteType(e.target.value)} className="bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] text-xs rounded-md px-2 py-1.5 focus:outline-none">
                <option value="fleeting">Type: Fleeting</option>
                <option value="literature">Type: Literature</option>
                <option value="atomic">Type: Atomic</option>
                <option value="journal">Type: Journal</option>
            </select>
          )}

          {entityType === "resource" && (
            <>
              <select value={resStorage} onChange={e => setResStorage(e.target.value)} className="bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] text-xs rounded-md px-2 py-1.5 focus:outline-none">
                  <option value="external">Storage: External Link</option>
                  <option value="internal">Storage: Internal (Upload)</option>
              </select>
              <select value={resType} onChange={e => setResType(e.target.value)} className="bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] text-xs rounded-md px-2 py-1.5 focus:outline-none">
                  <option value="link">Type: Link</option>
                  <option value="pdf">Type: PDF</option>
                  <option value="book">Type: Book</option>
              </select>
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
             <Button size="sm" className="h-8 gap-2 bg-[var(--foreground)] text-[var(--background)] hover:opacity-90" onClick={handleCapture} disabled={isPending || !inputValue.trim()}>
               {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Save {entityType} <CornerDownLeft className="w-3 h-3 opacity-70" /></>}
             </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
