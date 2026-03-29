-- =========================================================
-- LIFEOS SCHEMA FOR SUPABASE / POSTGRESQL
-- =========================================================

-- Recommended extensions
create extension if not exists pgcrypto;

-- =========================================================
-- ENUMS
-- =========================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'area_type') then
    create type area_type as enum ('life', 'work', 'health', 'learning', 'finance', 'relationships', 'personal', 'other');
  end if;

  if not exists (select 1 from pg_type where typname = 'project_status') then
    create type project_status as enum ('active', 'on_hold', 'completed', 'archived', 'cancelled');
  end if;

  if not exists (select 1 from pg_type where typname = 'task_status') then
    create type task_status as enum ('inbox', 'todo', 'in_progress', 'waiting', 'done', 'cancelled', 'archived');
  end if;

  if not exists (select 1 from pg_type where typname = 'task_priority') then
    create type task_priority as enum ('low', 'medium', 'high', 'urgent');
  end if;

  if not exists (select 1 from pg_type where typname = 'note_type') then
    create type note_type as enum ('plain', 'atomic', 'literature', 'meeting', 'journal', 'summary', 'idea', 'reference');
  end if;

  if not exists (select 1 from pg_type where typname = 'resource_type') then
    create type resource_type as enum ('link', 'pdf', 'image', 'video', 'book', 'paper', 'article', 'course', 'audio', 'file', 'other');
  end if;

  if not exists (select 1 from pg_type where typname = 'storage_mode') then
    create type storage_mode as enum ('internal', 'external');
  end if;

  if not exists (select 1 from pg_type where typname = 'preview_status') then
    create type preview_status as enum ('none', 'pending', 'ready', 'failed');
  end if;

  if not exists (select 1 from pg_type where typname = 'decision_status') then
    create type decision_status as enum ('open', 'validated', 'invalidated', 'mixed', 'superseded');
  end if;

  if not exists (select 1 from pg_type where typname = 'log_energy') then
    create type log_energy as enum ('very_low', 'low', 'medium', 'high', 'very_high');
  end if;

  if not exists (select 1 from pg_type where typname = 'relation_kind') then
    create type relation_kind as enum ('inspired_by', 'supports', 'blocks', 'references', 'derived_from', 'related_to');
  end if;
end $$;

-- =========================================================
-- UPDATED_AT TRIGGER FUNCTION
-- =========================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =========================================================
-- PROFILES
-- =========================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  username text unique,
  avatar_url text,
  bio text,
  timezone text default 'America/La_Paz',
  locale text default 'es',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- Auto-create profile on auth user creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- =========================================================
-- AREAS
-- =========================================================

create table if not exists public.areas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  type area_type not null default 'other',
  color text,
  icon text,
  sort_order integer default 0,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, name)
);

create index if not exists idx_areas_user_id on public.areas(user_id);

drop trigger if exists trg_areas_updated_at on public.areas;
create trigger trg_areas_updated_at
before update on public.areas
for each row execute function public.set_updated_at();

-- =========================================================
-- PROJECTS
-- =========================================================

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  area_id uuid references public.areas(id) on delete set null,
  title text not null,
  description text,
  status project_status not null default 'active',
  priority task_priority not null default 'medium',
  start_date date,
  target_date date,
  completed_at timestamptz,
  is_archived boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_projects_user_id on public.projects(user_id);
create index if not exists idx_projects_area_id on public.projects(area_id);
create index if not exists idx_projects_status on public.projects(status);

drop trigger if exists trg_projects_updated_at on public.projects;
create trigger trg_projects_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

-- =========================================================
-- TASKS
-- =========================================================

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  area_id uuid references public.areas(id) on delete set null,
  parent_task_id uuid references public.tasks(id) on delete cascade,
  title text not null,
  description text,
  status task_status not null default 'inbox',
  priority task_priority not null default 'medium',
  due_date timestamptz,
  scheduled_for timestamptz,
  completed_at timestamptz,
  estimated_minutes integer,
  actual_minutes integer,
  sort_order integer default 0,
  is_recurring boolean not null default false,
  recurrence_rule text,
  energy_required log_energy,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_tasks_user_id on public.tasks(user_id);
