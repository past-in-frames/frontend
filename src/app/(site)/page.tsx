import type { Metadata } from "next";
import { HomeFeed } from "@/app/(site)/home-feed";
import { PageShell } from "@/components/page-header";
import { StoryDateFilter } from "@/components/story-date-filter";
import { StorySortBar } from "@/components/story-sort-bar";
import { getStoriesPage, tryGet, type StorySummary } from "@/lib/api";
import { HOME_PAGE_SIZE } from "@/lib/paging";
import { isDefaultWindow, parseStoryDates, resolveStoryWindow, todayIso } from "@/lib/story-dates";
import { eventYear, formatEventDate } from "@/lib/story-path";
import { DEFAULT_STORY_SORT, parseStorySort } from "@/lib/story-sort";

type HomePageProps = {
  searchParams: Promise<{ sort?: string | string[]; from?: string | string[]; to?: string | string[] }>;
};

const todayFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
});

export async function generateMetadata({ searchParams }: HomePageProps): Promise<Metadata> {
  const query = await searchParams;
  const sort = parseStorySort(query.sort);
  const dates = parseStoryDates(query);
  if (sort === DEFAULT_STORY_SORT && !dates.from && !dates.to) return {};
  return { robots: { index: false, follow: true } };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const query = await searchParams;
  const sort = parseStorySort(query.sort);
  const today = todayIso();
  const dates = parseStoryDates(query);
  const storyWindow = resolveStoryWindow(dates, today);
  const { data: page, error } = await tryGet(
    () =>
      getStoriesPage({
        limit: HOME_PAGE_SIZE,
        sort,
        excludeType: "other",
        from: storyWindow.from,
        to: storyWindow.to,
      }),
    { stories: [] as StorySummary[], total: 0 },
  );
  const { stories } = page;
  const lead = stories[0];
  const filtered = !isDefaultWindow(storyWindow, today);

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
          {lead ? `${describeSpan(stories)} ` : ""}
          {describeWindow(storyWindow, today)} Five minutes each, with the sources left in plain sight.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <StorySortBar path="/" sort={sort} from={storyWindow.from} to={storyWindow.to} today={today} />
        <StoryDateFilter path="/" sort={sort} from={dates.from} to={dates.to} today={today} />
      </div>

      {error ? <p className="m-0 text-sm text-faded">{error}</p> : null}
      {!error && !lead ? (
        <p className="m-0 text-sm text-faded">
          {filtered ? "No stories in this range." : "No stories published yet."}
        </p>
      ) : null}

      {stories.length > 0 ? (
        <HomeFeed
          key={`${sort}:${storyWindow.from ?? ""}:${storyWindow.to}`}
          initialStories={stories}
          total={page.total}
          sort={sort}
          from={storyWindow.from}
          to={storyWindow.to}
        />
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
    return `${count} from ${newest}.`;
  }

  return `${count} from ${oldest} to ${newest}.`;
}

function describeWindow(window: { from?: string; to: string }, today: string) {
  if (!window.from && window.to === today) return "From today back through the past.";
  if (!window.from) return `From ${formatEventDate(window.to)} back through the past.`;
  return `${formatEventDate(window.from)} through ${formatEventDate(window.to)}.`;
}
