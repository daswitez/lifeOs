import { AudioLines, Database, ExternalLink, FileImage, FileText, Film, Link as LinkIcon, Upload } from "lucide-react";
import { CreateEntityModal } from "@/components/forms/create-entity-modal";
import { ResourceRowEditButton } from "@/components/ui/resource-row-edit-button";
import { RESOURCE_TYPES, RESOURCE_TYPE_LABELS, STORAGE_MODE_LABELS, STORAGE_MODES } from "@/lib/domain";
import { createResourceAction, createUploadedResourceAction } from "@/server/actions/lifeos";
import { getResourcesData } from "@/server/queries/lifeos";
import Link from "next/link";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-BO", {
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
      <header className="panel-surface rounded-[32px] p-6 sm:p-8">
        <div className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
          <div>
            <div className="kicker-pill">Media y referencias</div>
            <h1 className="title-balance mt-5 text-4xl font-semibold text-[var(--foreground)]">Resources Vault</h1>
            <p className="mt-4 text-base text-[var(--muted-foreground)]">
              Guarda links, PDFs y materiales sin inflar el ruido del sistema.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="panel-quiet flex flex-col justify-between rounded-[28px] p-5">
              <div>
                <p className="eyebrow">Nuevo recurso</p>
                <h2 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
                  Composer de referencia
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
                  Crear va en modal para que la tabla siga siendo la estructura principal de lectura.
                </p>
              </div>

              <div className="mt-6">
                <CreateEntityModal
                  title="Nuevo recurso"
                  description="Guarda una referencia con tipo, storage y una ubicacion clara para que luego no tengas que adivinar que era."
                  triggerLabel="Nuevo recurso"
                  submitLabel="Guardar recurso"
                  pendingLabel="Guardando..."
                  action={createResourceAction}
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block">
                      <span className="eyebrow">Titulo</span>
                      <input
                        name="title"
                        required
                        placeholder="Titulo del recurso"
                        className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)] outline-none"
                      />
                    </label>
                    <label className="block">
                      <span className="eyebrow">Ubicacion</span>
                      <input
                        name="location"
                        required
                        placeholder="URL o ruta interna"
                        className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)] outline-none"
                      />
                    </label>
                    <label className="block">
                      <span className="eyebrow">Storage</span>
                      <select
                        name="storage_mode"
                        defaultValue="external"
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
                      <span className="eyebrow">Tipo</span>
                      <select
                        name="type"
                        defaultValue="link"
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
                      <span className="eyebrow">Descripcion</span>
                      <input
                        name="description"
                        placeholder="Para que lo guardas?"
                        className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)] outline-none"
                      />
                    </label>
                  </div>
                </CreateEntityModal>
              </div>
            </div>

            <div className="panel-quiet flex flex-col justify-between rounded-[28px] p-5">
              <div>
                <p className="eyebrow">Subida interna</p>
                <h2 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
                  Vault uploader
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
                  Sube PDFs, imagenes, audio o video al sistema y deja listo el preview sin salir de LifeOS.
                </p>
              </div>

              <div className="mt-6">
                <CreateEntityModal
                  title="Subir archivo"
                  description="Guarda un archivo dentro del vault. El sistema inferira el tipo, registrara metadata util y, si el bucket existe, dejara preview directa para medios compatibles."
                  triggerLabel="Subir archivo"
                  submitLabel="Subir al vault"
                  pendingLabel="Subiendo..."
                  action={createUploadedResourceAction}
                >
                  <div className="grid gap-4">
                    <label className="block">
                      <span className="eyebrow">Archivo</span>
                      <input
                        name="file"
                        type="file"
                        required
                        className="mt-3 w-full rounded-2xl border border-dashed border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)] outline-none file:mr-4 file:rounded-full file:border-0 file:bg-[var(--accent-soft)] file:px-4 file:py-2 file:text-sm file:font-medium file:text-[var(--foreground)]"
                      />
                    </label>
                    <label className="block">
                      <span className="eyebrow">Titulo opcional</span>
                      <input
                        name="title"
                        placeholder="Si lo dejas vacio, usamos el nombre del archivo"
                        className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)] outline-none"
                      />
                    </label>
                    <label className="block">
                      <span className="eyebrow">Descripcion</span>
                      <input
                        name="description"
                        placeholder="Que contiene o para que te servira?"
                        className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)] outline-none"
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
            <div className="col-span-6 md:col-span-5">Titulo</div>
            <div className="col-span-2 hidden md:block">Tipo</div>
            <div className="col-span-3 hidden md:block">Storage</div>
            <div className="col-span-6 md:col-span-2 text-right">Alta</div>
          </div>

          {data.resources.map((resource) => (
            <article key={resource.id} className="group grid grid-cols-12 gap-4 border-b border-[var(--border)] p-4 last:border-none hover:bg-[var(--accent-soft)]/40">
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
