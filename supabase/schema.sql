-- ============================================================
-- Daily Habits Tracker — Supabase Schema
-- Run this entire file in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. FAMILY MEMBERS (login = name + 4-digit pin)
create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  pin text not null,
  avatar_emoji text default '🌱',
  color_theme text default 'sage',
  created_at timestamptz default now()
);

-- 2. HABIT DEFINITIONS (customizable per member)
create table if not exists habits (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references members(id) on delete cascade,
  key text not null,              -- stable slug e.g. 'meditation'
  label text not null,            -- display name
  icon text not null,             -- emoji
  unit text not null,             -- 'min', 'km', 'L', 'pages', 'hr', 'times', 'item'
  absolute_target numeric not null,
  bare_min_target numeric not null,
  sort_order int default 0,
  active boolean default true,
  created_at timestamptz default now()
);

-- 3. DAILY LOGS — one row per member per day
create table if not exists daily_logs (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references members(id) on delete cascade,
  log_date date not null,
  mode text not null check (mode in ('absolute', 'bare_minimum', 'partial')),
  habit_progress jsonb not null default '{}'::jsonb,  -- { habit_key: { done: bool, value: number } }
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (member_id, log_date)
);

-- 4. MILESTONES / CHALLENGE PROGRESS
create table if not exists milestones (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references members(id) on delete cascade,
  milestone_key text not null,     -- e.g. '7_day_streak', '30_absolute_days'
  achieved_at timestamptz default now(),
  unique (member_id, milestone_key)
);

-- Helpful index for month-based queries
create index if not exists idx_daily_logs_member_date on daily_logs (member_id, log_date);

-- Row Level Security — open policies since auth is custom (name+pin), app enforces access
alter table members enable row level security;
alter table habits enable row level security;
alter table daily_logs enable row level security;
alter table milestones enable row level security;

create policy "public read members" on members for select using (true);
create policy "public insert members" on members for insert with check (true);
create policy "public update members" on members for update using (true);

create policy "public all habits" on habits for all using (true) with check (true);
create policy "public all daily_logs" on daily_logs for all using (true) with check (true);
create policy "public all milestones" on milestones for all using (true) with check (true);

-- ============================================================
-- SEED: Sri Lakshmi Devika + default 10 habits
-- ============================================================
insert into members (name, pin, avatar_emoji, color_theme)
values ('Sri Lakshmi Devika', '1234', '🌸', 'sage')
on conflict (name) do nothing;

-- Insert default habits for this member
insert into habits (member_id, key, label, icon, unit, absolute_target, bare_min_target, sort_order)
select m.id, h.key, h.label, h.icon, h.unit, h.absolute_target, h.bare_min_target, h.sort_order
from members m
cross join (values
  ('meditation',   'Meditation',            '🧘', 'min',   15,  10, 1),
  ('reading',      'Reading',               '📖', 'min',   30,  10, 2),
  ('walking',      'Walking',               '🚶', 'km',     3,   1, 3),
  ('fruit',        'Eat Fruit',             '🍎', 'item',   1,   1, 4),
  ('writing',      'Writing',               '✍️', 'pages',  3,   1, 5),
  ('learning',     'Learning',              '📚', 'min',   60,  20, 6),
  ('laughing',     'Laugh',                 '😄', 'times',  5,   3, 7),
  ('water',        'Drink Water',           '💧', 'L',      3,   2, 8),
  ('stretching',   'Stretching',            '🤸', 'min',   10,   5, 9),
  ('affirmations', 'Affirmations & Visualization', '✨', 'min', 10, 5, 10)
) as h(key, label, icon, unit, absolute_target, bare_min_target, sort_order)
where m.name = 'Sri Lakshmi Devika'
on conflict do nothing;
