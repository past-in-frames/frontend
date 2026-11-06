export const site = {
  name: "Past In Frames",
  /** About 155 characters, which is how much of it a search result shows. */
  description:
    "What happened on this day in history? Short, well-sourced stories about events, discoveries and turning points, one date at a time.",
  /** Absolute origin, needed for canonical URLs, sitemaps and social cards. */
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3022").replace(/\/+$/, ""),
} as const;

export function absoluteUrl(path: string) {
  return `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
}
