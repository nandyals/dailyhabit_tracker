'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Member, Habit } from '@/types';
import LoginScreen from '@/components/LoginScreen';
import QuoteSplash from '@/components/QuoteSplash';
import DailyCheckIn from '@/components/DailyCheckIn';
import MonthlyStats from '@/components/MonthlyStats';
import MilestonesView from '@/components/MilestonesView';
import SettingsView from '@/components/SettingsView';
import { CalendarDays, ListChecks, Trophy, Settings } from 'lucide-react';

type Tab = 'today' | 'stats' | 'milestones' | 'settings';

export default function Home() {
  const [member, setMember] = useState<Member | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [tab, setTab] = useState<Tab>('today');
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitsLoading, setHabitsLoading] = useState(false);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('dailybloom_member') : null;
    if (stored) {
      try {
        const m = JSON.parse(stored) as Member;
        setMember(m);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (member) loadHabits(member.id);
  }, [member?.id]);

  async function loadHabits(memberId: string) {
    setHabitsLoading(true);
    const { data } = await supabase.from('habits').select('*').eq('member_id', memberId).order('sort_order');
    setHabits((data as Habit[]) || []);
    setHabitsLoading(false);
  }

  function handleLogin(m: Member) {
    setMember(m);
    localStorage.setItem('dailybloom_member', JSON.stringify(m));
  }

  function handleLogout() {
    setMember(null);
    localStorage.removeItem('dailybloom_member');
    setTab('today');
  }

  if (!member) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--paper)' }}>
      {showSplash && <QuoteSplash onDone={() => setShowSplash(false)} />}

      <header className="px-5 pt-6 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{member.avatar_emoji}</span>
          <div>
            <p className="font-display text-lg leading-tight">Daily Bloom</p>
            <p className="text-[11px]" style={{ color: 'var(--sage)' }}>{member.name}</p>
          </div>
        </div>
        <span className="text-xs" style={{ color: 'var(--sage)' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </span>
      </header>

      <main className="flex-1 px-5 pb-24 max-w-md w-full mx-auto">
        {habitsLoading ? (
          <div className="flex justify-center py-16" style={{ color: 'var(--sage)' }}>Loading your habits…</div>
        ) : (
          <>
            {tab === 'today' && <DailyCheckIn member={member} habits={habits} />}
            {tab === 'stats' && <MonthlyStats member={member} />}
            {tab === 'milestones' && <MilestonesView member={member} />}
            {tab === 'settings' && (
              <SettingsView member={member} habits={habits} onHabitsChanged={() => loadHabits(member.id)} onLogout={handleLogout} />
            )}
          </>
        )}
      </main>

      <nav
        className="fixed bottom-0 left-0 right-0 flex justify-around items-center py-3 backdrop-blur-md"
        style={{ background: 'rgba(251,247,238,0.92)', borderTop: '1px solid var(--line)' }}
      >
        <NavBtn active={tab === 'today'} onClick={() => setTab('today')} icon={<ListChecks size={20} />} label="Today" />
        <NavBtn active={tab === 'stats'} onClick={() => setTab('stats')} icon={<CalendarDays size={20} />} label="Garden" />
        <NavBtn active={tab === 'milestones'} onClick={() => setTab('milestones')} icon={<Trophy size={20} />} label="Milestones" />
        <NavBtn active={tab === 'settings'} onClick={() => setTab('settings')} icon={<Settings size={20} />} label="Settings" />
      </nav>
    </div>
  );
}

function NavBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-0.5 px-3 transition" style={{ color: active ? 'var(--terracotta)' : 'var(--sage)' }}>
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}
