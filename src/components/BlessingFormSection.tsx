import React, { useState } from 'react';
import { Send, CheckCircle2, LoaderCircle } from 'lucide-react';
import { addBlessing } from '../lib/guest-data';

export function BlessingFormSection({ onBlessingSubmitted }: { onBlessingSubmitted?: () => void }) {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;
    if (!name.trim() || !message.trim()) {
      setError('Нэр болон ерөөлөө бүрэн оруулна уу.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await addBlessing({ guest_name: name.trim(), message: message.trim() });
      setSubmitted(true);
      onBlessingSubmitted?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Хадгалж чадсангүй. Дахин оролдоно уу.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section id="blessing-form-section" className="py-14 px-5 text-center select-none overflow-hidden">
      <div className="max-w-[400px] mx-auto">
        <span className="rule" aria-hidden="true" />
        <span className="eyebrow block mt-2 mb-1">Сэтгэлийн дурсгал</span>
        <h2 className="title text-[#261E19] mb-2">Шинэ өргөөнд ерөөл өргөх</h2>
        <p className="font-serif text-xs text-[#8A7565] italic mb-6">
          Таны чин сэтгэлийн гэгээн ерөөл, ерөөлийн нандин үгсийг хүлээн авч байна.
        </p>

        {submitted ? (
          <div role="status" className="rounded-2xl border border-[#DFC694] bg-[#FAF7F2]/95 p-7 text-center shadow-xs">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-[#2F7A57]" aria-hidden="true" />
            <h3 className="display text-xl text-[#261E19]">Гэгээн ерөөлийг тань хүлээн авлаа</h3>
            <p className="mt-2 text-xs font-serif leading-relaxed text-[#8A7565]">
              Таны сэтгэлийн нандин үгс шинэ өргөөний ерөөлийн хананд мөнхөрлөө. Гүнээ талархъя!
            </p>
            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setMessage('');
              }}
              className="mt-5 text-xs font-serif text-[#C29B53] underline underline-offset-4 cursor-pointer hover:text-[#261E19]"
            >
              Дахин ерөөл бичих
            </button>
          </div>
        ) : (
          <form onSubmit={(e) => void submit(e)} className="text-left rounded-2xl border border-[#DFC694]/70 bg-[#FAF7F2]/90 p-6 space-y-4 shadow-xs">
            <label className="form-field mb-0">
              <span className="form-field-label">Таны нэр *</span>
              <input
                autoComplete="name"
                required
                maxLength={80}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Нэрээ бичнэ үү"
              />
            </label>

            <label className="form-field mb-0">
              <span className="form-field-label">Сэтгэлийн нандин ерөөл *</span>
              <textarea
                required
                rows={4}
                maxLength={2000}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Шинэ өргөөнд дэвшүүлэх ерөөл, сайхан үгээ энд бичнэ үү…"
                className="w-full mt-1 p-3 rounded-md border border-[#DFC694] bg-white/70 font-serif text-sm text-[#261E19] focus:outline-none focus:border-[#C29B53] resize-y"
              />
            </label>

            {error && (
              <p role="alert" className="text-xs font-serif italic text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="ceremonial-btn flex items-center justify-center gap-2 mt-2"
            >
              {busy ? (
                <>
                  <LoaderCircle className="w-4 h-4 animate-spin text-[#C29B53]" />
                  <span>Илгээж байна...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-[#C0913F]" aria-hidden="true" />
                  <span>Ерөөл өргөх</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
