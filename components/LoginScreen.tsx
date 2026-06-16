'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Member } from '@/types';
import { Loader2, Sprout } from 'lucide-react';

const DEFAULT_HABITS = [
  { key: 'meditation', label: 'Meditation', icon: '🧘', unit: 'min', absolute_target: 15, bare_min_target: 10, sort_order: 1 },
  { key: 'reading', label: 'Reading', icon: '📖', unit: 'min', absolute_target: 30, bare_min_target: 10, sort_order: 2 },
  { key: 'walking', label: 'Walking', icon: '🚶', unit: 'km', absolute_target: 3, bare_min_target: 1, sort_order: 3 },
  { key: 'fruit', label: 'Eat Fruit', icon: '🍎', unit: 'item', absolute_target: 1, bare_min_target: 1, sort_order: 4 },
  { key: 'writing', label: 'Writing', icon: '✍️', unit: 'pages', absolute_target: 3, bare_min_target: 1, sort_order: 5 },
  { key: 'learning', label: 'Learning', icon: '📚', unit: 'min', absolute_target: 60, bare_min_target: 20, sort_order: 6 },
  { key: 'laughing', label: 'Laugh', icon: '😄', unit: 'times', absolute_target: 5, bare_min_target: 3, sort_order: 7 },
  { key: 'water', label: 'Drink Water', icon: '💧', unit: 'L', absolute_target: 3, bare_min_target: 2, sort_order: 8 },
  { key: 'stretching', label: 'Stretching', icon: '🤸', unit: 'min', absolute_target: 10, bare_min_target: 5, sort_order: 9 },
  { key: 'affirmations', label: 'Affirmations & Visualization', icon: '✨', unit: 'min', absolute_target: 10, bare_min_target: 5, sort_order: 10 },
];

const AVATAR_OPTIONS = ['🌸', '🌻', '🌿', '🦋', '⭐', '🌙', '🍀', '🔥'];

