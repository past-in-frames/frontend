/** Anniversaries ignore the year, so dates are placed in a leap year where Feb 29 exists. */
const REFERENCE_YEAR = 2024;

export const SCOPES = [
  { value: "all", label: "All" },
  { value: "us", label: "U.S." },
  { value: "world", label: "World" },
  { value: "science", label: "Science" },
] as const;

export type Scope = (typeof SCOPES)[number]["value"];
export const DEFAULT_SCOPE: Scope = "all";

export type MonthDay = { month: number; day: number };

export function parseScope(value: string | string[] | undefined): Scope {
  const raw = Array.isArray(value) ? value[0] : value;
  return SCOPES.some((scope) => scope.value === raw) ? (raw as Scope) : DEFAULT_SCOPE;
}

export function daysInMonth(month: number) {
  return new Date(Date.UTC(REFERENCE_YEAR, month, 0)).getUTCDate();
}

export function isMonthDay(month: number, day: number) {
  return (
    Number.isInteger(month) &&
    Number.isInteger(day) &&
    month >= 1 &&
    month <= 12 &&
    day >= 1 &&
    day <= daysInMonth(month)
  );
}

/** `10-14` to `{ month: 10, day: 14 }`; anything else is null. */
export function parseMonthDay(value: string): MonthDay | null {
  const match = /^(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const month = Number(match[1]);
  const day = Number(match[2]);
  return isMonthDay(month, day) ? { month, day } : null;
}

export function monthDayFromIso(iso: string): MonthDay {
  return { month: Number(iso.slice(5, 7)), day: Number(iso.slice(8, 10)) };
}

export function monthDayKey({ month, day }: MonthDay) {
  return `${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function shiftDay({ month, day }: MonthDay, offset: number): MonthDay {
  const date = new Date(Date.UTC(REFERENCE_YEAR, month - 1, day + offset));
  return { month: date.getUTCMonth() + 1, day: date.getUTCDate() };
}

function format(value: MonthDay, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-US", { ...options, timeZone: "UTC" }).format(
    new Date(Date.UTC(REFERENCE_YEAR, value.month - 1, value.day)),
  );
}

/** `October 14` */
export function longMonthDay(value: MonthDay) {
  return format(value, { month: "long", day: "numeric" });
}

/** `OCT 14` */
export function shortMonthDay(value: MonthDay) {
  return format(value, { month: "short", day: "numeric" }).toUpperCase();
}

export function monthName(month: number, style: "long" | "short" = "short") {
  return format({ month, day: 1 }, { month: style });
}

/** The page for one calendar day. Today is the home page. */
export function onThisDayHref(value: MonthDay, scope: Scope = DEFAULT_SCOPE, today?: MonthDay) {
  const isToday = today && today.month === value.month && today.day === value.day;
  const path = isToday ? "/" : `/on-this-day/${monthDayKey(value)}`;
  return scope === DEFAULT_SCOPE ? path : `${path}?scope=${scope}`;
}

/** `On This Day in History: October 14` */
export function onThisDayTitle(value: MonthDay) {
  return `On This Day in History: ${longMonthDay(value)}`;
}

export function onThisDayDescription(value: MonthDay) {
  const label = longMonthDay(value);
  return `What happened on ${label} in history? Short, well-sourced stories about the events, discoveries and turning points that share this date.`;
}
