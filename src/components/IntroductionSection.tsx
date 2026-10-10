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
    <section className="relative pt-16 pb-0 px-5 text-center select-none overflow-hidden">
      <div className="max-w-[400px] mx-auto">
        {/* Top Gold Rule */}
        <span className="rule" aria-hidden="true" />

        {/* Section Heading */}
        <span className="eyebrow block mt-2 mb-1">Шинэ өргөөний баяр</span>
        <h2 className="title text-[#261E19] mb-4">Урилга</h2>

        {/* Ceremonial Message */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="font-serif text-[15px] sm:text-[16px] leading-[1.8] text-[#4D3D32] px-2 my-4"
        >
          Шинэ өргөө, шинэ дурсамж, шинэхэн эхлэл...<br />
          Та бүхнийг гал голомтоо бадрааж буй энэхүү баярт мөчид гэр бүлийн хамт хүрэлцэн ирж, сэтгэлийн гэгээн ерөөлөө хайрлана уу хэмээн хүндэтгэлтэйгээр урин залж байна.
        </motion.p>

        {/* Ornamental Knot */}
        <div className="ulzii-ornament my-4" aria-hidden="true" />

        {/* Date & Time Highlights */}
        <div className="my-6 py-5 px-4 rounded-xl border border-[#DFC694]/60 bg-[#FAF7F2]/90 backdrop-blur-xs shadow-xs">
          <p className="font-serif text-[16px] sm:text-[18px] text-[#261E19] font-medium mb-1">
            2026 оны 10 сарын {targetDay}, {targetWeekday} гараг
          </p>
          <p className="display text-3xl sm:text-4xl text-[#261E19] my-2">
            15:00 цагт
          </p>
          <span className="eyebrow text-[11px] text-[#8A7565]">
            {isDay2 ? 'Хоёр дахь өдрийн цайллага' : 'Эхний өдрийн цайллага'}
          </span>

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
