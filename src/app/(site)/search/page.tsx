import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader, PageShell } from "@/components/page-header";
import { StoryGrid } from "@/components/story-card";
import { searchStories, tryGet } from "@/lib/api";

type SearchPageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
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
  const q = searchQuery((await searchParams).q);

  if (!q) {
    return (
      <PageShell>
        <PageHeader title="Search" lede="Search stories by title." />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader title="Search" lede={`Stories with “${q}” in the title.`} />
      <Suspense key={q} fallback={<p className="m-0 text-sm text-faded">Loading stories…</p>}>
        <SearchResults q={q} />
      </Suspense>
    </PageShell>
  );
}

async function SearchResults({ q }: { q: string }) {
  const { data: stories, error } = await tryGet(() => searchStories(q), []);

  if (error) {
    return <p className="m-0 text-sm text-faded">{error}</p>;
  }

  return <StoryGrid stories={stories} empty={`No stories with “${q}” in the title.`} />;
}
