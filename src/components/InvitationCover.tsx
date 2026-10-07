import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { ArrowDown } from 'lucide-react';
import { EventConfig } from '../types';

interface InvitationCoverProps {
  config: EventConfig;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InvitationCover: React.FC<InvitationCoverProps> = ({ config, isOpen, onOpenChange }) => {
  const coverRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isOpening, setIsOpening] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [hasVideoError, setHasVideoError] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const touchStartY = useRef<number | null>(null);

  // Lock body scroll while envelope is closed so the hero section stays centered at top-0
  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = 'hidden';
      window.scrollTo(0, 0);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleFinishOpen = useCallback(() => {
    setIsFading(true);
    setTimeout(() => {
      onOpenChange(true);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 400);
  }, [onOpenChange]);

  const startOpening = useCallback(() => {
    if (isOpening || isFading || isOpen) return;
    setIsOpening(true);

    if (prefersReducedMotion || hasVideoError) {
      handleFinishOpen();
      return;
    }

    const video = videoRef.current;
    if (video) {
      video.playbackRate = 1.25;
      video.play().catch(() => {
        handleFinishOpen();
      });
    } else {
      handleFinishOpen();
    }
  }, [handleFinishOpen, hasVideoError, isFading, isOpen, isOpening, prefersReducedMotion]);

  // Check video progress
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration)) return;
    // When video is in the final frames (letter fully revealed), transition smoothly to Hero section
    if (video.currentTime >= video.duration - 0.2) {
      handleFinishOpen();
    }
  };

  const handleVideoEnded = () => {
    handleFinishOpen();
  };

  // Detect user interactions to open (scroll wheel, touch swipe, or keyboard)
  useEffect(() => {
    if (isOpen) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY > 5) {
        startOpening();
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartY.current === null) return;
      const currentY = e.touches[0].clientY;
      const delta = touchStartY.current - currentY;
      if (Math.abs(delta) > 15) {
        startOpening();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['Enter', ' ', 'ArrowDown', 'PageDown'].includes(e.key)) {
        e.preventDefault();
        startOpening();
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
    };
  }, [isOpen, startOpening]);

  if (isOpen) return null;

  return (
    <div
      ref={coverRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${config.hosts} · Шинэ гэрийн урилга нээх`}
      className="fixed inset-0 z-50 overflow-hidden cursor-pointer select-none"
      onClick={startOpening}
    >
      <div
        className="relative w-full h-[100svh] bg-[#181411] flex items-center justify-center transition-opacity duration-500 ease-out"
        style={{ opacity: isFading ? 0 : 1 }}
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
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleVideoEnded}
          onError={() => setHasVideoError(true)}
        />

        {/* Floating open button */}
        {!isOpening && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 pointer-events-auto">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                startOpening();
              }}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-[#FAF7F0]/95 text-[#29231E] shadow-2xl border border-[#B49368]/40 font-medium text-xs tracking-wider hover:bg-white active:scale-95 transition-all cursor-pointer animate-pulse"
              aria-label="Урилгаа нээх"
            >
              <span>Урилгаа нээх</span>
              <ArrowDown size={15} strokeWidth={2} className="text-[#B6785D]" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
