import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Navigation, Copy, Check } from 'lucide-react';
import { EventConfig } from '../types';

export const LocationSection: React.FC<{ config: EventConfig }> = ({ config }) => {
  const [copied, setCopied] = useState(false);

  const fullAddress = `${config.locationCity}, ${config.locationDistrict}, ${config.locationAddress}`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(fullAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenMap = () => {
    if (config.googleMapsUrl) {
      window.open(config.googleMapsUrl, '_blank', 'noopener,noreferrer');
    } else {
      window.open(`https://maps.google.com/?q=${encodeURIComponent(fullAddress)}`, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <section className="relative py-16 px-6 text-center select-none overflow-hidden">
      <div className="max-w-[360px] mx-auto rounded-3xl bg-[#F7F1E5]/80 border border-[#B49368]/20 paper-card-shadow overflow-hidden">
        {/* Address Card Body */}
        <div className="p-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#B49368] font-medium block mb-1">
              БАЙРШИЛ & ХАЯГ
            </span>
            <h3 className="font-serif-title text-2xl text-[#29231E] font-medium">
              {config.locationCity}
            </h3>
            <p className="font-sans-ui text-xs text-[#29231E]/70 mt-1">
              {config.locationDistrict}
            </p>
            <p className="font-sans-ui text-sm text-[#29231E] font-medium mt-2 leading-snug px-2">
              {config.locationAddress}
            </p>
          </motion.div>

          {/* Action buttons */}
          <div className="mt-6 flex flex-col gap-2.5">
            <button
              onClick={handleOpenMap}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#29231E] text-[#FAF7F0] text-xs font-medium tracking-wide shadow-md hover:bg-[#3D352E] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Navigation className="w-4 h-4 text-[#D4B98E]" />
              <span>Газрын зураг нээх</span>
            </button>

            <button
              onClick={handleCopy}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-[#B49368]/30 bg-transparent text-xs font-medium text-[#29231E] hover:bg-[#FAF7F0] active:scale-[0.98] transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Хаяг хуулагдлаа!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#B49368]" />
                  <span>Хаяг хуулах</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
