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

-- =========================================================
-- LIFEOS EXTENSIONS: JOURNAL + FINANCE + WORK + CONTACTS
-- additive migration for existing schema
-- =========================================================

create extension if not exists pgcrypto;

-- =========================================================
-- ENUMS
-- =========================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'journal_type') then
    create type journal_type as enum (
      'daily',
      'reflection',
      'gratitude',
      'learning',
      'worklog',
      'travel',
      'health',
      'freeform'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'account_type') then
    create type account_type as enum (
      'cash',
      'checking',
      'savings',
      'credit_card',
      'investment',
      'crypto',
      'ewallet',
      'receivable',
      'payable',
      'other'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'finance_category_kind') then
    create type finance_category_kind as enum (
      'income',
      'expense',
      'transfer',
      'both'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'transaction_direction') then
    create type transaction_direction as enum (
      'inflow',
      'outflow',
      'transfer'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'transaction_status') then
    create type transaction_status as enum (
      'pending',
      'posted',
      'reconciled',
      'void'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'contact_kind') then
    create type contact_kind as enum (
      'person',
      'company'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'business_status') then
    create type business_status as enum (
      'lead',
      'active',
      'inactive',
      'archived'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'engagement_type') then
    create type engagement_type as enum (
      'full_time',
      'part_time',
      'freelance',
      'consulting',
      'contract',
      'retainer',
      'business',
      'other'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'engagement_status') then
    create type engagement_status as enum (
      'lead',
      'prospecting',
      'proposal_sent',
      'negotiation',
      'active',
      'paused',
      'completed',
      'cancelled',
      'lost'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'payment_model') then
    create type payment_model as enum (
      'hourly',
      'fixed',
      'retainer',
      'salary',
      'commission',
      'mixed',
      'other'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'invoice_status') then
    create type invoice_status as enum (
      'draft',
      'sent',
      'partially_paid',
      'paid',
      'overdue',
      'void'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'interaction_type') then
    create type interaction_type as enum (
      'email',
      'call',
      'meeting',
      'message',
      'proposal',
      'follow_up',
      'networking',
      'other'
    );
  end if;
end $$;

-- =========================================================
-- JOURNALS
-- =========================================================

create table if not exists public.journals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  slug text,
  description text,
  color text,
  icon text,
  is_default boolean not null default false,
  is_archived boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name),
  unique (user_id, slug)
);

create index if not exists idx_journals_user_id on public.journals(user_id);

drop trigger if exists trg_journals_updated_at on public.journals;
create trigger trg_journals_updated_at
before update on public.journals
for each row execute function public.set_updated_at();

