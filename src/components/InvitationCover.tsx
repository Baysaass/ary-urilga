import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { ArrowDown } from 'lucide-react';
import { EventConfig } from '../types';

interface InvitationCoverProps {
  config: EventConfig;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const OPENING_END = 0.85;
const LAST_FRAME_MARGIN = 0.04;

export const InvitationCover: React.FC<InvitationCoverProps> = ({ config, isOpen, onOpenChange }) => {
  const coverRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState(isOpen ? 1 : 0);
  const [hasVideoError, setHasVideoError] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Progress references for 60/120fps smooth interpolation
  const currentProgressRef = useRef(isOpen ? 1 : 0);
  const targetProgressRef = useRef(isOpen ? 1 : 0);
  const rafRef = useRef<number | null>(null);
  const autoAnimRef = useRef<number | null>(null);

  // Gesture tracking refs
  const touchStartY = useRef<number | null>(null);
  const isTouchAtTop = useRef(false);

  // Video seeking logic
  const seekVideo = useCallback((prog: number) => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration) || video.duration <= 0 || video.readyState < 2) return;
    if (video.seeking) return;

    const maxTime = Math.max(0, video.duration - LAST_FRAME_MARGIN);
    const targetTime = Math.min(prog / OPENING_END, 1) * maxTime;

