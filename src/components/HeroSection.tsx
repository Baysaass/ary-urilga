import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowDown, ChevronUp } from 'lucide-react';
import { EventConfig } from '../types';

interface HeroSectionProps {
  config: EventConfig;
  onScrollDown: () => void;
  onCloseInvitation?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ config, onScrollDown, onCloseInvitation }) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="hero-portrait" aria-labelledby="hero-title">
      <img
        className="hero-portrait-image"
        src={`${import.meta.env.BASE_URL}images/hero-portrait.png`}
        alt="Монгол дээлтэй хос баярын ширээний ард хамтдаа"
        width={941}
        height={1672}
        fetchPriority="high"
        decoding="async"
      />
      <div className="hero-portrait-shade" aria-hidden="true" />

      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="hero-portrait-greeting"
      >
        {onCloseInvitation && (
          <button
            type="button"
            onClick={onCloseInvitation}
            className="hero-portrait-close-hint"
            aria-label="Дугтуйг буцааж хаах"
          >
            <ChevronUp size={14} strokeWidth={2} aria-hidden="true" />
            <span>Дээш гүйлгэж дугтуйг хаах</span>
          </button>
        )}
        <span className="hero-portrait-kicker">ХҮНДЭТ ЗОЧИН ТАНАА</span>
        <h2 className="font-serif-editorial hero-portrait-hosts">{config.hosts}</h2>
        <p className="font-serif-editorial hero-portrait-invitee">{config.inviteeKicker}</p>
      </motion.div>

      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="hero-portrait-content"
      >
        <h1 id="hero-title" className="hero-portrait-title">
          Шинэ гэрийн
          <span className="font-serif-editorial">цайллагад</span>
        </h1>
        <p className="hero-portrait-subtitle">{config.subtitle}</p>
        <div className="hero-portrait-date">
          <span>{config.year}</span>
          <span aria-hidden="true">·</span>
          <span>
            {config.selectedDay === 2
              ? '10.24 (Бямба)'
              : '10.23 (Баасан)'}
          </span>
        </div>
        <button type="button" className="hero-portrait-scroll" onClick={onScrollDown}>
          <span>Доош гүйлгэнэ үү</span>
          <ArrowDown size={17} strokeWidth={1.5} aria-hidden="true" />
        </button>
      </motion.div>
    </section>
  );
};
