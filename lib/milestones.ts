import { DailyLog } from '@/types';

export interface MilestoneDef {
  key: string;
  label: string;
  description: string;
  emoji: string;
  check: (logs: DailyLog[]) => boolean;
}

function currentStreak(logs: DailyLog[], predicate: (l: DailyLog) => boolean): number {
  const sorted = [...logs].sort((a, b) => b.log_date.localeCompare(a.log_date));
  const map = new Map(sorted.map((l) => [l.log_date, l]));
  let streak = 0;
  const cursor = new Date();
  while (true) {
    const dateStr = cursor.toISOString().slice(0, 10);
    const log = map.get(dateStr);
    if (log && predicate(log)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export const MILESTONES: MilestoneDef[] = [
  {
    key: 'first_log',
    label: 'First Sprout',
    description: 'Logged your very first day',
    emoji: '🌱',
    check: (logs) => logs.length >= 1,
  },
  {
    key: 'streak_3',
    label: '3-Day Streak',
    description: 'Showed up 3 days in a row, any mode',
    emoji: '🔥',
    check: (logs) => currentStreak(logs, (l) => l.mode !== 'partial' || Object.values(l.habit_progress).some((p) => p.done)) >= 3,
  },
  {
    key: 'streak_7',
    label: 'One Week Wonder',
    description: '7-day streak — a full week of showing up',
    emoji: '🌿',
    check: (logs) => currentStreak(logs, () => true) >= 7,
  },
  {
    key: 'streak_30',
    label: 'Full Bloom Month',
    description: '30-day streak — a month of consistency',
    emoji: '🌳',
    check: (logs) => currentStreak(logs, () => true) >= 30,
  },
  {
    key: 'absolute_10',
    label: 'Peak Performer',
    description: 'Hit Absolute Best mode 10 times total',
    emoji: '⭐',
    check: (logs) => logs.filter((l) => l.mode === 'absolute').length >= 10,
  },
  {
    key: 'absolute_streak_5',
    label: 'On Fire',
    description: '5 Absolute Best days in a row',
    emoji: '🚀',
    check: (logs) => currentStreak(logs, (l) => l.mode === 'absolute') >= 5,
  },
  {
    key: 'comeback',
    label: 'Comeback Kid',
    description: 'Logged a day right after missing one — resilience counts',
    emoji: '💪',
    check: (logs) => {
      const sorted = [...logs].sort((a, b) => a.log_date.localeCompare(b.log_date));
      for (let i = 1; i < sorted.length; i++) {
        const prev = new Date(sorted[i - 1].log_date);
        const cur = new Date(sorted[i].log_date);
        const gapDays = Math.round((cur.getTime() - prev.getTime()) / 86400000);
        if (gapDays >= 2) return true;
      }
      return false;
    },
  },
  {
    key: 'hydration_hero',
    label: 'Hydration Hero',
    description: 'Hit water goal 14 days total',
    emoji: '💧',
    check: (logs) => logs.filter((l) => l.habit_progress?.water?.done).length >= 14,
  },
  {
    key: 'bookworm',
    label: 'Bookworm',
    description: 'Hit reading goal 14 days total',
    emoji: '📖',
    check: (logs) => logs.filter((l) => l.habit_progress?.reading?.done).length >= 14,
  },
  {
    key: 'fifty_days',
    label: 'Half Century',
    description: '50 total days logged',
    emoji: '🏆',
    check: (logs) => logs.length >= 50,
  },
  {
    key: 'hundred_days',
    label: 'Century Club',
    description: '100 total days logged — true habit master',
    emoji: '👑',
    check: (logs) => logs.length >= 100,
  },
];

export interface ChallengeDef {
  key: string;
  title: string;
  description: string;
  emoji: string;
  durationDays: number;
}

export const CHALLENGES: ChallengeDef[] = [
  {
    key: 'water_week',
    title: '7-Day Hydration Sprint',
    description: 'Hit your water goal (any mode) every day for 7 days straight.',
    emoji: '💧',
    durationDays: 7,
  },
  {
    key: 'no_zero_days',
    title: 'No Zero Days — 14 Days',
    description: 'Log something — even bare minimum — for 14 days straight. No skipped days.',
    emoji: '🛡️',
    durationDays: 14,
  },
  {
    key: 'absolute_5',
    title: 'Absolute Best x5',
    description: 'Hit full Absolute Best mode 5 days in a row. Go big.',
    emoji: '🚀',
    durationDays: 5,
  },
  {
    key: 'mindful_month',
    title: 'Mindful Month',
    description: 'Complete meditation + affirmations together for 21 days (habit-stack challenge).',
    emoji: '🧘',
    durationDays: 21,
  },
  {
    key: 'page_a_day',
    title: 'Page-a-Day Author',
    description: 'Hit your writing goal every day for 10 days — start that journal or book.',
    emoji: '✍️',
    durationDays: 10,
  },
];
