export type Mode = 'absolute' | 'bare_minimum' | 'partial';

export interface Member {
  id: string;
  name: string;
  pin: string;
  avatar_emoji: string;
  color_theme: string;
  created_at: string;
}

export interface Habit {
  id: string;
  member_id: string;
  key: string;
  label: string;
  icon: string;
  unit: string;
  absolute_target: number;
  bare_min_target: number;
  sort_order: number;
  active: boolean;
}

export interface HabitProgressEntry {
  done: boolean;
  value: number;
}

export type HabitProgress = Record<string, HabitProgressEntry>;

export interface DailyLog {
  id: string;
  member_id: string;
  log_date: string; // YYYY-MM-DD
  mode: Mode;
  habit_progress: HabitProgress;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Milestone {
  id: string;
  member_id: string;
  milestone_key: string;
  achieved_at: string;
}
