import React from 'react';
import { motion } from 'motion/react';
import { Calendar } from 'lucide-react';
import { EventConfig } from '../types';

export const IntroductionSection: React.FC<{ config: EventConfig }> = ({ config }) => {
  const isDay2 = config.selectedDay === 2;
  const targetDay = isDay2 ? (config.day2 || 24) : 23;
  const targetWeekday = isDay2 ? 'Бямба' : 'Баасан';

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
    <section className="relative pt-16 pb-0 px-5 text-center select-none overflow-hidden">
      <div className="max-w-[400px] mx-auto">
        {/* Top Gold Rule */}
        <span className="rule" aria-hidden="true" />

        {/* Section Heading */}
        <span className="eyebrow block mt-2 mb-1">Шинэ өргөөний баяр</span>
        <h2 className="title text-[#261E19] mb-4">Урилга</h2>

        {/* Ceremonial Invitation Verse (From Image) */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="my-5 px-2 max-w-[370px] mx-auto text-center"
        >
          {/* Top greeting line */}
          <p className="font-serif italic font-semibold text-[17px] sm:text-[19px] text-[#7A4F23] tracking-wide mb-3.5 leading-snug">
            Эрхэм хүндэт таныг гэр бүлийн хамт
          </p>

          {/* Alliterative Mongolian housewarming poem */}
          <div className="font-serif text-[15px] sm:text-[16.5px] leading-[2.1] text-[#261E19] font-normal space-y-0.5">
            <p>Ургах нарыг угтан сүндэрлэсэн</p>
            <p>Ураг төрөл батжин дэлгэрсэн</p>
            <p>Эцэг өвгөдийнхөө голомтыг</p>
            <p>өргөтгөн тэлж буй бидний</p>
          </div>

          {/* Highlighted Event Title in royal blue */}
          <div className="mt-3 pt-1">
            <p className="font-serif italic font-bold text-[21px] sm:text-[24px] text-[#1D4ED8] tracking-normal leading-snug drop-shadow-2xs">
              Шинэ байшингийн цайллаганд
            </p>
            <p className="font-serif text-[15px] sm:text-[16.5px] text-[#261E19] mt-1.5 font-normal">
              хүрэлцэн ирэхийг урьж байна.
            </p>
          </div>
        </motion.div>

        {/* Ornamental Knot */}
        <div className="ulzii-ornament my-4" aria-hidden="true" />

        {/* Date & Time Highlights */}
        <div className="my-6 py-5 px-4 rounded-xl border border-[#DFC694]/60 bg-[#FAF7F2]/90 backdrop-blur-xs shadow-xs">
          <p className="font-serif text-[16px] sm:text-[18px] text-[#261E19] font-medium mb-1">
            2026 оны 10 сарын {targetDay}, {targetWeekday} гараг
          </p>
          {config.timeRange?.trim() && (
            <p className="display text-3xl sm:text-4xl text-[#261E19] my-2">
              {config.timeRange}
            </p>
          )}

          <div className="mt-4 pt-3 border-t border-[#DFC694]/40">
            <button
              type="button"
              onClick={handleCalendar}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#C29B53]/45 bg-[#FAF7F2] text-xs font-serif text-[#261E19] hover:bg-white cursor-pointer transition-all shadow-2xs"
            >
              <Calendar className="w-3.5 h-3.5 text-[#C29B53]" aria-hidden="true" />
              <span>Календарт тэмдэглэх</span>
            </button>
          </div>
        </div>
      </div>

      {/* AI-Generated Housewarming Still Life Watercolor Band */}
      <div className="land-art-band mt-2" aria-hidden="true">
        <img
          src={`${import.meta.env.BASE_URL}images/art/land-still-life.jpg`}
          alt="Шинэ гэрийн бэлгэдэл, алтан түлхүүр, сүүтэй цайны зураглал"
          width={1920}
          height={1080}
          loading="lazy"
        />
      </div>
    </section>
  );
};
