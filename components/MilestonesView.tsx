'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Member, DailyLog } from '@/types';
import { MILESTONES, CHALLENGES } from '@/lib/milestones';
import { Loader2, Lock } from 'lucide-react';

export default function MilestonesView({ member }: { member: Member }) {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [member.id]);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('daily_logs').select('*').eq('member_id', member.id);
    setLogs((data as DailyLog[]) || []);
    setLoading(false);
  }

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="animate-spin" style={{ color: 'var(--sage)' }} /></div>;
  }

  const unlocked = new Set(MILESTONES.filter((m) => m.check(logs)).map((m) => m.key));

  return (
    <div className="space-y-6">
      <section>
        <h3 className="font-display text-lg mb-3">🏆 Milestones</h3>
        <div className="grid grid-cols-2 gap-2">
          {MILESTONES.map((m) => {
            const isUnlocked = unlocked.has(m.key);
            return (
              <div
                key={m.key}
                className="rounded-2xl p-3 text-center transition"
                style={{
                  background: isUnlocked ? 'rgba(198,107,61,0.08)' : 'var(--paper-raised)',
                  border: `1px solid ${isUnlocked ? 'var(--terracotta)' : 'var(--line)'}`,
                  opacity: isUnlocked ? 1 : 0.6,
                }}
              >
                <div className="text-2xl mb-1">{isUnlocked ? m.emoji : <Lock size={18} className="mx-auto" style={{ color: 'var(--sage)' }} />}</div>
                <p className="text-xs font-semibold" style={{ color: isUnlocked ? 'var(--ink)' : 'var(--sage)' }}>{m.label}</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--sage)' }}>{m.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h3 className="font-display text-lg mb-3">🎯 Challenges to try</h3>
        <div className="space-y-2">
          {CHALLENGES.map((c) => (
            <div key={c.key} className="rounded-2xl p-4 flex items-start gap-3" style={{ background: 'var(--paper-raised)', border: '1px solid var(--line)' }}>
              <span className="text-2xl">{c.emoji}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm" style={{ color: 'var(--ink)' }}>{c.title}</p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'var(--sage-light)', color: 'white' }}>{c.durationDays}d</span>
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--sage)' }}>{c.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="font-display text-lg mb-3">🎉 Fun ways to celebrate milestones</h3>
        <div className="rounded-2xl p-4 space-y-2 text-sm" style={{ background: 'var(--paper-raised)', border: '1px solid var(--line)' }}>
          {[
            '7-day streak → treat yourself to your favorite snack guilt-free',
            '30-day streak → buy yourself a small plant for your desk',
            '10 Absolute Best days → a solo movie night or spa hour',
            'Century Club (100 days) → plan a weekend trip as a reward',
            'Any comeback after a miss → tell a family member, celebrate resilience not perfection',
          ].map((tip, i) => (
            <p key={i} style={{ color: 'var(--ink)' }}>🎈 {tip}</p>
          ))}
        </div>
      </section>
    </div>
  );
}
