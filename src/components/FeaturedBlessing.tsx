import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Blessing } from '../types';

export function FeaturedBlessing({
  blessings,
  onWriteBlessing,
}: {
  blessings: Blessing[];
  onWriteBlessing: () => void;
}) {
  const [activeId, setActiveId] = useState<string>();
  const [paused, setPaused] = useState(false);
  const [focused, setFocused] = useState(false);
  const reducedMotion = useReducedMotion();
  const blessingIds = blessings.map((b) => b.id).join('|');
  const foundIndex = blessings.findIndex((b) => b.id === activeId);
  const index = Math.max(0, foundIndex);
  const current = blessings[index];

  const move = (direction: number) => {
    if (!blessings.length) return;
    setActiveId(blessings[(index + direction + blessings.length) % blessings.length].id);
  };

  useEffect(() => {
    if (blessings.length < 2 || paused || focused || reducedMotion) return;
    const timer = window.setInterval(() => {
      setActiveId((id) => {
        const active = Math.max(0, blessings.findIndex((b) => b.id === id));
        return blessings[(active + 1) % blessings.length].id;
      });
    }, 6500);
    return () => window.clearInterval(timer);
  }, [blessingIds, paused, focused, reducedMotion]);

  return (
    <section
      id="guest-blessing-cards"
      className="py-14 px-5 text-center overflow-hidden select-none"
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
      aria-label="Зочдын ерөөлийн картууд"
    >
      <div className="max-w-[380px] mx-auto">
        <span className="rule" aria-hidden="true" />
        <span className="eyebrow block mt-2 mb-1">Зочдын сэтгэлийн үг</span>
        <h2 className="title text-[#261E19] mb-6">Эрхэм зочдын гэгээн ерөөл</h2>

        <div className="relative">
          <AnimatePresence mode="wait" initial={false}>
            <motion.article
              key={current?.id || 'empty'}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.35 }}
              className="relative min-h-60 flex flex-col justify-center rounded-2xl bg-[#FAF7F2]/95 border border-[#DFC694] p-6 shadow-sm"
            >
              {current ? (
                <>
                  <blockquote className="font-serif text-[17px] italic leading-relaxed text-[#261E19] break-words">
                    “{current.message}”
                  </blockquote>
                  <p className="mt-4 text-xs font-serif font-bold text-[#C29B53] uppercase tracking-wider">
                    — {current.guest_name}
                  </p>
                  <p className="mt-1 text-[10px] font-serif text-[#8A7565]">
                    {new Date(current.created_at).toLocaleDateString('mn-MN')}
                  </p>
                </>
              ) : (
                <>
                  <p className="font-serif text-[17px] italic leading-relaxed text-[#261E19]">
                    Шинэ өргөөний анхны ерөөл<br />Таны гэгээн үгээр эхэлнэ.
                  </p>
                  <button
                    type="button"
                    onClick={onWriteBlessing}
                    className="mx-auto mt-5 text-xs font-serif text-[#C29B53] underline underline-offset-4 cursor-pointer hover:text-[#261E19]"
                  >
                    Ерөөл өргөх
                  </button>
                </>
              )}
            </motion.article>
          </AnimatePresence>
        </div>

        {blessings.length > 1 && (
          <div className="mt-5 flex justify-center items-center gap-3">
            <button
              type="button"
              onClick={() => move(-1)}
              aria-label="Өмнөх ерөөл"
              className="w-9 h-9 rounded-full border border-[#DFC694] flex items-center justify-center cursor-pointer hover:bg-white text-[#261E19]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-serif tabular-nums text-[#8A7565]">
              {index + 1} / {blessings.length}
            </span>
            <button
              type="button"
              onClick={() => move(1)}
              aria-label="Дараагийн ерөөл"
              className="w-9 h-9 rounded-full border border-[#DFC694] flex items-center justify-center cursor-pointer hover:bg-white text-[#261E19]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
