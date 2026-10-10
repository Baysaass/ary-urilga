import React, { useCallback, useEffect, useRef, useState } from 'react';
import { LoaderCircle } from 'lucide-react';

const AUDIO_SRC = `${import.meta.env.BASE_URL}audio/nair.mp3`;
const LOAD_ERROR = 'Дуу ачаалсангүй. Дахин тоглуулж үзнэ үү.';

// Дууны хүчийг өмнөх 0.38-аас 50% багасгасан түвшин (0.19)
const DEFAULT_VOLUME = 0.19;

interface AudioPlayerProps {
  variant?: 'floating' | 'header';
  isOpen?: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  variant = 'floating',
  isOpen = true,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const audioRef = useRef<HTMLAudioElement>(null);
  const wantsPlaybackRef = useRef(false);
  const userPausedRef = useRef(false);
  const playRequestRef = useRef(0);

  const startPlayback = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (wantsPlaybackRef.current && !audio.paused) return;

    const request = ++playRequestRef.current;
    wantsPlaybackRef.current = true;
    setError('');
    setIsLoading(true);
    audio.volume = DEFAULT_VOLUME;
    if (audio.error) audio.load();

    try {
      await audio.play();
      if (request === playRequestRef.current) {
        setIsPlaying(true);
        setIsLoading(false);
      }
    } catch {
      if (request !== playRequestRef.current || !wantsPlaybackRef.current) return;
      wantsPlaybackRef.current = false;
      setIsPlaying(false);
      setIsLoading(false);
      // Silent catch on browser autoplay denial before interaction
    }
  }, []);

  const stopPlayback = useCallback(() => {
    userPausedRef.current = true;
    wantsPlaybackRef.current = false;
    playRequestRef.current += 1;
    audioRef.current?.pause();
    setIsPlaying(false);
    setIsLoading(false);
  }, []);

  const toggleSound = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (wantsPlaybackRef.current || !audio.paused) {
      stopPlayback();
    } else {
      userPausedRef.current = false;
      void startPlayback();
    }
  }, [startPlayback, stopPlayback]);

  // Initial volume configuration
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.volume = DEFAULT_VOLUME;
    return () => {
      wantsPlaybackRef.current = false;
      playRequestRef.current += 1;
      audio?.pause();
    };
  }, []);

  // Autoplay handler on page load + gesture unlock fallback
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // 1. Attempt autoplay immediately
    void startPlayback().catch(() => {});

    // 2. Gesture fallback: on first tap/click anywhere (e.g. tapping "Урилгаа нээх")
    const handleFirstInteraction = () => {
      if (!userPausedRef.current && (!wantsPlaybackRef.current || audio.paused)) {
        void startPlayback().catch(() => {});
      }
      removeListeners();
    };

    const handleOpenEvent = () => {
      if (!userPausedRef.current) {
        void startPlayback().catch(() => {});
      }
    };

    const events: (keyof WindowEventMap)[] = ['pointerdown', 'touchstart', 'click', 'keydown'];
    const removeListeners = () => {
      events.forEach((evt) => {
        window.removeEventListener(evt, handleFirstInteraction, { capture: true });
      });
    };

    events.forEach((evt) => {
      window.addEventListener(evt, handleFirstInteraction, { capture: true, once: true });
    });

    window.addEventListener('app:open-invitation', handleOpenEvent);

    return () => {
      removeListeners();
      window.removeEventListener('app:open-invitation', handleOpenEvent);
    };
  }, [startPlayback]);

  // When isOpen becomes true (invitation opens), start audio if not paused by user
  useEffect(() => {
    if (isOpen && !userPausedRef.current) {
      void startPlayback().catch(() => {});
    }
  }, [isOpen, startPlayback]);

  const showButton = variant !== 'floating' || isOpen;

  return (
    <>
      <audio
        ref={audioRef}
        src={AUDIO_SRC}
        preload="auto"
        loop
        playsInline
        onPlaying={() => {
          if (!wantsPlaybackRef.current) {
            audioRef.current?.pause();
            return;
          }
          setIsPlaying(true);
          setIsLoading(false);
          setError('');
        }}
        onWaiting={() => {
          if (wantsPlaybackRef.current) setIsLoading(true);
        }}
        onPause={() => {
          if (userPausedRef.current) {
            wantsPlaybackRef.current = false;
            setIsPlaying(false);
            setIsLoading(false);
          }
        }}
        onEnded={stopPlayback}
        onError={() => {
          wantsPlaybackRef.current = false;
          playRequestRef.current += 1;
          setIsPlaying(false);
          setIsLoading(false);
          setError(LOAD_ERROR);
        }}
      />

      {showButton && (
        variant === 'floating' ? (
          <button
            id="music-btn"
            type="button"
            onClick={toggleSound}
            className="music-btn"
            aria-label={isPlaying ? 'Хөгжим зогсоох' : 'Хөгжим тоглуулах'}
            aria-pressed={isPlaying}
            aria-busy={isLoading}
            title={error || (isPlaying ? 'Дашням — Найр · Хөгжим зогсоох' : 'Дашням — Найр · Хөгжим тоглуулах')}
          >
            {/* Rotating Circular Text Stamp Ring */}
            <svg
              className="music-ring"
              viewBox="0 0 120 120"
              aria-hidden="true"
              style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}
            >
              <defs>
                <path
                  id="ring-path"
                  d="M 60,60 m -45,0 a 45,45 0 1,1 90,0 a 45,45 0 1,1 -90,0"
                />
              </defs>
              <text className="ring-text">
                <textPath href="#ring-path" startOffset="0" textLength="282.7" lengthAdjust="spacing">
                  Хөгжим · Хөгжим · Хөгжим · Хөгжим ·
                </textPath>
              </text>
            </svg>

            {/* Central Play/Pause Icon */}
            <span className="music-core" aria-hidden="true">
              {isLoading ? (
                <LoaderCircle className="w-4 h-4 animate-spin text-[#C29B53]" />
              ) : isPlaying ? (
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#261E19]">
                  <rect x="6" y="5" width="4" height="14" rx="1" />
                  <rect x="14" y="5" width="4" height="14" rx="1" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#261E19] ml-0.5">
                  <polygon points="7,5 20,12 7,19" />
                </svg>
              )}
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={toggleSound}
            className="flex min-h-9 items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF7F2]/95 border border-[#C29B53]/40 text-[#261E19] shadow-sm hover:bg-white active:scale-95 transition-all text-xs font-medium cursor-pointer"
            aria-label={isPlaying ? 'Хөгжим зогсоох' : 'Хөгжим тоглуулах'}
            aria-pressed={isPlaying}
          >
            {isLoading ? (
              <LoaderCircle className="w-3.5 h-3.5 animate-spin text-[#C29B53]" />
            ) : isPlaying ? (
              <span className="w-2 h-2 rounded-full bg-[#C29B53] animate-ping" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-[#261E19]/40" />
            )}
            <span className="text-[11px] font-serif">
              {isPlaying ? 'Ая эгшиглэж байна' : 'Ая тоглуулах'}
            </span>
          </button>
        )
      )}

      {error && <span role="alert" className="sr-only">{error}</span>}
    </>
  );
};
