import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
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
    if (!name.trim() || !message.trim()) { setError('Нэр болон ерөөлөө бүрэн оруулна уу.'); return; }
    setBusy(true); setError('');
    try {
      await addBlessing({ guest_name: name.trim(), message: message.trim() });
      setSubmitted(true); onBlessingSubmitted?.();
    } catch (error) { setError(error instanceof Error ? error.message : 'Хадгалж чадсангүй. Дахин оролдоно уу.'); }
    finally { setBusy(false); }
  };
  const inputClass = 'w-full rounded-xl border border-[#B49368]/30 bg-white px-3.5 py-3 text-sm focus:outline-none focus:border-[#B6785D] placeholder:text-[#29231E]/35';
  return <section id="blessing-form-section" className="py-16 px-6 bg-[#F3EBDD]/60 border-y border-[#B49368]/20">
    <div className="max-w-[360px] mx-auto">
      <div className="text-center mb-8">
        <span className="text-[11px] tracking-[0.25em] text-[#B6785D]">СЭТГЭЛИЙН ДУРСГАЛ</span>
        <h2 className="font-serif-title text-3xl mt-1">Шинэ гэрийн ерөөл</h2>
        <p className="text-xs text-[#29231E]/70 mt-3">Сайхан үг, ерөөлөө нэртэйгээ үлдээгээрэй.</p>
      </div>
      {submitted ? <div role="status" className="rounded-3xl border border-[#B49368]/30 bg-[#FAF7F0] p-7 text-center">
        <CheckCircle2 className="w-10 h-10 mx-auto mb-4 text-[#7E9276]" aria-hidden="true" />
        <h3 className="font-serif-title text-2xl">Таны ерөөлийг хүлээн авлаа</h3>
        <p className="mt-3 text-xs leading-relaxed text-[#29231E]/70">Таны сайхан үг ерөөлийн картууд болон хананд нэмэгдлээ. Баярлалаа!</p>
        <button type="button" onClick={() => { setSubmitted(false); setMessage(''); }} className="mt-5 text-xs text-[#B6785D] underline underline-offset-4 cursor-pointer">Дахин ерөөл бичих</button>
      </div> : <form onSubmit={event => void submit(event)} className="rounded-3xl border border-[#B49368]/25 bg-[#FAF7F0] p-6 space-y-5">
        <div>
          <label htmlFor="blessing-name" className="block text-xs font-medium mb-2">Таны нэр *</label>
          <input id="blessing-name" autoComplete="name" required maxLength={80} value={name} onChange={event => setName(event.target.value)} placeholder="Таны нэр" className={inputClass} />
        </div>
        <div>
          <label htmlFor="blessing-message" className="block text-xs font-medium mb-2">Сэтгэлийн ерөөл *</label>
          <textarea id="blessing-message" required rows={4} maxLength={2000} value={message} onChange={event => setMessage(event.target.value)} placeholder="Ерөөл, сайхан үгээ энд бичээрэй…" className={inputClass + ' resize-y leading-relaxed'} />
        </div>
        {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
        <button type="submit" disabled={busy} className="w-full flex justify-center items-center gap-2 rounded-xl bg-[#29231E] text-[#FAF7F0] py-3.5 text-sm cursor-pointer disabled:opacity-50 hover:bg-[#3E352E]">
          <Send className="w-4 h-4 text-[#D4B98E]" aria-hidden="true" /> {busy ? 'Илгээж байна…' : 'Ерөөлөө илгээх'}
        </button>
      </form>}
    </div>
  </section>;
}
