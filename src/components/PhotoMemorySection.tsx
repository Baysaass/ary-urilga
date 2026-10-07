import React from 'react';
import { motion } from 'motion/react';
import { GalleryPhoto } from '../types';
import { EditorialFlourish } from './MongolianMotifs';

export const PhotoMemorySection: React.FC<{ photos: GalleryPhoto[] }> = ({ photos }) => {
  return (
    <section className="relative py-20 px-6 select-none overflow-hidden">
      <div className="max-w-[360px] mx-auto">
        <div className="text-center mb-12">
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#B49368] font-medium block mb-1">
            ХӨГЖИХ ӨРГӨӨ
          </span>
          <h2 className="font-serif-title text-3xl text-[#29231E] font-medium">
            Дурсамж & Орон зай
          </h2>
          <p className="font-sans-ui text-xs text-[#29231E]/70 mt-1.5">
            Шинэ гэрийн анхны дурсамжууд эндээс эхэлж байна
          </p>
        </div>

        {/* Alternating editorial layout: photo, caption, photo */}
        <div className="space-y-12">
          {photos.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.8, delay: index * 0.15 }}
              className="space-y-3"
            >
              {/* Photo Frame with subtle organic texture & fallback */}
              <div
                className={`relative w-full rounded-2xl overflow-hidden border border-[#B49368]/20 paper-card-shadow ${
                  item.aspect === 'portrait' ? 'h-72 sm:h-80' : 'h-52'
                }`}
              >
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  /* Editorial Architectural Still Life Fallback Graphic */
                  <div className="w-full h-full bg-gradient-to-br from-[#EFE5D5] via-[#FAF7F0] to-[#E3D4C0] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
                    {/* Architectural aesthetic lines */}
                    <svg
                      viewBox="0 0 200 200"
                      className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
                    >
                      <circle cx="100" cy="100" r="80" stroke="#B49368" strokeWidth="1" fill="none" />
                      <line x1="20" y1="100" x2="180" y2="100" stroke="#29231E" strokeWidth="0.8" />
                      <line x1="100" y1="20" x2="100" y2="180" stroke="#29231E" strokeWidth="0.8" />
                      <rect x="60" y="60" width="80" height="80" stroke="#B6785D" strokeWidth="1" fill="none" />
                    </svg>

                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#B49368] font-medium block mb-2 z-10">
                      0{index + 1} · БҮТЭЭН БАЙГУУЛАЛТ
                    </span>
                    <h4 className="font-serif-title text-xl text-[#29231E] font-medium z-10">
                      {item.title}
                    </h4>
                    <p className="font-sans-ui text-xs text-[#29231E]/75 mt-2 max-w-[240px] leading-relaxed z-10">
                      {item.caption}
                    </p>
                  </div>
                )}
              </div>

              {/* Text note underneath */}
              <div className="px-2 pt-1">
                <span className="font-serif-editorial text-sm italic text-[#B6785D] block">
                  {item.title}
                </span>
                <p className="font-sans-ui text-xs text-[#29231E]/70 leading-relaxed mt-0.5">
                  {item.caption}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