create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  journal_id uuid not null references public.journals(id) on delete cascade,
  area_id uuid references public.areas(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  daily_log_id uuid references public.daily_logs(id) on delete set null,
  title text,
  content text not null default '',
  entry_type journal_type not null default 'freeform',
  entry_date date not null default current_date,
  mood integer check (mood between 1 and 5),
  energy log_energy,
  weather text,
  location text,
  is_private boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_journal_entries_user_id on public.journal_entries(user_id);
create index if not exists idx_journal_entries_journal_id on public.journal_entries(journal_id);
create index if not exists idx_journal_entries_project_id on public.journal_entries(project_id);
create index if not exists idx_journal_entries_area_id on public.journal_entries(area_id);
create index if not exists idx_journal_entries_entry_date on public.journal_entries(entry_date);

drop trigger if exists trg_journal_entries_updated_at on public.journal_entries;
create trigger trg_journal_entries_updated_at
before update on public.journal_entries
for each row execute function public.set_updated_at();

create table if not exists public.journal_entry_tags (
  journal_entry_id uuid not null references public.journal_entries(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (journal_entry_id, tag_id)
);

create index if not exists idx_journal_entry_tags_user_id on public.journal_entry_tags(user_id);

create table if not exists public.journal_entry_resources (
  journal_entry_id uuid not null references public.journal_entries(id) on delete cascade,
  resource_id uuid not null references public.resources(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (journal_entry_id, resource_id)
);

create index if not exists idx_journal_entry_resources_user_id on public.journal_entry_resources(user_id);

-- =========================================================
-- CONTACTS + BUSINESSES
-- =========================================================

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  legal_name text,
  website text,
  industry text,
  country text,
  city text,
  tax_id text,
  default_currency text not null default 'USD',
  status business_status not null default 'lead',
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);

create index if not exists idx_businesses_user_id on public.businesses(user_id);
create index if not exists idx_businesses_status on public.businesses(status);

drop trigger if exists trg_businesses_updated_at on public.businesses;
create trigger trg_businesses_updated_at
before update on public.businesses
for each row execute function public.set_updated_at();

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete set null,
  kind contact_kind not null default 'person',
  full_name text not null,
  display_name text,
  job_title text,
  primary_email text,
  primary_phone text,
  whatsapp text,
  linkedin_url text,
  website text,
  country text,
  city text,
  notes text,
  is_favorite boolean not null default false,
  is_archived boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_contacts_user_id on public.contacts(user_id);
create index if not exists idx_contacts_business_id on public.contacts(business_id);
create index if not exists idx_contacts_primary_email on public.contacts(primary_email);

drop trigger if exists trg_contacts_updated_at on public.contacts;
create trigger trg_contacts_updated_at
before update on public.contacts
for each row execute function public.set_updated_at();

create table if not exists public.contact_interactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete set null,
  interaction_type interaction_type not null default 'other',
  subject text,
  notes text,
  interaction_at timestamptz not null default now(),
  next_follow_up_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_contact_interactions_user_id on public.contact_interactions(user_id);
create index if not exists idx_contact_interactions_contact_id on public.contact_interactions(contact_id);
create index if not exists idx_contact_interactions_business_id on public.contact_interactions(business_id);
create index if not exists idx_contact_interactions_interaction_at on public.contact_interactions(interaction_at);
create index if not exists idx_contact_interactions_followup on public.contact_interactions(next_follow_up_at);

drop trigger if exists trg_contact_interactions_updated_at on public.contact_interactions;
create trigger trg_contact_interactions_updated_at
before update on public.contact_interactions
for each row execute function public.set_updated_at();

-- =========================================================
-- WORK / REVENUE SOURCES / ENGAGEMENTS
-- =========================================================

create table if not exists public.work_engagements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete set null,
  primary_contact_id uuid references public.contacts(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  area_id uuid references public.areas(id) on delete set null,
  title text not null,
  description text,
  engagement_type engagement_type not null default 'freelance',
  status engagement_status not null default 'lead',
  payment_model payment_model not null default 'fixed',
  currency text not null default 'USD',
  hourly_rate numeric(12,2),
  fixed_fee numeric(12,2),
  recurring_fee numeric(12,2),
  estimated_value numeric(12,2),
  booked_value numeric(12,2),
  start_date date,
  end_date date,
  proposal_sent_at timestamptz,
  won_at timestamptz,
  lost_at timestamptz,
  last_activity_at timestamptz,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_work_engagements_user_id on public.work_engagements(user_id);
create index if not exists idx_work_engagements_business_id on public.work_engagements(business_id);
create index if not exists idx_work_engagements_contact_id on public.work_engagements(primary_contact_id);
create index if not exists idx_work_engagements_project_id on public.work_engagements(project_id);
create index if not exists idx_work_engagements_status on public.work_engagements(status);
create index if not exists idx_work_engagements_type on public.work_engagements(engagement_type);

drop trigger if exists trg_work_engagements_updated_at on public.work_engagements;
create trigger trg_work_engagements_updated_at
before update on public.work_engagements
for each row execute function public.set_updated_at();

-- =========================================================
-- FINANCE
-- =========================================================

create table if not exists public.financial_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  account_type account_type not null default 'checking',
  currency text not null default 'USD',
  institution_name text,
  account_last4 text,
  credit_limit numeric(12,2),
  opening_balance numeric(14,2) not null default 0,
  current_balance_manual numeric(14,2),
  is_active boolean not null default true,
  is_archived boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);

create index if not exists idx_financial_accounts_user_id on public.financial_accounts(user_id);
create index if not exists idx_financial_accounts_type on public.financial_accounts(account_type);

drop trigger if exists trg_financial_accounts_updated_at on public.financial_accounts;
create trigger trg_financial_accounts_updated_at
before update on public.financial_accounts
for each row execute function public.set_updated_at();

create table if not exists public.financial_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  parent_category_id uuid references public.financial_categories(id) on delete set null,
  name text not null,
  kind finance_category_kind not null default 'expense',
  color text,
  icon text,
  system_key text,
  sort_order integer not null default 0,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name, kind)
);

create index if not exists idx_financial_categories_user_id on public.financial_categories(user_id);
create index if not exists idx_financial_categories_parent on public.financial_categories(parent_category_id);

drop trigger if exists trg_financial_categories_updated_at on public.financial_categories;
create trigger trg_financial_categories_updated_at
before update on public.financial_categories
for each row execute function public.set_updated_at();

