import { SubmitButton } from "@/components/ui/submit-button";
import { updateProfileAction } from "@/server/actions/lifeos";
import { getProfileData } from "@/server/queries/lifeos";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-BO", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default async function ProfilePage() {
  const { profile } = await getProfileData();

  return (
    <div className="min-h-full px-5 py-6 sm:px-8 md:px-10 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <header className="panel-surface rounded-[32px] p-6 sm:p-8">
          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <div>
              <div className="kicker-pill">Espacio personal</div>
              <h1 className="title-balance mt-5 text-4xl font-semibold text-[var(--foreground)]">Perfil y preferencias</h1>
              <p className="mt-4 text-base leading-relaxed text-[var(--muted-foreground)]">
                Ajusta identidad, zona horaria e idioma para que LifeOS se sienta realmente tuyo y no una instalacion generica.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <article className="panel-quiet rounded-[26px] p-5">
                <p className="eyebrow">Email</p>
                <p className="mt-3 break-all text-sm font-medium text-[var(--foreground)]">{profile.email}</p>
              </article>
              <article className="panel-quiet rounded-[26px] p-5">
                <p className="eyebrow">Creado</p>
                <p className="mt-3 text-sm font-medium text-[var(--foreground)]">{formatDate(profile.createdAt)}</p>
              </article>
              <article className="panel-quiet rounded-[26px] p-5">
                <p className="eyebrow">Actualizado</p>
                <p className="mt-3 text-sm font-medium text-[var(--foreground)]">{formatDate(profile.updatedAt)}</p>
              </article>
            </div>
          </div>
        </header>

        <form action={updateProfileAction} className="panel-surface mt-8 rounded-[30px] p-6 sm:p-8">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="eyebrow">Nombre</span>
              <input
                name="full_name"
                defaultValue={profile.fullName}
                placeholder="Como quieres verte dentro del sistema"
                className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)] outline-none"
              />
            </label>

            <label className="block">
              <span className="eyebrow">Username</span>
              <input
                name="username"
                defaultValue={profile.username}
                placeholder="handle personal"
                className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)] outline-none"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="eyebrow">Avatar URL</span>
              <input
                name="avatar_url"
                defaultValue={profile.avatarUrl}
                placeholder="https://..."
                className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)] outline-none"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="eyebrow">Bio</span>
              <textarea
                name="bio"
                rows={5}
                defaultValue={profile.bio}
                placeholder="Que areas de tu vida o de tu trabajo quieres que este sistema represente mejor?"
                className="mt-3 w-full resize-none rounded-[24px] border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)] outline-none"
              />
            </label>

            <label className="block">
              <span className="eyebrow">Zona horaria</span>
              <input
                name="timezone"
                defaultValue={profile.timezone}
                placeholder="America/La_Paz"
                className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)] outline-none"
              />
            </label>

            <label className="block">
              <span className="eyebrow">Idioma</span>
              <select
                name="locale"
                defaultValue={profile.locale}
                className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-3 py-4 text-sm text-[var(--foreground)] outline-none"
              >
                <option value="es">Espanol</option>
                <option value="en">English</option>
              </select>
            </label>

            <label className="block md:col-span-2">
              <span className="eyebrow">Email</span>
              <input
                value={profile.email}
                readOnly
                className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--muted)]/40 px-4 py-4 text-sm text-[var(--muted-foreground)] outline-none"
              />
            </label>
          </div>

          <div className="soft-rule mt-8 flex flex-col gap-4 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[var(--muted-foreground)]">
              Estos ajustes no cambian tu contenido, pero si como el sistema representa identidad, tiempos y contexto.
            </p>
            <SubmitButton pendingLabel="Guardando..." className="rounded-full px-5">
              Guardar perfil
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}
