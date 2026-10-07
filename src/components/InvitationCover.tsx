import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { ArrowDown } from 'lucide-react';
import { EventConfig } from '../types';

interface InvitationCoverProps {
  config: EventConfig;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// The final part of the scroll fades the fully opened envelope into the invitation.
const OPENING_END = 0.82;
const LAST_FRAME_MARGIN = 1 / 30;

export const InvitationCover: React.FC<InvitationCoverProps> = ({ config, isOpen, onOpenChange }) => {
  const coverRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scrollFrameRef = useRef<number | null>(null);
  const progressRef = useRef(0);
  const onOpenChangeRef = useRef(onOpenChange);
  const openStateRef = useRef(isOpen);
  const [progress, setProgress] = useState(0);
  const [isEndFrame, setIsEndFrame] = useState(false);
  const [hasVideoError, setHasVideoError] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  onOpenChangeRef.current = onOpenChange;

  const reportOpenState = useCallback((open: boolean) => {
    if (openStateRef.current === open) return;
    openStateRef.current = open;
    onOpenChangeRef.current(open);
  }, []);

  const seekVideo = useCallback(() => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration) || video.duration <= 0 || video.readyState < 2) return;
    // Keep the newest scroll position while a seek is decoding; seeked catches up.
    if (video.seeking) return;
    const lastFrame = Math.max(0, video.duration - LAST_FRAME_MARGIN);
    const target = Math.min(progressRef.current / OPENING_END, 1) * lastFrame;
    if (Math.abs(video.currentTime - target) > LAST_FRAME_MARGIN / 2) {
      video.currentTime = target;
    } else {
      setIsEndFrame(video.currentTime >= lastFrame - LAST_FRAME_MARGIN / 2);
    }
  }, []);

  const updateScroll = useCallback(() => {
    scrollFrameRef.current = null;
    const range = spacerRef.current?.offsetHeight ?? 0;
    const next = range > 0 ? Math.min(1, Math.max(0, window.scrollY / range)) : 0;
    progressRef.current = next;
    setProgress(next);
    if (next < 0.999) reportOpenState(false);
    if (!prefersReducedMotion) seekVideo();
  }, [prefersReducedMotion, reportOpenState, seekVideo]);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollFrameRef.current === null) scrollFrameRef.current = requestAnimationFrame(updateScroll);
    };
    updateScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', updateScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateScroll);
      if (scrollFrameRef.current !== null) cancelAnimationFrame(scrollFrameRef.current);
      scrollFrameRef.current = null;
    };
  }, [updateScroll]);

  useEffect(() => {
    if (!isOpen) coverRef.current?.focus({ preventScroll: true });
  }, [isOpen]);

  useEffect(() => {
    if (isOpen || progress < 0.999 || (!isEndFrame && !hasVideoError && !prefersReducedMotion)) return;
    // Give the final decoded frame and opacity transition time to reach the screen.
    const timer = window.setTimeout(() => reportOpenState(true), prefersReducedMotion ? 0 : 240);
    return () => window.clearTimeout(timer);
  }, [hasVideoError, isEndFrame, isOpen, prefersReducedMotion, progress, reportOpenState]);

  const handleOpenClick = () => {
    window.scrollTo({ top: spacerRef.current?.offsetHeight ?? 0, behavior: prefersReducedMotion ? 'instant' : 'smooth' });
  };

  const handleVideoReady = () => {
    videoRef.current?.pause();
    if (!prefersReducedMotion) seekVideo();
  };

  const fade = isEndFrame || hasVideoError || prefersReducedMotion
    ? Math.min(1, Math.max(0, (progress - OPENING_END) / (1 - OPENING_END)))
    : 0;
  const opacity = 1 - fade * fade * (3 - 2 * fade);

  return (
    <>
      <div className="invitation-cover-spacer" ref={spacerRef} aria-hidden="true" />
      <div
        ref={coverRef}
        role={isOpen ? undefined : 'dialog'}
        aria-modal={isOpen ? undefined : true}
        aria-hidden={isOpen}
        inert={isOpen}
        aria-labelledby="invitation-cover-title"
        aria-describedby="invitation-cover-instructions"
        tabIndex={isOpen ? -1 : 0}
        className="invitation-cover"
        style={{ visibility: isOpen ? 'hidden' : 'visible' }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && event.target === event.currentTarget) {
            event.preventDefault();
            handleOpenClick();
          }
        }}
      >
        <h1 id="invitation-cover-title" className="sr-only">{config.hosts} · Шинэ гэрийн урилга</h1>
        <p id="invitation-cover-instructions" className="sr-only">
          Доош гүйлгэж дугтуйг нээнэ үү. Дээш гүйлгэхэд буцаж хаагдана. Гарнаас доош сум эсвэл Page Down ашиглана. Enter дарж урилгаа нээж болно.
        </p>
        <div className="invitation-cover-stage">
          <div className="invitation-cover-scene" style={{ opacity }}>
            <video
              ref={videoRef}
              className="invitation-cover-video"
              src={`${import.meta.env.BASE_URL}video/invitation-opening.mp4`}
              poster={`${import.meta.env.BASE_URL}video/invitation-opening.jpg`}
              preload="auto"
              muted
              playsInline
              disablePictureInPicture
              aria-hidden="true"
              onLoadedData={handleVideoReady}
              onCanPlay={handleVideoReady}
              onSeeked={seekVideo}
              onError={() => setHasVideoError(true)}
            />
            <button
              type="button"
              className="invitation-scroll-hint"
              style={{ opacity: Math.max(0, 1 - progress / 0.16) }}
              onClick={handleOpenClick}
              aria-label="Урилгаа нээх"
            >
              <span>{prefersReducedMotion || hasVideoError ? 'Урилгаа нээх' : 'Доош гүйлгэж нээгээрэй'}</span>
              <ArrowDown size={17} strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
