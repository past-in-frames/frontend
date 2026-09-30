import Image from "next/image";
import Link from "next/link";
import type { StorySummary } from "@/lib/api";
import { categoryLabel, eventYear, formatEventDate, storyPath } from "@/lib/story-path";

/** The lead image is the largest thing on the home page, so it gets most of the viewport. */
const LEAD_SIZES = "(min-width: 1024px) 60vw, 100vw";
const SECONDARY_SIZES = "(min-width: 1024px) 120px, 92px";

/**
 * Opens the home page: one story at roughly twice the weight of anything below
 * it. Without a cover the text takes the full width rather than leaving the
 * image column empty.
 */
export function StoryLead({ story }: { story: StorySummary }) {
  return (
    <Link
      href={storyPath(story.category, story.slug)}
      className={`mi-card flex flex-col gap-4 ${
        story.coverUrl
          ? "lg:grid lg:grid-cols-[1.35fr_1fr] lg:items-center lg:gap-12"
          : "lg:max-w-[820px] lg:gap-5"
      }`}
    >
      {story.coverUrl ? (
        <div className="relative h-56 w-full overflow-hidden rounded-2xl lg:h-[420px] lg:rounded-[18px]">
          <Image
            src={story.coverUrl}
            alt={story.coverAlt ?? ""}
            fill
            sizes={LEAD_SIZES}
            /* The home page's largest paint, so it never waits on lazy loading. */
            loading="eager"
            fetchPriority="high"
            className="object-cover"
          />
        </div>
      ) : null}
      <div className="flex flex-col gap-2 lg:gap-3">
        <span className="font-serif text-[40px] leading-none font-semibold tabular-nums lg:text-[64px]">
          {eventYear(story.eventDate)}
        </span>
        <span className="text-[11px] font-bold tracking-[0.06em] text-accent-2 uppercase lg:text-xs lg:tracking-[0.08em]">
          {categoryLabel(story.category)}
        </span>
        <h2 className="mi-card-title m-0 font-serif text-[26px] leading-[1.15] font-semibold tracking-[-0.01em] lg:text-[38px] lg:leading-[1.1]">
          {story.title}
        </h2>
        <p className="m-0 text-[15px] leading-[1.55] text-muted lg:text-[18px] lg:leading-relaxed">
          {story.summary}
        </p>
        <time dateTime={story.eventDate} className="text-[13px] text-faded lg:text-sm">
          {formatEventDate(story.eventDate)}
        </time>
      </div>
    </Link>
  );
}

/**
 * Sits under the lead in a two-up row. Stories with a cover get a thumbnail;
 * the rest lean on the year, which is the only thing every story is guaranteed.
 */
export function StorySecondary({ story }: { story: StorySummary }) {
  return (
    <Link
      href={storyPath(story.category, story.slug)}
      className="mi-card flex items-start gap-4 lg:gap-5"
    >
      {story.coverUrl ? (
        <div className="relative h-[86px] w-[92px] shrink-0 overflow-hidden rounded-xl lg:h-[110px] lg:w-[120px]">
          <Image
            src={story.coverUrl}
            alt={story.coverAlt ?? ""}
            fill
            sizes={SECONDARY_SIZES}
            className="object-cover"
          />
        </div>
      ) : (
        <span className="shrink-0 border-l-2 border-accent-2/40 pl-3 font-serif text-[30px] leading-none font-semibold tabular-nums text-faded lg:pl-4 lg:text-[38px]">
          {eventYear(story.eventDate)}
        </span>
      )}
      <div className="flex min-w-0 flex-col gap-1.5">
        <span className="text-[11px] font-bold tracking-[0.06em] text-accent-2 uppercase lg:text-xs">
          {categoryLabel(story.category)}
        </span>
        <span className="mi-card-title font-serif text-lg leading-tight font-semibold lg:text-xl lg:leading-[1.25]">
          {story.title}
        </span>
        <span className="text-[13px] leading-[1.5] text-muted lg:text-sm">{story.summary}</span>
      </div>
    </Link>
  );
}
