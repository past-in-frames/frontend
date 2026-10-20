const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export type StoryWindow = {
  /** Inclusive first day. Absent means the list keeps going into the past. */
  from?: string;
  /** Inclusive last day. The list starts here and runs backward. */
  to: string;
};

/** The server's local calendar day. Passed into client components so the label does not hydrate twice. */
export function todayIso(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseIsoDate(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return undefined;
  const match = ISO_DATE.exec(raw);
  if (!match) return undefined;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return undefined;
  }
  return raw;
}

export function parseStoryDates(query: { from?: string | string[]; to?: string | string[] }) {
  return {
    from: parseIsoDate(query.from),
    to: parseIsoDate(query.to),
  };
}

/**
 * No dates means today and everything earlier. A single day is that day and
 * everything earlier. Two days are the inclusive range between them.
 * The later day is always `to`, so the list can start there and walk backward.
 */
export function resolveStoryWindow(
  dates: { from?: string; to?: string },
  today: string,
): StoryWindow {
  let { from, to } = dates;
  if (from && to && from > to) [from, to] = [to, from];
  if (!to && from) return { to: from };
  return { from, to: to ?? today };
}

export function isDefaultWindow(window: StoryWindow, today: string) {
  return !window.from && window.to === today;
}
