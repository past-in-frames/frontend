import Image from "next/image";
import Link from "next/link";
import type { StorySummary } from "@/lib/api";
import { eventYear, formatMonthDay, sectionLabel, storyPath } from "@/lib/story-path";

const THUMB_SIZES = "120px";

/**
 * Every story below the fold shares the same shape: the year leads, the title
 * follows, and a thumbnail only appears when there is a real image for it.
 */
export function StoryTimeline({ stories }: { stories: StorySummary[] }) {
  return (
    <ol className="m-0 flex list-none flex-col p-0">
      {stories.map((story) => (
        <li key={story.slug} className="border-t border-ink/12">
          <Link
            href={storyPath(story.type, story.slug) ?? "/"}
            className="mi-card grid grid-cols-[54px_1fr] items-start gap-4 py-4 lg:grid-cols-[110px_1fr_120px] lg:items-center lg:gap-8 lg:py-6"
          >
            <span className="font-serif text-[22px] leading-none font-semibold tabular-nums text-faded lg:text-[34px]">
              {eventYear(story.eventDate)}
            </span>
            <div className="flex min-w-0 flex-col gap-1.5">
              <span className="mi-card-title font-serif text-[17px] leading-[1.2] font-semibold lg:text-[22px] lg:leading-[1.25]">
                {story.title}
              </span>
              <span className="text-xs text-faded lg:text-[13px]">
                {sectionLabel(story.type) ? `${sectionLabel(story.type)} · ` : ""}
                {formatMonthDay(story.eventDate)}
              </span>
              <span className="hidden text-sm leading-[1.55] text-muted lg:block">
                {story.summary}
              </span>
            </div>
            {story.coverUrl ? (
              <div className="relative hidden h-[76px] w-[120px] overflow-hidden rounded-xl lg:block">
                <Image
                  src={story.coverUrl}
                  alt={story.coverAlt ?? ""}
                  fill
                  sizes={THUMB_SIZES}
                  className="object-cover"
                />
              </div>
            ) : null}
          </Link>
        </li>
      ))}
    </ol>
  );
}
