/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  getEventConfig,
  getRsvps,
  getBlessings,
  getPublicBlessings,
  getTimeline,
  getGallery,
  getSymbolicGifts,
  syncRsvpsFromSupabase,
  syncEventConfigFromSupabase,
  subscribeRsvps,
} from './lib/storage';
import { EventConfig, RSVP, Blessing, TimelineItem, GalleryPhoto, SymbolicGift } from './types';
import { InvitationCover } from './components/InvitationCover';
import { HeroSection } from './components/HeroSection';
import { IntroductionSection } from './components/IntroductionSection';
import { DateCountdownSection } from './components/DateCountdownSection';
import { FeaturedBlessing } from './components/FeaturedBlessing';
import { LocationSection } from './components/LocationSection';
import { SymbolicInteraction } from './components/SymbolicInteraction';
import { BlessingFormSection } from './components/BlessingFormSection';
import { BlessingWall } from './components/BlessingWall';
import { RsvpSection } from './components/RsvpSection';
import { ClosingSection } from './components/ClosingSection';
import { AudioPlayer } from './components/AudioPlayer';
import { AdminDashboard } from './components/AdminDashboard';
import { Lock } from 'lucide-react';
import { openGuestSession, refreshGuestData, subscribeGuestData, loginHost } from './lib/guest-data';

