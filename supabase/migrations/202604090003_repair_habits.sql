create extension if not exists "pgcrypto";

create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  target_type text not null default 'count',
  target_value integer not null default 1,
  frequency text not null default 'daily',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint habits_frequency_check check (frequency in ('daily', 'weekly'))
);

create table if not exists public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  habit_id uuid not null references public.habits(id) on delete cascade,
  log_date date not null default current_date,
  value integer not null default 1,
  completed boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (habit_id, log_date)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_habits_updated_at on public.habits;
create trigger set_habits_updated_at
before update on public.habits
for each row execute function public.set_updated_at();

drop trigger if exists set_habit_logs_updated_at on public.habit_logs;
create trigger set_habit_logs_updated_at
before update on public.habit_logs
for each row execute function public.set_updated_at();

alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;

drop policy if exists "habits_all_own" on public.habits;
create policy "habits_all_own"
on public.habits
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "habit_logs_all_own" on public.habit_logs;
create policy "habit_logs_all_own"
on public.habit_logs
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
