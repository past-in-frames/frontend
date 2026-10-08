/** Public sections. The URL says `others`; the story's stored type is `other`. */
export const sections = {
  science: { type: "science", label: "Science" },
  history: { type: "history", label: "History" },
  others: { type: "other", label: "Other" },
} as const;

export type SectionPath = keyof typeof sections;

export const sectionNav = [
  { href: "/science", label: sections.science.label },
  { href: "/history", label: sections.history.label },
] as const;

export const miscellaneousHref = "/others";

export function sectionFromPath(value: string): SectionPath | null {
  return value in sections ? (value as SectionPath) : null;
}

export function sectionFromType(type: string | null | undefined): SectionPath | null {
  if (type === "science" || type === "history") return type;
  if (type === "other") return "others";
  return null;
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
