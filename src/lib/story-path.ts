/** Categories are free text in the database, so URLs use a slugified form. */
export function categorySlug(category: string) {
  return category
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function categoryPath(category: string) {
  return `/category/${categorySlug(category)}`;
}

export function storyPath(category: string, slug: string) {
  return `${categoryPath(category)}/${slug}`;
}

export function categoryLabel(category: string) {
  return category.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function labelFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
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
