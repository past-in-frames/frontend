import Image from "next/image";
import Link from "next/link";
import { BirthdayForm } from "@/components/home/birthday-form";
import { ArchiveBar } from "@/components/home/archive-bar";
import { DayStrip } from "@/components/home/day-strip";
import { TopicTiles } from "@/components/home/topic-tiles";
import { PlayBadge } from "@/components/icons";
import { PageShell } from "@/components/page-header";
import { Cover, Eyebrow, rustButtonClass, SectionHeading } from "@/components/ui";
import {
  getCollections,
  getOnThisDay,
  getStories,
  tryGet,
  type CollectionSummary,
  type OnThisDay,
  type StorySummary,
} from "@/lib/api";
import {
  longMonthDay,
  monthDayFromIso,
  onThisDayHref,
  SCOPES,
  shiftDay,
  shortMonthDay,
  type MonthDay,
  type Scope,
} from "@/lib/on-this-day";
import { todayIso } from "@/lib/story-dates";
import { eventYear, storyPath } from "@/lib/story-path";

const STRIP_RADIUS = 3;

/** The home page and `/on-this-day/MM-DD` are the same page for different days. */
export async function OnThisDayView({ date, scope }: { date: MonthDay; scope: Scope }) {
  const today = monthDayFromIso(todayIso());
  const empty: OnThisDay = { month: date.month, day: date.day, featured: null, also: [], week: [] };

  const [day, photo, collections, watch] = await Promise.all([
    tryGet(() => getOnThisDay(date.month, date.day, scope), empty),
    tryGet(() => getStories({ photoStory: true, limit: 1, sort: "latest" }), [] as StorySummary[]),
    tryGet(() => getCollections(3), [] as CollectionSummary[]),
    tryGet(() => getStories({ video: true, limit: 1, sort: "latest" }), [] as StorySummary[]),
  ]);

  const { featured, also, week } = day.data;
  const label = longMonthDay(date);
  const stripDays = Array.from({ length: STRIP_RADIUS * 2 + 1 }, (_, index) => {
    const value = shiftDay(date, index - STRIP_RADIUS);
    return {
      label: shortMonthDay(value),
      href: onThisDayHref(value, scope, today),
      active: index === STRIP_RADIUS,
    };
  });

  return (
    <PageShell>
      <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-1">
          <Eyebrow>{label}</Eyebrow>
          <h1 className="m-0 font-serif text-[48px] leading-[1.02] font-bold tracking-[-0.015em] sm:text-[60px]">
            On This Day
          </h1>
        </div>
        <nav aria-label="Filter by region or topic" className="flex flex-wrap gap-2.5 md:pb-2">
          {SCOPES.map((item) => {
            const current = item.value === scope;
            return (
              <Link
                key={item.value}
                href={onThisDayHref(date, item.value, today)}
                aria-current={current ? "true" : undefined}
                className={`flex h-9 min-w-[60px] items-center justify-center rounded-full border px-4 text-[15px] font-semibold ${
                  current
                    ? "border-rust bg-rust text-white"
                    : "border-ink/70 text-ink hover:border-rust hover:text-rust"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <DayStrip days={stripDays} />

      {day.error ? <p className="m-0 text-sm text-faded">{day.error}</p> : null}

      {featured ? (
        <FeaturedStory story={featured} />
      ) : day.error ? null : (
        <p className="m-0 font-serif text-lg text-muted">
          No stories for {label} yet{scope === "all" ? "" : " in this filter"}. Try another day.
        </p>
      )}

      {also.length > 0 ? (
        <section className="flex flex-col gap-5" aria-labelledby="also-heading">
          <SectionHeading id="also-heading">Also on {label}</SectionHeading>
          <ul className="m-0 grid list-none gap-y-5 p-0 sm:grid-cols-2">
            {also.map((story, index) => (
              <li key={story.slug} className={index % 2 === 1 ? "sm:border-l sm:border-ink/35 sm:pl-6" : "sm:pr-6"}>
                <Link
                  href={storyPath(story.type, story.slug) ?? "/"}
                  className="mi-card flex items-center gap-4"
                >
                  <span className="font-serif text-[48px] leading-none font-semibold text-rust tabular-nums sm:text-[56px]">
                    {eventYear(story.eventDate)}
                  </span>
                  <span aria-hidden="true" className="h-14 w-px shrink-0 bg-ink/35" />
                  <span className="mi-card-title font-serif text-[21px] leading-[1.2] font-bold sm:text-[24px]">
                    {story.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {week.length > 0 ? (
        <section className="flex flex-col gap-5" aria-labelledby="week-heading">
          <SectionHeading id="week-heading">This Week in History</SectionHeading>
          <ul className="m-0 grid list-none grid-cols-2 gap-x-4 gap-y-6 p-0 sm:grid-cols-3">
            {week.map((story) => (
              <li key={story.slug}>
                <Link href={storyPath(story.type, story.slug) ?? "/"} className="mi-card flex flex-col gap-3">
                  <Cover
                    src={story.coverUrl}
                    alt={story.coverAlt ?? ""}
                    sizes="(min-width: 1200px) 370px, (min-width: 640px) 33vw, 50vw"
                    aspect="aspect-[1.1/1]"
                  />
                  <span className="mi-card-title font-serif text-[19px] leading-[1.2] font-bold sm:text-[22px]">
                    {story.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {photo.data[0] ? <PhotoStory story={photo.data[0]} /> : null}

      {collections.data.length > 0 ? (
        <section className="flex flex-col gap-5" aria-labelledby="collections-heading">
          <SectionHeading id="collections-heading">Collections</SectionHeading>
          <ul className="m-0 grid list-none grid-cols-2 gap-x-4 gap-y-6 p-0 sm:grid-cols-3">
            {collections.data.map((collection) => (
              <li key={collection.slug}>
                <Link href={`/collections/${collection.slug}`} className="mi-card flex flex-col gap-3">
                  <Cover
                    src={collection.coverUrl}
                    alt=""
                    sizes="(min-width: 1200px) 370px, (min-width: 640px) 33vw, 50vw"
                    aspect="aspect-[1.65/1]"
                  />
                  <span className="mi-card-title font-serif text-[19px] leading-[1.2] font-bold sm:text-[22px]">
                    {collection.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="flex flex-col gap-5" aria-labelledby="topics-heading">
        <SectionHeading id="topics-heading">Explore by Topic</SectionHeading>
        <TopicTiles />
      </section>

      <div className="grid gap-10 md:grid-cols-2 md:gap-0">
        <section className="flex flex-col gap-3 md:pr-8" aria-labelledby="birthday-heading">
          <h2 id="birthday-heading" className="m-0 font-serif text-[30px] leading-[1.1] font-bold tracking-[-0.01em]">
            My Birthday in History
          </h2>
          <p className="m-0 mb-2 font-serif text-lg text-ink">See what happened on your date.</p>
          <BirthdayForm initial={date} today={today} />
        </section>
        <section className="flex flex-col gap-3 md:border-l md:border-ink/35 md:pl-8" aria-labelledby="watch-heading">
          <h2 id="watch-heading" className="m-0 font-serif text-[30px] leading-[1.1] font-bold tracking-[-0.01em]">
            Watch in 30 Seconds
          </h2>
          <p className="m-0 mb-2 font-serif text-lg text-ink">Big moments, short videos.</p>
          <WatchTile story={watch.data[0]} />
          <Link href="/watch" className={`${rustButtonClass} mt-1 self-start`}>
            Browse videos →
          </Link>
        </section>
      </div>

      <ArchiveBar today={today} />
    </PageShell>
  );
}

function FeaturedStory({ story }: { story: StorySummary }) {
  return (
    <section className="grid items-center gap-6 md:grid-cols-[1.15fr_1fr] md:gap-8" aria-label="Featured story">
      <Cover
        src={story.coverUrl}
        alt={story.coverAlt ?? ""}
        sizes="(min-width: 1200px) 620px, (min-width: 768px) 55vw, 100vw"
        aspect="aspect-[2.1/1]"
        illustration={story.coverIsAi}
        priority
      />
      <div className="flex flex-col items-start gap-3">
        <Eyebrow>{eventYear(story.eventDate)}</Eyebrow>
        <h2 className="m-0 font-serif text-[36px] leading-[1.05] font-bold tracking-[-0.01em] sm:text-[44px]">
          {story.title}
        </h2>
        <p className="m-0 font-serif text-lg leading-snug text-ink sm:text-xl">{story.summary}</p>
        <Link href={storyPath(story.type, story.slug) ?? "/"} className={`${rustButtonClass} mt-2`}>
          Read the story →
        </Link>
      </div>
    </section>
  );
}

function PhotoStory({ story }: { story: StorySummary }) {
  return (
    <section className="flex flex-col gap-5" aria-labelledby="photo-heading">
      <SectionHeading id="photo-heading">The Story Behind the Photo</SectionHeading>
      <div className="grid items-center gap-6 md:grid-cols-[1.25fr_1fr] md:gap-8">
        <Cover
          src={story.coverUrl}
          alt={story.coverAlt ?? ""}
          sizes="(min-width: 1200px) 640px, (min-width: 768px) 55vw, 100vw"
          aspect="aspect-[2.1/1]"
          illustration={story.coverIsAi}
        />
        <div className="flex flex-col items-start gap-3">
          <h3 className="m-0 font-serif text-[32px] leading-[1.08] font-bold tracking-[-0.01em] sm:text-[38px]">
            {story.title}
          </h3>
          <p className="m-0 font-serif text-lg leading-snug text-ink sm:text-xl">{story.summary}</p>
          <Link href={storyPath(story.type, story.slug) ?? "/"} className={`${rustButtonClass} mt-2`}>
            Explore the frame →
          </Link>
        </div>
      </div>
    </section>
  );
}

/** The thumbnail of the newest video. With no video yet it stays as a dark placeholder so the layout holds. */
function WatchTile({ story }: { story?: StorySummary }) {
  const body = (
    <div className="relative aspect-[2.4/1] w-full overflow-hidden bg-ink">
      {story?.coverUrl ? (
        <Image
          src={story.coverUrl}
          alt={story.coverAlt ?? ""}
          fill
          sizes="(min-width: 1200px) 520px, (min-width: 768px) 45vw, 100vw"
          className="object-cover"
        />
      ) : null}
      <span className="absolute inset-0 flex items-center justify-center">
        <PlayBadge size={48} />
      </span>
    </div>
  );

  if (!story) return body;
  return (
    <Link href={storyPath(story.type, story.slug) ?? "/watch"} aria-label={`Watch: ${story.title}`}>
      {body}
    </Link>
  );
}
