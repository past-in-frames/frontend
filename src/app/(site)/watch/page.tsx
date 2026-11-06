import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader, PageShell } from "@/components/page-header";
import { StoryGrid } from "@/components/story-card";
import { StoryPagination } from "@/components/story-pagination";
import { getStoriesPage, tryGet } from "@/lib/api";
import { CATEGORY_PAGE_SIZE, pageHref, parsePageParam } from "@/lib/paging";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Short History Videos",
  description:
    "Watch big moments from history in short videos: launches, discoveries and turning points, each linked to a fully sourced story.",
  path: "/watch",
});

export default async function WatchPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const { page, redirectToFirst } = parsePageParam((await searchParams).page);
  if (redirectToFirst) redirect(pageHref("/watch", 1));

  const { data, error } = await tryGet(
    () => getStoriesPage({ video: true, sort: "latest", limit: CATEGORY_PAGE_SIZE, offset: (page - 1) * CATEGORY_PAGE_SIZE }),
    { stories: [], total: 0 },
  );
  const pageCount = data.total === 0 ? 0 : Math.ceil(data.total / CATEGORY_PAGE_SIZE);
  if (!error && pageCount > 0 && page > pageCount) redirect(pageHref("/watch", pageCount));

  return (
    <PageShell>
      <PageHeader title="Short History Videos" lede="Big moments, short videos, each with the full story and its sources." />
      {error ? (
        <p className="m-0 text-sm text-faded">{error}</p>
      ) : (
        <StoryGrid stories={data.stories} empty="No videos yet." />
      )}
      {error ? null : <StoryPagination page={page} pageCount={pageCount} path="/watch" />}
    </PageShell>
  );
}
