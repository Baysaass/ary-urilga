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

  // Gesture tracking refs
  const touchStartY = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);
  const isTouchAtTop = useRef(false);
  const wheelDeltaAccumulator = useRef(0);
  const wheelResetTimer = useRef<number | null>(null);

  // Manage body scroll lock
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
      setIsOpening(false);
      setIsFading(false);
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

  const triggerClose = useCallback(() => {
    if (!isOpen) return;

    // 1. Immediately lock scroll at top so content doesn't jump
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.body.style.overflow = 'hidden';

    // 2. Pause and reset video to start frame (closed envelope with wax seal)
    const video = videoRef.current;
    if (video) {
      video.pause();
      try {
        video.currentTime = 0;
      } catch (e) {
        // ignore seek error
      }
    }

    // 3. Reset opening states and notify parent
    setIsOpening(false);
    setIsFading(false);
    onOpenChange(false);
  }, [isOpen, onOpenChange]);

  // Video progress listener
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration)) return;
    if (video.currentTime >= video.duration - 0.2) {
      handleFinishOpen();
    }
  };

  const handleVideoEnded = () => {
    handleFinishOpen();
  };

  // Listeners when closed: scroll down / swipe up / keys to OPEN
  useEffect(() => {
    if (isOpen) return;

    const handleWheelOpen = (e: WheelEvent) => {
      if (e.deltaY > 5) {
        startOpening();
      }
    };

    const handleTouchStartOpen = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMoveOpen = (e: TouchEvent) => {
      if (touchStartY.current === null) return;
      const currentY = e.touches[0].clientY;
      const delta = touchStartY.current - currentY;
      if (Math.abs(delta) > 15) {
        startOpening();
      }
    };

    const handleKeyDownOpen = (e: KeyboardEvent) => {
      if (['Enter', ' ', 'ArrowDown', 'PageDown'].includes(e.key)) {
        e.preventDefault();
        startOpening();
      }
    };

    window.addEventListener('wheel', handleWheelOpen, { passive: true });
    window.addEventListener('touchstart', handleTouchStartOpen, { passive: true });
    window.addEventListener('touchmove', handleTouchMoveOpen, { passive: true });
    window.addEventListener('keydown', handleKeyDownOpen);

    return () => {
      window.removeEventListener('wheel', handleWheelOpen);
      window.removeEventListener('touchstart', handleTouchStartOpen);
      window.removeEventListener('touchmove', handleTouchMoveOpen);
      window.removeEventListener('keydown', handleKeyDownOpen);
    };
  }, [isOpen, startOpening]);

  // Listeners when open: scroll UP at top / swipe DOWN at top to CLOSE
  useEffect(() => {
    if (!isOpen) return;

    const handleWheelClose = (e: WheelEvent) => {
      // Trigger close when at the top of page and user scrolls UP
      if (window.scrollY <= 0 && e.deltaY < -6) {
        wheelDeltaAccumulator.current += e.deltaY;
        if (wheelDeltaAccumulator.current < -20) {
          wheelDeltaAccumulator.current = 0;
          triggerClose();
        }
        if (wheelResetTimer.current) window.clearTimeout(wheelResetTimer.current);
        wheelResetTimer.current = window.setTimeout(() => {
          wheelDeltaAccumulator.current = 0;
        }, 300);
      } else {
        wheelDeltaAccumulator.current = 0;
      }
    };

    const handleTouchStartClose = (e: TouchEvent) => {
      if (window.scrollY <= 5) {
        isTouchAtTop.current = true;
        touchStartY.current = e.touches[0].clientY;
        touchStartX.current = e.touches[0].clientX;
      } else {
        isTouchAtTop.current = false;
        touchStartY.current = null;
        touchStartX.current = null;
      }
    };

    const handleTouchMoveClose = (e: TouchEvent) => {
      if (!isTouchAtTop.current || touchStartY.current === null) return;
      if (window.scrollY > 8) {
        isTouchAtTop.current = false;
        return;
      }
      const currentY = e.touches[0].clientY;
      const currentX = e.touches[0].clientX;
      const deltaY = currentY - touchStartY.current; // positive when dragging downward
      const deltaX = Math.abs(currentX - (touchStartX.current || currentX));

      // User pulled down while at top of page
      if (deltaY > 35 && deltaY > deltaX) {
        isTouchAtTop.current = false;
        touchStartY.current = null;
        triggerClose();
      }
    };

    const handleKeyDownClose = (e: KeyboardEvent) => {
      if (window.scrollY <= 0 && ['ArrowUp', 'PageUp'].includes(e.key)) {
        triggerClose();
      }
    };

    window.addEventListener('wheel', handleWheelClose, { passive: true });
    window.addEventListener('touchstart', handleTouchStartClose, { passive: true });
    window.addEventListener('touchmove', handleTouchMoveClose, { passive: true });
    window.addEventListener('keydown', handleKeyDownClose);

    return () => {
      window.removeEventListener('wheel', handleWheelClose);
      window.removeEventListener('touchstart', handleTouchStartClose);
      window.removeEventListener('touchmove', handleTouchMoveClose);
      window.removeEventListener('keydown', handleKeyDownClose);
      if (wheelResetTimer.current) window.clearTimeout(wheelResetTimer.current);
    };
  }, [isOpen, triggerClose]);

  return (
    <div
      ref={coverRef}
      role="dialog"
      aria-modal={!isOpen}
      aria-hidden={isOpen}
      aria-label={`${config.hosts} · Шинэ гэрийн урилга`}
      className={`fixed inset-0 z-50 overflow-hidden select-none transition-all duration-500 ease-out ${
        isOpen
          ? 'opacity-0 pointer-events-none invisible -translate-y-4'
          : 'opacity-100 pointer-events-auto visible translate-y-0 cursor-pointer'
      }`}
      onClick={!isOpen ? startOpening : undefined}
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
        {!isOpening && !isOpen && (
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
