import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Heart, Minus, Plus, Sparkles, Send } from 'lucide-react';
import { addRsvp } from '../lib/storage';

interface RsvpSectionProps {
  onSuccessSubmit?: () => void;
}

export const RsvpSection: React.FC<RsvpSectionProps> = ({ onSuccessSubmit }) => {
  const [attending, setAttending] = useState<'yes' | 'no' | null>(null);
  const [guestName, setGuestName] = useState('');
  const [guestCount, setGuestCount] = useState(2);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      setErrorMessage('Та өөрийн нэрээ оруулна уу');
      return;
    }
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      addRsvp({
        guest_name: guestName.trim(),
        attending: attending || 'yes',
        guest_count: attending === 'yes' ? guestCount : 0,
        arrival_time: '',
        phone_or_note: note.trim(),
      });

      setTimeout(() => {
        setIsSubmitting(false);
        setIsSubmitted(true);
        if (onSuccessSubmit) onSuccessSubmit();
      }, 500);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <section id="rsvp-section" className="relative py-16 px-6 select-none">
      <div className="max-w-[360px] mx-auto rounded-3xl bg-[#FAF7F0] border border-[#B49368]/25 p-6 sm:p-7 paper-card-shadow overflow-hidden">
        {/* Header */}
        <div className="text-center mb-6">
          <span className="text-[11px] uppercase tracking-[0.22em] text-[#B49368] font-medium block mb-1">
            ХҮРЭЛЦЭН ИРЭХ БАТАЛГААЖУУЛАЛТ
          </span>
          <h2 className="font-serif-title text-2xl text-[#29231E] font-medium">
            Та хүрэлцэн ирэх үү?
          </h2>
          <p className="font-sans-ui text-xs text-[#29231E]/70 mt-1">
            Зочдоо тав тухтай хүлээн авахад бидэнд тусална уу
          </p>
        </div>

        {/* Success State */}
        {isSubmitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-8 text-center space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-[#B6785D]/15 text-[#B6785D] flex items-center justify-center mx-auto mb-3">
              <Heart className="w-8 h-8 fill-[#B6785D]" />
            </div>

            <h3 className="font-serif-title text-2xl text-[#29231E] font-medium">
              Баярлалаа 🤍
            </h3>

            <div className="font-sans-ui text-sm text-[#29231E]/80 leading-relaxed px-2">
              <p>Таны хариуг хүлээн авлаа.</p>
              <p className="font-serif-editorial text-base text-[#B6785D] mt-2">
                Таныг шинэ гэртээ тэсэн ядан хүлээж байна.
              </p>
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsSubmitted(false);
                  setAttending(null);
                  setGuestName('');
                }}
                className="text-xs text-[#B49368] hover:underline cursor-pointer"
              >
                Өөр зочны хариу бүртгэх
              </button>
            </div>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Attending Choice */}
            <div className="space-y-2.5">
              <div className="grid grid-cols-1 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setAttending('yes');
                    setErrorMessage('');
                  }}
                  className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    attending === 'yes'
                      ? 'border-[#B6785D] bg-[#F7EEE8] text-[#29231E] shadow-sm'
                      : 'border-[#B49368]/20 bg-[#FBF8F2] hover:bg-white text-[#29231E]/90'
                  }`}
                >
                  <span className="font-sans-ui text-sm font-medium">
                    Тэгэлгүй яах вэ 🤍
                  </span>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      attending === 'yes'
                        ? 'border-[#B6785D] bg-[#B6785D] text-white'
                        : 'border-[#B49368]/40'
                    }`}
                  >
                    {attending === 'yes' && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAttending('no');
                    setErrorMessage('');
                  }}
                  className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    attending === 'no'
                      ? 'border-[#8898A5] bg-[#EFF2F5] text-[#29231E] shadow-sm'
                      : 'border-[#B49368]/20 bg-[#FBF8F2] hover:bg-white text-[#29231E]/90'
                  }`}
                >
                  <span className="font-sans-ui text-sm font-normal text-[#29231E]/80">
                    Харамсалтай нь амжихгүй
                  </span>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      attending === 'no'
                        ? 'border-[#8898A5] bg-[#8898A5] text-white'
                        : 'border-[#B49368]/40'
                    }`}
                  >
                    {attending === 'no' && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </button>
              </div>
            </div>

            {/* Revealed Sub-Steps when a choice is selected */}
            <AnimatePresence>
              {attending !== null && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                  className="space-y-5 overflow-hidden pt-1"
                >
                  {/* Guest Name */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-[#29231E]/80">
                      Таны нэр <span className="text-[#B6785D]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Жишээ: Ариунаа & Мөнхбат"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#B49368]/30 bg-white text-sm text-[#29231E] placeholder:text-[#29231E]/30 focus:outline-none focus:border-[#B6785D] transition-colors"
                    />
                  </div>

                  {attending === 'yes' && (
                    <>
                      {/* Guest Count Counter */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-[#29231E]/80">
                          Та хэдүүлээ ирэх вэ?
                        </label>
                        <div className="flex items-center justify-between p-2 rounded-xl border border-[#B49368]/30 bg-white">
                          <button
                            type="button"
                            onClick={() => setGuestCount((c) => Math.max(1, c - 1))}
                            className="w-9 h-9 rounded-lg bg-[#FAF7F0] hover:bg-[#F3EBDD] flex items-center justify-center text-[#29231E] active:scale-95 transition-all cursor-pointer"
                          >
                            <Minus className="w-4 h-4" />
                          </button>

                          <div className="flex items-baseline gap-1.5">
                            <span className="font-serif-title text-2xl font-medium text-[#29231E] tabular-nums">
                              {guestCount}
                            </span>
                            <span className="text-xs text-[#29231E]/60 font-sans-ui">
                              хүн
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => setGuestCount((c) => Math.min(10, c + 1))}
                            className="w-9 h-9 rounded-lg bg-[#FAF7F0] hover:bg-[#F3EBDD] flex items-center justify-center text-[#29231E] active:scale-95 transition-all cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                    </>
                  )}

                  {/* Optional Note / Phone */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-[#29231E]/80">
                      {attending === 'yes'
                        ? 'Утасны дугаар эсвэл зурвас (заавал биш)'
                        : 'Сэтгэлийн үг, мэндчилгээ (заавал биш)'}
                    </label>
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder={
                        attending === 'yes'
                          ? 'Утас: 9911-XXXX'
                          : 'Баярт мөчид амжилт хүсье...'
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#B49368]/30 bg-white text-xs text-[#29231E] placeholder:text-[#29231E]/30 focus:outline-none focus:border-[#B6785D] transition-colors"
                    />
                  </div>

                  {errorMessage && (
                    <p className="text-xs text-rose-600 font-medium text-center">
                      {errorMessage}
                    </p>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-[#B6785D] text-white font-medium text-sm shadow-md hover:bg-[#A3664C] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="text-xs">Илгээж байна...</span>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>
                          {attending === 'yes' ? 'Ирэхээ баталгаажуулах' : 'Хариу илгээх'}
                        </span>
                      </>
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        )}
      </div>
    </section>
  );
};
