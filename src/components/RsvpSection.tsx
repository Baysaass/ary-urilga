import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LoaderCircle } from 'lucide-react';
import { addRsvp } from '../lib/storage';

interface RsvpSectionProps {
  selectedDay?: 1 | 2;
  onSuccessSubmit?: () => void;
}

export const RsvpSection: React.FC<RsvpSectionProps> = ({ selectedDay, onSuccessSubmit }) => {
  const [attending, setAttending] = useState<'yes' | 'with_family' | 'no'>('yes');
  const [guestName, setGuestName] = useState('');
  const [phone, setPhone] = useState('');
  const isDay2 = selectedDay === 2;
  const eventDay: '10-23' | '10-24' = isDay2 ? '10-24' : '10-23';
  const [adults, setAdults] = useState<number>(1);
  const [children, setChildren] = useState<number>(0);
  const [note, setNote] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleAdultsChange = (delta: number) => {
    setAdults((prev) => Math.max(1, Math.min(20, prev + delta)));
  };

  const handleChildrenChange = (delta: number) => {
    setChildren((prev) => Math.max(0, Math.min(20, prev + delta)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      setErrorMessage('Нэрээ бичнэ үү');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage('Утасны дугаараа бичнэ үү');
      return;
    }
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const isAttending = attending !== 'no';
      const adultCount = isAttending ? Math.max(1, adults) : 0;
      const childCount = isAttending ? Math.max(0, children) : 0;
      const totalCount = adultCount + childCount;

      const formattedNote = [
        `Утас: ${phone.trim()}`,
        isAttending ? `(Том хүн: ${adultCount}, Хүүхэд: ${childCount})` : '',
        note.trim() ? `Тэмдэглэл: ${note.trim()}` : '',
      ]
        .filter(Boolean)
        .join(' | ');

      await addRsvp({
        guest_name: guestName.trim(),
        attending,
        guest_count: totalCount,
        adults: adultCount,
        children: childCount,
        arrival_time: '',
        phone_or_note: formattedNote,
        event_day: eventDay,
      });

      setIsSubmitting(false);
      setIsSubmitted(true);
      if (onSuccessSubmit) onSuccessSubmit();
    } catch (err) {
      console.error(err);
      setErrorMessage('Алдаа гарлаа. Дахин оролдоно уу.');
      setIsSubmitting(false);
    }
  };

  return (
    <section id="rsvp-section" className="relative pt-16 pb-12 px-5 text-center select-none overflow-hidden">
      <div className="max-w-[420px] mx-auto">
        {/* Top Gold Rule */}
        <span className="rule" aria-hidden="true" />

        <span className="eyebrow block mt-2 mb-1">Хүрэлцэн ирэх хариу</span>
        <h2 className="title title--long text-[#261E19] mb-2">Хүрэлцэн ирэхээ мэдэгдэх</h2>
        <p className="font-serif text-[14px] text-[#635246] italic mb-6">
          Шинэ өргөөний баярыг хамтдаа хуваалцахаар хүрэлцэн ирэх хариугаа урьдчилан илгээнэ үү.
        </p>

        {isSubmitted ? (
          /* Confirmation Success View */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rsvp-done-card shadow-md"
          >
            <div className="done-mark-circle" aria-hidden="true">✓</div>
            <h3 className="display text-xl sm:text-2xl text-[#261E19] mb-1">
              Хариу илгээсэнд гүнээ талархъя! ♡
            </h3>
            <p className="font-serif text-xs text-[#2F7A57] italic mb-4">
              Таны хүрэлцэн ирэх мэдээллийг бүртгэж авлаа.
            </p>

            <dl className="done-summary-list">
              <dt>Нэр</dt>
              <dd>{guestName}</dd>

              <dt>Утас</dt>
              <dd>{phone}</dd>

              <dt>Хариу</dt>
              <dd>
                {attending === 'yes' && 'Хүрэлцэн ирнэ'}
                {attending === 'with_family' && 'Гэр бүлээрээ хүрэлцэн ирнэ'}
                {attending === 'no' && 'Хүндэтгэх шалтгаанаар очиж амжихгүй'}
              </dd>

              <dt>Өдөр</dt>
              <dd>
                {eventDay === '10-23' ? '10 сарын 23 (Баасан)' : '10 сарын 24 (Бямба)'}
              </dd>

              {attending !== 'no' && (
                <>
                  <dt>Том хүн</dt>
                  <dd>{adults} хүн</dd>

                  {children > 0 && (
                    <>
                      <dt>Хүүхэд</dt>
                      <dd>{children} хүүхэд</dd>
                    </>
                  )}
                </>
              )}
            </dl>

            <button
              type="button"
              onClick={() => setIsSubmitted(false)}
              className="mt-2 px-5 py-2 border border-[#C29B53] text-xs font-serif tracking-widest uppercase text-[#261E19] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
            >
              Мэдээлэл засах
            </button>
          </motion.div>
        ) : (
          /* Interactive RSVP Form per urilga.online */
          <form onSubmit={handleSubmit} className="text-left mt-6" noValidate>
            {/* 1. Name Field */}
            <label className="form-field">
              <span className="form-field-label">Таны нэр</span>
              <input
                type="text"
                value={guestName}
                onChange={(e) => {
                  setGuestName(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                maxLength={100}
                placeholder="Нэрээ оруулна уу"
                autoComplete="name"
              />
            </label>

            {/* 2. Phone Field */}
            <label className="form-field">
              <span className="form-field-label">Утасны дугаар</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                maxLength={20}
                placeholder="Утасны дугаараа бичнэ үү"
                inputMode="tel"
                autoComplete="tel"
              />
            </label>

            {/* 3. Event Day (Fixed to active invitation day, non-selectable) */}
            <div className="form-field">
              <span className="form-field-label">Цайллагын өдөр</span>
              <div className="mt-1 py-2 px-3.5 rounded-lg border border-[#DFC694]/70 bg-[#FAF7F2]/90 flex items-center justify-between">
                <div>
                  <span className="block font-semibold text-xs text-[#261E19]">
                    10 сарын {isDay2 ? '24' : '23'}
                  </span>
                  <span className="text-[11px] text-[#8A7565]">
                    {isDay2 ? 'Бямба гараг' : 'Баасан гараг'}
                  </span>
                </div>
                <span className="text-[10px] font-serif uppercase tracking-wider text-[#9A7432] bg-[#FAF7F2] px-2 py-0.5 rounded border border-[#C29B53]/30">
                  Тогтсон өдөр
                </span>
              </div>
            </div>

            {/* 4. Attendance Radios */}
            <fieldset className="form-field">
              <legend className="form-field-label">Таны хариу</legend>
              <div className="space-y-1">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="attendance"
                    value="yes"
                    checked={attending === 'yes'}
                    onChange={() => setAttending('yes')}
                  />
                  <span>Хүрэлцэн ирнэ</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="attendance"
                    value="with_family"
                    checked={attending === 'with_family'}
                    onChange={() => {
                      setAttending('with_family');
                      if (adults < 2) setAdults(2);
                    }}
                  />
                  <span>Гэр бүлээрээ хүрэлцэн ирнэ</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="attendance"
                    value="no"
                    checked={attending === 'no'}
                    onChange={() => setAttending('no')}
                  />
                  <span>Хүндэтгэх шалтгаанаар очиж амжихгүй</span>
                </label>
              </div>
            </fieldset>

            {/* 5. Separate Stepper Counts for Adults and Children (Shown when attending) */}
            {attending !== 'no' && (
              <div className="space-y-4 my-6 p-4 rounded-xl border border-[#DFC694]/70 bg-[#FAF7F2]/90 shadow-2xs">
                {/* Adults Stepper */}
                <div className="form-field mb-0">
                  <span className="form-field-label flex justify-between items-center">
                    <span>Том хүний тоо</span>
                    <span className="text-xs text-[#261E19] font-semibold">{adults} том хүн</span>
                  </span>
                  <div className="stepper mt-1">
                    <button
                      type="button"
                      onClick={() => handleAdultsChange(-1)}
                      aria-label="Том хүний тоог хасах"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      name="adults"
                      min={1}
                      max={20}
                      value={adults}
                      onChange={(e) => setAdults(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                      inputMode="numeric"
                    />
                    <button
                      type="button"
                      onClick={() => handleAdultsChange(1)}
                      aria-label="Том хүний тоог нэмэх"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Children Stepper */}
                <div className="form-field mb-0">
                  <span className="form-field-label flex justify-between items-center">
                    <span>Хүүхдийн тоо</span>
                    <span className="text-xs text-[#261E19] font-semibold">{children} хүүхэд</span>
                  </span>
                  <div className="stepper mt-1">
                    <button
                      type="button"
                      onClick={() => handleChildrenChange(-1)}
                      aria-label="Хүүхдийн тоог хасах"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      name="children"
                      min={0}
                      max={20}
                      value={children}
                      onChange={(e) => setChildren(Math.max(0, Math.min(20, parseInt(e.target.value) || 0)))}
                      inputMode="numeric"
                    />
                    <button
                      type="button"
                      onClick={() => handleChildrenChange(1)}
                      aria-label="Хүүхдийн тоог нэмэх"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Optional Note Field */}
            <label className="form-field">
              <span className="form-field-label">Гэрийн эздэд хүргэх зурвас (заавал биш)</span>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Жишээ: 16:00 цагийн үед очно, баярын мэнд хүргэе гэх мэт"
              />
            </label>

            {/* Error Message */}
            {errorMessage && (
              <p className="text-xs font-serif italic text-red-600 mb-4 text-center">
                {errorMessage}
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="ceremonial-btn flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="w-4 h-4 animate-spin text-[#C0913F]" />
                  <span>Илгээж байна...</span>
                </>
              ) : (
                <span>Хариу илгээх</span>
              )}
            </button>
          </form>
        )}
      </div>
    </section>
  );
};
