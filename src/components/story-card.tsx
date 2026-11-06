import Image from "next/image";
import Link from "next/link";
import { PlayBadge } from "@/components/icons";
import type { StorySummary } from "@/lib/api";
import { eventYear, formatEventDate, sectionLabel, storyPath } from "@/lib/story-path";

/** Three across on desktop, so the browser only needs a third of the viewport. */
const CARD_SIZES = "(min-width: 1024px) 33vw, 100vw";

type HeadingLevel = "h2" | "h3";

/** `h2` when the cards sit directly under the page title, `h3` under a section heading. */
export function StoryCard({
  story,
  eager = false,
  headingLevel: Heading = "h2",
}: {
  story: StorySummary;
  eager?: boolean;
  headingLevel?: HeadingLevel;
}) {
  const label = sectionLabel(story.type);
  return (
    <Link href={storyPath(story.type, story.slug) ?? "/"} className="mi-card flex flex-col gap-3">
      {story.coverUrl ? (
        <div className="relative aspect-[1.5/1] w-full overflow-hidden bg-ink/10">
          <Image
            src={story.coverUrl}
            alt={story.coverAlt ?? ""}
            fill
            sizes={CARD_SIZES}
            loading={eager ? "eager" : "lazy"}
            className="object-cover"
          />
          {story.videoUrl ? (
            <span className="absolute inset-0 flex items-center justify-center">
              <PlayBadge />
            </span>
          ) : null}
        </div>
      ) : (
        /* No cover yet, so the year fills the frame instead of a stand-in photo. */
        <div className="flex aspect-[1.5/1] w-full items-end bg-rust/8 px-4 pb-3">
          <span className="font-serif text-[52px] leading-none font-semibold tabular-nums text-rust/70">
            {eventYear(story.eventDate)}
          </span>
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <span className="font-mono text-xs font-semibold tracking-[0.1em] text-rust uppercase">
          {[eventYear(story.eventDate), label].filter(Boolean).join(" · ")}
        </span>
        <Heading className="mi-card-title m-0 font-serif text-[22px] leading-[1.2] font-bold">{story.title}</Heading>
        <span className="text-[13px] text-faded">{formatEventDate(story.eventDate)}</span>
      </div>
    </Link>
  );
}

export function StoryGrid({
  stories,
  empty,
  headingLevel,
}: {
  stories: StorySummary[];
  empty: string;
  headingLevel?: HeadingLevel;
}) {
  if (stories.length === 0) {
    return <p className="m-0 text-sm text-faded">{empty}</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-3 lg:gap-7">
      {/* The first row is above the fold, so it should not wait on lazy loading. */}
      {stories.map((story, index) => (
        <StoryCard key={story.slug} story={story} eager={index < 3} headingLevel={headingLevel} />
      ))}
    </div>
  );
}
