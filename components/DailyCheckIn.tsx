'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Member, Habit, DailyLog, HabitProgress, Mode } from '@/types';
import { Loader2, Check, Minus } from 'lucide-react';

function todayStr() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export default function DailyCheckIn({ member, habits }: { member: Member; habits: Habit[] }) {
  const [log, setLog] = useState<DailyLog | null>(null);
  const [progress, setProgress] = useState<HabitProgress>({});
  const [mode, setMode] = useState<Mode>('partial');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    loadToday();
  }, [member.id]);

  async function loadToday() {
    setLoading(true);
    const { data } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('member_id', member.id)
      .eq('log_date', todayStr())
      .maybeSingle();

    if (data) {
      setLog(data as DailyLog);
      setProgress((data as DailyLog).habit_progress || {});
      setMode((data as DailyLog).mode);
    } else {
      const init: HabitProgress = {};
      habits.forEach((h) => { init[h.key] = { done: false, value: 0 }; });
      setProgress(init);
      setMode('partial');
    }
    setLoading(false);
  }

  const computeMode = useCallback((p: HabitProgress): Mode => {
    const relevant = habits.filter((h) => h.active);
    const allAbsolute = relevant.every((h) => (p[h.key]?.value ?? 0) >= h.absolute_target);
    const allBareMin = relevant.every((h) => (p[h.key]?.value ?? 0) >= h.bare_min_target);
    if (allAbsolute) return 'absolute';
    if (allBareMin) return 'bare_minimum';
    return 'partial';
  }, [habits]);

  async function persist(newProgress: HabitProgress) {
    const newMode = computeMode(newProgress);
    setMode(newMode);
    setSaving(true);
    const { data, error } = await supabase
      .from('daily_logs')
      .upsert(
        {
          id: log?.id,
          member_id: member.id,
          log_date: todayStr(),
          mode: newMode,
          habit_progress: newProgress,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'member_id,log_date' }
      )
      .select()
      .single();

    if (!error && data) {
      setLog(data as DailyLog);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1200);
    }
    setSaving(false);
  }

  function toggleHabit(habit: Habit, targetType: 'absolute' | 'bare_min') {
    const target = targetType === 'absolute' ? habit.absolute_target : habit.bare_min_target;
    const current = progress[habit.key]?.value ?? 0;
    const isAtTarget = current >= target;
    const newValue = isAtTarget ? 0 : target;
    const newProgress = {
      ...progress,
      [habit.key]: { done: newValue > 0, value: newValue },
    };
    setProgress(newProgress);
    persist(newProgress);
  }

  function setExactValue(habit: Habit, value: number) {
    const newProgress = {
      ...progress,
      [habit.key]: { done: value > 0, value },
    };
    setProgress(newProgress);
    persist(newProgress);
  }

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="animate-spin" style={{ color: 'var(--sage)' }} /></div>;
  }

  const modeStyles: Record<Mode, { bg: string; label: string }> = {
    absolute: { bg: 'var(--terracotta)', label: '🌟 Absolute Best — today, in full bloom' },
    bare_minimum: { bg: 'var(--clay)', label: '🌤️ Bare Minimum — showed up, and that counts' },
    partial: { bg: 'var(--sage-light)', label: '🌱 In progress — keep going' },
  };

  return (
    <div className="space-y-4">
      <div
        className="rounded-2xl px-4 py-3 text-center text-sm font-medium text-white transition-colors duration-300"
        style={{ background: modeStyles[mode].bg }}
      >
        {modeStyles[mode].label}
      </div>

      <div className="space-y-2">
        {habits.filter((h) => h.active).sort((a, b) => a.sort_order - b.sort_order).map((habit) => {
          const value = progress[habit.key]?.value ?? 0;
          const hitAbsolute = value >= habit.absolute_target;
          const hitBareMin = value >= habit.bare_min_target && !hitAbsolute;

          return (
            <div
              key={habit.key}
              className="rounded-2xl p-4 transition"
              style={{
                background: hitAbsolute ? 'rgba(198,107,61,0.1)' : hitBareMin ? 'rgba(212,165,116,0.15)' : 'var(--paper-raised)',
                border: `1px solid ${hitAbsolute ? 'var(--terracotta)' : hitBareMin ? 'var(--clay)' : 'var(--line)'}`,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{habit.icon}</span>
                  <span className="font-medium text-sm" style={{ color: 'var(--ink)' }}>{habit.label}</span>
                </div>
                <span className="text-xs" style={{ color: 'var(--sage)' }}>
                  {value}/{habit.absolute_target} {habit.unit}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => toggleHabit(habit, 'bare_min')}
                  className="flex-1 py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1 transition"
                  style={{
                    background: hitBareMin || hitAbsolute ? 'var(--clay)' : 'var(--paper)',
                    color: hitBareMin || hitAbsolute ? 'white' : 'var(--ink)',
                    border: '1px solid var(--line)',
                  }}
                >
                  {(hitBareMin || hitAbsolute) && <Check size={12} />}
                  Bare min ({habit.bare_min_target}{habit.unit})
                </button>
                <button
                  onClick={() => toggleHabit(habit, 'absolute')}
                  className="flex-1 py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1 transition"
                  style={{
                    background: hitAbsolute ? 'var(--terracotta)' : 'var(--paper)',
                    color: hitAbsolute ? 'white' : 'var(--ink)',
                    border: '1px solid var(--line)',
                  }}
                >
                  {hitAbsolute && <Check size={12} />}
                  Best ({habit.absolute_target}{habit.unit})
                </button>
                {value > 0 && (
                  <button
                    onClick={() => setExactValue(habit, 0)}
                    className="px-3 py-2 rounded-xl text-xs"
                    style={{ color: 'var(--sage)', border: '1px solid var(--line)' }}
                    title="Reset"
                  >
                    <Minus size={12} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="h-5 text-center text-xs transition-opacity" style={{ color: 'var(--sage)', opacity: saving || savedFlash ? 1 : 0 }}>
        {saving ? 'Saving…' : savedFlash ? '✓ Saved' : ''}
      </div>
    </div>
  );
}
