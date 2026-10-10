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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isOpening, setIsOpening] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [hasVideoError, setHasVideoError] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Prevent scroll when envelope is closed
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

  const startOpening = useCallback(() => {
    if (isOpening || isFading || isOpen) return;
    setIsOpening(true);
    setIsFading(true);

    const video = videoRef.current;
    if (video) {
      video.playbackRate = 2.5;
      void video.play().catch(() => {});
    }

    // Snappy, instant transition (~280ms) so the photo appears immediately on click
    setTimeout(() => {
      onOpenChange(true);
      window.scrollTo({ top: 0, behavior: 'instant' });
      setIsOpening(false);
      setIsFading(false);
    }, 280);
  }, [isFading, isOpen, isOpening, onOpenChange]);

  // Keyboard support to open (Enter / Space)
  useEffect(() => {
    if (isOpen) return;

    const handleKeyDownOpen = (e: KeyboardEvent) => {
      if (['Enter', ' ', 'ArrowDown', 'PageDown'].includes(e.key)) {
        e.preventDefault();
        startOpening();
      }
    };

    window.addEventListener('keydown', handleKeyDownOpen);
    return () => {
      window.removeEventListener('keydown', handleKeyDownOpen);
    };
  }, [isOpen, startOpening]);

  // Notice: Absolutely NO reverse/close listeners! Once opened, it NEVER closes back.

  if (isOpen && !isFading) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal={!isOpen}
      aria-hidden={isOpen}
      aria-label={`${config.hosts} · Шинэ өргөөний урилга`}
      className={`fixed inset-0 z-50 overflow-hidden select-none transition-all duration-500 ease-out ${
        isOpen
          ? 'opacity-0 pointer-events-none invisible -translate-y-4'
          : 'opacity-100 pointer-events-auto visible translate-y-0 cursor-pointer'
      }`}
      onClick={!isOpen ? startOpening : undefined}
    >
      <div
        className="relative w-full h-[100svh] bg-[#181411] flex items-center justify-center transition-all duration-300 ease-out"
        style={{
          opacity: isFading ? 0 : 1,
          transform: isFading ? 'scale(1.03)' : 'scale(1)',
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
          onError={() => setHasVideoError(true)}
        />

        {/* Floating Open Prompt Button */}
        {!isOpening && !isOpen && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 pointer-events-auto">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                startOpening();
              }}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-[#FAF7F0]/95 text-[#29231E] shadow-2xl border border-[#C29B53]/50 font-serif text-xs tracking-wider hover:bg-white active:scale-95 transition-all cursor-pointer animate-pulse"
              aria-label="Урилгаа нээх"
            >
              <span className="font-medium">Урилгаа нээх</span>
              <ArrowDown size={15} strokeWidth={2} className="text-[#A83A2A]" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
