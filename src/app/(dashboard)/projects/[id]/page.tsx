import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Plus, CheckCircle2, ChevronRight, CheckSquare } from "lucide-react";
import { TASK_PRIORITIES, TASK_PRIORITY_LABELS, NOTE_TYPES, NOTE_TYPE_LABELS } from "@/lib/domain";
import { CreateEntityModal } from "@/components/forms/create-entity-modal";
import { createTaskAction, createNoteAction, updateTaskStatusAction } from "@/server/actions/lifeos";
import { getProjectDetailData, getAreasData } from "@/server/queries/lifeos";
import { SubmitButton } from "@/components/ui/submit-button";
import { EditTaskModal } from "@/components/forms/edit-task-modal";
import { EditProjectModal } from "@/components/forms/edit-project-modal";

function formatDate(value: string | null) {
  if (!value) return "No date";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  let data;
  let areasData;
  try {
    data = await getProjectDetailData(params.id);
    areasData = await getAreasData();
  } catch (error) {
    notFound();
  }

  const { project, tasks, notes, resources } = data;
  const openTasks = tasks.filter(t => t.status !== "done" && t.status !== "archived" && t.status !== "cancelled");
  const closedTasks = tasks.filter(t => t.status === "done");

  return (
    <div className="min-h-full px-5 py-6 sm:px-8 md:px-10 lg:px-12 flex flex-col gap-10">
      
      {/* HEADER / NAVIGATION */}
      <nav className="flex items-center text-sm font-medium text-[var(--muted-foreground)]">
        <Link href="/projects" className="flex items-center transition-colors hover:text-[var(--foreground)]">
          <ChevronLeft className="mr-1 h-4 w-4" /> Back to Projects
        </Link>
        <span className="mx-2 opacity-50">/</span>
        <span className="text-[var(--foreground)] truncate max-w-[200px] sm:max-w-xs">{project.title}</span>
      </nav>

      {/* HERO SECTION */}
      <section className="panel-surface rounded-[32px] p-6 sm:p-8 xl:p-10 relative overflow-hidden">
        {project.areaColor && (
          <div 
            className="absolute top-0 right-0 w-64 h-64 rounded-bl-full opacity-10 blur-3xl"
            style={{ backgroundColor: project.areaColor }}
          />
        )}
        
        <div className="relative z-10 grid gap-6 md:grid-cols-[1fr_300px]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="kicker-pill">{project.status}</span>
              <span className="text-xs uppercase tracking-[0.2em] text-[var(--muted-foreground)] flex items-center gap-1">
                {project.areaColor && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: project.areaColor }} />}
                {project.areaName}
              </span>
            </div>
            
            <div className="flex items-center gap-3 mt-5 group">
              <h1 className="text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl md:text-6xl md:leading-tight">
                {project.title}
              </h1>
              <div className="-mt-2">
                <EditProjectModal project={{
                   id: project.id,
                   title: project.title,
                   description: project.description,
                   status: project.status,
                   priority: project.priority,
                   targetDate: project.targetDate,
                   area_id: project.areaId
                }} areas={areasData.areas} />
              </div>
            </div>
            
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--muted-foreground)]">
              {project.description || "No description provided for this project yet."}
            </p>
          </div>
          
          <div className="flex flex-col flex-wrap gap-4 md:items-end justify-center md:border-l md:border-[var(--border)] md:pl-8">
            <div className="w-full max-w-xs panel-quiet rounded-2xl p-4">
               <p className="eyebrow">Progress</p>
               <div className="mt-3 flex items-end justify-between">
                 <span className="text-3xl font-semibold text-[var(--foreground)]">{project.progress}%</span>
                 <span className="text-sm text-[var(--muted-foreground)] mb-1">{project.completedTaskCount} / {project.openTaskCount + project.completedTaskCount}</span>
               </div>
               <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[var(--background)]">
                <div className="h-full bg-[var(--foreground)] transition-all duration-500" style={{ width: `${project.progress}%` }} />
               </div>
            </div>

            <div className="w-full max-w-xs panel-quiet rounded-2xl p-4">
               <p className="eyebrow">Target Date</p>
               <p className="mt-2 text-lg font-medium text-[var(--foreground)] uppercase tracking-wide">
                 {formatDate(project.targetDate)}
               </p>
            </div>
          </div>
        </div>
      </section>

      {/* CONTINUOUS SCROLL CONTENT */}
      <div className="grid gap-10 xl:grid-cols-[1.2fr_0.8fr] items-start">
        
        {/* LEFT COLUMN: ACTIVE EXECUTION (TASKS) */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
               <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--foreground)] text-[var(--background)]">
                 <CheckSquare className="h-4 w-4" />
               </div>
               <h2 className="text-2xl font-semibold text-[var(--foreground)]">Actions</h2>
             </div>
             
             <CreateEntityModal
               title="New next action"
               description="Add an action specifically linked to this project."
               triggerLabel="Add Action"
               submitLabel="Create action"
               pendingLabel="Adding..."
               action={createTaskAction}
             >
                {/* Hidden input to physically link the task */}
                <input type="hidden" name="project_id" value={project.id} />
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block md:col-span-2">
                    <span className="eyebrow">Title</span>
                    <input
                      name="title"
                      required
                      placeholder="e.g. Draft the first architecture schema..."
                      className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)] outline-none focus:border-[var(--foreground)]/50"
                    />
                  </label>
                  <label className="block">
                    <span className="eyebrow">Status</span>
                    <select
                      name="status"
                      defaultValue="todo"
                      className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-3 py-4 text-sm text-[var(--foreground)] outline-none"
                    >
                      <option value="todo">To do</option>
                      <option value="in_progress">In progress</option>
                      <option value="inbox">Inbox</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="eyebrow">Priority</span>
                    <select
                      name="priority"
                      defaultValue="medium"
                      className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-3 py-4 text-sm text-[var(--foreground)] outline-none"
                    >
                      {TASK_PRIORITIES.map((priority) => (
                        <option key={priority} value={priority}>
                          {TASK_PRIORITY_LABELS[priority]}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
             </CreateEntityModal>
          </div>

          <div className="flex flex-col gap-3">
            {openTasks.length === 0 ? (
               <div className="panel-surface rounded-3xl p-8 text-center border border-dashed border-[var(--border)]">
                 <p className="text-[var(--muted-foreground)]">No active tasks. Project is clear or stalled.</p>
               </div>
            ) : (
              openTasks.map(task => (
                <article key={task.id} className="panel-quiet group flex items-start gap-4 rounded-[26px] p-5 transition-all hover:bg-[var(--foreground)]/5">
                  <form action={updateTaskStatusAction} className="mt-1">
                    <input type="hidden" name="id" value={task.id} />
                    <input type="hidden" name="status" value="done" />
                    <SubmitButton 
                      pendingLabel="" 
                      className="h-6 w-6 rounded-full border border-[var(--border)] bg-transparent p-0 text-transparent transition-colors hover:border-[var(--foreground)] hover:text-[var(--foreground)] flex items-center justify-center cursor-pointer"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </SubmitButton>
                  </form>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold text-[var(--foreground)]">{task.title}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[var(--muted-foreground)]">
                      <span className="capitalize">{task.status.replace('_', ' ')}</span>
                      <span>·</span>
                      <span>{task.priority} priority</span>
                      {task.dueDate && (
                        <>
                          <span>·</span>
                          <span>Due {formatDate(task.dueDate)}</span>
                        </>
                      )}
                      
                      {/* The hover Edit button */}
                      <EditTaskModal task={{
                        id: task.id,
                        title: task.title,
                        status: task.status,
                        priority: task.priority,
                        dueDate: task.dueDate,
                        project_id: project.id
                      }} projects={[{ id: project.id, title: project.title }]} />
                    </div>
                  </div>
                </article>
              ))
            )}
            
            {closedTasks.length > 0 && (
              <details className="group mt-4 text-sm text-[var(--muted-foreground)]">
                <summary className="cursor-pointer font-medium hover:text-[var(--foreground)] outline-none list-none flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
                  Show {closedTasks.length} completed tasks
                </summary>
                <div className="mt-4 flex flex-col gap-2 pl-6 opacity-60">
                  {closedTasks.map(task => (
                    <div key={task.id} className="line-through">{task.title}</div>
                  ))}
                </div>
              </details>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: KNOWLEDGE & RESOURCES */}
        <div className="flex flex-col gap-10">
          
          {/* NOTES BLOCK */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">Project Notes</h2>
              <CreateEntityModal
               title="New Note"
               description="Capture knowledge, brainstorms, or logs for this project."
               triggerLabel="Add Note"
               submitLabel="Save Note"
               pendingLabel="Saving..."
               action={createNoteAction}
              >
                <input type="hidden" name="project_id" value={project.id} />
                <div className="grid gap-4">
                  <label className="block">
                    <span className="eyebrow">Title</span>
                    <input name="title" required className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)] outline-none" />
                  </label>
                  <label className="block">
                    <span className="eyebrow">Type</span>
                    <select name="type" defaultValue="plain" className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-3 py-4 text-sm text-[var(--foreground)] outline-none">
                      {NOTE_TYPES.map(type => (
                        <option key={type} value={type}>{NOTE_TYPE_LABELS[type]}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="eyebrow">Content</span>
                    <textarea name="content" rows={5} className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)] outline-none resize-none" />
                  </label>
                </div>
              </CreateEntityModal>
            </div>
            
            <div className="flex flex-col gap-3">
               {notes.length === 0 ? (
                 <p className="text-sm text-[var(--muted-foreground)] italic">No notes linked yet.</p>
               ) : (
                 notes.map(note => (
                   <Link key={note.id} href="/knowledge" className="panel-surface rounded-2xl p-4 transition-all hover:border-[var(--foreground)]/20 hover:-translate-y-0.5">
                     <span className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)]">{note.type}</span>
                     <h3 className="mt-1 font-semibold text-[var(--foreground)]">{note.title}</h3>
                     <p className="mt-2 text-xs text-[var(--muted-foreground)] line-clamp-2">{note.preview}</p>
                   </Link>
                 ))
               )}
            </div>
          </div>

          {/* RESOURCES BLOCK */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">Resources</h2>
              <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider">Vault</p>
            </div>
            
            <div className="flex flex-col gap-3">
               {resources.length === 0 ? (
                 <p className="text-sm text-[var(--muted-foreground)] italic">No resources attached.</p>
               ) : (
                 resources.map(res => (
                   <a key={res.id} href={res.location!} target="_blank" rel="noreferrer" className="panel-quiet rounded-2xl p-4 flex flex-col gap-1 transition-colors hover:bg-[var(--foreground)]/5">
                     <span className="text-sm font-medium text-[var(--foreground)] hover:underline">{res.title}</span>
                     {res.description && <span className="text-xs text-[var(--muted-foreground)] truncate">{res.description}</span>}
                   </a>
                 ))
               )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
