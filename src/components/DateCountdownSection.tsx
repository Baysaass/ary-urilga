import React from 'react';
import { Calendar } from 'lucide-react';
import { EventConfig } from '../types';

export const DateCountdownSection: React.FC<{ config: EventConfig }> = ({ config }) => {
  const isDay2 = config.selectedDay === 2;
  const targetDay = isDay2 ? (config.day2 || 24) : 23;
  const targetWeekday = isDay2 ? 'Бямба' : 'Баасан';

  // October 2026 calendar days:
  // 1st of October 2026 was a Thursday.
  // Leading empty cells for Mon, Tue, Wed: 3
  const leadingBlanks = [null, null, null];
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  const handleCalendar = () => {
    const dayOfMonthStr = String(targetDay).padStart(2, '0');
    const startIso = `${config.year || 2026}10${dayOfMonthStr}T150000`;
    const endIso = `${config.year || 2026}10${dayOfMonthStr}T210000`;
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `${config.hosts} · Шинэ гэрийн цайллага`,
      dates: `${startIso}/${endIso}`,
      location: [config.locationCity, config.locationDistrict, config.locationAddress].filter(Boolean).join(', '),
      details: `Шинэ гэрийн цайллагын урилга - ${config.hosts}`,
    });
    window.open('https://calendar.google.com/calendar/render?' + params, '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="event-date" className="relative py-12 px-5 text-center select-none overflow-hidden">
      <div className="max-w-[380px] mx-auto">
        <span className="eyebrow block mb-2">Хуанли</span>
        <h3 className="title text-[#261E19] mb-5">Билгийн тоолол</h3>

        {/* Traditional Stamped Month Calendar Grid */}
        <div className="cal">
          <p className="cal-title">10 САР <i>·</i> 2026</p>

          <div className="cal-head">
            <span>Да</span>
            <span>Мя</span>
            <span>Лх</span>
            <span>Пү</span>
            <span>Ба</span>
            <span>Бя</span>
            <span>Ня</span>
          </div>

          <div className="cal-grid">
            {leadingBlanks.map((_, idx) => (
              <span key={`blank-${idx}`} aria-hidden="true" />
            ))}

            {daysInMonth.map((dayNum) => {
              const isMarked = dayNum === targetDay;
              const isOtherEventDay = (dayNum === 23 || dayNum === 24) && !isMarked;

              return (
                <span
                  key={dayNum}
                  className={`
                    ${isMarked ? 'cal-day--mark' : ''}
                    ${isOtherEventDay ? 'text-[#C29B53] font-semibold' : ''}
                  `}
                >
                  {dayNum}
                </span>
              );
            })}
          </div>
        </div>

        {/* Date Description & Calendar Save CTA */}
        <div className="mt-6">
          <p className="font-serif text-[15px] text-[#261E19] font-medium">
            2026 оны 10 сарын {targetDay}, {targetWeekday} гараг
          </p>
          {config.timeRange?.trim() && (
            <p className="font-serif text-xs text-[#8A7565] italic mt-1">
              {config.timeRange}
            </p>
          )}

          <button
            type="button"
            onClick={handleCalendar}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#C29B53]/45 bg-[#FAF7F2] text-xs font-serif text-[#261E19] hover:bg-white active:scale-95 transition-all cursor-pointer shadow-2xs"
          >
            <Calendar className="w-3.5 h-3.5 text-[#C29B53]" aria-hidden="true" />
            <span>Google календарт тэмдэглэх</span>
          </button>
        </div>
      </div>
    </section>
  );
};
