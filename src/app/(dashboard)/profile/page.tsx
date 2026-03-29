import { SubmitButton } from "@/components/ui/submit-button";
import { updateProfileAction } from "@/server/actions/lifeos";
import { getProfileData } from "@/server/queries/lifeos";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
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
        <header className="panel-surface rounded-[32px] p-6 sm:p-8 anim-fade-in-up">
          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <div>
              <div className="kicker-pill">Personal space</div>
              <h1 className="title-balance mt-5 text-4xl font-semibold text-[var(--foreground)]">Profile & preferences</h1>
              <p className="mt-4 text-base leading-relaxed text-[var(--muted-foreground)]">
                Adjust identity, timezone, and language so LifeOS feels truly yours and not a generic install.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3 stagger">
              <article className="panel-quiet rounded-[26px] p-5">
                <p className="eyebrow">Email</p>
                <p className="mt-3 break-all text-sm font-medium text-[var(--foreground)]">{profile.email}</p>
              </article>
              <article className="panel-quiet rounded-[26px] p-5">
                <p className="eyebrow">Created</p>
                <p className="mt-3 text-sm font-medium text-[var(--foreground)]">{formatDate(profile.createdAt)}</p>
              </article>
              <article className="panel-quiet rounded-[26px] p-5">
                <p className="eyebrow">Updated</p>
                <p className="mt-3 text-sm font-medium text-[var(--foreground)]">{formatDate(profile.updatedAt)}</p>
              </article>
            </div>
          </div>
        </header>

        <form action={updateProfileAction} className="panel-surface mt-8 rounded-[30px] p-6 sm:p-8">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="eyebrow">Name</span>
              <input
                name="full_name"
                defaultValue={profile.fullName}
                placeholder="How you want to appear inside the system"
                className="input-ring mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)]"
              />
            </label>

            <label className="block">
              <span className="eyebrow">Username</span>
              <input
                name="username"
                defaultValue={profile.username}
                placeholder="personal handle"
                className="input-ring mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)]"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="eyebrow">Avatar URL</span>
              <input
                name="avatar_url"
                defaultValue={profile.avatarUrl}
                placeholder="https://..."
                className="input-ring mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)]"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="eyebrow">Bio</span>
              <textarea
                name="bio"
                rows={5}
                defaultValue={profile.bio}
                placeholder="What areas of your life or work do you want this system to best represent?"
                className="input-ring mt-3 w-full resize-none rounded-[24px] border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)]"
              />
            </label>

            <label className="block">
              <span className="eyebrow">Timezone</span>
              <input
                name="timezone"
                defaultValue={profile.timezone}
                placeholder="America/La_Paz"
                className="input-ring mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-4 text-sm text-[var(--foreground)]"
              />
            </label>

            <label className="block">
              <span className="eyebrow">Language</span>
              <select
                name="locale"
                defaultValue={profile.locale}
                className="input-ring mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-3 py-4 text-sm text-[var(--foreground)]"
              >
                <option value="es">Spanish</option>
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
              These settings don&apos;t change your content, but they do affect how the system represents identity, timing, and context.
            </p>
            <SubmitButton pendingLabel="Saving..." className="rounded-full px-5">
              Save profile
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}
