"use server";

import { getStoriesPage, type StorySummary } from "@/lib/api";
import { HOME_PAGE_SIZE } from "@/lib/paging";

/** The next slice of the home feed, in the same latest-published order as the first page. */
export async function loadMoreHomeStories(offset: number): Promise<StorySummary[]> {
  const safeOffset = Number.isInteger(offset) && offset > 0 ? Math.min(offset, 10_000) : 0;
  const { stories } = await getStoriesPage({
    limit: HOME_PAGE_SIZE,
    offset: safeOffset,
    sort: "latest",
    excludeType: "other",
  });
  return stories;
}
