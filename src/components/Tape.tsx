import type { DigitMode, HistoryItem } from "../lib/calc";
import { toDisplay } from "../lib/calc";

interface TapeProps {
  items: HistoryItem[];
  mode: DigitMode;
  onPick: (item: HistoryItem) => void;
  onClear: () => void;
}

export default function Tape({ items, mode, onPick, onClear }: TapeProps) {
  return (
    <aside className="rise" style={{ animationDelay: "0.22s" }}>
      <div className="flex items-end justify-between mb-3 px-1">
        <h2 className="font-display text-2xl text-[#e9e4d4] leading-none">
          نوار محاسبات
          {items.length > 0 && (
            <span className="mr-2 inline-flex items-center justify-center rounded-full bg-[#f7a928]/15 border border-[#f7a928]/40 text-[#ffc04a] text-sm font-body font-bold px-2.5 py-0.5 align-middle">
              {toDisplay(String(items.length), mode)}
            </span>
          )}
        </h2>
        {items.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="group flex items-center gap-1.5 text-sm text-[#9aa79b] hover:text-[#ff9b78] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#f7a928] rounded-md px-2 py-1"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18" />
              <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
            </svg>
            <span className="group-hover:underline underline-offset-4">پاک کردن</span>
          </button>
        )}
      </div>

      {/* roller */}
      <div className="relative z-10 h-4 rounded-full bg-gradient-to-b from-[#4a545b] via-[#2c3339] to-[#171c1f] shadow-[0_3px_8px_rgba(0,0,0,0.5)] border border-white/10">
        <div className="absolute inset-x-6 top-[3px] h-[3px] rounded-full bg-white/20" />
      </div>

      {/* paper */}
      <div className="tape-zigzag -mt-1 pb-3">
        <div className="tape-paper px-5 pt-5 pb-8 min-h-[300px] shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-14 text-[#8d8264]">
              <svg viewBox="0 0 24 24" className="w-10 h-10 mb-3 opacity-60" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="2" width="16" height="20" rx="2" />
                <path d="M8 6h8" />
                <path d="M8 10h2M12 10h2M16 10h.01" />
                <path d="M8 14h2M12 14h2M16 14h.01" />
                <path d="M8 18h2M12 18h6" />
              </svg>
              <p className="font-body font-medium text-sm leading-7">
                هنوز چیزی حساب نشده است.
                <br />
                اولین جمع را بزنید تا اینجا چاپ شود!
              </p>
            </div>
          ) : (
            <ul>
              {items.map((item, i) => (
                <li key={item.id} className={i === 0 ? "tapein" : undefined}>
                  <button
                    type="button"
                    onClick={() => onPick(item)}
                    title="برای استفاده از این نتیجه کلیک کنید"
                    className="group w-full text-right rounded-md px-2 py-2.5 -mx-2 transition-all duration-150 hover:bg-[#f7a928]/15 hover:translate-x-[-3px] active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-[#b97e14]"
                  >
                    <div dir="ltr" className="text-left text-[13px] font-body text-[#8d8264] group-hover:text-[#7a6c48] transition-colors">
                      {toDisplay(item.expr, mode)} <span className="text-[#b97e14]">=</span>
                    </div>
                    <div dir="ltr" className="text-left font-display text-[1.65rem] leading-tight text-[#26251c] group-hover:text-[#191811]">
                      {toDisplay(item.result, mode)}
                    </div>
                    <div className="mt-1.5 h-px bg-[repeating-linear-gradient(90deg,#c9bd9d_0_6px,transparent_6px_12px)]" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <p className="mt-3 px-1 text-[13px] text-[#77857a] font-body leading-6">
        روی هر نتیجه کلیک کنید تا دوباره روی صفحهٔ ماشین حساب بنشیند.
      </p>
    </aside>
  );
}
