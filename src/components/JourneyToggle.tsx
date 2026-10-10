import React, { useEffect, useRef, useState, useCallback } from 'react';

interface JourneyToggleProps {
  isOpen?: boolean;
}

export const JourneyToggle: React.FC<JourneyToggleProps> = ({ isOpen }) => {
  const [isActive, setIsActive] = useState(false);
  const [isPausedByInput, setIsPausedByInput] = useState(false);
  const [isPausedByTouch, setIsPausedByTouch] = useState(false);

  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const hasAutoStartedRef = useRef(false);
  const inputResumeTimerRef = useRef<number | null>(null);
  const touchResumeTimerRef = useRef<number | null>(null);

  // Auto-start slow journey when invitation is opened
  useEffect(() => {
    if (isOpen && !hasAutoStartedRef.current) {
      hasAutoStartedRef.current = true;
      // Generous 2-second delay after envelope opens so guest admires the cover/photo
      const timer = window.setTimeout(() => {
        setIsActive(true);
      }, 2000);
      return () => window.clearTimeout(timer);
    }
  }, [isOpen]);

  // Main smooth auto-scroll loop
  useEffect(() => {
    const isPaused = isPausedByInput || isPausedByTouch;

    if (!isActive || isPaused) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      lastTimeRef.current = null;
      return;
    }

    lastTimeRef.current = performance.now();
    const scrollSpeed = 30; // 30px per second — elegant, comfortable reading speed

    const step = (now: number) => {
      if (lastTimeRef.current === null) lastTimeRef.current = now;
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (window.scrollY >= maxScroll - 6) {
        // Reached bottom
        setIsActive(false);
        rafRef.current = null;
        return;
      }

      window.scrollBy({ top: scrollSpeed * dt, behavior: 'instant' });
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isActive, isPausedByInput, isPausedByTouch]);

  // Listen for user typing or focusing any input/textarea to pause immediately
  useEffect(() => {
    const isFormElement = (el: EventTarget | null): boolean => {
      if (!(el instanceof HTMLElement)) return false;
      return (
        el.tagName === 'INPUT' ||
        el.tagName === 'TEXTAREA' ||
        el.tagName === 'SELECT' ||
        el.isContentEditable ||
        Boolean(el.closest('input, textarea, select, [contenteditable="true"]'))
      );
    };

    const handleFocusIn = (e: FocusEvent) => {
      if (isFormElement(e.target)) {
        if (inputResumeTimerRef.current !== null) {
          window.clearTimeout(inputResumeTimerRef.current);
          inputResumeTimerRef.current = null;
        }
        setIsPausedByInput(true);
      }
    };

    const handleFocusOut = () => {
      // Delay before resuming after blurring input
      if (inputResumeTimerRef.current !== null) {
        window.clearTimeout(inputResumeTimerRef.current);
      }
      inputResumeTimerRef.current = window.setTimeout(() => {
        const active = document.activeElement;
        if (!isFormElement(active)) {
          setIsPausedByInput(false);
        }
      }, 3500);
    };

    const handleInput = (e: Event) => {
      if (isFormElement(e.target)) {
        setIsPausedByInput(true);
        if (inputResumeTimerRef.current !== null) {
          window.clearTimeout(inputResumeTimerRef.current);
        }
      }
    };

    // User manual touch or wheel scroll temporarily pauses auto-scroll
    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest('#journey-toggle')) return;
      if (touchResumeTimerRef.current !== null) {
        window.clearTimeout(touchResumeTimerRef.current);
      }
      setIsPausedByTouch(true);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest('#journey-toggle')) return;
      if (touchResumeTimerRef.current !== null) {
        window.clearTimeout(touchResumeTimerRef.current);
      }
      // Resume 3.5s after user finishes touching screen
      touchResumeTimerRef.current = window.setTimeout(() => {
        setIsPausedByTouch(false);
      }, 3500);
    };

    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest('#journey-toggle')) return;
      setIsPausedByTouch(true);
      if (touchResumeTimerRef.current !== null) {
        window.clearTimeout(touchResumeTimerRef.current);
      }
      // Resume 2.5s after wheel ends
      touchResumeTimerRef.current = window.setTimeout(() => {
        setIsPausedByTouch(false);
      }, 2500);
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);
    document.addEventListener('input', handleInput);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
      document.removeEventListener('input', handleInput);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('wheel', handleWheel);
      if (inputResumeTimerRef.current !== null) window.clearTimeout(inputResumeTimerRef.current);
      if (touchResumeTimerRef.current !== null) window.clearTimeout(touchResumeTimerRef.current);
    };
  }, []);

  const toggleJourney = useCallback(() => {
    if (isActive) {
      setIsActive(false);
      setIsPausedByInput(false);
      setIsPausedByTouch(false);
    } else {
      setIsPausedByInput(false);
      setIsPausedByTouch(false);
      setIsActive(true);
    }
  }, [isActive]);

  const isTemporarilyPaused = isActive && (isPausedByInput || isPausedByTouch);

  return (
    <button
      id="journey-toggle"
      type="button"
      onClick={toggleJourney}
      className={`journey-toggle ${isActive ? 'is-active' : ''}`}
      aria-pressed={isActive}
      aria-label={
        isTemporarilyPaused
          ? 'Автомат гүйлгэлт түр зогссон'
          : isActive
          ? 'Автомат гүйлгэлтийг зогсоох'
          : 'Автоматаар аялах'
      }
      title={
        isTemporarilyPaused
          ? 'Оруулах/бичих үед түр зогссон'
          : isActive
          ? 'Гүйлгэлтийг зогсоох'
          : 'Автоматаар доош гүйлгэх'
      }
    >
      <span className="journey-icon" aria-hidden="true">
        {isActive ? '❚❚' : '▷'}
      </span>
      <span className="font-serif-editorial font-medium">
        {isTemporarilyPaused ? 'Түр зогссон' : isActive ? 'Зогсоох' : 'Авто'}
      </span>
    </button>
  );
};
