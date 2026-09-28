export const site = {
  name: "Past In Frames",
  description:
    "Short, well-sourced dives into the odd, the overlooked and the quietly astonishing. Five minutes, every day.",
  /** Absolute origin, needed for canonical URLs, sitemaps and social cards. */
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3022").replace(/\/+$/, ""),
} as const;

export function absoluteUrl(path: string) {
  return `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
}
