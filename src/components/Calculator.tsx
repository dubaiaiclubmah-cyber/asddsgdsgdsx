import { useCallback, useEffect, useRef, useState } from "react";
import type { DigitMode, HistoryItem, Op } from "../lib/calc";
import { applyOp, digitCount, numToRaw, opSymbol, toDisplay } from "../lib/calc";
import Key from "./Key";

interface CalculatorProps {
  mode: DigitMode;
  pickup: HistoryItem | null;
  onHistory: (item: HistoryItem) => void;
}

const MAX_DIGITS = 14;

/** four indicator lamps: amber, coral, mint, sky — each blinks on its own rhythm */
const LAMPS: { bg: string; glow: string; duration: string; delay: string }[] = [
  {
    bg: "linear-gradient(180deg, #ffc04a 0%, #e28e0c 100%)",
    glow: "rgba(247, 169, 40, 0.8)",
    duration: "2.1s",
    delay: "0s",
  },
  {
    bg: "linear-gradient(180deg, #ff8a6b 0%, #e4502e 100%)",
    glow: "rgba(255, 107, 90, 0.75)",
    duration: "2.7s",
    delay: "0.6s",
  },
  {
    bg: "linear-gradient(180deg, #6fe3b4 0%, #2fae7f 100%)",
    glow: "rgba(87, 224, 168, 0.7)",
    duration: "1.9s",
    delay: "1.1s",
  },
  {
    bg: "linear-gradient(180deg, #7fc4ff 0%, #3f8fe0 100%)",
    glow: "rgba(110, 180, 255, 0.75)",
    duration: "2.4s",
    delay: "0.3s",
  },
];