create index if not exists idx_tasks_project_id on public.tasks(project_id);
create index if not exists idx_tasks_area_id on public.tasks(area_id);
create index if not exists idx_tasks_status on public.tasks(status);
create index if not exists idx_tasks_due_date on public.tasks(due_date);

drop trigger if exists trg_tasks_updated_at on public.tasks;
create trigger trg_tasks_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

-- =========================================================
-- NOTES
-- =========================================================

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  area_id uuid references public.areas(id) on delete set null,
  title text not null,
  content text not null default '',
  type note_type not null default 'plain',
  summary text,
  is_favorite boolean not null default false,
  is_archived boolean not null default false,
  source_resource_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_notes_user_id on public.notes(user_id);
create index if not exists idx_notes_project_id on public.notes(project_id);
create index if not exists idx_notes_area_id on public.notes(area_id);
create index if not exists idx_notes_type on public.notes(type);

drop trigger if exists trg_notes_updated_at on public.notes;
create trigger trg_notes_updated_at
before update on public.notes
for each row execute function public.set_updated_at();

-- =========================================================
-- RESOURCES
-- =========================================================

create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  area_id uuid references public.areas(id) on delete set null,
  title text not null,
  description text,
  type resource_type not null default 'link',
  storage_mode storage_mode not null default 'external',
  source_provider text, -- google_drive, youtube, local_upload, web, etc
  external_url text,
  internal_path text,   -- path in Supabase Storage if internal
  mime_type text,
  file_size_bytes bigint,
  preview_status preview_status not null default 'none',
  thumbnail_url text,
  author text,
  publisher text,
  published_year integer,
  language text,
  isbn text,
  metadata jsonb not null default '{}'::jsonb,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (storage_mode = 'external' and external_url is not null)
    or
    (storage_mode = 'internal' and internal_path is not null)
  )
);

create index if not exists idx_resources_user_id on public.resources(user_id);
create index if not exists idx_resources_area_id on public.resources(area_id);
create index if not exists idx_resources_type on public.resources(type);
create index if not exists idx_resources_storage_mode on public.resources(storage_mode);

drop trigger if exists trg_resources_updated_at on public.resources;
create trigger trg_resources_updated_at
before update on public.resources
for each row execute function public.set_updated_at();

-- =========================================================
-- RESOURCE PREVIEWS
-- =========================================================

