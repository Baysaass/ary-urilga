import React, { useEffect, useRef, useState } from 'react';
import { LoaderCircle, Volume2, VolumeX } from 'lucide-react';

const AUDIO_SRC = `${import.meta.env.BASE_URL}audio/nair.mp3`;
const LOAD_ERROR = 'Дуу ачаалсангүй. Дахин тоглуулж үзнэ үү.';

export const AudioPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const audioRef = useRef<HTMLAudioElement>(null);
  const wantsPlaybackRef = useRef(false);
  const playRequestRef = useRef(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.volume = 0.35;
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
      // A pause or a newer request can cancel an in-flight play promise.
      if (request !== playRequestRef.current || !wantsPlaybackRef.current) return;
      wantsPlaybackRef.current = false;
      setIsPlaying(false);
      setIsLoading(false);
      setError(LOAD_ERROR);
    }
  };

  const label = isLoading
    ? 'Дуу ачаалж байна'
    : isPlaying ? 'Ая эгшиглэж байна' : error ? 'Дахин тоглуулах' : 'Ая тоглуулах';

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
      <button
        type="button"
        onClick={toggleSound}
        title={error || (isPlaying ? 'Дашням — Найр · Ая зогсоох' : 'Дашням — Найр · Ая тоглуулах')}
        className="flex min-h-9 items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF7F0]/95 border border-[#B49368]/30 text-[#29231E] shadow-sm hover:bg-[#FAF7F0] active:scale-95 transition-all text-xs font-medium cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B6785D]"
        aria-label={isPlaying || isLoading ? 'Ая зогсоох' : error ? 'Дууг дахин тоглуулах' : 'Ая тоглуулах'}
        aria-pressed={isPlaying}
        aria-busy={isLoading}
      >
        {isLoading
          ? <LoaderCircle className="w-3.5 h-3.5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
          : isPlaying
            ? <Volume2 className="w-3.5 h-3.5 text-[#B6785D]" aria-hidden="true" />
            : <VolumeX className="w-3.5 h-3.5 text-[#29231E]/60" aria-hidden="true" />}
        <span className={`text-[11px] tracking-tight ${isPlaying ? 'text-[#B6785D]' : 'text-[#29231E]/70'}`}>{label}</span>
      </button>
      {error && <span role="alert" className="sr-only">{error}</span>}
    </>
  );
};
