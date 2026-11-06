import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader, PageShell } from "@/components/page-header";
import { StoryGrid } from "@/components/story-card";
import { StoryPagination } from "@/components/story-pagination";
import { getStoriesPage, tryGet } from "@/lib/api";
import { CATEGORY_PAGE_SIZE, pageHref, parsePageParam } from "@/lib/paging";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Watch",
  description: "Big moments, short videos.",
  alternates: { canonical: absoluteUrl("/watch") },
};

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
      <PageHeader title="Watch" lede="Big moments, short videos." />
      {error ? (
        <p className="m-0 text-sm text-faded">{error}</p>
      ) : (
        <StoryGrid stories={data.stories} empty="No videos yet." />
      )}
      {error ? null : <StoryPagination page={page} pageCount={pageCount} path="/watch" />}
    </PageShell>
  );
}
