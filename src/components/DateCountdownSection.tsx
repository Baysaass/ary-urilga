import React, { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';
import { EventConfig } from '../types';

export const DateCountdownSection: React.FC<{ config: EventConfig }> = ({ config }) => {
  const date = new Date(Date.UTC(config.year, config.month - 1, config.day));
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
    const params = new URLSearchParams({ action: 'TEMPLATE', text: config.hosts + ' · Шинэ гэрийн цайллага', dates: format(date) + '/' + format(end), location: [config.locationCity, config.locationDistrict, config.locationAddress].join(', '), details: 'Шинэ гэрийн цайллагын урилга' });
    window.open('https://calendar.google.com/calendar/render?' + params, '_blank', 'noopener,noreferrer');
  };
  return <section id="event-date" className="py-12 px-6 text-center">
    <div className="max-w-[360px] mx-auto py-9 px-6 rounded-3xl bg-[#F7F1E5]/70 border border-[#B49368]/20 paper-card-shadow">
      <span className="text-xs tracking-[0.25em] text-[#B49368]">{config.year} ОН</span>
      <p className="mt-2 font-sans-ui tracking-widest">{config.month} САРЫН</p>
      <div className="font-serif-title text-8xl leading-none py-3">{String(config.day).padStart(2, '0')}</div>
      <p className="font-sans-ui text-lg">{weekdays[date.getUTCDay()]} гараг</p>
      <div className="w-24 h-px bg-[#B49368]/30 mx-auto my-6" />
      {days > 0 ? <p className="text-sm text-[#29231E]/70">Баярын өдөр хүртэл <strong className="text-[#B6785D] text-lg">{days}</strong> өдөр</p> : <p className="font-serif-editorial text-lg text-[#B6785D]">{isEventDay ? 'Баярт өдөр тохиож байна' : 'Хамтдаа бүтээсэн сайхан дурсамж'}</p>}
      <button type="button" onClick={handleCalendar} className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-[#B49368]/40 text-xs hover:bg-white cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B6785D]">
        <Calendar className="w-4 h-4" aria-hidden="true" /> Календарт тэмдэглэх
      </button>
    </div>
  </section>;
};
