"use server";

import { getStoriesPage, type StorySummary } from "@/lib/api";
import { HOME_PAGE_SIZE } from "@/lib/paging";
import { parseIsoDate, resolveStoryWindow, todayIso } from "@/lib/story-dates";
import { parseStorySort, type StorySort } from "@/lib/story-sort";

/** The next slice of the home feed, in the same order and date window as the first page. */
export async function loadMoreHomeStories(
  offset: number,
  sort: StorySort,
  dates: { from?: string; to?: string } = {},
): Promise<StorySummary[]> {
  const safeOffset = Number.isInteger(offset) && offset > 0 ? Math.min(offset, 10_000) : 0;
  const storyWindow = resolveStoryWindow(
    { from: parseIsoDate(dates.from), to: parseIsoDate(dates.to) },
    todayIso(),
  );
  const { stories } = await getStoriesPage({
    limit: HOME_PAGE_SIZE,
    offset: safeOffset,
    sort: parseStorySort(sort),
    excludeType: "other",
    from: storyWindow.from,
    to: storyWindow.to,
  });
  return stories;
}