create table if not exists public.financial_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  account_id uuid not null references public.financial_accounts(id) on delete cascade,
  category_id uuid references public.financial_categories(id) on delete set null,
  business_id uuid references public.businesses(id) on delete set null,
  contact_id uuid references public.contacts(id) on delete set null,
  engagement_id uuid references public.work_engagements(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  direction transaction_direction not null,
  status transaction_status not null default 'posted',
  amount numeric(14,2) not null check (amount >= 0),
  currency text not null default 'USD',
  description text not null,
  notes text,
  occurred_at timestamptz not null default now(),
  posted_at timestamptz,
  transfer_group_id uuid,
  external_reference text,
  is_recurring boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_financial_transactions_user_id on public.financial_transactions(user_id);
create index if not exists idx_financial_transactions_account_id on public.financial_transactions(account_id);
create index if not exists idx_financial_transactions_category_id on public.financial_transactions(category_id);
create index if not exists idx_financial_transactions_business_id on public.financial_transactions(business_id);
create index if not exists idx_financial_transactions_contact_id on public.financial_transactions(contact_id);
create index if not exists idx_financial_transactions_engagement_id on public.financial_transactions(engagement_id);
create index if not exists idx_financial_transactions_project_id on public.financial_transactions(project_id);
create index if not exists idx_financial_transactions_occurred_at on public.financial_transactions(occurred_at);
create index if not exists idx_financial_transactions_direction on public.financial_transactions(direction);
create index if not exists idx_financial_transactions_transfer_group_id on public.financial_transactions(transfer_group_id);

drop trigger if exists trg_financial_transactions_updated_at on public.financial_transactions;
create trigger trg_financial_transactions_updated_at
before update on public.financial_transactions
for each row execute function public.set_updated_at();

create table if not exists public.account_balance_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  account_id uuid not null references public.financial_accounts(id) on delete cascade,
  snapshot_date date not null,
  balance numeric(14,2) not null,
  source text default 'manual',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (account_id, snapshot_date)
);

create index if not exists idx_account_balance_snapshots_user_id on public.account_balance_snapshots(user_id);
create index if not exists idx_account_balance_snapshots_account_id on public.account_balance_snapshots(account_id);
create index if not exists idx_account_balance_snapshots_snapshot_date on public.account_balance_snapshots(snapshot_date);

drop trigger if exists trg_account_balance_snapshots_updated_at on public.account_balance_snapshots;
create trigger trg_account_balance_snapshots_updated_at
before update on public.account_balance_snapshots
for each row execute function public.set_updated_at();

create table if not exists public.recurring_financial_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  account_id uuid references public.financial_accounts(id) on delete set null,
  category_id uuid references public.financial_categories(id) on delete set null,
  business_id uuid references public.businesses(id) on delete set null,
  engagement_id uuid references public.work_engagements(id) on delete set null,
  direction transaction_direction not null,
  amount numeric(14,2) not null check (amount >= 0),
  currency text not null default 'USD',
  description text not null,
  cron_like_rule text,
  next_run_at timestamptz,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_recurring_financial_rules_user_id on public.recurring_financial_rules(user_id);
create index if not exists idx_recurring_financial_rules_next_run_at on public.recurring_financial_rules(next_run_at);

drop trigger if exists trg_recurring_financial_rules_updated_at on public.recurring_financial_rules;
create trigger trg_recurring_financial_rules_updated_at
before update on public.recurring_financial_rules
for each row execute function public.set_updated_at();

-- =========================================================
-- INVOICES
-- =========================================================

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete set null,
  contact_id uuid references public.contacts(id) on delete set null,
  engagement_id uuid references public.work_engagements(id) on delete set null,
  invoice_number text not null,
  status invoice_status not null default 'draft',
  currency text not null default 'USD',
  issue_date date not null default current_date,
  due_date date,
  subtotal numeric(14,2) not null default 0,
  tax_amount numeric(14,2) not null default 0,
  total_amount numeric(14,2) not null default 0,
  amount_paid numeric(14,2) not null default 0,
  balance_due numeric(14,2) not null default 0,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, invoice_number)
);

create index if not exists idx_invoices_user_id on public.invoices(user_id);
create index if not exists idx_invoices_business_id on public.invoices(business_id);
create index if not exists idx_invoices_contact_id on public.invoices(contact_id);
create index if not exists idx_invoices_engagement_id on public.invoices(engagement_id);
create index if not exists idx_invoices_status on public.invoices(status);
create index if not exists idx_invoices_due_date on public.invoices(due_date);

