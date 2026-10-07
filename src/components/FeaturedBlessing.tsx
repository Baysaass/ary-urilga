import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import type { Blessing } from '../types';
import { EditorialFlourish } from './MongolianMotifs';

export function FeaturedBlessing({ blessings, onWriteBlessing }: { blessings: Blessing[]; onWriteBlessing: () => void }) {
  const [activeId, setActiveId] = useState<string>();
  const [paused, setPaused] = useState(false);
  const [focused, setFocused] = useState(false);
  const reducedMotion = useReducedMotion();
  const blessingIds = blessings.map(blessing => blessing.id).join('|');
  const foundIndex = blessings.findIndex(b => b.id === activeId);
  const index = Math.max(0, foundIndex);
  const current = blessings[index];
  const move = (direction: number) => {
    if (!blessings.length) return;
    setActiveId(blessings[(index + direction + blessings.length) % blessings.length].id);
  };
  useEffect(() => {
    if (blessings.length < 2 || paused || focused || reducedMotion) return;
    const timer = window.setInterval(() => {
      setActiveId(id => {
        const active = Math.max(0, blessings.findIndex(b => b.id === id));
        return blessings[(active + 1) % blessings.length].id;
      });
    }, 6500);
    return () => window.clearInterval(timer);
    // Reaction/count refreshes must not restart the rotation timer.
  }, [blessingIds, paused, focused, reducedMotion]);

  return <section id="guest-blessing-cards" className="py-12 px-6 text-center overflow-hidden"
    onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
    aria-label="Зочдын ерөөлийн картууд" aria-roledescription="ээлжлэн харагдах картууд">
    <div className="max-w-[360px] mx-auto">
      <span className="block text-[10px] tracking-[0.25em] text-[#B49368] mb-2">ЗОЧДЫН СЭТГЭЛИЙН ҮГ</span>
      <h2 className="font-serif-title text-3xl mb-7">Таны ерөөл гэрт минь</h2>
      <div className="relative" style={{ perspective: 1000 }}>
        {blessings.length > 1 && <div aria-hidden="true" className="absolute inset-0 rounded-3xl bg-[#EADCC8]/40 border border-[#B49368]/20 rotate-3 translate-y-1" />}
        <AnimatePresence mode="wait" initial={false}>
          <motion.article key={current?.id || 'empty'}
            initial={{ opacity: 0, rotateY: reducedMotion ? 0 : -24 }} animate={{ opacity: 1, rotateY: 0 }} exit={{ opacity: 0, rotateY: reducedMotion ? 0 : 24 }}
            transition={{ duration: reducedMotion ? 0 : 0.35 }}
            className="relative min-h-64 flex flex-col justify-center rounded-3xl bg-[#F7F1E5] border border-[#B49368]/25 px-6 py-8 paper-card-shadow">
            <EditorialFlourish className="mb-5 opacity-50" />
            {current ? <>
              <blockquote className="font-serif-editorial text-xl italic leading-relaxed break-words">“{current.message}”</blockquote>
              <p className="mt-5 text-xs font-medium text-[#B6785D]">— {current.guest_name}</p>
              <p className="mt-2 text-[10px] text-[#29231E]/45">{new Date(current.created_at).toLocaleDateString('mn-MN')}</p>
            </> : <>
              <p className="font-serif-editorial text-xl leading-relaxed">Энэ гэрийн анхны ерөөл<br />таны үгээр эхэлнэ.</p>
              <button type="button" onClick={onWriteBlessing} className="mx-auto mt-6 text-xs text-[#B6785D] underline underline-offset-4 cursor-pointer">Ерөөлөө үлдээх</button>
            </>}
          </motion.article>
        </AnimatePresence>
      </div>
      {blessings.length > 1 && <div className="mt-6 flex justify-center items-center gap-3">
        <button type="button" onClick={() => move(-1)} aria-label="Өмнөх ерөөл" className="w-10 h-10 rounded-full border border-[#B49368]/30 flex items-center justify-center cursor-pointer hover:bg-[#F3EBDD]"><ChevronLeft className="w-4 h-4" /></button>
        <span className="text-xs tabular-nums text-[#29231E]/60" aria-live="off">{index + 1} / {blessings.length}</span>
        <button type="button" onClick={() => move(1)} aria-label="Дараагийн ерөөл" className="w-10 h-10 rounded-full border border-[#B49368]/30 flex items-center justify-center cursor-pointer hover:bg-[#F3EBDD]"><ChevronRight className="w-4 h-4" /></button>
        {!reducedMotion && <button type="button" onClick={() => setPaused(value => !value)} aria-label={paused ? 'Ерөөл ээлжлүүлэх' : 'Ерөөл ээлжлүүлэхийг түр зогсоох'} aria-pressed={paused} className="w-10 h-10 flex items-center justify-center text-[#29231E]/60 cursor-pointer">{paused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}</button>}
      </div>}
      {!!blessings.length && <p className="mt-4 text-[11px] text-[#29231E]/55">{blessings.length} зочны ерөөл</p>}
    </div>
  </section>;
}
