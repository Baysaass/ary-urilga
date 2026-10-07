import React from 'react';
import { motion } from 'motion/react';
import { UlziiPattern, EditorialFlourish } from './MongolianMotifs';
import { EventConfig } from '../types';

export const IntroductionSection: React.FC<{ config: EventConfig }> = ({ config }) => {
  return (
    <section className="relative py-20 px-6 text-center select-none overflow-hidden">
      {/* Decorative top glyph */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.8 }}
        className="flex justify-center mb-6"
      >
        <UlziiPattern size={28} color="#B49368" strokeWidth={1.3} />
      </motion.div>

      {/* Main emotive poetry */}
      <div className="max-w-[320px] mx-auto space-y-4">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="font-serif-editorial text-2xl sm:text-[26px] leading-relaxed text-[#29231E] font-normal"
        >
          Шинэ гэр,<br />
          шинэ дурсамж,<br />
          <span className="italic text-[#B6785D]">шинэ эхлэл.</span>
        </motion.p>

        <EditorialFlourish className="my-6 opacity-60" />

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="font-sans-ui text-sm sm:text-[15px] leading-relaxed text-[#29231E]/80 font-light"
        >
          {config.introSubtext}
        </motion.p>
      </div>

      {/* Subtle bottom subtle border accent */}
      <div className="mt-14 max-w-[120px] mx-auto h-[1px] bg-gradient-to-r from-transparent via-[#B49368]/30 to-transparent" />
    </section>
  );
};