drop trigger if exists trg_invoices_updated_at on public.invoices;
create trigger trg_invoices_updated_at
before update on public.invoices
for each row execute function public.set_updated_at();

create table if not exists public.invoice_line_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  description text not null,
  quantity numeric(12,2) not null default 1,
  unit_price numeric(14,2) not null default 0,
  line_total numeric(14,2) not null default 0,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_invoice_line_items_invoice_id on public.invoice_line_items(invoice_id);
create index if not exists idx_invoice_line_items_user_id on public.invoice_line_items(user_id);

drop trigger if exists trg_invoice_line_items_updated_at on public.invoice_line_items;
create trigger trg_invoice_line_items_updated_at
before update on public.invoice_line_items
for each row execute function public.set_updated_at();

create table if not exists public.invoice_transaction_links (
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  transaction_id uuid not null references public.financial_transactions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount_applied numeric(14,2) not null default 0,
  created_at timestamptz not null default now(),
  primary key (invoice_id, transaction_id)
);

create index if not exists idx_invoice_transaction_links_user_id on public.invoice_transaction_links(user_id);

-- =========================================================
-- OPTIONAL SEEDS: DEFAULT JOURNAL + FINANCE AREA
-- safe inserts
-- =========================================================

insert into public.journals (user_id, name, slug, description, is_default)
select p.id, 'Personal Journal', 'personal-journal', 'Main personal journal', true
from public.profiles p
where not exists (
  select 1 from public.journals j
  where j.user_id = p.id and j.is_default = true
);

insert into public.areas (user_id, name, description, type, icon, color)
select p.id, 'Finance', 'Personal finances and money management', 'finance', 'wallet', '#22c55e'
from public.profiles p
where not exists (
  select 1 from public.areas a
  where a.user_id = p.id and lower(a.name) = 'finance'
);

-- =========================================================
-- ENABLE RLS
-- =========================================================

alter table public.journals enable row level security;
alter table public.journal_entries enable row level security;
alter table public.journal_entry_tags enable row level security;
alter table public.journal_entry_resources enable row level security;
alter table public.businesses enable row level security;
alter table public.contacts enable row level security;
alter table public.contact_interactions enable row level security;
alter table public.work_engagements enable row level security;
alter table public.financial_accounts enable row level security;
alter table public.financial_categories enable row level security;
alter table public.financial_transactions enable row level security;
alter table public.account_balance_snapshots enable row level security;
alter table public.recurring_financial_rules enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_line_items enable row level security;
alter table public.invoice_transaction_links enable row level security;

-- =========================================================
-- RLS POLICIES
-- =========================================================

drop policy if exists "Users manage own journals" on public.journals;
create policy "Users manage own journals"
on public.journals
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage own journal entries" on public.journal_entries;
create policy "Users manage own journal entries"
on public.journal_entries
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage own journal entry tags" on public.journal_entry_tags;
create policy "Users manage own journal entry tags"
on public.journal_entry_tags
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage own journal entry resources" on public.journal_entry_resources;
create policy "Users manage own journal entry resources"
on public.journal_entry_resources
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage own businesses" on public.businesses;
create policy "Users manage own businesses"
on public.businesses
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage own contacts" on public.contacts;
create policy "Users manage own contacts"
on public.contacts
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage own contact interactions" on public.contact_interactions;
create policy "Users manage own contact interactions"
on public.contact_interactions
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage own work engagements" on public.work_engagements;
create policy "Users manage own work engagements"
on public.work_engagements
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage own financial accounts" on public.financial_accounts;
create policy "Users manage own financial accounts"
on public.financial_accounts
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage own financial categories" on public.financial_categories;
create policy "Users manage own financial categories"
on public.financial_categories
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage own financial transactions" on public.financial_transactions;
create policy "Users manage own financial transactions"
on public.financial_transactions
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage own account balance snapshots" on public.account_balance_snapshots;
create policy "Users manage own account balance snapshots"
on public.account_balance_snapshots
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage own recurring financial rules" on public.recurring_financial_rules;
create policy "Users manage own recurring financial rules"
on public.recurring_financial_rules
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage own invoices" on public.invoices;
create policy "Users manage own invoices"
on public.invoices
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage own invoice line items" on public.invoice_line_items;
create policy "Users manage own invoice line items"
on public.invoice_line_items
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage own invoice transaction links" on public.invoice_transaction_links;
create policy "Users manage own invoice transaction links"
on public.invoice_transaction_links
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);