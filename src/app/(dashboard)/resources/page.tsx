import { AudioLines, Database, ExternalLink, FileImage, FileText, Film, Link as LinkIcon, Upload } from "lucide-react";
import { CreateEntityModal } from "@/components/forms/create-entity-modal";
import { ResourceRowEditButton } from "@/components/ui/resource-row-edit-button";
import { RESOURCE_TYPES, RESOURCE_TYPE_LABELS, STORAGE_MODE_LABELS, STORAGE_MODES } from "@/lib/domain";
import { createResourceAction, createUploadedResourceAction } from "@/server/actions/lifeos";
import { getResourcesData } from "@/server/queries/lifeos";
import Link from "next/link";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function iconForType(type: string) {
  switch (type) {
    case "image":
      return <FileImage className="h-4 w-4" />;
    case "video":
      return <Film className="h-4 w-4" />;
    case "audio":
      return <AudioLines className="h-4 w-4" />;
    case "link":
      return <LinkIcon className="h-4 w-4" />;
    case "pdf":
    case "file":
      return <FileText className="h-4 w-4" />;
    default:
      return <Database className="h-4 w-4" />;
  }
}

function formatBytes(value: number | null | undefined) {
  if (!value || value <= 0) return null;
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  if (value < 1024 * 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(1)} MB`;
  return `${(value / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export default async function ResourcesPage() {
  const data = await getResourcesData();

  return (
    <div className="min-h-full px-5 py-6 pb-24 sm:px-8 md:px-10 lg:px-12">
      <header className="panel-surface rounded-[32px] p-6 sm:p-8 anim-fade-in-up">
        <div className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
          <div>
            <div className="kicker-pill">Media & references</div>
            <h1 className="title-balance mt-5 text-4xl font-semibold text-[var(--foreground)]">Resources Vault</h1>
            <p className="mt-4 text-base text-[var(--muted-foreground)]">
              Save links, PDFs, and materials without inflating system noise.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="panel-quiet flex flex-col justify-between rounded-[28px] p-5">
              <div>
                <p className="eyebrow">New resource</p>
                <h2 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
                  Reference composer
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
                  Creation opens in a modal so the table remains the primary reading structure.
                </p>
              </div>

              <div className="mt-6">
                <CreateEntityModal
                  title="New resource"
                  description="Save a reference with type, storage, and a clear location so you don't have to guess later."
                  triggerLabel="New resource"
                  submitLabel="Save resource"
                  pendingLabel="Saving..."
                  action={createResourceAction}
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block">
                      <span className="eyebrow">Title</span>
                      <input
                        name="title"
                        required
                        placeholder="Resource title"
                        className="input-ring mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)]"
                      />
                    </label>
                    <label className="block">
                      <span className="eyebrow">Location</span>
                      <input
                        name="location"
                        required
                        placeholder="URL or internal path"
                        className="input-ring mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)]"
                      />
                    </label>
                    <label className="block">
                      <span className="eyebrow">Storage</span>
                      <select
                        name="storage_mode"
                        defaultValue="external"
                        className="input-ring mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-3 py-4 text-sm text-[var(--foreground)]"
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
                        defaultValue="link"
                        className="input-ring mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-3 py-4 text-sm text-[var(--foreground)]"
                      >
                        {RESOURCE_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {RESOURCE_TYPE_LABELS[type]}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block md:col-span-2">
                      <span className="eyebrow">Description</span>
                      <input
                        name="description"
                        placeholder="Why are you saving this?"
                        className="input-ring mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)]"
                      />
                    </label>
                  </div>
                </CreateEntityModal>
              </div>
            </div>

            <div className="panel-quiet flex flex-col justify-between rounded-[28px] p-5">
              <div>
                <p className="eyebrow">Internal upload</p>
                <h2 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
                  Vault uploader
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
                  Upload PDFs, images, audio, or video to the system and preview them without leaving LifeOS.
                </p>
              </div>

              <div className="mt-6">
                <CreateEntityModal
                  title="Upload file"
                  description="Store a file inside the vault. The system will infer type, record useful metadata, and enable direct preview for compatible media."
                  triggerLabel="Upload file"
                  submitLabel="Upload to vault"
                  pendingLabel="Uploading..."
                  action={createUploadedResourceAction}
                >
                  <div className="grid gap-4">
                    <label className="block">
                      <span className="eyebrow">File</span>
                      <input
                        name="file"
                        type="file"
                        required
                        className="mt-3 w-full rounded-2xl border border-dashed border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)] outline-none file:mr-4 file:rounded-full file:border-0 file:bg-[var(--accent-soft)] file:px-4 file:py-2 file:text-sm file:font-medium file:text-[var(--foreground)]"
                      />
                    </label>
                    <label className="block">
                      <span className="eyebrow">Title (optional)</span>
                      <input
                        name="title"
                        placeholder="Leave empty to use the filename"
                        className="input-ring mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)]"
                      />
                    </label>
                    <label className="block">
                      <span className="eyebrow">Description</span>
                      <input
                        name="description"
                        placeholder="What does it contain or what will it serve for?"
                        className="input-ring mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)]"
                      />
                    </label>
                  </div>
                </CreateEntityModal>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="pt-8">
        <div className="panel-surface overflow-hidden rounded-[30px]">
          <div className="grid grid-cols-12 gap-4 border-b border-[var(--border)] bg-[var(--muted)]/40 p-4 text-[10px] uppercase tracking-[0.25em] text-[var(--muted-foreground)]">
            <div className="col-span-6 md:col-span-5">Title</div>
            <div className="col-span-2 hidden md:block">Type</div>
            <div className="col-span-3 hidden md:block">Storage</div>
            <div className="col-span-6 md:col-span-2 text-right">Added</div>
          </div>

          {data.resources.map((resource) => (
            <article key={resource.id} className="group grid grid-cols-12 gap-4 border-b border-[var(--border)] p-4 last:border-none transition-colors hover:bg-[var(--accent-soft)]/40">
              <div className="col-span-6 md:col-span-5 flex items-center gap-3">
                <div className="text-[var(--muted-foreground)]">{iconForType(resource.type)}</div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-[var(--foreground)]">
                      <Link href={`/resources/${resource.id}`} className="hover:underline">
                        {resource.title}
                      </Link>
                    </p>
                    <ResourceRowEditButton
                      resource={{
                        id: resource.id,
                        title: resource.title,
                        description: resource.description,
                        type: resource.type,
                        storageMode: resource.storageMode,
                        location: resource.location,
                        isArchived: resource.isArchived ?? false,
                        linkedProjects: resource.linkedProjects ?? [],
                        linkedTasks: resource.linkedTasks ?? [],
                        linkedNotes: resource.linkedNotes ?? [],
                        linkedDecisions: resource.linkedDecisions ?? [],
                      }}
                      relationOptions={data.relationOptions}
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {resource.location && (
                      <p className="truncate text-xs text-[var(--muted-foreground)]">{resource.location}</p>
                    )}
                    {resource.mimeType && (
                      <span className="rounded-full border border-[var(--border)] px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                        {resource.mimeType}
                      </span>
                    )}
                    {formatBytes(resource.fileSizeBytes) && (
                      <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                        {formatBytes(resource.fileSizeBytes)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="col-span-2 hidden md:flex items-center">
                <span className="rounded-full border border-[var(--border)] px-2 py-1 text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
                  {RESOURCE_TYPE_LABELS[resource.type]}
                </span>
              </div>
              <div className="col-span-3 hidden md:flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                {resource.storageMode === "external" ? <ExternalLink className="h-3 w-3" /> : <Upload className="h-3 w-3" />}
                {STORAGE_MODE_LABELS[resource.storageMode]}
              </div>
              <div className="col-span-6 md:col-span-2 text-right text-xs font-mono text-[var(--muted-foreground)]">
                {formatDate(resource.createdAt)}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
