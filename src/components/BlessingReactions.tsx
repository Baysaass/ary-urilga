import React, { useState } from 'react';
import type { Blessing } from '../types';
import { getSelectedReaction, reactToBlessing, type Reaction } from '../lib/guest-data';

const OPTIONS: { type: Reaction; icon: string; label: string }[] = [
  { type: 'heart', icon: '❤️', label: 'Таалагдлаа' },
  { type: 'sparkle', icon: '✨', label: 'Аз хийморь' },
  { type: 'pray', icon: '🙏', label: 'Ерөөл өргөе' },
];

export function BlessingReactions({ blessing, onUpdated }: { blessing: Blessing; onUpdated?: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const selected = getSelectedReaction(blessing.id);
  const react = async (type: Reaction) => {
    if (busy || selected === type) return;
    setBusy(true); setError('');
    try { await reactToBlessing(blessing.id, type); onUpdated?.(); }
    catch (error) { setError(error instanceof Error ? error.message : 'Дахин оролдоно уу.'); }
    finally { setBusy(false); }
  };
  return <div>
    <div className="flex items-center gap-2" role="group" aria-label="Ерөөлд хариу илэрхийлэх">
      {OPTIONS.map(option => <button key={option.type} type="button" disabled={busy} onClick={() => void react(option.type)}
        aria-label={option.label} aria-pressed={selected === option.type}
        className={`inline-flex min-h-9 min-w-12 items-center justify-center gap-1.5 rounded-full border px-2.5 text-xs transition-colors cursor-pointer disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B6785D] ${selected === option.type ? 'border-[#B6785D]/50 bg-[#B6785D]/10 text-[#9E6046]' : 'border-transparent text-[#29231E]/65 hover:bg-[#F3EBDD]'}`}>
        <span aria-hidden="true">{option.icon}</span><span className="tabular-nums">{blessing.reactions[option.type]}</span>
      </button>)}
    </div>
    {error && <p role="alert" className="text-xs text-red-700 mt-2">{error}</p>}
  </div>;
}
