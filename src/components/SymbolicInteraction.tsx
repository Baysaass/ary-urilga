import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { SymbolicGift } from '../types';
import { getSelectedGifts, incrementSymbolicGift } from '../lib/guest-data';

export function SymbolicInteraction({
  gifts,
  onGiftIncremented,
}: {
  gifts: SymbolicGift[];
  onGiftIncremented?: () => void;
}) {
  const [busy, setBusy] = useState<string>();
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const selected = getSelectedGifts();

  const leave = async (gift: SymbolicGift) => {
    if (busy || selected.includes(gift.id)) return;
    setBusy(gift.id);
    setError('');
    setStatus('');
    try {
      await incrementSymbolicGift(gift.id);
      onGiftIncremented?.();
      setStatus(`Шинэ өргөөнд «${gift.label}» бэлгэдлийг өргөлөө 🤍 Баярлалаа!`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Дахин оролдоно уу.');
    } finally {
      setBusy(undefined);
    }
  };

  return (
    <section id="symbolic-gifts" className="py-14 px-5 text-center select-none overflow-hidden">
      <div className="max-w-[400px] mx-auto">
        <span className="rule" aria-hidden="true" />
        <span className="eyebrow block mt-2 mb-1">Бэлгэдэлт мэндчилгээ</span>
        <h2 className="title text-[#261E19] mb-2 leading-tight">
          Шинэ өргөөний гал голомтыг мялаах
        </h2>
        <p className="font-serif text-xs text-[#635246] italic mb-3 leading-relaxed">
          Бэлгэдэл тус бүр дээр дарж, шинэ өргөөний минь босгыг мялаан ерөөл өргөнө үү.
        </p>

        {status && (
          <div className="min-h-8 py-2 text-xs font-serif text-[#C29B53] font-semibold" role="status">
            {status}
          </div>
        )}
        {error && (
          <p role="alert" className="text-xs font-serif italic text-red-600 mb-3">
            {error}
          </p>
        )}

        <div className="grid grid-cols-3 gap-3 mt-4">
          {gifts.map((gift) => {
            const isSelected = selected.includes(gift.id);
            return (
              <button
                key={gift.id}
                type="button"
                onClick={() => void leave(gift)}
                disabled={!!busy || isSelected}
                aria-pressed={isSelected}
                aria-label={gift.label}
                className={`relative flex flex-col items-center p-3 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#FAF7F2] border-[#C29B53] shadow-xs'
                    : 'bg-[#FAF7F2]/80 border-[#DFC694] hover:bg-white hover:border-[#C29B53] shadow-2xs'
                }`}
              >
                {isSelected && (
                  <Check className="absolute top-2 right-2 w-3.5 h-3.5 text-[#C29B53]" aria-hidden="true" />
                )}
                <span
                  aria-hidden="true"
                  className="w-11 h-11 flex items-center justify-center rounded-full text-xl shadow-2xs"
                  style={{ backgroundColor: gift.color + '18' }}
                >
                  {gift.icon}
                </span>
                <span className="text-xs mt-2 font-serif font-medium text-[#261E19]">{gift.label}</span>
                <span className="text-[11px] font-serif text-[#8A7565] tabular-nums mt-0.5">
                  {gift.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
