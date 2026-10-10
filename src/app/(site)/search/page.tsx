import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader, PageShell } from "@/components/page-header";
import { StoryGrid } from "@/components/story-card";
import { StorySortBar } from "@/components/story-sort-bar";
import { searchStories, tryGet } from "@/lib/api";
import { parseStorySort, type StorySort } from "@/lib/story-sort";

type SearchPageProps = {
  searchParams: Promise<{ q?: string | string[]; sort?: string | string[] }>;
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
        <StorySortBar path="/search" sort={sort} query={q} />
      </div>
      <Suspense key={`${q}:${sort}`} fallback={<p className="m-0 text-sm text-faded">Loading stories…</p>}>
        <SearchResults q={q} sort={sort} />
      </Suspense>
    </PageShell>
  );
}

async function SearchResults({ q, sort }: { q: string; sort: StorySort }) {
  const { data: stories, error } = await tryGet(() => searchStories(q, sort), []);

  if (error) {
    return <p className="m-0 text-sm text-faded">{error}</p>;
  }

  return <StoryGrid stories={stories} empty={`No stories with “${q}” in the title.`} />;
}
