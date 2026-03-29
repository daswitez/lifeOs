import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Download, ExternalLink } from "lucide-react";
import { RESOURCE_TYPE_LABELS, STORAGE_MODE_LABELS } from "@/lib/domain";
import { getResourceDetailData } from "@/server/queries/lifeos";
import { EditResourceModal } from "@/components/forms/edit-resource-modal";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-BO", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatBytes(value: number | null | undefined) {
  if (!value || value <= 0) return null;
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  if (value < 1024 * 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(1)} MB`;
  return `${(value / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export default async function ResourceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let data;

  try {
    data = await getResourceDetailData(id);
  } catch {
    notFound();
  }

  const imagePreview =
    data.resource.type === "image" && data.resource.previewUrl ? (
      <>
        {/* Signed storage URLs are ephemeral and bypass Next image optimization config. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={data.resource.previewUrl}
          alt={data.resource.title}
          className="h-auto max-h-[36rem] w-full object-contain"
        />
      </>
    ) : null;

  return (
    <div className="min-h-full px-5 py-6 sm:px-8 md:px-10 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <nav className="flex items-center text-sm font-medium text-[var(--muted-foreground)]">
          <Link href="/resources" className="flex items-center transition-colors hover:text-[var(--foreground)]">
            <ChevronLeft className="mr-1 h-4 w-4" /> Back to Resources
          </Link>
        </nav>

        <section className="panel-surface mt-6 rounded-[32px] p-6 sm:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="kicker-pill">{RESOURCE_TYPE_LABELS[data.resource.type]}</span>
                <span className="text-xs text-[var(--muted-foreground)]">
                  {STORAGE_MODE_LABELS[data.resource.storageMode]}
                </span>
                {data.resource.isArchived && <span className="kicker-pill">Archived</span>}
              </div>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl">
                {data.resource.title}
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[var(--muted-foreground)]">
                {data.resource.description || "This resource still needs contextual metadata."}
              </p>
            </div>

            <div className="group">
              <EditResourceModal
                resource={{
                  id: data.resource.id,
                  title: data.resource.title,
                  description: data.resource.description,
                  type: data.resource.type,
                  storageMode: data.resource.storageMode,
                  location: data.resource.location,
                  isArchived: data.resource.isArchived,
                }}
              />
            </div>
          </div>

          <div className="soft-rule mt-8 grid gap-4 pt-5 md:grid-cols-3">
            <div className="panel-quiet rounded-2xl p-4">
              <p className="eyebrow">Created</p>
              <p className="mt-2 text-sm text-[var(--foreground)]">{formatDate(data.resource.createdAt)}</p>
            </div>
            <div className="panel-quiet rounded-2xl p-4">
              <p className="eyebrow">Updated</p>
              <p className="mt-2 text-sm text-[var(--foreground)]">{formatDate(data.resource.updatedAt)}</p>
            </div>
            <div className="panel-quiet rounded-2xl p-4">
              <p className="eyebrow">Preview</p>
              <p className="mt-2 text-sm text-[var(--foreground)]">{data.resource.previewStatus}</p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="panel-quiet rounded-2xl p-4">
              <p className="eyebrow">Provider</p>
              <p className="mt-2 text-sm text-[var(--foreground)]">{data.resource.sourceProvider || "manual"}</p>
            </div>
            <div className="panel-quiet rounded-2xl p-4">
              <p className="eyebrow">Mime type</p>
              <p className="mt-2 break-all text-sm text-[var(--foreground)]">{data.resource.mimeType || "n/a"}</p>
            </div>
            <div className="panel-quiet rounded-2xl p-4">
              <p className="eyebrow">Size</p>
              <p className="mt-2 text-sm text-[var(--foreground)]">{formatBytes(data.resource.fileSizeBytes) || "n/a"}</p>
            </div>
          </div>
        </section>

        <section className="panel-surface mt-8 rounded-[32px] p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <p className="eyebrow">Preview</p>
            {data.resource.signedUrl && (
              <a
                href={data.resource.signedUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2 text-sm text-[var(--foreground)] transition-colors hover:bg-[var(--accent-soft)]"
              >
                Abrir archivo
                <Download className="h-4 w-4" />
              </a>
            )}
          </div>
          {data.resource.previewUrl ? (
            <div className="mt-4 overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--muted)]/30">
              {imagePreview}
              {data.resource.type === "pdf" && (
                <iframe
                  src={data.resource.previewUrl}
                  title={data.resource.title}
                  className="h-[36rem] w-full bg-white"
                />
              )}
              {data.resource.type === "video" && (
                <video
                  controls
                  src={data.resource.previewUrl}
                  className="h-auto max-h-[36rem] w-full bg-black"
                />
              )}
              {data.resource.type === "audio" && (
                <div className="p-6">
                  <audio controls src={data.resource.previewUrl} className="w-full" />
                </div>
              )}
            </div>
          ) : (
            <p className="mt-4 text-sm text-[var(--muted-foreground)]">
              No hay preview embebida para este recurso. Si es interno, puedes abrirlo desde el vault.
            </p>
          )}
        </section>

        <section className="panel-surface mt-8 rounded-[32px] p-6 sm:p-8">
          <p className="eyebrow">Location</p>
          {data.resource.storageMode === "external" && data.resource.location ? (
            <a
              href={data.resource.location}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 break-all text-sm text-[var(--foreground)] underline-offset-4 hover:underline"
            >
              {data.resource.location}
              <ExternalLink className="h-4 w-4" />
            </a>
          ) : data.resource.storageMode === "internal" ? (
            <div className="mt-4 space-y-3">
              <p className="break-all text-sm text-[var(--foreground)]">{data.resource.location || "No internal path stored yet."}</p>
              {data.resource.signedUrl && (
                <a
                  href={data.resource.signedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-[var(--foreground)] underline-offset-4 hover:underline"
                >
                  Descargar o abrir desde storage
                  <Download className="h-4 w-4" />
                </a>
              )}
            </div>
          ) : (
            <p className="mt-4 text-sm text-[var(--muted-foreground)]">No location stored yet.</p>
          )}
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-2">
          <article className="panel-surface rounded-[30px] p-6">
            <p className="eyebrow">Linked projects</p>
            <div className="mt-5 space-y-3">
              {data.backlinks.projects.length === 0 && (
                <p className="text-sm text-[var(--muted-foreground)]">No projects linked yet.</p>
              )}
              {data.backlinks.projects.map((project) => (
                <Link key={project.id} href={`/projects/${project.id}`} className="block text-sm text-[var(--foreground)] hover:underline">
                  {project.title}
                </Link>
              ))}
            </div>
          </article>

          <article className="panel-surface rounded-[30px] p-6">
            <p className="eyebrow">Linked notes</p>
            <div className="mt-5 space-y-3">
              {data.backlinks.notes.length === 0 && (
                <p className="text-sm text-[var(--muted-foreground)]">No notes linked yet.</p>
              )}
              {data.backlinks.notes.map((note) => (
                <Link key={note.id} href={`/knowledge/${note.id}`} className="block text-sm text-[var(--foreground)] hover:underline">
                  {note.title}
                </Link>
              ))}
            </div>
          </article>

          <article className="panel-surface rounded-[30px] p-6">
            <p className="eyebrow">Linked tasks</p>
            <div className="mt-5 space-y-3">
              {data.backlinks.tasks.length === 0 && (
                <p className="text-sm text-[var(--muted-foreground)]">No tasks linked yet.</p>
              )}
              {data.backlinks.tasks.map((task) => (
                <div key={task.id}>
                  <p className="text-sm text-[var(--foreground)]">{task.title}</p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">{task.status}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="panel-surface rounded-[30px] p-6">
            <p className="eyebrow">Linked decisions</p>
            <div className="mt-5 space-y-3">
              {data.backlinks.decisions.length === 0 && (
                <p className="text-sm text-[var(--muted-foreground)]">No decisions linked yet.</p>
              )}
              {data.backlinks.decisions.map((decision) => (
                <Link key={decision.id} href={`/decisions/${decision.id}`} className="block text-sm text-[var(--foreground)] hover:underline">
                  {decision.title}
                </Link>
              ))}
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}
