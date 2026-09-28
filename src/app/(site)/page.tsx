import Link from "next/link";
import { PageShell } from "@/components/page-header";
import { StoryLead, StorySecondary } from "@/components/story-lead";
import { StoryTimeline } from "@/components/story-timeline";
import { getCategories, getStories, tryGet, type Category, type StorySummary } from "@/lib/api";
import { categoryLabel, categoryPath, eventYear } from "@/lib/story-path";

/** One lead, a two-up, and a timeline. The rest of the archive lives on the category pages. */
const HOME_STORY_LIMIT = 20;

const todayFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
});

export default async function HomePage() {
  const [{ data: stories, error }, { data: categories }] = await Promise.all([
    tryGet(() => getStories({ limit: HOME_STORY_LIMIT }), [] as StorySummary[]),
    tryGet(getCategories, [] as Category[]),
  ]);

  const [lead, ...rest] = stories;
  const secondary = rest.slice(0, 2);
  const timeline = rest.slice(2);

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

      {error ? <p className="m-0 text-sm text-faded">{error}</p> : null}
      {!error && !lead ? (
        <p className="m-0 text-sm text-faded">No stories published yet.</p>
      ) : null}

      {lead ? <StoryLead story={lead} /> : null}

      {secondary.length > 0 ? (
        <div className="grid gap-7 lg:grid-cols-2 lg:gap-12">
          {secondary.map((story) => (
            <StorySecondary key={story.slug} story={story} />
          ))}
        </div>
      ) : null}

      {timeline.length > 0 ? (
        <section className="flex flex-col gap-3 lg:gap-5">
          <h2 className="m-0 font-serif text-xl font-semibold lg:text-[26px]">Further back</h2>
          <StoryTimeline stories={timeline} />
        </section>
      ) : null}

      {categories.length > 0 ? (
        <section className="flex flex-col gap-3 border-t border-ink/12 pt-7 lg:gap-4 lg:pt-10">
          <h2 className="m-0 text-[11px] font-bold tracking-[0.08em] text-pale uppercase lg:text-xs">
            Browse by subject
          </h2>
          <div className="flex flex-wrap gap-2 lg:gap-2.5">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={categoryPath(category.name)}
                className="rounded-full border border-ink/18 px-3.5 py-[7px] text-[13px] font-semibold whitespace-nowrap text-muted lg:px-[18px] lg:py-[9px] lg:text-sm"
              >
                {categoryLabel(category.name)}{" "}
                <span className="text-pale">{category.count}</span>
              </Link>
            ))}
          </div>
        </section>
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
