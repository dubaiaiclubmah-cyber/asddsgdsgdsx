export type Op = "+" | "-" | "*" | "/";
export type DigitMode = "fa" | "en";

export interface HistoryItem {
  id: number;
  /** raw expression with latin digits, e.g. "12 + 7" */
  expr: string;
  /** raw result with latin digits */
  result: string;
}

const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

export function opSymbol(op: Op): string {
  return op === "+" ? "+" : op === "-" ? "−" : op === "*" ? "×" : "÷";
}

/** trim float noise: 0.1+0.2 -> "0.3" */
export function numToRaw(n: number): string {
  if (!Number.isFinite(n)) return "∞";
  return String(parseFloat(n.toPrecision(12)));
}

/** group thousands + localize digits/separators for the LCD and the tape */
export function toDisplay(raw: string, mode: DigitMode): string {
  const neg = raw.startsWith("-");
  const body = neg ? raw.slice(1) : raw;
  const dot = body.indexOf(".");
  const int = dot === -1 ? body : body.slice(0, dot);
  const dec = dot === -1 ? undefined : body.slice(dot + 1);

  let out = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  if (dec !== undefined) out += "." + dec;
  else if (body.endsWith(".")) out += ".";
  if (neg) out = "-" + out;

  if (mode === "en") return out;
  return out
    .replace(/\d/g, (d) => FA_DIGITS[Number(d)])
    .replace(/,/g, "٬")
    .replace(/\./g, "٫")
    .replace(/-/g, "−");
}

export function applyOp(a: number, op: Op, b: number): number {
  switch (op) {
    case "+":
      return a + b;
    case "-":
      return a - b;
    case "*":
      return a * b;
    case "/":
      return a / b;
  }
}

/** count significant input digits (cap typing length) */
export function digitCount(raw: string): number {
  return raw.replace(/[^0-9]/g, "").length;
}