    if (Math.abs(video.currentTime - targetTime) > 0.02) {
      video.currentTime = targetTime;
    }
  }, []);

  const handleVideoSeeked = useCallback(() => {
    seekVideo(currentProgressRef.current);
  }, [seekVideo]);

  const handleVideoReady = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      seekVideo(currentProgressRef.current);
    }
  }, [seekVideo]);

  // Main RAF lerp loop for buttery smooth scrub
  const startProgressLoop = useCallback(() => {
    if (rafRef.current !== null) return;

    const tick = () => {
      const target = targetProgressRef.current;
      const current = currentProgressRef.current;

      const next = current + (target - current) * 0.24;
      const finalProg = Math.abs(next - target) < 0.0015 ? target : next;

      currentProgressRef.current = finalProg;
      setProgress(finalProg);
      seekVideo(finalProg);

      // Transition to open
      if (finalProg >= 0.998) {
        currentProgressRef.current = 1;
        targetProgressRef.current = 1;
        setProgress(1);
        onOpenChange(true);
        document.body.style.overflow = '';
        window.scrollTo({ top: 0, behavior: 'instant' });
        rafRef.current = null;
        return;
      }

      // Transition to closed
      if (finalProg <= 0.002) {
        currentProgressRef.current = 0;
        targetProgressRef.current = 0;
        setProgress(0);
        onOpenChange(false);
        document.body.style.overflow = 'hidden';
        window.scrollTo({ top: 0, behavior: 'instant' });
        rafRef.current = null;
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [onOpenChange, seekVideo]);

  // Auto animate to 0 (close) or 1 (open) on button clicks
  const animateProgressTo = useCallback((destination: 0 | 1) => {
    if (autoAnimRef.current !== null) cancelAnimationFrame(autoAnimRef.current);
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (destination === 0) {
      onOpenChange(false);
      document.body.style.overflow = 'hidden';
      window.scrollTo({ top: 0, behavior: 'instant' });
    }

    const startProg = currentProgressRef.current;
    const duration = 1100;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      // Quad easeInOut
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      const next = startProg + (destination - startProg) * ease;

      currentProgressRef.current = next;
      targetProgressRef.current = next;
      setProgress(next);
      seekVideo(next);

      if (t < 1) {
        autoAnimRef.current = requestAnimationFrame(step);
      } else {
        currentProgressRef.current = destination;
        targetProgressRef.current = destination;
        setProgress(destination);
        seekVideo(destination);
        autoAnimRef.current = null;

        if (destination === 1) {
          onOpenChange(true);
          document.body.style.overflow = '';
          window.scrollTo({ top: 0, behavior: 'instant' });
        } else {
          onOpenChange(false);
          document.body.style.overflow = 'hidden';
        }
      }
    };

    autoAnimRef.current = requestAnimationFrame(step);
  }, [onOpenChange, seekVideo]);

  // Sync external isOpen prop changes (e.g. clicking header close button or hero button)
  useEffect(() => {
    if (!isOpen && currentProgressRef.current > 0.05) {
      animateProgressTo(0);
    } else if (isOpen && currentProgressRef.current < 0.95) {
      animateProgressTo(1);
    }
  }, [isOpen, animateProgressTo]);

  // Wheel and Touch listeners for bi-directional scrub control
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!isOpen || currentProgressRef.current < 0.99) {
        // In cover / scrubbing mode: scroll down opens, scroll up reverses/closes!
        if (autoAnimRef.current !== null) {
          cancelAnimationFrame(autoAnimRef.current);
          autoAnimRef.current = null;
        }
        targetProgressRef.current = Math.max(0, Math.min(1, targetProgressRef.current + e.deltaY / 600));
        startProgressLoop();
      } else if (window.scrollY <= 0 && e.deltaY < -4) {
        // Opened and at top: scrolling UP begins reversing back into envelope!
        if (autoAnimRef.current !== null) {
          cancelAnimationFrame(autoAnimRef.current);
          autoAnimRef.current = null;
        }
        document.body.style.overflow = 'hidden';
        window.scrollTo({ top: 0, behavior: 'instant' });
        onOpenChange(false);
        targetProgressRef.current = Math.max(0, Math.min(0.97, targetProgressRef.current + e.deltaY / 600));
        startProgressLoop();
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
      isTouchAtTop.current = window.scrollY <= 2;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartY.current === null) return;
      const currentY = e.touches[0].clientY;
      const deltaY = touchStartY.current - currentY; // positive when dragging up (scrolling down)
      touchStartY.current = currentY;

      if (!isOpen || currentProgressRef.current < 0.99) {
        if (autoAnimRef.current !== null) {
          cancelAnimationFrame(autoAnimRef.current);
          autoAnimRef.current = null;
        }
        targetProgressRef.current = Math.max(0, Math.min(1, targetProgressRef.current + deltaY / 380));
        startProgressLoop();
      } else if (isTouchAtTop.current && window.scrollY <= 2 && deltaY < -4) {
        // Dragging down at the very top: reverse back into envelope!
        if (autoAnimRef.current !== null) {
          cancelAnimationFrame(autoAnimRef.current);
          autoAnimRef.current = null;
        }
        document.body.style.overflow = 'hidden';
        window.scrollTo({ top: 0, behavior: 'instant' });
        onOpenChange(false);
        targetProgressRef.current = Math.max(0, Math.min(0.97, targetProgressRef.current + deltaY / 380));
        startProgressLoop();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || currentProgressRef.current < 0.99) {
        if (['Enter', ' ', 'ArrowDown', 'PageDown'].includes(e.key)) {
          e.preventDefault();
          animateProgressTo(1);
        } else if (['ArrowUp', 'PageUp'].includes(e.key)) {
          e.preventDefault();
          animateProgressTo(0);
        }
      } else if (window.scrollY <= 0 && ['ArrowUp', 'PageUp'].includes(e.key)) {
        animateProgressTo(0);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('keydown', handleKeyDown);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (autoAnimRef.current !== null) cancelAnimationFrame(autoAnimRef.current);
    };
  }, [isOpen, onOpenChange, startProgressLoop, animateProgressTo]);

  // Calculate smooth fade between 0.85 and 1.0
  const fade = Math.min(1, Math.max(0, (progress - OPENING_END) / (1 - OPENING_END)));
  const opacity = 1 - fade * fade * (3 - 2 * fade);

  return (
    <div
      ref={coverRef}
      role="dialog"
      aria-modal={!isOpen}
      aria-hidden={isOpen}
      aria-label={`${config.hosts} · Шинэ гэрийн урилга`}
      className="fixed inset-0 z-50 overflow-hidden select-none"
      style={{
        visibility: progress >= 0.999 ? 'hidden' : 'visible',
        pointerEvents: progress >= 0.96 ? 'none' : 'auto',
      }}
    >
      <div
        className="relative w-full h-[100svh] bg-[#181411] flex items-center justify-center"
        style={{
          opacity,
          transform: `scale(${1 + (1 - opacity) * 0.03})`,
          transition: 'transform 0.1s ease-out',
        }}
      >
        <video
          ref={videoRef}
          className="w-full h-full max-w-[480px] object-cover object-center pointer-events-none"
          src={`${import.meta.env.BASE_URL}video/invitation-opening.mp4`}
          poster={`${import.meta.env.BASE_URL}video/invitation-opening.jpg`}
          preload="auto"
          muted
          playsInline
          disablePictureInPicture
          onLoadedData={handleVideoReady}
          onCanPlay={handleVideoReady}
          onSeeked={handleVideoSeeked}
          onError={() => setHasVideoError(true)}
        />

        {/* Floating open hint button - visible when near start */}
        <div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 pointer-events-auto transition-opacity duration-200"
          style={{ opacity: Math.max(0, 1 - progress / 0.18) }}
        >
          <button
            type="button"
            onClick={() => animateProgressTo(1)}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-[#FAF7F0]/95 text-[#29231E] shadow-2xl border border-[#B49368]/40 font-medium text-xs tracking-wider hover:bg-white active:scale-95 transition-all cursor-pointer animate-pulse"
            aria-label="Урилгаа нээх"
          >
            <span>{prefersReducedMotion || hasVideoError ? 'Урилгаа нээх' : 'Доош гүйлгэж нээнэ үү'}</span>
            <ArrowDown size={15} strokeWidth={2} className="text-[#B6785D]" />
          </button>
        </div>
      </div>
    </div>
  );
};
