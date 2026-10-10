import React, { useEffect, useRef, useState } from 'react';
import { LoaderCircle } from 'lucide-react';

const AUDIO_SRC = `${import.meta.env.BASE_URL}audio/nair.mp3`;
const LOAD_ERROR = 'Дуу ачаалсангүй. Дахин тоглуулж үзнэ үү.';

interface AudioPlayerProps {
  variant?: 'floating' | 'header';
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ variant = 'floating' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const audioRef = useRef<HTMLAudioElement>(null);
  const wantsPlaybackRef = useRef(false);
  const playRequestRef = useRef(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.volume = 0.38;
    return () => {
      wantsPlaybackRef.current = false;
      playRequestRef.current += 1;
      audio?.pause();
    };
  }, []);

  const stopPlayback = () => {
    wantsPlaybackRef.current = false;
    playRequestRef.current += 1;
    audioRef.current?.pause();
    setIsPlaying(false);
    setIsLoading(false);
  };

  const toggleSound = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (wantsPlaybackRef.current || !audio.paused) {
      stopPlayback();
      return;
    }

    const request = ++playRequestRef.current;
    wantsPlaybackRef.current = true;
    setError('');
    setIsLoading(true);
    if (audio.error) audio.load();

    try {
      await audio.play();
    } catch {
      if (request !== playRequestRef.current || !wantsPlaybackRef.current) return;
      wantsPlaybackRef.current = false;
      setIsPlaying(false);
      setIsLoading(false);
      setError(LOAD_ERROR);
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={AUDIO_SRC}
        preload="none"
        loop
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
          wantsPlaybackRef.current = false;
          setIsPlaying(false);
          setIsLoading(false);
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

      {variant === 'floating' ? (
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
          <svg className="music-ring" viewBox="0 0 120 120" aria-hidden="true">
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
      )}

      {error && <span role="alert" className="sr-only">{error}</span>}
    </>
  );
};
