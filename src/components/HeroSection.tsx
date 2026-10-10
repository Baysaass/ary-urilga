import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowDown, Calendar } from 'lucide-react';
import { EventConfig } from '../types';

interface HeroSectionProps {
  config: EventConfig;
  onScrollDown: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ config, onScrollDown }) => {
  const prefersReducedMotion = useReducedMotion();

  const isDay2 = config.selectedDay === 2;
  const targetDay = isDay2 ? (config.day2 || 24) : 23;
  const targetWeekday = isDay2 ? 'Бямба' : 'Баасан';

  // Target: 15:00 Ulaanbaatar time (UTC+8) -> 07:00 UTC
  const targetDateUtc = Date.UTC(config.year || 2026, (config.month || 10) - 1, targetDay, 7, 0, 0);

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const diff = Math.max(0, targetDateUtc - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDateUtc]);

  return (
    <section className="relative pt-12 pb-0 px-4 text-center overflow-hidden" aria-labelledby="hero-title">
      {/* Main Hero Header Block */}
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-[420px] mx-auto"
      >
        <h1 id="hero-title" className="display text-[#261E19] mb-2 tracking-wider">
          Хүндэт Зочин Танаа
        </h1>
        <span className="patronym block text-sm tracking-[0.2em] mb-1.5 text-[#C29B53]">
          {config.hosts || 'Батдорж & Ариунбаяр'} нарын
        </span>
        <span className="eyebrow block mb-5 text-xs tracking-[0.2em] text-[#8A7565]">
          Шинэ гэрийн цайллага
        </span>

        {/* Cloud Arch Framed Couple Photograph */}
        <figure className="arch arch--tall hero-photo my-5 max-w-[290px] mx-auto">
          <img
            src={`${import.meta.env.BASE_URL}images/hero-portrait.png`}
            alt={config.hosts || 'Батдорж & Ариунбаяр'}
            width={880}
            height={1100}
            fetchPriority="high"
            decoding="async"
          />
        </figure>

        {/* Traditional Gold Ornamental Rule */}
        <span className="rule" aria-hidden="true" />

        {/* Warm Poetic Invitation Lines */}
        <p className="font-serif text-[14px] leading-relaxed text-[#4D3D32] max-w-[340px] mx-auto my-3">
          Эрхэм хүндэт ахан дүүс, элгэн садан, анд нөхөд та бүхнийг шинэ өргөөнийхөө гал голомтыг бадраах баярт мөчийг хуваалцан, хүндэтгэн морилно уу хэмээн халуун дотноор урин залж байна.
        </p>

        {/* Datemark */}
        <div className="my-5">
          <p className="datemark">
            2026 <i>·</i> 10 <i>·</i> {targetDay}
            <span className="date-sub">
              {targetWeekday} гараг{config.timeRange?.trim() ? (
                <> <i>·</i> {config.timeRange}</>
              ) : null}
            </span>
          </p>
        </div>

        {/* Live Countdown Grid with bordered cells */}
        <div className="countdown-grid" aria-label="Баяр болоход үлдсэн хугацаа">
          <div className="cd-cell">
            <span className="cd-num">{timeLeft.days}</span>
            <span className="cd-lbl">хоног</span>
          </div>
          <div className="cd-cell">
            <span className="cd-num">{String(timeLeft.hours).padStart(2, '0')}</span>
            <span className="cd-lbl">цаг</span>
          </div>
          <div className="cd-cell">
            <span className="cd-num">{String(timeLeft.minutes).padStart(2, '0')}</span>
            <span className="cd-lbl">минут</span>
          </div>
          <div className="cd-cell">
            <span className="cd-num">{String(timeLeft.seconds).padStart(2, '0')}</span>
            <span className="cd-lbl">секунд</span>
          </div>
        </div>

        {/* Scroll Down Prompt Button */}
        <div className="mt-7 mb-2">
          <button
            type="button"
            onClick={onScrollDown}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FAF7F2]/95 border border-[#C29B53]/45 text-[#261E19] hover:bg-white active:scale-95 transition-all text-xs font-serif tracking-widest uppercase cursor-pointer shadow-xs"
          >
            <span>Цааш үзэх</span>
            <ArrowDown size={14} strokeWidth={1.8} className="text-[#C29B53] animate-bounce" />
          </button>
        </div>
      </motion.div>

      {/* AI-Generated Watercolor Housewarming Apartment Meadow Landscape Band */}
      <div className="land-art-band mt-4" aria-hidden="true">
        <img
          src={`${import.meta.env.BASE_URL}images/art/land-apartment.jpg`}
          alt="Шинэ байрны уран зургийн дүрслэл"
          width={1920}
          height={1080}
          loading="eager"
        />
      </div>
    </section>
  );
};
