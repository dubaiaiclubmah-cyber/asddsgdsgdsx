import type { ReactNode } from "react";

export type KeyVariant = "num" | "fn" | "ac" | "op" | "eq";

interface KeyProps {
  label: ReactNode;
  onPress: () => void;
  variant?: KeyVariant;
  active?: boolean;
  ariaLabel?: string;
}

const BASE =
  "relative h-14 md:h-16 select-none rounded-lg font-display text-2xl md:text-[1.7rem] leading-none " +
  "transition-all duration-100 ease-out outline-none " +
  "focus-visible:ring-2 focus-visible:ring-[#f7a928] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1d2327] " +
  "active:translate-y-[3px]";

const VARIANTS: Record<KeyVariant, string> = {
  num: "bg-gradient-to-b from-[#303940] to-[#232a2f] text-[#f0ead9] " +
    "shadow-[0_4px_0_#14181b,0_7px_12px_rgba(0,0,0,0.35)] active:shadow-[0_1px_0_#14181b] " +
    "hover:from-[#39434b] hover:to-[#28303680]",
  fn: "bg-gradient-to-b from-[#5a656d] to-[#475158] text-[#e6edea] " +
    "shadow-[0_4px_0_#2a3136,0_7px_12px_rgba(0,0,0,0.3)] active:shadow-[0_1px_0_#2a3136] " +
    "hover:from-[#647079] hover:to-[#4d575f]",
  ac: "bg-gradient-to-b from-[#5a656d] to-[#475158] text-[#ff9b78] " +
    "shadow-[0_4px_0_#2a3136,0_7px_12px_rgba(0,0,0,0.3)] active:shadow-[0_1px_0_#2a3136] " +
    "hover:from-[#647079] hover:to-[#4d575f]",
  op: "bg-gradient-to-b from-[#f7a928] to-[#e28e0c] text-[#3a2503] " +
    "shadow-[0_4px_0_#96610a,0_7px_14px_rgba(0,0,0,0.35)] active:shadow-[0_1px_0_#96610a] " +
    "hover:from-[#ffbb45] hover:to-[#ea9a15]",
  eq: "bg-gradient-to-b from-[#ffc04a] to-[#f08c00] text-[#2a1a00] " +
    "shadow-[0_4px_0_#a35f00,0_0_26px_rgba(247,169,40,0.35)] active:shadow-[0_1px_0_#a35f00] " +
    "hover:from-[#ffcd6b] hover:to-[#f99a12]",
};

const ACTIVE_OP =
  "bg-gradient-to-b from-[#2c343a] to-[#22282d] text-[#ffc04a] ring-2 ring-[#f7a928]/70 " +
  "shadow-[0_4px_0_#14181b,inset_0_0_18px_rgba(247,169,40,0.18)]";

export default function Key({ label, onPress, variant = "num", active = false, ariaLabel }: KeyProps) {
  const style = variant === "op" && active ? ACTIVE_OP : VARIANTS[variant];
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onPress}
      className={`${BASE} ${style}`}
    >
      <span className="absolute inset-x-0 top-[3px] h-[38%] rounded-[6px] bg-white/10 pointer-events-none" />
      <span className="relative">{label}</span>
    </button>
  );
}