export default function LoginScreen({ onLogin }: { onLogin: (member: Member) => void }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [selected, setSelected] = useState<Member | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPin, setNewPin] = useState('');
  const [newAvatar, setNewAvatar] = useState('🌸');

  useEffect(() => {
    loadMembers();
  }, []);

  async function loadMembers() {
    setLoadingMembers(true);
    const { data, error } = await supabase.from('members').select('*').order('created_at');
    if (!error && data) setMembers(data as Member[]);
    setLoadingMembers(false);
  }

  async function handlePinSubmit() {
    if (!selected) return;
    setError('');
    if (pin === selected.pin) {
      setBusy(true);
      onLogin(selected);
    } else {
      setError('Incorrect PIN. Try again.');
      setPin('');
    }
  }

  async function handleAddMember() {
    setError('');
    if (!newName.trim()) { setError('Enter a name.'); return; }
    if (!/^\d{4}$/.test(newPin)) { setError('PIN must be exactly 4 digits.'); return; }
    setBusy(true);
    const { data, error: insertErr } = await supabase
      .from('members')
      .insert({ name: newName.trim(), pin: newPin, avatar_emoji: newAvatar })
      .select()
      .single();

    if (insertErr || !data) {
      setError(insertErr?.message.includes('duplicate') ? 'That name is already taken.' : 'Something went wrong. Try again.');
      setBusy(false);
      return;
    }

    const habitRows = DEFAULT_HABITS.map((h) => ({ ...h, member_id: data.id }));
    await supabase.from('habits').insert(habitRows);

    setBusy(false);
    setShowAddMember(false);
    setNewName('');
    setNewPin('');
    await loadMembers();
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12" style={{ background: 'var(--paper)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="text-5xl mb-3">🌸</div>
          <h1 className="font-display text-4xl tracking-tight" style={{ color: 'var(--ink)' }}>Daily Bloom</h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--sage)' }}>Show up. Absolute best, or bare minimum — either way, you bloom.</p>
        </div>

        {loadingMembers ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin" style={{ color: 'var(--sage)' }} /></div>
        ) : !selected && !showAddMember ? (
          <div className="space-y-3">
            {members.map((m) => (
              <button
                key={m.id}
                onClick={() => { setSelected(m); setError(''); }}
                className="w-full flex items-center gap-3 p-4 rounded-2xl border transition hover:shadow-md"
                style={{ background: 'var(--paper-raised)', borderColor: 'var(--line)' }}
              >
                <span className="text-2xl">{m.avatar_emoji}</span>
                <span className="font-medium" style={{ color: 'var(--ink)' }}>{m.name}</span>
              </button>
            ))}
            <button
              onClick={() => setShowAddMember(true)}
              className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border border-dashed text-sm font-medium transition hover:bg-white/40"
              style={{ borderColor: 'var(--sage-light)', color: 'var(--sage)' }}
            >
              <Sprout size={16} /> Add a family member
            </button>
          </div>
        ) : showAddMember ? (
          <div className="space-y-4 p-5 rounded-2xl" style={{ background: 'var(--paper-raised)', border: '1px solid var(--line)' }}>
            <h2 className="font-display text-lg">New family member</h2>
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--sage)' }}>Name</label>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border outline-none focus:ring-2"
                style={{ borderColor: 'var(--line)', background: 'var(--paper)' }}
                placeholder="e.g. Anand"
              />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--sage)' }}>4-digit PIN</label>
              <input
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                inputMode="numeric"
                className="w-full px-3 py-2 rounded-xl border outline-none focus:ring-2 tracking-widest"
                style={{ borderColor: 'var(--line)', background: 'var(--paper)' }}
                placeholder="••••"
              />
            </div>
            <div>
              <label className="block text-xs mb-2" style={{ color: 'var(--sage)' }}>Pick an emoji</label>
              <div className="flex gap-2 flex-wrap">
                {AVATAR_OPTIONS.map((a) => (
                  <button
                    key={a}
                    onClick={() => setNewAvatar(a)}
                    className="text-xl w-9 h-9 rounded-full flex items-center justify-center transition"
                    style={{ background: newAvatar === a ? 'var(--sage-light)' : 'var(--paper)', border: '1px solid var(--line)' }}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
            {error && <p className="text-sm" style={{ color: 'var(--terracotta)' }}>{error}</p>}
            <div className="flex gap-2 pt-2">
              <button onClick={() => { setShowAddMember(false); setError(''); }} className="flex-1 py-2 rounded-xl text-sm font-medium" style={{ color: 'var(--sage)' }}>Cancel</button>
              <button
                onClick={handleAddMember}
                disabled={busy}
                className="flex-1 py-2 rounded-xl text-sm font-semibold text-white transition disabled:opacity-60"
                style={{ background: 'var(--sage)' }}
              >
                {busy ? <Loader2 className="animate-spin mx-auto" size={16} /> : 'Create profile'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 p-5 rounded-2xl" style={{ background: 'var(--paper-raised)', border: '1px solid var(--line)' }}>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{selected?.avatar_emoji}</span>
              <div>
                <p className="font-display text-lg">{selected?.name}</p>
                <p className="text-xs" style={{ color: 'var(--sage)' }}>Enter your PIN</p>
              </div>
            </div>
            <input
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              onKeyDown={(e) => e.key === 'Enter' && handlePinSubmit()}
              inputMode="numeric"
              autoFocus
              className="w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 text-center text-2xl tracking-[0.5em]"
              style={{ borderColor: 'var(--line)', background: 'var(--paper)' }}
              placeholder="••••"
            />
            {error && <p className="text-sm text-center" style={{ color: 'var(--terracotta)' }}>{error}</p>}
            <div className="flex gap-2">
              <button onClick={() => { setSelected(null); setPin(''); setError(''); }} className="flex-1 py-2 rounded-xl text-sm font-medium" style={{ color: 'var(--sage)' }}>Back</button>
              <button
                onClick={handlePinSubmit}
                disabled={busy || pin.length !== 4}
                className="flex-1 py-2 rounded-xl text-sm font-semibold text-white transition disabled:opacity-50"
                style={{ background: 'var(--terracotta)' }}
              >
                {busy ? <Loader2 className="animate-spin mx-auto" size={16} /> : 'Enter'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
