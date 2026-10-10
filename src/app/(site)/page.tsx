import { HomeFeed } from "@/app/(site)/home-feed";
import { PageShell } from "@/components/page-header";
import { StorySortBar } from "@/components/story-sort-bar";
import { getStoriesPage, tryGet, type StorySummary } from "@/lib/api";
import { HOME_PAGE_SIZE } from "@/lib/paging";
import { eventYear } from "@/lib/story-path";
import { parseStorySort } from "@/lib/story-sort";

type HomePageProps = {
  searchParams: Promise<{ sort?: string | string[] }>;
};

const todayFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
});

export default async function HomePage({ searchParams }: HomePageProps) {
  const sort = parseStorySort((await searchParams).sort);
  const { data: page, error } = await tryGet(
    () => getStoriesPage({ limit: HOME_PAGE_SIZE, sort, excludeType: "other" }),
    { stories: [] as StorySummary[], total: 0 },
  );
  const { stories } = page;
  const lead = stories[0];

  return (
    <PageShell>
      <header className="flex max-w-[760px] flex-col gap-2.5 lg:gap-4">
        <span className="text-[11px] font-bold tracking-[0.08em] text-accent-2 uppercase lg:text-xs">
          Today · {todayFormatter.format(new Date())}
        </span>
        <h1 className="m-0 font-serif text-[34px] leading-[1.08] font-semibold tracking-[-0.01em] lg:text-[56px] lg:leading-[1.04] lg:tracking-[-0.02em]">
          This week in history
        </h1>
        <p className="m-0 text-[15px] leading-[1.55] text-muted lg:text-[19px] lg:leading-relaxed">
          {lead ? `${describeSpan(stories)} ` : ""}Five minutes each, with the sources left in plain
          sight.
        </p>
      </header>

      <StorySortBar path="/" sort={sort} />

      {error ? <p className="m-0 text-sm text-faded">{error}</p> : null}
      {!error && !lead ? (
        <p className="m-0 text-sm text-faded">No stories published yet.</p>
      ) : null}

      {stories.length > 0 ? (
        <HomeFeed key={sort} initialStories={stories} total={page.total} sort={sort} />
      ) : null}
    </PageShell>
  );
}

/** Describes the loaded set rather than making a promise the archive may not keep. */
function describeSpan(stories: StorySummary[]) {
  const years = stories.map((story) => Number(eventYear(story.eventDate)));
  const oldest = Math.min(...years);
  const newest = Math.max(...years);
  const count = stories.length === 1 ? "One anniversary" : `${stories.length} anniversaries`;

  if (oldest === newest) {
    return `${count} falling this week, all from ${newest}.`;
  }

  return `${count} falling this week, from ${oldest} to ${newest}.`;
}
