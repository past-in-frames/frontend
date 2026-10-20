import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader, PageShell } from "@/components/page-header";
import { StoryGrid } from "@/components/story-card";
import { StoryDateFilter } from "@/components/story-date-filter";
import { StorySortBar } from "@/components/story-sort-bar";
import { searchStories, tryGet } from "@/lib/api";
import { parseStoryDates, resolveStoryWindow, todayIso } from "@/lib/story-dates";
import { parseStorySort, type StorySort } from "@/lib/story-sort";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string | string[];
    sort?: string | string[];
    from?: string | string[];
    to?: string | string[];
  }>;
};

function searchQuery(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  return (raw ?? "").trim().slice(0, 191);
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const q = searchQuery((await searchParams).q);

  return {
    title: q ? `“${q}”` : "Search",
    description: q ? `Stories with “${q}” in the title.` : "Search stories by title.",
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = await searchParams;
  const q = searchQuery(query.q);
  const sort = parseStorySort(query.sort);
  const today = todayIso();
  const dates = parseStoryDates(query);
  const storyWindow = resolveStoryWindow(dates, today);

  if (!q) {
    return (
      <PageShell>
        <PageHeader title="Search" lede="Search stories by title." />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <PageHeader title="Search" lede={`Stories with “${q}” in the title.`} />
        <div className="flex flex-wrap items-center gap-3">
          <StoryDateFilter
            path="/search"
            sort={sort}
            query={q}
            from={dates.from}
            to={dates.to}
            today={today}
          />
          <StorySortBar
            path="/search"
            sort={sort}
            query={q}
            from={storyWindow.from}
            to={storyWindow.to}
            today={today}
          />
        </div>
      </div>
      <Suspense
        key={`${q}:${sort}:${storyWindow.from ?? ""}:${storyWindow.to}`}
        fallback={<p className="m-0 text-sm text-faded">Loading stories…</p>}
      >
        <SearchResults q={q} sort={sort} from={storyWindow.from} to={storyWindow.to} />
      </Suspense>
    </PageShell>
  );
}

async function SearchResults({
  q,
  sort,
  from,
  to,
}: {
  q: string;
  sort: StorySort;
  from?: string;
  to?: string;
}) {
  const { data: stories, error } = await tryGet(() => searchStories(q, sort, { from, to }), []);

  if (error) {
    return <p className="m-0 text-sm text-faded">{error}</p>;
  }

  return <StoryGrid stories={stories} empty={`No stories with “${q}” in the title.`} />;
}
