import React, { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';
import { EventConfig } from '../types';

export const DateCountdownSection: React.FC<{ config: EventConfig }> = ({ config }) => {
  const [activeTab, setActiveTab] = useState<1 | 2>(config.selectedDay || 1);
  const displayDay = config.selectedDay || activeTab;
  const targetDay = displayDay === 2 ? (config.day2 || 24) : config.day;

  const date = new Date(Date.UTC(config.year, config.month - 1, targetDay));
  const target = date.getTime() - 8 * 60 * 60 * 1000;
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  const days = Math.max(0, Math.ceil((target - now) / 86400000));
  const isEventDay = now >= target && now < target + 86400000;
  const weekdays = ['Ням', 'Даваа', 'Мягмар', 'Лхагва', 'Пүрэв', 'Баасан', 'Бямба'];

  const handleCalendar = () => {
    const format = (d: Date) => d.toISOString().slice(0, 10).replaceAll('-', '');
    const end = new Date(date.getTime() + 86400000);
    const dayLabel = displayDay === 2 ? '2 дахь өдөр' : '1 дэх өдөр';
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `${config.hosts} · Шинэ гэрийн цайллага (${dayLabel})`,
      dates: `${format(date)}/${format(end)}`,
      location: [config.locationCity, config.locationDistrict, config.locationAddress].join(', '),
      details: `Шинэ гэрийн цайллагын урилга (${dayLabel})`,
    });
    window.open('https://calendar.google.com/calendar/render?' + params, '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="event-date" className="py-12 px-6 text-center">
      <div className="max-w-[360px] mx-auto py-9 px-6 rounded-3xl bg-[#F7F1E5]/70 border border-[#B49368]/20 paper-card-shadow">
        {/* If no day was specified in URL, show day switcher */}
        {!config.selectedDay ? (
          <div className="flex justify-center gap-2 mb-6 p-1 bg-white/60 rounded-full border border-[#B49368]/20 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab(1)}
              className={`px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer ${
                activeTab === 1 ? 'bg-[#B6785D] text-white shadow-sm' : 'text-[#29231E]/70 hover:text-[#29231E]'
              }`}
            >
              1 дэх өдөр (10.23)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab(2)}
              className={`px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer ${
                activeTab === 2 ? 'bg-[#B6785D] text-white shadow-sm' : 'text-[#29231E]/70 hover:text-[#29231E]'
              }`}
            >
              2 дахь өдөр (10.24)
            </button>
          </div>
        ) : (
          <div className="mb-4">
            <span className="inline-block px-3 py-1 rounded-full bg-[#B6785D]/10 text-[#B6785D] border border-[#B6785D]/20 text-[11px] font-semibold tracking-wider">
              {config.selectedDay === 1 ? '1 ДЭХ ӨДРИЙН УРИЛГА (10.23)' : '2 ДАХЬ ӨДРИЙН УРИЛГА (10.24)'}
            </span>
          </div>
        )}

        <span className="text-xs tracking-[0.25em] text-[#B49368]">{config.year} ОН</span>
        <p className="mt-2 font-sans-ui tracking-widest">{config.month} САРЫН</p>
        <div className="font-serif-title text-8xl leading-none py-3">{String(targetDay).padStart(2, '0')}</div>
        <p className="font-sans-ui text-lg">{weekdays[date.getUTCDay()]} гараг</p>
        
        <div className="w-24 h-px bg-[#B49368]/30 mx-auto my-6" />

        {days > 0 ? (
          <p className="text-sm text-[#29231E]/70">
            Баярын өдөр хүртэл <strong className="text-[#B6785D] text-lg">{days}</strong> өдөр
          </p>
        ) : (
          <p className="font-serif-editorial text-lg text-[#B6785D]">
            {isEventDay ? 'Баярт өдөр тохиож байна' : 'Хамтдаа бүтээсэн сайхан дурсамж'}
          </p>
        )}

        <button
          type="button"
          onClick={handleCalendar}
          className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-[#B49368]/40 text-xs hover:bg-white cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B6785D]"
        >
          <Calendar className="w-4 h-4" aria-hidden="true" /> Календарт тэмдэглэх
        </button>
      </div>
    </section>
  );
};
