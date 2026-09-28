import Image from "next/image";
import Link from "next/link";
import type { StorySummary } from "@/lib/api";
import { categoryLabel, eventYear, formatEventDate, storyPath } from "@/lib/story-path";

/** Three across on desktop, so the browser only needs a third of the viewport. */
const CARD_SIZES = "(min-width: 1024px) 33vw, 100vw";

export function StoryCard({ story, priority = false }: { story: StorySummary; priority?: boolean }) {
  return (
    <Link
      href={storyPath(story.category, story.slug)}
      className="mi-card flex flex-col overflow-hidden rounded-2xl border border-ink/8 bg-white lg:gap-3.5"
    >
      {story.coverUrl ? (
        <div className="relative h-40 w-full lg:h-[190px]">
          <Image
            src={story.coverUrl}
            alt={story.coverAlt ?? ""}
            fill
            sizes={CARD_SIZES}
            priority={priority}
            className="object-cover"
          />
        </div>
      ) : (
        /* No cover yet, so the year fills the frame instead of a stand-in photo. */
        <div className="flex h-40 w-full items-end bg-accent-2/8 px-4 pb-3 lg:h-[190px] lg:px-[18px] lg:pb-4">
          <span className="font-serif text-[46px] leading-none font-semibold tabular-nums text-accent-2/70 lg:text-[58px]">
            {eventYear(story.eventDate)}
          </span>
        </div>
      )}
      <div className="flex flex-col gap-1.5 px-4 py-4 lg:gap-2 lg:px-[18px] lg:pt-0 lg:pb-5">
        <span className="text-[11px] font-bold tracking-[0.06em] text-accent-2 uppercase lg:text-xs lg:tracking-[0.08em]">
          {categoryLabel(story.category)}
        </span>
        <span className="mi-card-title font-serif text-lg leading-tight font-semibold lg:text-xl lg:leading-[1.25]">
          {story.title}
        </span>
        <span className="text-[13px] text-faded lg:text-sm">
          {formatEventDate(story.eventDate)}
        </span>
      </div>
    </Link>
  );
}

export function StoryGrid({ stories, empty }: { stories: StorySummary[]; empty: string }) {
  if (stories.length === 0) {
    return <p className="m-0 text-sm text-faded">{empty}</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-3 lg:gap-7">
      {stories.map((story, index) => (
        <StoryCard key={story.slug} story={story} priority={index < 3} />
      ))}
    </div>
  );
}
