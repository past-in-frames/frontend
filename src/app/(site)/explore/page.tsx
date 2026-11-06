import type { Metadata } from "next";
import Link from "next/link";
import { TopicTiles } from "@/components/home/topic-tiles";
import { PageHeader, PageShell } from "@/components/page-header";
import { StoryGrid } from "@/components/story-card";
import { SectionHeading } from "@/components/ui";
import { getStories, tryGet, type StorySummary } from "@/lib/api";
import { pageMetadata } from "@/lib/seo";
import { sections } from "@/lib/story-path";

export const metadata: Metadata = pageMetadata({
  title: "Explore History by Topic",
  description:
    "Browse history by topic: the people who made it, the places where it happened, the eras that shaped it and the science behind it.",
  path: "/explore",
});

export default async function ExplorePage() {
  const { data: stories, error } = await tryGet(
    () => getStories({ limit: 6, sort: "latest" }),
    [] as StorySummary[],
  );

  return (
    <PageShell>
      <PageHeader title="Explore History by Topic" lede="Browse stories by the people, the places, the eras and the science behind them." />
      <TopicTiles />

      <section className="flex flex-col gap-5" aria-labelledby="sections-heading">
        <SectionHeading id="sections-heading">Sections</SectionHeading>
        <ul className="m-0 flex list-none flex-wrap gap-3 p-0">
          {Object.entries(sections).map(([path, section]) => (
            <li key={path}>
              <Link
                href={`/${path}`}
                className="inline-flex h-10 items-center rounded-full border border-ink/70 px-5 text-[15px] font-semibold hover:border-rust hover:text-rust"
              >
                {section.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-5" aria-labelledby="latest-heading">
        <SectionHeading id="latest-heading">Latest stories</SectionHeading>
        {error ? <p className="m-0 text-sm text-faded">{error}</p> : <StoryGrid stories={stories} empty="No stories published yet." headingLevel="h3" />}
      </section>
    </PageShell>
  );
}
