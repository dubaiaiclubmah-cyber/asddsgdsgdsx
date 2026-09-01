import { useCallback, useState } from "react";
import Calculator from "./components/Calculator";
import Tape from "./components/Tape";
import type { DigitMode, HistoryItem } from "./lib/calc";

function CalcMark() {
  return (
    <svg viewBox="0 0 48 48" className="w-12 h-12 md:w-14 md:h-14" aria-hidden="true">
      <rect x="6" y="3" width="36" height="42" rx="7" fill="#f7a928" />
      <rect x="6" y="3" width="36" height="42" rx="7" fill="url(#g)" />
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffc04a" />
          <stop offset="1" stopColor="#e28e0c" />
        </linearGradient>
      </defs>
      <rect x="12" y="9" width="24" height="9" rx="2.5" fill="#1d2327" />
      <rect x="14" y="13" width="14" height="3" rx="1.5" fill="#c3d1b2" />
      <g fill="#1d2327">
        <circle cx="15.5" cy="25" r="3" />
        <circle cx="24" cy="25" r="3" />
        <circle cx="32.5" cy="25" r="3" />
        <circle cx="15.5" cy="33" r="3" />
        <circle cx="24" cy="33" r="3" />
        <circle cx="32.5" cy="33" r="3" />
        <rect x="12.5" y="38.5" width="23" height="4" rx="2" />
      </g>
    </svg>
  );
}

const HINTS: { keys: string; label: string }[] = [
  { keys: "۰–۹", label: "نوشتن رقم" },
  { keys: "+ − * /", label: "چهار عمل" },
  { keys: "Enter", label: "مساوی" },
  { keys: "Esc", label: "پاک کردن" },
  { keys: "⌫", label: "حذف رقم" },
  { keys: "%", label: "درصد" },
];