create table if not exists public.resource_previews (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid not null references public.resources(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  preview_url text,
  preview_type text, -- image, pdf_cover, embed, text_extract
  status preview_status not null default 'pending',
  generated_at timestamptz,
  error_message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_resource_previews_resource_id on public.resource_previews(resource_id);
create index if not exists idx_resource_previews_user_id on public.resource_previews(user_id);

drop trigger if exists trg_resource_previews_updated_at on public.resource_previews;
create trigger trg_resource_previews_updated_at
before update on public.resource_previews
for each row execute function public.set_updated_at();

-- =========================================================
-- TAGS
-- =========================================================

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  color text,
  description text,
  created_at timestamptz not null default now(),
  unique(user_id, name)
);

create index if not exists idx_tags_user_id on public.tags(user_id);

-- =========================================================
-- NOTE TAGS
-- =========================================================

create table if not exists public.note_tags (
  note_id uuid not null references public.notes(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (note_id, tag_id)
);

create index if not exists idx_note_tags_user_id on public.note_tags(user_id);

-- =========================================================
-- RESOURCE TAGS
-- =========================================================

create table if not exists public.resource_tags (
  resource_id uuid not null references public.resources(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (resource_id, tag_id)
);

create index if not exists idx_resource_tags_user_id on public.resource_tags(user_id);

-- =========================================================
-- TASK TAGS
-- =========================================================

create table if not exists public.task_tags (
  task_id uuid not null references public.tasks(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (task_id, tag_id)
);

create index if not exists idx_task_tags_user_id on public.task_tags(user_id);

-- =========================================================
-- PROJECT TAGS
-- =========================================================

create table if not exists public.project_tags (
  project_id uuid not null references public.projects(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (project_id, tag_id)
);

create index if not exists idx_project_tags_user_id on public.project_tags(user_id);

-- =========================================================
-- PROJECT RESOURCES
-- =========================================================

create table if not exists public.project_resources (
  project_id uuid not null references public.projects(id) on delete cascade,
  resource_id uuid not null references public.resources(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  relation relation_kind not null default 'references',
  created_at timestamptz not null default now(),
  primary key (project_id, resource_id)
);

create index if not exists idx_project_resources_user_id on public.project_resources(user_id);

-- =========================================================
-- NOTE RESOURCES
-- =========================================================

create table if not exists public.note_resources (
  note_id uuid not null references public.notes(id) on delete cascade,
  resource_id uuid not null references public.resources(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  relation relation_kind not null default 'references',
  created_at timestamptz not null default now(),
  primary key (note_id, resource_id)
);

create index if not exists idx_note_resources_user_id on public.note_resources(user_id);

-- =========================================================
-- TASK RESOURCES
-- =========================================================

create table if not exists public.task_resources (
  task_id uuid not null references public.tasks(id) on delete cascade,
  resource_id uuid not null references public.resources(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  relation relation_kind not null default 'references',
  created_at timestamptz not null default now(),
  primary key (task_id, resource_id)
);

create index if not exists idx_task_resources_user_id on public.task_resources(user_id);

-- =========================================================
-- NOTE RELATIONS (knowledge graph lite)
-- =========================================================

create table if not exists public.note_relations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  from_note_id uuid not null references public.notes(id) on delete cascade,
  to_note_id uuid not null references public.notes(id) on delete cascade,
  relation relation_kind not null default 'related_to',
  created_at timestamptz not null default now(),
  check (from_note_id <> to_note_id),
  unique (from_note_id, to_note_id, relation)
);

create index if not exists idx_note_relations_user_id on public.note_relations(user_id);

-- =========================================================
-- DAILY LOGS
-- =========================================================

create table if not exists public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  log_date date not null,
  mood integer check (mood between 1 and 5),
  energy log_energy,
  focus_score integer check (focus_score between 1 and 5),
  wins text,
  blockers text,
  reflections text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, log_date)
);

create index if not exists idx_daily_logs_user_id on public.daily_logs(user_id);
create index if not exists idx_daily_logs_log_date on public.daily_logs(log_date);

drop trigger if exists trg_daily_logs_updated_at on public.daily_logs;
create trigger trg_daily_logs_updated_at
before update on public.daily_logs
for each row execute function public.set_updated_at();

-- =========================================================
-- WEEKLY REVIEWS
-- =========================================================

create table if not exists public.weekly_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  week_start date not null,
  week_end date not null,
  summary text,
  wins text,
  blockers text,
  lessons text,
  next_focus text,
  energy_avg numeric(3,2),
  mood_avg numeric(3,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, week_start, week_end)
);

create index if not exists idx_weekly_reviews_user_id on public.weekly_reviews(user_id);
create index if not exists idx_weekly_reviews_week_start on public.weekly_reviews(week_start);

drop trigger if exists trg_weekly_reviews_updated_at on public.weekly_reviews;
create trigger trg_weekly_reviews_updated_at
before update on public.weekly_reviews
for each row execute function public.set_updated_at();

-- =========================================================
-- DECISIONS
-- =========================================================

create table if not exists public.decisions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  area_id uuid references public.areas(id) on delete set null,
  title text not null,
  context text,
  options_considered text,
  chosen_option text,
  reasoning text,
  expected_outcome text,
  review_date date,
  status decision_status not null default 'open',
  outcome_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_decisions_user_id on public.decisions(user_id);
create index if not exists idx_decisions_project_id on public.decisions(project_id);
create index if not exists idx_decisions_area_id on public.decisions(area_id);
create index if not exists idx_decisions_review_date on public.decisions(review_date);

drop trigger if exists trg_decisions_updated_at on public.decisions;
create trigger trg_decisions_updated_at
before update on public.decisions
for each row execute function public.set_updated_at();

-- =========================================================
-- DECISION RESOURCES
-- =========================================================

create table if not exists public.decision_resources (
  decision_id uuid not null references public.decisions(id) on delete cascade,
  resource_id uuid not null references public.resources(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (decision_id, resource_id)
);

create index if not exists idx_decision_resources_user_id on public.decision_resources(user_id);

-- =========================================================
-- DECISION NOTES
-- =========================================================

create table if not exists public.decision_notes (
  decision_id uuid not null references public.decisions(id) on delete cascade,
  note_id uuid not null references public.notes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (decision_id, note_id)
);

create index if not exists idx_decision_notes_user_id on public.decision_notes(user_id);

-- =========================================================
-- FOREIGN KEY FOR notes.source_resource_id
-- =========================================================

do $$
begin
  if not exists (
    select 1
    from information_schema.table_constraints
    where constraint_name = 'notes_source_resource_id_fkey'
      and table_name = 'notes'
      and table_schema = 'public'
  ) then
    alter table public.notes
      add constraint notes_source_resource_id_fkey
      foreign key (source_resource_id)
      references public.resources(id)
      on delete set null;
  end if;
end $$;

-- =========================================================
-- ENABLE ROW LEVEL SECURITY
-- =========================================================

alter table public.profiles enable row level security;
alter table public.areas enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.notes enable row level security;
alter table public.resources enable row level security;
alter table public.resource_previews enable row level security;
alter table public.tags enable row level security;
alter table public.note_tags enable row level security;
alter table public.resource_tags enable row level security;
alter table public.task_tags enable row level security;
alter table public.project_tags enable row level security;
alter table public.project_resources enable row level security;
alter table public.note_resources enable row level security;
alter table public.task_resources enable row level security;
alter table public.note_relations enable row level security;
alter table public.daily_logs enable row level security;
alter table public.weekly_reviews enable row level security;
alter table public.decisions enable row level security;
alter table public.decision_resources enable row level security;
alter table public.decision_notes enable row level security;

-- =========================================================
-- RLS POLICIES
-- =========================================================

-- Profiles
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles
for insert
with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- Generic helper macro pattern repeated manually for all user-owned tables

-- Areas
drop policy if exists "Users manage own areas" on public.areas;
create policy "Users manage own areas"
on public.areas
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Projects
drop policy if exists "Users manage own projects" on public.projects;
create policy "Users manage own projects"
on public.projects
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Tasks
drop policy if exists "Users manage own tasks" on public.tasks;
create policy "Users manage own tasks"
on public.tasks
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Notes
drop policy if exists "Users manage own notes" on public.notes;
create policy "Users manage own notes"
on public.notes
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Resources
drop policy if exists "Users manage own resources" on public.resources;
create policy "Users manage own resources"
on public.resources
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Resource previews
drop policy if exists "Users manage own resource previews" on public.resource_previews;
create policy "Users manage own resource previews"
on public.resource_previews
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Tags
drop policy if exists "Users manage own tags" on public.tags;
create policy "Users manage own tags"
on public.tags
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Note tags
drop policy if exists "Users manage own note tags" on public.note_tags;
create policy "Users manage own note tags"
on public.note_tags
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Resource tags
drop policy if exists "Users manage own resource tags" on public.resource_tags;
create policy "Users manage own resource tags"
on public.resource_tags
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Task tags
drop policy if exists "Users manage own task tags" on public.task_tags;
create policy "Users manage own task tags"
on public.task_tags
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Project tags
drop policy if exists "Users manage own project tags" on public.project_tags;
create policy "Users manage own project tags"
on public.project_tags
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Project resources
drop policy if exists "Users manage own project resources" on public.project_resources;
create policy "Users manage own project resources"
on public.project_resources
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Note resources
drop policy if exists "Users manage own note resources" on public.note_resources;
create policy "Users manage own note resources"
on public.note_resources
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Task resources
drop policy if exists "Users manage own task resources" on public.task_resources;
create policy "Users manage own task resources"
on public.task_resources
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Note relations
drop policy if exists "Users manage own note relations" on public.note_relations;
create policy "Users manage own note relations"
on public.note_relations
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Daily logs
drop policy if exists "Users manage own daily logs" on public.daily_logs;
create policy "Users manage own daily logs"
on public.daily_logs
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Weekly reviews
drop policy if exists "Users manage own weekly reviews" on public.weekly_reviews;
create policy "Users manage own weekly reviews"
on public.weekly_reviews
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Decisions
drop policy if exists "Users manage own decisions" on public.decisions;
create policy "Users manage own decisions"
on public.decisions
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Decision resources
drop policy if exists "Users manage own decision resources" on public.decision_resources;
create policy "Users manage own decision resources"
on public.decision_resources
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Decision notes
drop policy if exists "Users manage own decision notes" on public.decision_notes;
create policy "Users manage own decision notes"
on public.decision_notes
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);