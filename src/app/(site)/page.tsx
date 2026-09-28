import Link from "next/link";
import { PageShell } from "@/components/page-header";
import { StoryGrid } from "@/components/story-card";
import { getStories, tryGet } from "@/lib/api";
import { categoryLabel, categoryPath } from "@/lib/story-path";
import { site } from "@/lib/site";

export default async function HomePage() {
  const { data: stories, error } = await tryGet(() => getStories(), []);
  const categories = [...new Set(stories.map((story) => story.category))];

  return (
    <>
      <section className="flex max-w-[900px] flex-col items-start gap-3.5 px-[18px] pt-8 pb-6 lg:gap-6 lg:px-16 lg:pt-24 lg:pb-16">
        <h1 className="m-0 font-serif text-[34px] leading-[1.08] font-semibold tracking-[-0.01em] lg:text-[64px] lg:leading-[1.04] lg:tracking-[-0.02em]">
          Curious minds,
          <br className="hidden lg:block" /> this way.
        </h1>
        <p className="m-0 max-w-[620px] text-[15px] leading-[1.55] text-muted lg:text-[19px] lg:leading-relaxed">
          {site.description}
        </p>
        {categories.length > 0 ? (
          <div className="mt-1 flex flex-wrap gap-2 lg:mt-2 lg:gap-2.5">
            {categories.map((category) => (
              <Link
                key={category}
                href={categoryPath(category)}
                className="rounded-full border border-ink/18 px-3.5 py-[7px] text-[13px] font-semibold whitespace-nowrap text-muted lg:px-[18px] lg:py-[9px] lg:text-sm"
              >
                {categoryLabel(category)}
              </Link>
            ))}
          </div>
        ) : null}
      </section>

      <PageShell>
        <h2 className="m-0 font-serif text-xl font-semibold lg:text-[26px]">
          Fresh finds
        </h2>
        {error ? (
          <p className="m-0 text-sm text-faded">{error}</p>
        ) : (
          <StoryGrid stories={stories} empty="No stories published yet." />
        )}
      </PageShell>
    </>
  );
}
