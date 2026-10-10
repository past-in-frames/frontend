export const STORY_SORTS = ["year", "year-asc", "month-day", "month-day-desc"] as const;

export type StorySort = (typeof STORY_SORTS)[number];

/** December first, same calendar day together. The address stays clean until a reader picks something else. */
export const DEFAULT_STORY_SORT: StorySort = "month-day-desc";

export function parseStorySort(value: string | string[] | undefined): StorySort {
  const raw = Array.isArray(value) ? value[0] : value;
  return STORY_SORTS.includes(raw as StorySort) ? (raw as StorySort) : DEFAULT_STORY_SORT;
}

export function storySortMode(sort: StorySort): "year" | "month-day" {
  return sort === "month-day" || sort === "month-day-desc" ? "month-day" : "year";
}

export function flipStorySort(sort: StorySort): StorySort {
  switch (sort) {
    case "year":
      return "year-asc";
    case "year-asc":
      return "year";
    case "month-day":
      return "month-day-desc";
    case "month-day-desc":
      return "month-day";
  }
}

export function sortDirectionLabel(sort: StorySort) {
  switch (sort) {
    case "year":
      return "Newest first";
    case "year-asc":
      return "Oldest first";
    case "month-day":
      return "January first";
    case "month-day-desc":
      return "December first";
  }
}

/** Keeps search and pagination on the same order when the reader moves between pages. */
export function storySortHref(
  path: string,
  sort: StorySort,
  options?: { page?: number; query?: string },
) {
  const params = new URLSearchParams();
  if (options?.query) params.set("q", options.query);
  if (sort !== DEFAULT_STORY_SORT) params.set("sort", sort);
  if (options?.page && options.page > 1) params.set("page", String(options.page));
  const search = params.toString();
  return search ? `${path}?${search}` : path;
}

/** Same anniversary lands together; within that day the newer year comes first. */
export function compareStoriesBySort(
  a: { eventDate: string },
  b: { eventDate: string },
  sort: StorySort,
) {
  const byDate = a.eventDate.localeCompare(b.eventDate);
  if (sort === "year") return -byDate;
  if (sort === "year-asc") return byDate;

  const byMonthDay = a.eventDate.slice(5).localeCompare(b.eventDate.slice(5));
  if (sort === "month-day") return byMonthDay || -byDate;
  return -byMonthDay || -byDate;
}
