'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Member, DailyLog } from '@/types';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

function monthLabel(y: number, m: number) {
  return new Date(y, m, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default function MonthlyStats({ member }: { member: Member }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0-indexed
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMonth();
  }, [year, month, member.id]);

  async function loadMonth() {
    setLoading(true);
    const start = new Date(year, month, 1).toISOString().slice(0, 10);
    const end = new Date(year, month + 1, 0).toISOString().slice(0, 10);
    const { data } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('member_id', member.id)
      .gte('log_date', start)
      .lte('log_date', end)
      .order('log_date');
    setLogs((data as DailyLog[]) || []);
    setLoading(false);
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const logByDate = new Map(logs.map((l) => [l.log_date, l]));

  const absoluteCount = logs.filter((l) => l.mode === 'absolute').length;
  const bareMinCount = logs.filter((l) => l.mode === 'bare_minimum').length;
  const partialCount = logs.filter((l) => l.mode === 'partial').length;
  const totalLogged = logs.length;
  const consistencyPct = daysInMonth > 0 ? Math.round((totalLogged / daysInMonth) * 100) : 0;

  function bloomFor(dateStr: string) {
    const l = logByDate.get(dateStr);
    if (!l) return { emoji: '·', color: 'var(--line)' };
    if (l.mode === 'absolute') return { emoji: '🌸', color: 'var(--terracotta)' };
    if (l.mode === 'bare_minimum') return { emoji: '🌿', color: 'var(--clay)' };
    return { emoji: '🌱', color: 'var(--sage-light)' };
  }

  function changeMonth(delta: number) {
    let newMonth = month + delta;
    let newYear = year;
    if (newMonth < 0) { newMonth = 11; newYear--; }
    if (newMonth > 11) { newMonth = 0; newYear++; }
    setMonth(newMonth);
    setYear(newYear);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={() => changeMonth(-1)} className="p-2 rounded-full" style={{ color: 'var(--sage)' }}><ChevronLeft size={18} /></button>
        <h3 className="font-display text-lg">{monthLabel(year, month)}</h3>
        <button onClick={() => changeMonth(1)} className="p-2 rounded-full" style={{ color: 'var(--sage)' }} disabled={year === now.getFullYear() && month === now.getMonth()}>
          <ChevronRight size={18} style={{ opacity: year === now.getFullYear() && month === now.getMonth() ? 0.3 : 1 }} />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="animate-spin" style={{ color: 'var(--sage)' }} /></div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2">
            <StatCard label="Absolute Best" value={absoluteCount} color="var(--terracotta)" emoji="🌸" />
            <StatCard label="Bare Minimum" value={bareMinCount} color="var(--clay)" emoji="🌿" />
            <StatCard label="Consistency" value={`${consistencyPct}%`} color="var(--sage)" emoji="📈" />
          </div>

          <div className="rounded-2xl p-4" style={{ background: 'var(--paper-raised)', border: '1px solid var(--line)' }}>
            <p className="text-xs mb-3" style={{ color: 'var(--sage)' }}>Your bloom garden this month</p>
            <div className="grid grid-cols-7 gap-1.5 text-center">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <div key={i} className="text-[10px]" style={{ color: 'var(--sage)' }}>{d}</div>
              ))}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`pad-${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const bloom = bloomFor(dateStr);
                const isToday = dateStr === now.toISOString().slice(0, 10);
                return (
                  <div
                    key={day}
                    className="aspect-square rounded-lg flex flex-col items-center justify-center text-[13px] relative"
                    style={{ background: 'var(--paper)', outline: isToday ? '1.5px solid var(--terracotta)' : 'none' }}
                    title={dateStr}
                  >
                    <span>{bloom.emoji}</span>
                    <span className="text-[8px] absolute bottom-0.5" style={{ color: 'var(--sage)' }}>{day}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-4 mt-4 text-[11px] justify-center flex-wrap" style={{ color: 'var(--sage)' }}>
              <span>🌸 Absolute Best</span>
              <span>🌿 Bare Minimum</span>
              <span>🌱 Partial</span>
              <span>· Not logged</span>
            </div>
          </div>

          {partialCount > 0 && (
            <p className="text-xs text-center" style={{ color: 'var(--sage)' }}>
              {partialCount} day{partialCount > 1 ? 's' : ''} logged partially — every bit still counts 🌱
            </p>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, color, emoji }: { label: string; value: number | string; color: string; emoji: string }) {
  return (
    <div className="rounded-2xl p-3 text-center" style={{ background: 'var(--paper-raised)', border: '1px solid var(--line)' }}>
      <div className="text-lg">{emoji}</div>
      <div className="font-display text-xl" style={{ color }}>{value}</div>
      <div className="text-[10px] mt-0.5" style={{ color: 'var(--sage)' }}>{label}</div>
    </div>
  );
}
