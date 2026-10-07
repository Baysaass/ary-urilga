import React from 'react';
import { Blessing } from '../types';
import { BlessingReactions } from './BlessingReactions';

export function BlessingWall({ blessings, onReactionUpdated }: { blessings: Blessing[]; onReactionUpdated?: () => void }) {
  return <section id="blessing-wall" className="py-16 px-6">
    <div className="max-w-[380px] mx-auto">
      <div className="text-center mb-8">
        <span className="text-[11px] tracking-[0.25em] text-[#B49368]">СЭТГЭЛИЙН ХУРААНГУЙ</span>
        <h2 className="font-serif-title text-3xl mt-1">Та бүхний ерөөл</h2>
        <p className="text-xs text-[#29231E]/65 mt-3">{blessings.length ? blessings.length + ' сайхан ерөөл үлдээд байна.' : 'Та анхны ерөөлийг үлдээгээрэй.'}</p>
        {!!blessings.length && <p className="text-[11px] text-[#29231E]/50 mt-2">Ерөөл бүрт нэг төрлийн хариу сонгож болно.</p>}
      </div>
      <div className="space-y-5">
        {blessings.map(item => <article key={item.id} className="p-6 rounded-2xl bg-[#FAF7F0] border border-[#B49368]/25 paper-card-shadow">
          <blockquote className="font-serif-editorial text-lg italic leading-relaxed break-words">“{item.message}”</blockquote>
          <div className="mt-4 pt-3 border-t border-[#B49368]/15">
            <p className="text-xs font-medium text-[#29231E]/70 mb-2 break-words">— {item.guest_name}</p>
            <BlessingReactions blessing={item} onUpdated={onReactionUpdated} />
          </div>
        </article>)}
      </div>
    </div>
  </section>;
}
