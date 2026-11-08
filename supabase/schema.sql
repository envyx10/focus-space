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
alter table public.tasks add column if not exists description text not null default '' check (char_length(description) <= 20000);

-- Added later: the order the user dragged the tasks into. Safe to run again.
alter table public.tasks add column if not exists position double precision;

-- Added later: high, medium or low; null for none. Safe to run again.
alter table public.tasks add column if not exists priority text check (priority in ('high', 'medium', 'low'));

create index if not exists tasks_user_id_idx on public.tasks (user_id);

alter table public.tasks enable row level security;

-- Each policy is dropped first so the whole file can be run again.
drop policy if exists "tasks: select own" on public.tasks;
drop policy if exists "tasks: insert own" on public.tasks;
drop policy if exists "tasks: update own" on public.tasks;
drop policy if exists "tasks: delete own" on public.tasks;
-- (select auth.uid()) is evaluated once per query instead of once per row.
create policy "tasks: select own" on public.tasks for select using (user_id = (select auth.uid()));
create policy "tasks: insert own" on public.tasks for insert with check (user_id = (select auth.uid()));
create policy "tasks: update own" on public.tasks for update using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "tasks: delete own" on public.tasks for delete using (user_id = (select auth.uid()));

-- Added later: at most 2000 tasks per account, so one account can't fill the database. Safe to run again.
-- The app upserts, and a BEFORE INSERT trigger also fires for an upsert that ends up updating, so an existing id is let through.
-- shortcut: two inserts racing at exactly the limit can both pass; fine for an abuse cap, add pg_advisory_xact_lock if it must be exact.
create or replace function public.tasks_limit() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (select 1 from public.tasks where id = new.id)
     and (select count(*) from public.tasks where user_id = new.user_id) >= 2000 then
    raise exception 'task limit reached (2000)' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists tasks_limit on public.tasks;
create trigger tasks_limit before insert on public.tasks for each row execute function public.tasks_limit();
