import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { SymbolicGift } from '../types';
import { getSelectedGifts, incrementSymbolicGift } from '../lib/guest-data';

export function SymbolicInteraction({ gifts, onGiftIncremented }: { gifts: SymbolicGift[]; onGiftIncremented?: () => void }) {
  const [busy, setBusy] = useState<string>();
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const selected = getSelectedGifts();
  const leave = async (gift: SymbolicGift) => {
    if (busy || selected.includes(gift.id)) return;
    setBusy(gift.id); setError(''); setStatus('');
    try {
      await incrementSymbolicGift(gift.id); onGiftIncremented?.();
      setStatus('Та манай гэрт ' + gift.label + ' үлдээлээ');
    } catch (error) { setError(error instanceof Error ? error.message : 'Дахин оролдоно уу.'); }
    finally { setBusy(undefined); }
  };
  return <section id="symbolic-gifts" className="py-16 px-6 text-center">
    <div className="max-w-[360px] mx-auto">
      <span className="text-[11px] tracking-[0.25em] text-[#B49368]">БЭЛГЭДЭЛТ МЭНДЧИЛГЭЭ</span>
      <h2 className="font-serif-title text-3xl mt-2 leading-tight">Манай шинэ гэрт<br />сайхан зүйл үлдээгээрэй</h2>
      <p className="text-xs text-[#29231E]/65 mt-3 leading-relaxed">Хүссэн бэлгэдлүүдээ сонгоорой.<br />Нэг бэлгэдлийг нэг удаа үлдээнэ.</p>
      <div className="min-h-10 py-3 text-xs text-[#B6785D]" role="status">{status}</div>
      {error && <p role="alert" className="text-xs text-red-700 mb-3">{error}</p>}
      <div className="grid grid-cols-3 gap-3">
        {gifts.map(gift => <button key={gift.id} type="button" onClick={() => void leave(gift)} disabled={!!busy || selected.includes(gift.id)} aria-pressed={selected.includes(gift.id)} aria-label={gift.label}
          className={'relative flex flex-col items-center p-3 rounded-2xl border paper-card-shadow transition-colors cursor-pointer disabled:cursor-default focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B6785D] ' + (selected.includes(gift.id) ? 'bg-[#F3EBDD] border-[#B6785D]/50' : 'bg-[#FAF7F0] border-[#B49368]/25 hover:border-[#B49368]')}>
          {selected.includes(gift.id) && <Check className="absolute top-2 right-2 w-3 h-3 text-[#B6785D]" aria-hidden="true" />}
          <span aria-hidden="true" className="w-12 h-12 flex items-center justify-center rounded-full text-xl" style={{ backgroundColor: gift.color + '15' }}>{gift.icon}</span>
          <span className="text-xs mt-2 font-medium">{gift.label}</span>
          <span className="text-[11px] text-[#29231E]/60 tabular-nums mt-1">{gift.count}</span>
        </button>)}
      </div>
    </div>
  </section>;
}
