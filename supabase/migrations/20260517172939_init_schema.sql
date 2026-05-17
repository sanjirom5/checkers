-- Profiles table (one row per auth user)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  wins integer not null default 0,
  losses integer not null default 0,
  best_streak integer not null default 0,
  current_streak integer not null default 0,
  created_at timestamptz not null default now()
);

-- Games history table
create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.profiles(id) on delete cascade,
  opponent text not null,
  winner text not null,
  move_count integer not null,
  duration_seconds integer not null,
  created_at timestamptz not null default now()
);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.games enable row level security;

-- Profiles: anyone can read, only owner can insert/update
create policy "profiles_select" on public.profiles for select using (true);
create policy "profiles_insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

-- Games: users can only access their own rows
create policy "games_select" on public.games for select using (auth.uid() = player_id);
create policy "games_insert" on public.games for insert with check (auth.uid() = player_id);
