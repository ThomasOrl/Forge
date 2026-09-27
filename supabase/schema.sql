-- ============================================================
-- Forge — SCHEMA SUPABASE COMPLET
-- ============================================================

-- 1. PROFILES (lié à auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  username text not null,
  first_name text,
  avatar_url text,
  language text not null default 'fr' check (language in ('fr','en','es','it')),
  theme text not null default 'dark' check (theme in ('dark','light','system')),
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. EXERCISES (bibliothèque personnelle)
create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  muscle_group text not null,
  description text,
  image_url text,
  is_favorite boolean not null default false,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

-- 3. WORKOUTS (séances)
create table public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  date date not null default current_date,
  started_at timestamptz default now(),
  finished_at timestamptz,
  duration_seconds integer not null default 0
  check (duration_seconds >= 0),
  total_volume numeric not null default 0
  check (total_volume >= 0),
  status text not null default 'in_progress' check (status in ('in_progress','completed')),
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

-- 4. WORKOUT_EXERCISES (liaison séance <-> exercice)
create table public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  "order" integer not null
  check ("order" >= 0),
  created_at timestamptz not null default now()
);

-- 5. SETS (séries)
create table public.sets (
  id uuid primary key default gen_random_uuid(),
  workout_exercise_id uuid not null references public.workout_exercises(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  set_number integer not null
  check (set_number > 0),
  weight numeric not null
  check (weight >= 0),
  repetitions integer not null
  check (repetitions >= 0),
  created_at timestamptz not null default now()
);

-- 6. PERSONAL RECORDS (préparation future, calculable aussi à la volée)
create table public.personal_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  weight numeric not null
  check (weight >= 0),
  repetitions integer not null
  check (repetitions >= 0),
  achieved_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
-- 7. MENSTRUAL CYCLES
create table public.menstrual_cycles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  start_date date not null,
  end_date date,
  created_at timestamptz not null default now(),

  constraint menstrual_cycles_valid_dates
    check (end_date is null or end_date >= start_date)
);

create index idx_menstrual_cycles_user_date
  on public.menstrual_cycles(user_id, start_date desc);

alter table public.menstrual_cycles enable row level security;

create policy "Users can view their own menstrual cycles"
  on public.menstrual_cycles
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own menstrual cycles"
  on public.menstrual_cycles
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own menstrual cycles"
  on public.menstrual_cycles
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own menstrual cycles"
  on public.menstrual_cycles
  for delete
  using (auth.uid() = user_id);

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_exercises_user on public.exercises(user_id);
create index idx_workouts_user on public.workouts(user_id);
create index idx_workouts_date on public.workouts(user_id, date desc);
create index idx_workout_exercises_workout on public.workout_exercises(workout_id);
create index idx_workout_exercises_user on public.workout_exercises(user_id);
create index idx_sets_workout_exercise on public.sets(workout_exercise_id);
create index idx_sets_user on public.sets(user_id);
create index idx_pr_user_exercise on public.personal_records(user_id, exercise_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles enable row level security;
alter table public.exercises enable row level security;
alter table public.workouts enable row level security;
alter table public.workout_exercises enable row level security;
alter table public.sets enable row level security;
alter table public.personal_records enable row level security;

-- PROFILES policies
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);

-- EXERCISES policies
create policy "exercises_select_own" on public.exercises for select using (auth.uid() = user_id);
create policy "exercises_insert_own" on public.exercises for insert with check (auth.uid() = user_id);
create policy "exercises_update_own" on public.exercises for update using (auth.uid() = user_id);
create policy "exercises_delete_own" on public.exercises for delete using (auth.uid() = user_id);

-- WORKOUTS policies
create policy "workouts_select_own" on public.workouts for select using (auth.uid() = user_id);
create policy "workouts_insert_own" on public.workouts for insert with check (auth.uid() = user_id);
create policy "workouts_update_own" on public.workouts for update using (auth.uid() = user_id);
create policy "workouts_delete_own" on public.workouts for delete using (auth.uid() = user_id);

-- WORKOUT_EXERCISES policies

create policy "we_select_own"
on public.workout_exercises
for select
using (
  auth.uid() = user_id
  and exists (
    select 1
    from public.workouts w
    where w.id = workout_exercises.workout_id
      and w.user_id = auth.uid()
  )
  and exists (
    select 1
    from public.exercises e
    where e.id = workout_exercises.exercise_id
      and e.user_id = auth.uid()
  )
);

create policy "we_insert_own"
on public.workout_exercises
for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.workouts w
    where w.id = workout_id
      and w.user_id = auth.uid()
  )
  and exists (
    select 1
    from public.exercises e
    where e.id = exercise_id
      and e.user_id = auth.uid()
  )
);

create policy "we_update_own"
on public.workout_exercises
for update
using (
  auth.uid() = user_id
  and exists (
    select 1
    from public.workouts w
    where w.id = workout_exercises.workout_id
      and w.user_id = auth.uid()
  )
  and exists (
    select 1
    from public.exercises e
    where e.id = workout_exercises.exercise_id
      and e.user_id = auth.uid()
  )
)
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.workouts w
    where w.id = workout_id
      and w.user_id = auth.uid()
  )
  and exists (
    select 1
    from public.exercises e
    where e.id = exercise_id
      and e.user_id = auth.uid()
  )
);

create policy "we_delete_own"
on public.workout_exercises
for delete
using (
  auth.uid() = user_id
  and exists (
    select 1
    from public.workouts w
    where w.id = workout_exercises.workout_id
      and w.user_id = auth.uid()
  )
  and exists (
    select 1
    from public.exercises e
    where e.id = workout_exercises.exercise_id
      and e.user_id = auth.uid()
  )
);