export default function Calculator({ mode, pickup, onHistory }: CalculatorProps) {
  const [raw, setRaw] = useState("0");
  const [acc, setAcc] = useState<number | null>(null);
  const [op, setOp] = useState<Op | null>(null);
  const [overwrite, setOverwrite] = useState(false);
  const [exprLine, setExprLine] = useState("");
  const [error, setError] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  // ref mirror so the keyboard listener always sees fresh state
  const state = useRef({ raw, acc, op, overwrite, error });
  state.current = { raw, acc, op, overwrite, error };

  const clearAll = useCallback(() => {
    setRaw("0");
    setAcc(null);
    setOp(null);
    setOverwrite(false);
    setExprLine("");
    setError(false);
  }, []);

  const fail = useCallback((expr: string) => {
    setError(true);
    setExprLine(expr + " =");
    setOp(null);
    setAcc(null);
    setOverwrite(true);
    setShakeKey((k) => k + 1);
  }, []);

  const inputDigit = useCallback((d: string) => {
    const s = state.current;
    const startingFresh = s.overwrite || s.error;
    if (s.error) setError(false);
    if (startingFresh) {
      setRaw(d === "." ? "0." : d);
      setOverwrite(false);
      if (s.error || !s.op) setExprLine("");
      return;
    }
    const cur = s.raw;
    if (d === "." && cur.includes(".")) return;
    if (d !== "." && cur === "0") {
      setRaw(d);
      return;
    }
    if (digitCount(cur) >= MAX_DIGITS) return;
    setRaw(cur + d);
  }, []);

  const chooseOp = useCallback((next: Op) => {
    const s = state.current;
    if (s.error) return;
    const cur = parseFloat(s.raw);
    if (s.op && s.overwrite) {
      setOp(next);
      setExprLine(`${numToRaw(s.acc!)} ${opSymbol(next)}`);
      return;
    }
    let base = cur;
    if (s.op && s.acc !== null) {
      const r = applyOp(s.acc, s.op, cur);
      if (!Number.isFinite(r)) {
        fail(`${numToRaw(s.acc)} ${opSymbol(s.op)} ${numToRaw(cur)}`);
        return;
      }
      base = r;
      setRaw(numToRaw(r));
    }
    setAcc(base);
    setOp(next);
    setOverwrite(true);
    setExprLine(`${numToRaw(base)} ${opSymbol(next)}`);
  }, [fail]);

  const equals = useCallback(() => {
    const s = state.current;
    if (s.error || s.op === null || s.acc === null) return;
    const a = s.acc;
    const b = parseFloat(s.raw);
    const expr = `${numToRaw(a)} ${opSymbol(s.op)} ${numToRaw(b)}`;
    const r = applyOp(a, s.op, b);
    if (!Number.isFinite(r)) {
      fail(expr);
      setRaw("0");
      return;
    }
    const result = numToRaw(r);
    setRaw(result);
    setExprLine(expr + " =");
    setAcc(null);
    setOp(null);
    setOverwrite(true);
    onHistory({ id: Date.now(), expr, result });
  }, [fail, onHistory]);

  const percent = useCallback(() => {
    const s = state.current;
    if (s.error) return;
    setRaw(numToRaw(parseFloat(s.raw) / 100));
    setOverwrite(true);
  }, []);

  const negate = useCallback(() => {
    const s = state.current;
    if (s.error) return;
    setRaw(s.raw.startsWith("-") ? s.raw.slice(1) : s.raw === "0" ? "0" : "-" + s.raw);
  }, []);

  const backspace = useCallback(() => {
    const s = state.current;
    if (s.error || s.overwrite) return;
    const next = s.raw.length <= 1 || (s.raw.length === 2 && s.raw.startsWith("-")) ? "0" : s.raw.slice(0, -1);
    setRaw(next);
  }, []);

  // pull a result back in from the tape
  useEffect(() => {
    if (!pickup) return;
    setError(false);
    setRaw(pickup.result);
    setAcc(null);
    setOp(null);
    setOverwrite(true);
    setExprLine("");
  }, [pickup]);

  // keyboard support
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key;
      if (/^[0-9]$/.test(k)) {
        inputDigit(k);
      } else if (k === "." || k === ",") {
        inputDigit(".");
      } else if (k === "+") {
        chooseOp("+");
      } else if (k === "-") {
        chooseOp("-");
      } else if (k === "*" || k === "x" || k === "X") {
        chooseOp("*");
      } else if (k === "/") {
        e.preventDefault();
        chooseOp("/");
      } else if (k === "Enter" || k === "=") {
        e.preventDefault();
        equals();
      } else if (k === "Escape") {
        clearAll();
      } else if (k === "Backspace") {
        backspace();
      } else if (k === "%") {
        percent();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [inputDigit, chooseOp, equals, clearAll, backspace, percent]);

  const display = toDisplay(raw, mode);
  const sizeClass =
    display.length <= 11
      ? "text-[2.6rem] md:text-5xl"
      : display.length <= 15
        ? "text-4xl"
        : display.length <= 20
          ? "text-[1.7rem]"
          : "text-2xl";

  const pending = op !== null && overwrite && !error;

  const digitLabel = (d: string) => (mode === "fa" ? toDisplay(d, "fa") : d);

  return (
    <section aria-label="ماشین حساب" className="rise" style={{ animationDelay: "0.1s" }}>
      {/* outer frame */}
      <div className="rounded-[30px] bg-gradient-to-b from-[#454d54] via-[#262c31] to-[#15191d] p-1.5 shadow-[0_30px_70px_rgba(0,0,0,0.55),0_4px_14px_rgba(0,0,0,0.4)] ring-1 ring-white/10">
        <div className="rounded-[24px] bg-[#1d2327] px-5 pt-4 pb-6 md:px-6">
          {/* brand + solar strip */}
          <div className="flex items-center justify-between mb-4">
            <div className="font-display text-[#8b979a] text-lg leading-none tracking-wide">
              آریا <span className="text-[#f7a928]">۸۸</span>
              <span className="block font-body text-[10px] text-[#5c6a6d] mt-1 tracking-[0.25em]">ARYA·SOLAR</span>
            </div>
            <div
              className="flex gap-[5px] p-[5px] rounded-[4px] bg-[#101417] ring-1 ring-white/10 shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]"
              aria-label="چراغ‌های نشانگر ماشین حساب"
            >
              {LAMPS.map((lamp, i) => (
                <div
                  key={i}
                  className="lamp-blink w-7 h-4 rounded-[3px]"
                  style={{
                    background: lamp.bg,
                    ["--lamp" as string]: lamp.glow,
                    animationDuration: lamp.duration,
                    animationDelay: lamp.delay,
                  }}
                />
              ))}
            </div>
          </div>

          {/* LCD */}
          <div key={shakeKey} className={`lcd-surface relative rounded-lg px-4 pt-2.5 pb-3 mb-5 overflow-hidden ${error ? "shake" : ""}`}>
            <div className="lcd-scanlines absolute inset-0 pointer-events-none rounded-lg" />
            <div className="relative flex items-center justify-between h-5">
              <span dir="ltr" className="font-body font-bold text-[13px] text-[#33422f]/80 tracking-wide">
                {error ? "خطا" : exprLine || "\u00A0"}
              </span>
              <span className={`size-2 rounded-full bg-[#4d6a44] ${pending ? "blinkdot" : "opacity-25"}`} />
            </div>
            <div dir="ltr" key={raw + (error ? "e" : "")} className={`lcdpop relative text-right font-body font-black text-[#20301f] tracking-tight leading-[1.15] break-all min-h-[3.4rem] flex items-end justify-end ${sizeClass}`}>
              {error ? <span dir="rtl" className="font-body font-black text-[1.45rem] leading-snug">تقسیم بر صفر ممکن نیست</span> : display}
            </div>
          </div>

          {/* keypad */}
          <div className="grid grid-cols-4 gap-2.5 md:gap-3">
            <Key label="AC" variant="ac" onPress={clearAll} ariaLabel="پاک کردن همه" />
            <Key
              label={
                <svg viewBox="0 0 24 24" className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 5H8l-5 7 5 7h13a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1Z" />
                  <path d="M12 9l4 6M16 9l-4 6" />
                </svg>
              }
              variant="fn"
              onPress={backspace}
              ariaLabel="حذف یک رقم"
            />
            <Key label="٪" variant="fn" onPress={percent} ariaLabel="درصد" />
            <Key label="÷" variant="op" active={op === "/" && pending} onPress={() => chooseOp("/")} ariaLabel="تقسیم" />

            <Key label={digitLabel("7")} onPress={() => inputDigit("7")} />
            <Key label={digitLabel("8")} onPress={() => inputDigit("8")} />
            <Key label={digitLabel("9")} onPress={() => inputDigit("9")} />
            <Key label="×" variant="op" active={op === "*" && pending} onPress={() => chooseOp("*")} ariaLabel="ضرب" />

            <Key label={digitLabel("4")} onPress={() => inputDigit("4")} />
            <Key label={digitLabel("5")} onPress={() => inputDigit("5")} />
            <Key label={digitLabel("6")} onPress={() => inputDigit("6")} />
            <Key label="−" variant="op" active={op === "-" && pending} onPress={() => chooseOp("-")} ariaLabel="تفریق" />

            <Key label={digitLabel("1")} onPress={() => inputDigit("1")} />
            <Key label={digitLabel("2")} onPress={() => inputDigit("2")} />
            <Key label={digitLabel("3")} onPress={() => inputDigit("3")} />
            <Key label="+" variant="op" active={op === "+" && pending} onPress={() => chooseOp("+")} ariaLabel="جمع" />

            <Key label="±" variant="fn" onPress={negate} ariaLabel="تغییر علامت" />
            <Key label={digitLabel("0")} onPress={() => inputDigit("0")} />
            <Key label={mode === "fa" ? "٫" : "."} onPress={() => inputDigit(".")} ariaLabel="ممیز" />
            <Key label="=" variant="eq" onPress={equals} ariaLabel="مساوی" />
          </div>

          <p className="mt-5 text-center font-body text-[11px] text-[#5c6a6d] tracking-[0.2em]">
            MADE FOR EVERYDAY MATH · ۱۲-DIGIT
          </p>
        </div>
      </div>
    </section>
  );
}
