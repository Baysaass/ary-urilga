import React, { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';
import { EventConfig } from '../types';

export const DateCountdownSection: React.FC<{ config: EventConfig }> = ({ config }) => {
  const isDay2 = config.selectedDay === 2;
  const targetDay = isDay2 ? (config.day2 || 24) : 23;
  const targetWeekday = isDay2 ? 'Бямба гараг' : 'Баасан гараг';
  const dayBadge = isDay2 ? '2 ДАХЬ ӨДРИЙН УРИЛГА (10.24)' : '1 ДЭХ ӨДРИЙН УРИЛГА (10.23)';

  // Event start time: 15:00 Ulaanbaatar time (UTC+8) -> 07:00 UTC
  const targetDateUtc = Date.UTC(config.year || 2026, (config.month || 10) - 1, targetDay, 7, 0, 0);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 10000);
    return () => window.clearInterval(timer);
  }, []);

  const diffMs = targetDateUtc - now;
  const days = Math.max(0, Math.ceil(diffMs / 86400000));
  const isEventDay = diffMs <= 0 && diffMs > -86400000;

  const handleCalendar = () => {
    const dayOfMonthStr = String(targetDay).padStart(2, '0');
    const startIso = `${config.year || 2026}10${dayOfMonthStr}T150000`;
    const endIso = `${config.year || 2026}10${dayOfMonthStr}T210000`;
    const dayLabel = isDay2 ? '2 дахь өдөр' : '1 дэх өдөр';
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `${config.hosts} · Шинэ гэрийн цайллага (${dayLabel})`,
      dates: `${startIso}/${endIso}`,
      location: [config.locationCity, config.locationDistrict, config.locationAddress].filter(Boolean).join(', '),
      details: `Шинэ гэрийн цайллагын урилга (${dayLabel}) - ${config.hosts}`,
    });
    window.open('https://calendar.google.com/calendar/render?' + params, '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="event-date" className="py-12 px-6 text-center select-none">
      <div className="max-w-[360px] mx-auto py-9 px-6 rounded-3xl bg-[#F7F1E5]/70 border border-[#B49368]/20 paper-card-shadow">
        <div className="mb-4">
          <span className="inline-block px-3 py-1 rounded-full bg-[#B6785D]/10 text-[#B6785D] border border-[#B6785D]/20 text-[11px] font-semibold tracking-wider">
            {dayBadge}
          </span>
        </div>

        <span className="text-xs tracking-[0.25em] text-[#B49368]">{config.year || 2026} ОН</span>
        <p className="mt-2 font-sans-ui tracking-widest">{config.month || 10} САРЫН</p>
        <div className="font-serif-title text-8xl leading-none py-3 text-[#29231E]">
          {String(targetDay).padStart(2, '0')}
        </div>
        <p className="font-sans-ui text-lg text-[#29231E]">{targetWeekday}</p>
        
        <div className="w-24 h-px bg-[#B49368]/30 mx-auto my-6" />

        {diffMs > 0 ? (
          <p className="text-sm text-[#29231E]/70 font-sans-ui">
            Баярын өдөр хүртэл <strong className="text-[#B6785D] text-lg font-serif-title">{days}</strong> өдөр
          </p>
        ) : (
          <p className="font-serif-editorial text-lg text-[#B6785D]">
            {isEventDay ? 'Баярт өдөр тохиож байна 🤍' : 'Хамтдаа бүтээсэн сайхан дурсамж'}
          </p>
        )}

        <button
          type="button"
          onClick={handleCalendar}
          className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-[#B49368]/40 bg-white/60 text-xs hover:bg-white cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B6785D] transition-colors"
        >
          <Calendar className="w-4 h-4 text-[#B6785D]" aria-hidden="true" />
          <span>Календарт тэмдэглэх</span>
        </button>
      </div>
    </section>
  );
};