export default function App() {
  const [mode, setMode] = useState<DigitMode>("fa");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [pickup, setPickup] = useState<HistoryItem | null>(null);

  const handleHistory = useCallback((item: HistoryItem) => {
    setHistory((h) => [item, ...h].slice(0, 40));
  }, []);

  const handlePick = useCallback((item: HistoryItem) => {
    setPickup({ ...item, id: Date.now() });
  }, []);

  return (
    <div dir="rtl" className="relative min-h-screen overflow-hidden bg-[#0d1715] text-[#e9e4d4] font-body">
      {/* layered ambient background */}
      <div className="absolute inset-0 bg-dots pointer-events-none" aria-hidden="true" />
      <div
        className="absolute -top-40 left-1/2 w-[46rem] h-[46rem] -translate-x-1/4 rounded-full pointer-events-none lampfloat"
        style={{ background: "radial-gradient(circle, rgba(247,169,40,0.13) 0%, rgba(247,169,40,0.04) 40%, transparent 68%)" }}
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-56 -right-40 w-[42rem] h-[42rem] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(64,145,120,0.16) 0%, rgba(64,145,120,0.05) 42%, transparent 70%)" }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: "inset 0 0 180px rgba(0,0,0,0.75)" }} aria-hidden="true" />

      <main className="relative mx-auto max-w-5xl px-4 md:px-8 pt-10 pb-16 md:pt-14">
        {/* header */}
        <header className="rise flex flex-wrap items-end justify-between gap-6 mb-10 md:mb-12">
          <div className="flex items-center gap-4">
            <div className="drop-shadow-[0_10px_24px_rgba(247,169,40,0.25)]">
              <CalcMark />
            </div>
            <div>
              <h1 className="font-display text-5xl md:text-6xl leading-[1.05] text-[#f5efdd]">
                ماشین <span className="text-[#f7a928]">حساب</span>
              </h1>
              <p className="mt-2 text-[15px] md:text-base text-[#9aa79b] font-light leading-7">
                ساده، روشن و دقیق — همان‌قدر که لازم است، نه بیشتر.
              </p>
            </div>
          </div>

          {/* digit mode switch */}
          <div className="rise" style={{ animationDelay: "0.08s" }}>
            <p className="mb-1.5 text-[12px] text-[#77857a]">شیوهٔ نمایش اعداد</p>
            <div className="inline-flex rounded-xl bg-[#161d1a] ring-1 ring-white/10 p-1 gap-1 shadow-[inset_0_2px_6px_rgba(0,0,0,0.5)]">
              <button
                type="button"
                onClick={() => setMode("fa")}
                className={`rounded-lg px-4 py-1.5 text-sm font-bold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#f7a928] ${
                  mode === "fa"
                    ? "bg-[#f7a928] text-[#2a1a00] shadow-[0_2px_10px_rgba(247,169,40,0.4)]"
                    : "text-[#9aa79b] hover:text-[#e9e4d4]"
                }`}
              >
                فارسی ۱۲۳
              </button>
              <button
                type="button"
                onClick={() => setMode("en")}
                className={`rounded-lg px-4 py-1.5 text-sm font-bold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#f7a928] ${
                  mode === "en"
                    ? "bg-[#f7a928] text-[#2a1a00] shadow-[0_2px_10px_rgba(247,169,40,0.4)]"
                    : "text-[#9aa79b] hover:text-[#e9e4d4]"
                }`}
              >
                123 Latin
              </button>
            </div>
          </div>
        </header>

        {/* machine + tape */}
        <div className="grid gap-12 lg:gap-14 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] items-start">
          <div className="min-w-0">
            <Calculator mode={mode} pickup={pickup} onHistory={handleHistory} />

            {/* signature — right below the machine */}
            <div className="rise mt-5 rounded-2xl bg-[#121a17]/85 ring-1 ring-white/8 px-5 py-4" style={{ animationDelay: "0.22s" }}>
              <div className="flex items-center justify-center gap-3" aria-hidden="true">
                <span className="h-px w-12 bg-gradient-to-l from-transparent to-[#f7a928]/50" />
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4 text-[#f7a928] drop-shadow-[0_0_10px_rgba(247,169,40,0.55)]"
                  fill="currentColor"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                <span className="h-px w-12 bg-gradient-to-r from-transparent to-[#f7a928]/50" />
              </div>
              <p className="mt-3 text-center text-sm md:text-[15px] leading-8 text-[#c4bdaa]">
                این برنامه توسط <span className="font-bold text-[#f7a928]">هلیا ۶ ساله</span>، از کلاس خانم دکتر آقایی، نوشته شده است
                <span className="block mt-0.5 text-[12.5px] md:text-[13px] leading-7 text-[#7e8b80]">
                  و اولین پروژه هست که خود هلیا ساخته است
                </span>
              </p>
              <div className="mt-3.5 flex flex-col items-center gap-1.5">
                <span className="text-[11.5px] text-[#77857a]">شماره تماس استاد</span>
                <a
                  href="tel:00971551544988"
                  dir="ltr"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#161d1a] ring-1 ring-white/10 px-4 py-1.5 text-[15px] font-bold tracking-[0.08em] text-[#e9e4d4] outline-none transition-all duration-200 hover:ring-[#f7a928]/60 hover:text-[#ffc04a] hover:shadow-[0_0_18px_rgba(247,169,40,0.2)] focus-visible:ring-2 focus-visible:ring-[#f7a928]"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#f7a928]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  ۰۰۹۷۱۵۵۱۵۴۴۹۸۸
                </a>
              </div>
            </div>
          </div>

          <Tape items={history} mode={mode} onPick={handlePick} onClear={() => setHistory([])} />
        </div>

        {/* keyboard hints */}
        <footer className="rise mt-14" style={{ animationDelay: "0.32s" }}>
          <div className="rounded-2xl bg-[#121a17]/80 ring-1 ring-white/8 px-5 py-4 md:px-7">
            <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
              <span className="flex items-center gap-2 text-sm font-bold text-[#c8c2ae]">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#f7a928]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="6" width="20" height="12" rx="2" />
                  <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h.01M18 14h.01M9 14h6" />
                </svg>
                با صفحه‌کلید هم می‌شود حساب کرد:
              </span>
              {HINTS.map((h) => (
                <span key={h.keys} className="flex items-center gap-2 text-[13px] text-[#8b988c]">
                  <kbd dir="ltr" className="inline-block rounded-md bg-[#1e2622] ring-1 ring-white/12 px-2 py-0.5 text-[12px] font-body font-bold text-[#d9d3bf] shadow-[0_2px_0_rgba(0,0,0,0.45)]">
                    {h.keys}
                  </kbd>
                  {h.label}
                </span>
              ))}
            </div>
          </div>
          <p className="mt-5 text-center text-[12px] text-[#5c6a6d] tracking-wide">
            ساخته‌شده برای حساب‌وکتاب‌های روزمره — هر نتیجه روی نوار چاپ می‌شود و قابل برگرداندن است.
          </p>
        </footer>
      </main>
    </div>
  );
}
