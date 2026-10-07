import React from 'react';
import { motion } from 'motion/react';
import { TimelineItem } from '../types';

export const TimelineSection: React.FC<{ items: TimelineItem[] }> = ({ items }) => {
  return (
    <section className="relative py-20 px-6 select-none overflow-hidden">
      <div className="max-w-[340px] mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#B49368] font-medium block mb-1">
            БАЯРЫН ХӨТӨЛБӨР
          </span>
          <h2 className="font-serif-title text-3xl text-[#29231E] font-medium">
            Цагийн хуваарь
          </h2>
          <p className="font-sans-ui text-xs text-[#29231E]/70 mt-1.5">
            Шинэ гэрийн цайллага дараах дарааллаар явагдана
          </p>
        </div>

        {/* Vertical Flowing Timeline */}
        <div className="relative pl-8 pr-2">
          {/* Continuous Vertical Flowing Line */}
          <div className="absolute left-[13px] top-2 bottom-6 w-[1.5px] bg-gradient-to-b from-[#B49368]/40 via-[#B6785D]/60 to-[#B49368]/20" />

          <div className="space-y-10">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.7, delay: index * 0.12 }}
                className="relative group"
              >
                {/* Timeline Node Dot */}
                <div className="absolute -left-[27px] top-1 w-5 h-5 rounded-full bg-[#FAF7F0] border-2 border-[#B6785D] flex items-center justify-center shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-[#B6785D]" />
                </div>

                {/* Content */}
                <div className="space-y-1">
                  <span className="font-serif-editorial text-sm font-semibold tracking-wider text-[#B6785D]">
                    {item.time}
                  </span>
                  <h3 className="font-serif-title text-lg text-[#29231E] font-medium leading-snug">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="font-sans-ui text-xs text-[#29231E]/75 leading-relaxed pt-0.5">
                      {item.description}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
