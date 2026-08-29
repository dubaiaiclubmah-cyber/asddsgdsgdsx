import { useEffect, useRef, useState } from "react";

interface LampDef {
  base: string;
  deep: string;
  /** "r,g,b" for the glow halo */
  glow: string;
  /** blink period in ms */
  period: number;
  /** phase offset in ms so lamps never sync */
  offset: number;
  /** fraction of the period the lamp stays lit */
  duty: number;
}

/** amber · coral · mint · sky — each on its own rhythm */
const LAMPS: LampDef[] = [
  { base: "#ffc04a", deep: "#e28e0c", glow: "247,169,40", period: 2100, offset: 0, duty: 0.58 },
  { base: "#ff8a6b", deep: "#e4502e", glow: "255,107,90", period: 2700, offset: 950, duty: 0.52 },
  { base: "#6fe3b4", deep: "#2fae7f", glow: "87,224,168", period: 1800, offset: 420, duty: 0.62 },
  { base: "#7fc4ff", deep: "#3f8fe0", glow: "110,180,255", period: 2450, offset: 1500, duty: 0.55 },
];

/** every so often a quick light sweep runs across the four lamps */
const SWEEP_EVERY = 8000;
const SWEEP_LEN = 1100;

interface IndicatorLampsProps {
  /** increments when "=" is pressed → all lamps flash together */
  burstId: number;
}

export default function IndicatorLamps({ burstId }: IndicatorLampsProps) {
  const [now, setNow] = useState(0);
  const [burst, setBurst] = useState(false);
  const [reduced, setReduced] = useState(false);
  const prevBurst = useRef(burstId);

  // JS-driven clock — works even where CSS keyframes are blocked
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    if (mq.matches) return;
    const id = window.setInterval(() => setNow(performance.now()), 100);
    return () => window.clearInterval(id);
  }, []);

  // equals → celebratory flash of all four lamps
  useEffect(() => {
    if (burstId === prevBurst.current) return;
    prevBurst.current = burstId;
    setBurst(true);
    const id = window.setTimeout(() => setBurst(false), 620);
    return () => window.clearTimeout(id);
  }, [burstId]);

  const sweepPos = now % SWEEP_EVERY;
  const sweeping = !reduced && sweepPos < SWEEP_LEN;
  const sweepIdx = Math.floor(sweepPos / (SWEEP_LEN / LAMPS.length));

  return (
    <div
      className="flex gap-[5px] p-[5px] rounded-[4px] bg-[#101417] ring-1 ring-white/10 shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]"
      aria-label="چراغ‌های نشانگر ماشین حساب"
    >
      {LAMPS.map((lamp, i) => {
        const phase = ((now + lamp.offset) % lamp.period) / lamp.period;
        const on = reduced || phase < lamp.duty;
        const boosted = burst || (sweeping && sweepIdx === i);
        const lit = on || boosted;
        const brightness = boosted ? 1.65 : on ? 1.25 : 0.75;
        const glowSize = boosted ? 22 : on ? 15 : 0;
        const glowAlpha = boosted ? 0.95 : on ? 0.8 : 0;
        return (
          <div
            key={i}
            className="w-7 h-4 rounded-[3px]"
            style={{
              background: `linear-gradient(180deg, ${lamp.base} 0%, ${lamp.deep} 100%)`,
              opacity: lit ? 1 : 0.45,
              filter: `brightness(${brightness}) saturate(${lit ? 1.15 : 0.7})`,
              boxShadow: `0 0 ${glowSize}px ${Math.round(glowSize / 4)}px rgba(${lamp.glow},${glowAlpha}), inset 0 1px 1px rgba(255,255,255,${on ? 0.55 : 0.18})`,
              transition: "opacity .16s ease, filter .16s ease, box-shadow .22s ease",
            }}
          />
        );
      })}
    </div>
  );
}
