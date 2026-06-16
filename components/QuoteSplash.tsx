'use client';

import { useEffect, useState } from 'react';
import { getTodayQuote } from '@/lib/quotes';

export default function QuoteSplash({ onDone }: { onDone: () => void }) {
  const [quote] = useState(getTodayQuote());
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(false), 2200);
    const t2 = setTimeout(onDone, 2700);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-8 transition-opacity duration-500"
      style={{ background: 'var(--paper)', opacity: visible ? 1 : 0 }}
      onClick={onDone}
    >
      <div className="max-w-sm text-center">
        <div className="text-3xl mb-6">🌸</div>
        <p className="font-display text-2xl leading-snug" style={{ color: 'var(--ink)' }}>
          &ldquo;{quote.text}&rdquo;
        </p>
        <p className="mt-4 text-sm" style={{ color: 'var(--sage)' }}>— {quote.author}</p>
      </div>
    </div>
  );
}
