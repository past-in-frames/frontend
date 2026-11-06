/**
 * Public sections, in the order the site lists them. The key is the URL segment and
 * `type` is the value stored on the story. Only `others` differs (`/others` for the
 * stored type `other`). Keep this list in step with `backend/src/lib/story-types.ts`.
 */
export const sections = {
  history: { type: "history", label: "History" },
  politics: { type: "politics", label: "Politics" },
  war: { type: "war", label: "War & Conflict" },
  science: { type: "science", label: "Science" },
  space: { type: "space", label: "Space" },
  technology: { type: "technology", label: "Technology" },
  medicine: { type: "medicine", label: "Medicine & Health" },
  nature: { type: "nature", label: "Nature & Disasters" },
  exploration: { type: "exploration", label: "Exploration" },
  sport: { type: "sport", label: "Sport" },
  art: { type: "art", label: "Art & Literature" },
  music: { type: "music", label: "Music" },
  film: { type: "film", label: "Film & TV" },
  others: { type: "other", label: "Other" },
} as const;

export type SectionPath = keyof typeof sections;

export const sectionPaths = Object.keys(sections) as SectionPath[];

export const sectionNav = sectionPaths.map((path) => ({ href: `/${path}`, label: sections[path].label }));

export const miscellaneousHref = "/others";

export function sectionFromPath(value: string): SectionPath | null {
  return Object.hasOwn(sections, value) ? (value as SectionPath) : null;
}

export function sectionFromType(type: string | null | undefined): SectionPath | null {
  if (!type) return null;
  return sectionPaths.find((path) => sections[path].type === type) ?? null;
}

export function sectionLabel(type: string | null | undefined) {
  const section = sectionFromType(type);
  return section ? sections[section].label : "";
}

/** A story lives under its section: `/science/{slug}`. */
export function storyPath(type: string | null | undefined, slug: string) {
  const section = sectionFromType(type);
  return section ? `/${section}/${slug}` : null;
}

/** Event dates are stored as `YYYY-MM-DD`, so the year is the first segment. */
export function eventYear(value: string) {
  return value.slice(0, 4);
}

export function formatMonthDay(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function formatEventDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}
