import React from 'react';
import { Blessing } from '../types';
import { BlessingReactions } from './BlessingReactions';

export function BlessingWall({
  blessings,
  onReactionUpdated,
}: {
  blessings: Blessing[];
  onReactionUpdated?: () => void;
}) {
  return (
    <section id="blessing-wall" className="py-12 px-5 text-center select-none overflow-hidden">
      <div className="max-w-[400px] mx-auto">
        <span className="eyebrow block mb-1">Сэтгэлийн хураангуй</span>
        <h2 className="title text-[#261E19] mb-2">Та бүхний ерөөл</h2>
        <p className="font-serif text-xs text-[#8A7565] italic mb-6">
          {blessings.length
            ? `${blessings.length} сайхан ерөөл үлдээд байна.`
            : 'Та анхны ерөөлийг үлдээгээрэй.'}
        </p>

        <div className="space-y-4">
          {blessings.map((item) => (
            <article
              key={item.id}
              className="p-5 rounded-2xl bg-[#FAF7F2]/95 border border-[#DFC694]/70 shadow-2xs text-left"
            >
              <blockquote className="font-serif text-[15px] italic leading-relaxed text-[#261E19] break-words">
                “{item.message}”
              </blockquote>
              <div className="mt-3 pt-3 border-t border-[#DFC694]/40 flex items-center justify-between flex-wrap gap-2">
                <p className="text-xs font-serif font-bold text-[#C29B53] uppercase tracking-wider">
                  — {item.guest_name}
                </p>
                <BlessingReactions blessing={item} onUpdated={onReactionUpdated} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
