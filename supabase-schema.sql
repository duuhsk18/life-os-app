-- ============================================================
-- LIFE OS — Schema Supabase (Projeto Almanaque)
-- Todas as tabelas prefixadas com lifeos_ para zero conflito
-- Cole este SQL no Editor SQL do Supabase e execute.
-- ============================================================

-- 1. Profiles (vinculado ao auth.users)
create table if not exists lifeos_profiles (
  id            uuid references auth.users on delete cascade primary key,
  email         text,
  full_name     text,
  avatar_emoji  text default '😊',
  total_xp      integer default 0,
  current_streak integer default 0,
  best_streak   integer default 0,
  last_check_date date,
  created_at    timestamptz default now()
);

-- 2. Habits
create table if not exists lifeos_habits (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references lifeos_profiles(id) on delete cascade,
  name        text not null,
  icon        text default '✅',
  category    text default 'saude',
  xp_reward   integer default 10,
  active      boolean default true,
  created_at  timestamptz default now()
);

-- 3. Habit Checks (daily)
create table if not exists lifeos_habit_checks (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references lifeos_profiles(id) on delete cascade,
  habit_id    uuid references lifeos_habits(id) on delete cascade,
  date        date not null,
  completed   boolean default true,
  created_at  timestamptz default now(),
  unique(user_id, habit_id, date)
);

-- 4. Workouts
create table if not exists lifeos_workouts (
  id                uuid default gen_random_uuid() primary key,
  user_id           uuid references lifeos_profiles(id) on delete cascade,
  name              text,
  type              text,
  duration_minutes  integer,
  notes             text,
  date              date default current_date,
  created_at        timestamptz default now()
);

-- 5. Focus Sessions
create table if not exists lifeos_focus_sessions (
  id                uuid default gen_random_uuid() primary key,
  user_id           uuid references lifeos_profiles(id) on delete cascade,
  duration_minutes  integer,
  task              text,
  date              date default current_date,
  created_at        timestamptz default now()
);

-- 6. Goals
create table if not exists lifeos_goals (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references lifeos_profiles(id) on delete cascade,
  title       text not null,
  description text,
  deadline    date,
  status      text default 'active',
  progress    integer default 0,
  created_at  timestamptz default now()
);

-- 7. Journal Entries
create table if not exists lifeos_journal_entries (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references lifeos_profiles(id) on delete cascade,
  date        date default current_date,
  content     text,
  mood        text,
  gratitude   text,
  created_at  timestamptz default now(),
  unique(user_id, date)
);

-- 8. Finance Records
create table if not exists lifeos_finance_records (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references lifeos_profiles(id) on delete cascade,
  type        text check (type in ('income', 'expense')),
  category    text,
  description text,
  amount      numeric(10,2),
  date        date default current_date,
  created_at  timestamptz default now()
);

-- 9. User Products (Entitlements) — quem tem acesso a qual produto
create table if not exists lifeos_user_products (
  id              uuid default gen_random_uuid() primary key,
  user_id         uuid references lifeos_profiles(id) on delete cascade,
  product_slug    text not null,
  granted_at      timestamptz default now(),
  source          text default 'kiwify',
  kiwify_order_id text,
  active          boolean default true,
  unique(user_id, product_slug)
);

create index if not exists idx_user_products_user on lifeos_user_products(user_id);
create index if not exists idx_user_products_active on lifeos_user_products(user_id, active);

-- ============================================================
-- Row Level Security (cada usuário só vê seus próprios dados)
-- ============================================================
alter table lifeos_profiles        enable row level security;
alter table lifeos_habits          enable row level security;
alter table lifeos_habit_checks    enable row level security;
alter table lifeos_workouts        enable row level security;
alter table lifeos_focus_sessions  enable row level security;
alter table lifeos_goals           enable row level security;
alter table lifeos_journal_entries enable row level security;
alter table lifeos_finance_records enable row level security;
alter table lifeos_user_products   enable row level security;

-- Profiles
drop policy if exists "users own profile" on lifeos_profiles;
create policy "users own profile"       on lifeos_profiles        for all using (auth.uid() = id);
drop policy if exists "users own habits"       on lifeos_habits;
drop policy if exists "users own habit_checks" on lifeos_habit_checks;
drop policy if exists "users own workouts"     on lifeos_workouts;
drop policy if exists "users own focus"        on lifeos_focus_sessions;
drop policy if exists "users own goals"        on lifeos_goals;
drop policy if exists "users own journal"      on lifeos_journal_entries;
drop policy if exists "users own finance"      on lifeos_finance_records;
drop policy if exists "users see own products" on lifeos_user_products;

create policy "users own habits"        on lifeos_habits          for all using (auth.uid() = user_id);
create policy "users own habit_checks"  on lifeos_habit_checks    for all using (auth.uid() = user_id);
create policy "users own workouts"      on lifeos_workouts        for all using (auth.uid() = user_id);
create policy "users own focus"         on lifeos_focus_sessions  for all using (auth.uid() = user_id);
create policy "users own goals"         on lifeos_goals           for all using (auth.uid() = user_id);
create policy "users own journal"       on lifeos_journal_entries for all using (auth.uid() = user_id);
create policy "users own finance"       on lifeos_finance_records for all using (auth.uid() = user_id);
-- User products: usuário lê os próprios; INSERTs só pelo webhook (service_role)
create policy "users see own products"  on lifeos_user_products   for select using (auth.uid() = user_id);

-- ============================================================
-- Auto-create profile on signup
-- ============================================================
create or replace function public.handle_new_lifeos_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.lifeos_profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Trigger: dispara após novo signup
drop trigger if exists on_lifeos_auth_user_created on auth.users;
create trigger on_lifeos_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_lifeos_user();
