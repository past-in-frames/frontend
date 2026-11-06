import Link from "next/link";
import { VideoPlayer } from "@/components/video-player";
import type { StorySummary } from "@/lib/api";
import { eventYear } from "@/lib/story-path";
import { isShortUrl, youtubeId } from "@/lib/video";

const COUNT = 4;

/**
 * The newest Shorts from Watch on a warm grey band, so the one block of AI-made video stands apart
 * from the story rows. Each card plays in place.
 * Nothing is shown when there are no Shorts.
 */
export function AiShorts({ stories }: { stories: StorySummary[] }) {
  const shorts = stories
    .filter((story) => story.videoUrl && isShortUrl(story.videoUrl) && youtubeId(story.videoUrl))
    .slice(0, COUNT);
  if (shorts.length === 0) return null;

  return (
    <section
      aria-labelledby="ai-shorts-heading"
      className="grid items-center gap-6 bg-[#676156] px-5 py-7 text-[#f3ecdc] md:grid-cols-[minmax(0,290px)_minmax(0,1fr)] md:gap-9 md:p-9"
    >
      <div className="flex flex-col items-start gap-3">
        <span className="inline-flex items-center gap-2 font-mono text-xs font-semibold tracking-[0.14em] text-accent uppercase">
          <span aria-hidden="true" className="size-2 rounded-full bg-accent" />
          Made with AI
        </span>
        <h2
          id="ai-shorts-heading"
          className="m-0 font-serif text-[30px] leading-[1.08] font-bold tracking-[-0.01em] text-balance sm:text-[34px]"
        >
          AI History Recreations
        </h2>
        <p className="m-0 font-serif text-base leading-normal text-[#ece5d4] sm:text-[17px]">
          Short videos that recreate moments from the past. They are illustrations, not archival footage.
        </p>
        <Link
          href="/watch"
          className="mt-1 inline-block bg-accent px-[18px] py-2.5 text-[15px] font-semibold text-ink hover:brightness-105"
        >
          All videos →
        </Link>
      </div>

      <ul className="m-0 grid list-none grid-cols-2 gap-3.5 p-0 lg:grid-cols-4">
        {shorts.map((story) => (
          <li key={story.slug} className="min-w-0">
            <VideoPlayer
              videoId={youtubeId(story.videoUrl as string) as string}
              title={story.title}
              sizes="(min-width: 1200px) 220px, (min-width: 1024px) 18vw, 45vw"
              vertical
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-[linear-gradient(to_top,rgba(24,21,16,0.9)_0%,rgba(24,21,16,0.45)_38%,rgba(24,21,16,0)_62%)]"
              />
              <span
                aria-hidden="true"
                className="absolute top-2.5 left-2.5 border border-accent/55 bg-[#25221b]/85 px-[7px] py-[3px] font-mono text-[11px] font-semibold tracking-[0.12em] text-accent"
              >
                AI
              </span>
              <span className="absolute right-3 bottom-3 left-3 text-left text-[#f7f1e3]">
                <span className="block font-mono text-[11px] font-semibold tracking-[0.1em] text-accent">
                  {eventYear(story.eventDate)}
                </span>
                <span className="mt-1 block font-serif text-base leading-[1.2] font-bold text-balance">
                  {story.title}
                </span>
              </span>
            </VideoPlayer>
          </li>
        ))}
      </ul>
    </section>
  );
}
