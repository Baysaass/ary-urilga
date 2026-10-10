import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Copy, Check } from 'lucide-react';
import { EventConfig } from '../types';

export const LocationSection: React.FC<{ config: EventConfig }> = ({ config }) => {
  const [copied, setCopied] = useState(false);

  const fullAddress = `${config.locationCity}, ${config.locationDistrict}, ${config.locationAddress}`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(fullAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const mapUrl = config.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(fullAddress)}`;

  return (
    <section id="location-section" className="relative pt-16 pb-0 px-5 text-center select-none overflow-hidden">
      <div className="max-w-[420px] mx-auto">
        {/* Top Gold Rule */}
        <span className="rule" aria-hidden="true" />

        <span className="eyebrow block mt-2 mb-1">Баяр болох газар</span>
        <h2 className="title text-[#261E19] mb-3">Хаяг байршил</h2>

        {/* Address Typography */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="my-5"
        >
          <p className="font-serif text-[18px] sm:text-[21px] text-[#261E19] uppercase tracking-wider font-normal leading-relaxed">
            {config.locationCity}, {config.locationDistrict}
          </p>
          <p className="font-serif text-[16px] sm:text-[18px] text-[#635246] tracking-wide mt-1">
            {config.locationAddress}
          </p>
        </motion.div>

        {/* Map Button with Gold Map Pin */}
        <div className="my-6 flex flex-col items-center gap-3">
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex flex-col items-center gap-1.5 text-center no-underline cursor-pointer"
          >
            <svg
              className="w-10 h-9 fill-none stroke-[#C29B53] stroke-[1.4] stroke-linecap-round stroke-linejoin-round transition-transform group-hover:scale-110"
              viewBox="0 0 40 34"
              aria-hidden="true"
            >
              <path d="M1.8 12.6 13 8.8v20.4L1.8 33z" />
              <path d="M13 8.8l14 4.2v20.4l-14-4.2z" />
              <path d="M27 13l11.2-4.2v20.4L27 33.4z" />
              <path
                d="M20 1.4c3.7 0 6.7 3 6.7 6.7 0 4.8-6.7 11.4-6.7 11.4S13.3 12.9 13.3 8.1c0-3.7 3-6.7 6.7-6.7z"
                fill="#FAF7F2"
              />
              <circle cx="20" cy="8.1" r="2.6" fill="#C29B53" />
            </svg>
            <span className="eyebrow text-[#997433] group-hover:text-[#261E19] transition-colors">
              Газрын зураг харах
            </span>
          </a>

          {/* Copy Address Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#C29B53]/40 bg-[#FAF7F2]/90 text-xs font-serif text-[#261E19] hover:bg-white active:scale-95 transition-all cursor-pointer shadow-2xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Хаяг хуулагдлаа!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#C29B53]" />
                <span>Хаяг хуулах</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* AI-Generated Modern Home & Dalanzadgad Mountains Watercolor Land Band */}
      <div className="land-art-band mt-3" aria-hidden="true">
        <img
          src={`${import.meta.env.BASE_URL}images/art/land-city-home.jpg`}
          alt="Шинэ орон сууц, байгалийн уран зургийн дүрслэл"
          width={1920}
          height={1080}
          loading="lazy"
        />
      </div>
    </section>
  );
};
