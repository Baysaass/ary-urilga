import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Heart, Send, Check, Share2 } from 'lucide-react';
import { UlziiPattern, EditorialFlourish } from './MongolianMotifs';
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
        // user dismissed or share cancelled
      }
    }

    // fallback copy link
    navigator.clipboard?.writeText(window.location.href);
    setShared(true);
    setTimeout(() => setShared(false), 2500);
  };

  return (
    <section className="relative min-h-[90svh] py-20 px-6 flex flex-col justify-between items-center text-center select-none overflow-hidden bg-gradient-to-b from-transparent via-[#F5ECE0]/60 to-[#EFE5D3]/90">
      {/* Decorative top knot */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="pt-4"
      >
        <UlziiPattern size={32} color="#B49368" strokeWidth={1.3} />
      </motion.div>

      {/* Main Closing Poem */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9 }}
        className="my-auto max-w-[320px] space-y-6"
      >
        <p className="font-serif-editorial text-2xl sm:text-[26px] leading-[1.65] text-[#29231E] font-normal">
          Шинэ гэрийг<br />
          эд зүйлс биш,<br />
          <span className="italic text-[#B6785D] block my-2">
            хамтдаа бүтээсэн дурсамж,<br />
            инээд хөөр,<br />
            сайхан ерөөл
          </span>
          гэр болгодог.
        </p>

        <EditorialFlourish className="opacity-50" />

        <div className="pt-2">
          <p className="font-serif-title text-2xl text-[#29231E] font-medium">
            Таныг хүлээж байна 🤍
          </p>
          <p className="font-sans-ui text-xs text-[#29231E]/70 mt-1">
            {config.hosts}
          </p>
        </div>
      </motion.div>

      {/* CTAs */}
      <div className="w-full max-w-[320px] space-y-3 pb-6">
        <button
          onClick={onGoToRsvp}
          className="w-full py-3.5 px-4 rounded-xl bg-[#B6785D] text-white text-xs uppercase tracking-wider font-medium shadow-md hover:bg-[#A3664C] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Heart className="w-4 h-4 fill-white" />
          <span>Ирэхээ баталгаажуулах</span>
        </button>

        <button
          onClick={onGoToBlessing}
          className="w-full py-3 px-4 rounded-xl border border-[#B49368]/40 bg-[#FAF7F0] text-xs uppercase tracking-wider font-medium text-[#29231E] hover:bg-white active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
        >
          <Send className="w-3.5 h-3.5 text-[#B49368]" />
          <span>Ерөөл үлдээх</span>
        </button>

        <button
          onClick={handleShare}
          className="w-full py-2 px-3 text-[11px] text-[#29231E]/70 hover:text-[#29231E] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          {shared ? (
            <>
              <Check className="w-3 h-3 text-emerald-600" />
              <span className="text-emerald-700">Урилгын линк хуулагдлаа!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3 h-3 text-[#B49368]" />
              <span>Урилгыг бусдад хуваалцах</span>
            </>
          )}
        </button>
      </div>
    </section>
  );
};
