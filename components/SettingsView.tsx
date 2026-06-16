'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Member, Habit } from '@/types';
import { Check, X, Pencil, Share2 } from 'lucide-react';

export default function SettingsView({
  member,
  habits,
  onHabitsChanged,
  onLogout,
}: {
  member: Member;
  habits: Habit[];
  onHabitsChanged: () => void;
  onLogout: () => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAbs, setEditAbs] = useState('');
  const [editBare, setEditBare] = useState('');
  const [copied, setCopied] = useState(false);

  function startEdit(h: Habit) {
    setEditingId(h.id);
    setEditAbs(String(h.absolute_target));
    setEditBare(String(h.bare_min_target));
  }

  async function saveEdit(h: Habit) {
    const abs = parseFloat(editAbs);
    const bare = parseFloat(editBare);
    if (isNaN(abs) || isNaN(bare) || abs <= 0 || bare <= 0) return;
    await supabase.from('habits').update({ absolute_target: abs, bare_min_target: bare }).eq('id', h.id);
    setEditingId(null);
    onHabitsChanged();
  }

  async function toggleActive(h: Habit) {
    await supabase.from('habits').update({ active: !h.active }).eq('id', h.id);
    onHabitsChanged();
  }

  function shareApp() {
    const url = window.location.origin;
    navigator.clipboard.writeText(`Join me on Daily Bloom! 🌸 Track your daily habits with me — ${url}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      <section>
        <h3 className="font-display text-lg mb-1">Hi, {member.name} {member.avatar_emoji}</h3>
        <p className="text-xs" style={{ color: 'var(--sage)' }}>Customize your habit targets below.</p>
      </section>

      <section className="space-y-2">
        {habits.sort((a, b) => a.sort_order - b.sort_order).map((h) => (
          <div key={h.id} className="rounded-2xl p-3" style={{ background: 'var(--paper-raised)', border: '1px solid var(--line)', opacity: h.active ? 1 : 0.5 }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>{h.icon}</span>
                <span className="text-sm font-medium">{h.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {editingId !== h.id && (
                  <button onClick={() => startEdit(h)} className="p-1.5 rounded-full" style={{ color: 'var(--sage)' }}><Pencil size={14} /></button>
                )}
                <button
                  onClick={() => toggleActive(h)}
                  className="text-[10px] px-2 py-1 rounded-full"
                  style={{ background: h.active ? 'var(--sage-light)' : 'var(--line)', color: h.active ? 'white' : 'var(--ink)' }}
                >
                  {h.active ? 'Active' : 'Hidden'}
                </button>
              </div>
            </div>

            {editingId === h.id ? (
              <div className="flex items-center gap-2 mt-2">
                <input value={editBare} onChange={(e) => setEditBare(e.target.value)} className="w-16 px-2 py-1 rounded-lg border text-xs text-center" style={{ borderColor: 'var(--line)' }} placeholder="Bare min" />
                <span className="text-xs" style={{ color: 'var(--sage)' }}>{h.unit} bare min →</span>
                <input value={editAbs} onChange={(e) => setEditAbs(e.target.value)} className="w-16 px-2 py-1 rounded-lg border text-xs text-center" style={{ borderColor: 'var(--line)' }} placeholder="Best" />
                <span className="text-xs" style={{ color: 'var(--sage)' }}>{h.unit} best</span>
                <button onClick={() => saveEdit(h)} className="p-1.5 rounded-full ml-auto" style={{ background: 'var(--sage)', color: 'white' }}><Check size={12} /></button>
                <button onClick={() => setEditingId(null)} className="p-1.5 rounded-full" style={{ color: 'var(--sage)' }}><X size={12} /></button>
              </div>
            ) : (
              <p className="text-xs mt-1" style={{ color: 'var(--sage)' }}>
                Bare min: {h.bare_min_target}{h.unit} · Best: {h.absolute_target}{h.unit}
              </p>
            )}
          </div>
        ))}
      </section>

      <section>
        <button
          onClick={shareApp}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-medium text-white transition"
          style={{ background: 'var(--sage)' }}
        >
          <Share2 size={16} /> {copied ? 'Link copied!' : 'Share with family'}
        </button>
        <p className="text-[11px] text-center mt-2" style={{ color: 'var(--sage)' }}>
          Each family member gets their own profile and PIN from the login screen — everyone&apos;s progress stays separate but visible to the whole family.
        </p>
      </section>

      <section>
        <button onClick={onLogout} className="w-full py-3 rounded-2xl text-sm font-medium" style={{ color: 'var(--terracotta)', border: '1px solid var(--terracotta)' }}>
          Switch profile
        </button>
      </section>
    </div>
  );
}
