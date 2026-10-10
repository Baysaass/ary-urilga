import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Heart, Send, Check, Share2 } from 'lucide-react';
import { EventConfig } from '../types';

interface ClosingSectionProps {
  config: EventConfig;
  onGoToRsvp: () => void;
  onGoToBlessing: () => void;
}

export const ClosingSection: React.FC<ClosingSectionProps> = ({
  config,
  onGoToRsvp,
  onGoToBlessing,
}) => {
  const [shared, setShared] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: `${config.hosts} · Шинэ гэрийн цайллагын урилга`,
      text: `Танд урилга ирлээ - ${config.hosts} нарын шинэ гэрийн цайллагын урилга.`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (e) {
        // cancelled or dismissed
      }
    }

    navigator.clipboard?.writeText(window.location.href);
    setShared(true);
    setTimeout(() => setShared(false), 2500);
  };

  return (
    <section className="relative pt-16 pb-14 px-6 flex flex-col justify-between items-center text-center select-none overflow-hidden">
      {/* Top Gold Rule */}
      <span className="rule" aria-hidden="true" />

      {/* Main Closing Poem */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9 }}
        className="my-6 max-w-[360px] space-y-4"
      >
        <span className="eyebrow block mb-2">Талархал</span>
        <p className="font-serif text-[17px] sm:text-[19px] leading-[1.8] text-[#261E19] font-normal">
          Шинэ өргөөг эд зүйлс бус,<br />
          <span className="text-[#C29B53] font-medium block my-1">
            хамтдаа бүтээсэн нандин дурсамж, инээд хөөр, гэгээн ерөөл
          </span>
          жинхэнэ гэр болгон дулаацуулдаг билээ.
        </p>

        <div className="ulzii-ornament my-4" aria-hidden="true" />

        <div className="pt-2">
          <p className="display text-2xl text-[#261E19]">
            Таныг хүндэтгэн урьж байна 🤍
          </p>
          <p className="font-serif text-sm text-[#8A7565] mt-1 tracking-wider uppercase">
            {config.hosts}
          </p>
        </div>
      </motion.div>

      {/* CTAs */}
      <div className="w-full max-w-[340px] space-y-3 mt-4">
        <button
          type="button"
          onClick={onGoToRsvp}
          className="ceremonial-btn flex items-center justify-center gap-2 cursor-pointer"
        >
          <Heart className="w-4 h-4 fill-current text-[#C29B53]" />
          <span>Хүрэлцэн ирэхээ мэдэгдэх</span>
        </button>

        <button
          type="button"
          onClick={onGoToBlessing}
          className="w-full py-3 px-4 rounded-md border border-[#DFC694] bg-[#FAF7F2]/90 text-xs font-serif uppercase tracking-widest text-[#261E19] hover:bg-white active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
        >
          <Send className="w-3.5 h-3.5 text-[#C29B53]" />
          <span>Шинэ өргөөнд ерөөл өргөх</span>
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="w-full py-2.5 px-3 text-xs font-serif text-[#8A7565] hover:text-[#261E19] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          {shared ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700 font-semibold">Урилгын линк хуулагдлаа!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5 text-[#C29B53]" />
              <span>Урилгыг бусдад хуваалцах</span>
            </>
          )}
        </button>
      </div>

      {/* Signature Footer */}
      <footer className="footer mt-10 pt-6 border-t border-[#DFC694]/30 w-full max-w-[340px]">
        <p className="font-serif text-xs text-[#8A7565] italic mb-1">
          Цахим урилгыг хайр дүүрэн сэтгэлээр урлав ♡
        </p>
        <p className="text-[11px] font-serif text-[#C0913F] tracking-wider uppercase">
          {config.hosts} · 2026
        </p>
      </footer>
    </section>
  );
};