export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<EventConfig>(getEventConfig());
  const [rsvps, setRsvps] = useState<RSVP[]>(getRsvps());
  const [allBlessings, setAllBlessings] = useState<Blessing[]>(getBlessings());
  const [publicBlessings, setPublicBlessings] = useState<Blessing[]>(getPublicBlessings());
  const [timeline, setTimeline] = useState<TimelineItem[]>(getTimeline());
  const [gallery, setGallery] = useState<GalleryPhoto[]>(getGallery());
  const [gifts, setGifts] = useState<SymbolicGift[]>(getSymbolicGifts());

  // Admin state
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPinError, setAdminPinError] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);

  // Desktop viewport preview mode
  const [desktopWidth, setDesktopWidth] = useState<'390' | '430' | '100%'>('430');

  // Check URL params for day selection (?day=1 or ?day=2)
  const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const dayParam = urlParams.get('day');
  const selectedDay: 1 | 2 | undefined = dayParam === '2' ? 2 : (dayParam === '1' ? 1 : undefined);

  const activeConfig: EventConfig = {
    ...config,
    selectedDay,
    day: selectedDay === 2 ? (config.day2 || 24) : (config.day || 23),
    day2: config.day2 || 24,
  };

  const mainScrollContainerRef = useRef<HTMLDivElement>(null);

  const refreshAllData = () => {
    setConfig(getEventConfig());
    setRsvps(getRsvps());
    setAllBlessings(getBlessings());
    setPublicBlessings(getPublicBlessings());
    setTimeline(getTimeline());
    setGallery(getGallery());
    setGifts(getSymbolicGifts());
  };

  useEffect(() => {
    refreshAllData();
    const unsubscribeGuest = subscribeGuestData(refreshAllData);
    const unsubscribeRsvp = subscribeRsvps(refreshAllData);
    const sync = () => {
      void refreshGuestData().catch(() => {});
      void syncRsvpsFromSupabase().catch(() => {});
      void syncEventConfigFromSupabase().catch(() => {});
    };
    sync();
    const interval = window.setInterval(sync, 5000);
    window.addEventListener('focus', sync);

    // Check if URL has ?admin
    if (window.location.search.includes('admin')) {
      setShowPinModal(true);
    }
    return () => {
      unsubscribeGuest();
      unsubscribeRsvp();
      window.clearInterval(interval);
      window.removeEventListener('focus', sync);
    };
  }, []);

  // Enable guest actions and hand off focus without changing the scroll position.
  useEffect(() => {
    if (!isOpen) return;
    window.scrollTo({ top: 0, behavior: 'instant' });
    void openGuestSession().catch(() => {});
    mainScrollContainerRef.current?.focus({ preventScroll: true });
  }, [isOpen]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginHost(adminPinInput);
      setIsAdminAuthenticated(true);
      setShowPinModal(false);
      setIsAdminOpen(true);
      setAdminPinError(false);
      setAdminPinInput('');
    } catch {
      setAdminPinError(true);
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      className="min-h-[100svh] w-full bg-[#181411] text-[#29231E] flex flex-col items-center justify-start relative overflow-x-clip selection:bg-[#B49368]/20 selection:text-[#29231E]"
    >
      {/* Subtle Studio Desktop Ambient Lights */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#B49368]/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-[#B6785D]/5 rounded-full blur-[160px]" />
      </div>

      {/* Floating Header Toolbar (Discreet audio + host admin login + desktop switcher) */}
      <header inert={!isOpen} className="fixed top-3 z-40 w-full max-w-[460px] px-4 flex items-center justify-between pointer-events-none">
        {/* Left: Audio Player */}
        <div className="pointer-events-auto">
          <AudioPlayer />
        </div>

        {/* Right: Discreet Admin Key */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* Desktop Preview Width Switcher (hidden on small screens) */}
          <div className="hidden lg:flex items-center bg-[#29231E]/80 backdrop-blur-md rounded-full border border-white/10 p-0.5 mr-1">
            <button
              onClick={() => setDesktopWidth('390')}
              title="iPhone 14 (390px)"
              className={`px-2 py-1 rounded-full text-[10px] font-medium transition-all ${
                desktopWidth === '390' ? 'bg-[#FAF7F0] text-[#29231E]' : 'text-[#FAF7F0]/60 hover:text-white'
              }`}
            >
              390
            </button>
            <button
              onClick={() => setDesktopWidth('430')}
              title="iPhone Pro Max (430px)"
              className={`px-2 py-1 rounded-full text-[10px] font-medium transition-all ${
                desktopWidth === '430' ? 'bg-[#FAF7F0] text-[#29231E]' : 'text-[#FAF7F0]/60 hover:text-white'
              }`}
            >
              430
            </button>
          </div>

          <button
            onClick={() => {
              if (isAdminAuthenticated) {
                setIsAdminOpen(true);
              } else {
                setShowPinModal(true);
              }
            }}
            title="Гэрийн эзний удирдлага (Admin)"
            className="w-8 h-8 rounded-full bg-[#FAF7F0]/80 backdrop-blur-md border border-[#B49368]/30 flex items-center justify-center text-[#29231E]/75 hover:text-[#29231E] hover:bg-[#FAF7F0] active:scale-95 transition-all shadow-sm cursor-pointer"
            aria-label="Admin panel"
          >
            <Lock className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* PRIMARY MOBILE INVITATION CONTAINER (Centered max 430-480px per mobile-first specification) */}
      <div
        ref={mainScrollContainerRef}
        inert={!isOpen}
        tabIndex={-1}
        style={{
          maxWidth: desktopWidth === '100%' ? '100%' : `${desktopWidth}px`,
        }}
        className="w-full relative z-10 min-h-[100svh] bg-[#FAF7F0] paper-texture shadow-2xl flex flex-col justify-between focus:outline-none"
      >
        {/* 1. CINEMATIC HERO SECTION */}
        <HeroSection
          config={activeConfig}
          onScrollDown={() => scrollToSection('intro-section')}
        />

        {/* 2. INTRODUCTION SECTION */}
        <div id="intro-section">
          <IntroductionSection config={activeConfig} />
        </div>

        {/* 4. DATE REVEAL & LIVE COUNTDOWN */}
        <DateCountdownSection config={activeConfig} />

        {/* 5. FEATURED BLESSING SPOTLIGHT */}
        <FeaturedBlessing blessings={publicBlessings} onWriteBlessing={() => scrollToSection('blessing-form-section')} />

        {/* 6. IMMERSIVE LOCATION & MAP SECTION */}
        <LocationSection config={activeConfig} />

        {/* 8. SYMBOLIC INTERACTION (Leave a gift for the new home) */}
        <SymbolicInteraction
          gifts={gifts}
          onGiftIncremented={refreshAllData}
        />

        {/* 9. BLESSING FORM (Шинэ гэрийн ерөөл) */}
        <BlessingFormSection onBlessingSubmitted={refreshAllData} />

        {/* 10. PUBLIC BLESSING WALL (Approved notes) */}
        <BlessingWall
          blessings={publicBlessings}
          onReactionUpdated={refreshAllData}
        />

        {/* 12. INTERACTIVE RSVP */}
        <RsvpSection selectedDay={selectedDay} onSuccessSubmit={refreshAllData} />

        {/* 13. CLOSING SECTION */}
        <ClosingSection
          config={activeConfig}
          onGoToRsvp={() => scrollToSection('rsvp-section')}
          onGoToBlessing={() => scrollToSection('blessing-form-section')}
        />

        {/* Minimal Footer */}
        <footer className="py-6 px-4 text-center border-t border-[#B49368]/20 bg-[#FAF7F0] text-[11px] text-[#29231E]/50 font-sans-ui">
          <p>© 2026 {activeConfig.hosts} · Шинэ гэрийн цайллага</p>
          <button
            onClick={() => {
              if (isAdminAuthenticated) setIsAdminOpen(true);
              else setShowPinModal(true);
            }}
            className="text-[10px] text-[#B49368] hover:underline mt-1.5 inline-block cursor-pointer"
          >
            Гэрийн эзний удирдлага
          </button>
        </footer>
      </div>

      {/* The trailing spacer lets the invitation stay pinned throughout the cover scroll. */}
      <InvitationCover config={activeConfig} isOpen={isOpen} onOpenChange={setIsOpen} />

      {/* ADMIN PIN CODE MODAL */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-xs w-full shadow-2xl border border-slate-200 text-slate-800 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-700">
              <Lock className="w-5 h-5" />
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 text-base">Гэрийн эзний нэвтрэх</h3>
              <p className="text-xs text-slate-500 mt-1">
                ПИН код оруулан удирдах самбар руу нэвтэрнэ үү
              </p>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-3">
              <input
                type="password"
                autoFocus
                value={adminPinInput}
                onChange={(e) => {
                  setAdminPinInput(e.target.value);
                  setAdminPinError(false);
                }}
                placeholder="ПИН код оруулна уу"
                className="w-full text-center tracking-widest text-lg font-mono p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-slate-800"
              />

              {adminPinError && (
                <p className="text-xs text-rose-600 font-medium">
                  Нэвтэрч чадсангүй. ПИН код болон холболтоо шалгана уу.
                </p>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="flex-1 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Болих
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  Нэвтрэх
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL ADMIN DASHBOARD MODAL */}
      {isAdminOpen && (
        <AdminDashboard
          config={config}
          rsvps={rsvps}
          blessings={allBlessings}
          timeline={timeline}
          gallery={gallery}
          gifts={gifts}
          onRefreshData={refreshAllData}
          onClose={() => setIsAdminOpen(false)}
        />
      )}
    </div>
  );
}