-- SETS policies

create policy "sets_select_own"
on public.sets
for select
using (
  auth.uid() = user_id
  and exists (
    select 1
    from public.workout_exercises we
    where we.id = sets.workout_exercise_id
      and we.user_id = auth.uid()
  )
);

create policy "sets_insert_own"
on public.sets
for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.workout_exercises we
    where we.id = workout_exercise_id
      and we.user_id = auth.uid()
  )
);

create policy "sets_update_own"
on public.sets
for update
using (
  auth.uid() = user_id
  and exists (
    select 1
    from public.workout_exercises we
    where we.id = sets.workout_exercise_id
      and we.user_id = auth.uid()
  )
)
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.workout_exercises we
    where we.id = workout_exercise_id
      and we.user_id = auth.uid()
  )
);

create policy "sets_delete_own"
on public.sets
for delete
using (
  auth.uid() = user_id
  and exists (
    select 1
    from public.workout_exercises we
    where we.id = sets.workout_exercise_id
      and we.user_id = auth.uid()
  )
);

-- PERSONAL_RECORDS policies

create policy "pr_select_own"
on public.personal_records
for select
using (
  auth.uid() = user_id
  and exists (
    select 1
    from public.exercises e
    where e.id = personal_records.exercise_id
      and e.user_id = auth.uid()
  )
);

create policy "pr_insert_own"
on public.personal_records
for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.exercises e
    where e.id = exercise_id
      and e.user_id = auth.uid()
  )
);

create policy "pr_update_own"
on public.personal_records
for update
using (
  auth.uid() = user_id
  and exists (
    select 1
    from public.exercises e
    where e.id = personal_records.exercise_id
      and e.user_id = auth.uid()
  )
)
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.exercises e
    where e.id = exercise_id
      and e.user_id = auth.uid()
  )
);

create policy "pr_delete_own"
on public.personal_records
for delete
using (
  auth.uid() = user_id
  and exists (
    select 1
    from public.exercises e
    where e.id = personal_records.exercise_id
      and e.user_id = auth.uid()
  )
);

-- ============================================================
-- TRIGGER: création automatique du profil à l'inscription
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
as $$
begin
  insert into public.profiles (
    id,
    email,
    username,
    first_name,
    language,
    theme
  )
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'username',
      split_part(new.email, '@', 1)
    ),
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    'fr',
    'dark'
  );

  return new;
end;
$$
language plpgsql
security definer
set search_path = public, pg_temp;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- TRIGGER: updated_at automatique sur profiles
-- ============================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- FONCTION: calcul et mise à jour du volume total d'une séance
-- ============================================================
create or replace function public.recalculate_workout_volume(
  p_workout_id uuid
)
returns void
as $$
begin
  update public.workouts w
  set total_volume = coalesce((
    select sum(s.weight * s.repetitions)
    from public.sets s
    join public.workout_exercises we
      on we.id = s.workout_exercise_id
    where we.workout_id = p_workout_id
  ), 0)
  where w.id = p_workout_id;
end;
$$
language plpgsql
security definer
set search_path = public, pg_temp;

-- Trigger pour recalculer le volume automatiquement après modif des sets
create or replace function public.trg_recalc_volume()
returns trigger
as $$
declare
  v_old_workout_id uuid;
  v_new_workout_id uuid;
begin

  -- INSERT
  if tg_op = 'INSERT' then

    select workout_id
      into v_new_workout_id
    from public.workout_exercises
    where id = new.workout_exercise_id;

    if v_new_workout_id is not null then
      perform public.recalculate_workout_volume(v_new_workout_id);
    end if;

  -- DELETE
  elsif tg_op = 'DELETE' then

    select workout_id
      into v_old_workout_id
    from public.workout_exercises
    where id = old.workout_exercise_id;

    if v_old_workout_id is not null then
      perform public.recalculate_workout_volume(v_old_workout_id);
    end if;

  -- UPDATE
  elsif tg_op = 'UPDATE' then

    select workout_id
      into v_old_workout_id
    from public.workout_exercises
    where id = old.workout_exercise_id;

    select workout_id
      into v_new_workout_id
    from public.workout_exercises
    where id = new.workout_exercise_id;

    if v_old_workout_id is not null then
      perform public.recalculate_workout_volume(v_old_workout_id);
    end if;

    if v_new_workout_id is not null
       and v_new_workout_id is distinct from v_old_workout_id then
      perform public.recalculate_workout_volume(v_new_workout_id);
    end if;

  end if;

  return null;
end;
$$
language plpgsql
security definer
set search_path = public, pg_temp;

create trigger trg_sets_volume_recalc
  after insert or update or delete on public.sets
  for each row execute procedure public.trg_recalc_volume();

-- ============================================================
-- SÉCURITÉ : fonctions SECURITY DEFINER
-- ============================================================

revoke execute on function public.handle_new_user()
  from public;

revoke execute on function public.recalculate_workout_volume(uuid)
  from public;

revoke execute on function public.trg_recalc_volume()
  from public;
revoke execute on function public.set_updated_at()
  from public;

-- ============================================================
-- STORAGE : avatars
-- Le bucket est public pour afficher les URL d'avatar dans l'application.
-- Les écritures et remplacements restent limités au dossier de l'utilisateur.
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "avatars_read_own" on storage.objects;
create policy "avatars_read_own"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "avatars_insert_own" on storage.objects;
create policy "avatars_insert_own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "avatars_update_own" on storage.objects;
create policy "avatars_update_own"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
