-- Focus/Space: tasks table. Run once in Supabase → SQL Editor.
create table if not exists public.tasks (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  text text not null check (char_length(text) between 1 and 500),
  done boolean not null default false,
  active boolean not null default false,
  created_at timestamptz not null default now()
);

-- Added later: long notes for a task. Safe to run again.
alter table public.tasks add column if not exists description text not null default '' check (char_length(description) <= 5000);

create index if not exists tasks_user_id_idx on public.tasks (user_id);

alter table public.tasks enable row level security;

-- Each policy is dropped first so the whole file can be run again.
drop policy if exists "tasks: select own" on public.tasks;
drop policy if exists "tasks: insert own" on public.tasks;
drop policy if exists "tasks: update own" on public.tasks;
drop policy if exists "tasks: delete own" on public.tasks;
create policy "tasks: select own" on public.tasks for select using (user_id = auth.uid());
create policy "tasks: insert own" on public.tasks for insert with check (user_id = auth.uid());
create policy "tasks: update own" on public.tasks for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "tasks: delete own" on public.tasks for delete using (user_id = auth.uid());
