import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { PageHeader, PageShell } from "@/components/page-header";
import { StoryPagination } from "@/components/story-pagination";
import { outlineButtonClass, SectionHeading } from "@/components/ui";
import { VideoPlayer } from "@/components/video-player";
import { getStoriesPage, tryGet, type StorySummary } from "@/lib/api";
import { CATEGORY_PAGE_SIZE, pageHref, parsePageParam } from "@/lib/paging";
import { collectionPageJsonLd, pageMetadata } from "@/lib/seo";
import { absoluteUrl, youtubeChannelUrl } from "@/lib/site";
import { eventYear, formatEventDate, storyPath } from "@/lib/story-path";
import { isShortUrl, youtubeId } from "@/lib/video";

const FETCH_PAGE = 50;
const FETCH_LIMIT = 200;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}): Promise<Metadata> {
  const { page } = parsePageParam((await searchParams).page);
  return pageMetadata({
    title: page > 1 ? `Short History Videos — Page ${page}` : "Short History Videos",
    description:
      "Watch big moments from history in short videos and Shorts: launches, discoveries and turning points, each linked to a fully sourced story.",
    path: pageHref("/watch", page),
  });
}

/** Every story with a video, newest video first. Shorts and regular videos are told apart afterwards. */
async function loadVideoStories() {
  const all: StorySummary[] = [];
  let total = Infinity;
  while (all.length < total && all.length < FETCH_LIMIT) {
    const { stories, total: count } = await getStoriesPage({ video: true, sort: "latest", limit: FETCH_PAGE, offset: all.length });
    total = count;
    if (stories.length === 0) break;
    all.push(...stories);
  }
  return all;
}

export default async function WatchPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const { page, redirectToFirst } = parsePageParam((await searchParams).page);
  if (redirectToFirst) redirect(pageHref("/watch", 1));

  const { data: stories, error } = await tryGet(loadVideoStories, [] as StorySummary[]);
  const withVideo = stories.filter((story) => story.videoUrl && youtubeId(story.videoUrl));
  // Shorts sit in their own row at the top and are not paged; regular videos are.
  const shorts = withVideo.filter((story) => isShortUrl(story.videoUrl as string));
  const regular = withVideo.filter((story) => !isShortUrl(story.videoUrl as string));

  const pageCount = regular.length === 0 ? 0 : Math.ceil(regular.length / CATEGORY_PAGE_SIZE);
  if (!error && pageCount > 0 && page > pageCount) redirect(pageHref("/watch", pageCount));
  const visible = regular.slice((page - 1) * CATEGORY_PAGE_SIZE, page * CATEGORY_PAGE_SIZE);
  const showShorts = page === 1 && shorts.length > 0;
  const headingLevel = showShorts ? "h3" : "h2";

  return (
    <PageShell>
      <JsonLd
        data={collectionPageJsonLd({
          name: "Short History Videos",
          description: "Big moments from history in short videos, each linked to a fully sourced story.",
          path: "/watch",
          items: withVideo.flatMap((story) => {
            const path = storyPath(story.type, story.slug);
            return path ? [{ name: story.title, path }] : [];
          }),
        })}
      />
      {[...(showShorts ? shorts : []), ...visible].map((story) => {
        const id = youtubeId(story.videoUrl as string) as string;
        return (
          <JsonLd
            key={story.slug}
            data={{
              "@context": "https://schema.org",
              "@type": "VideoObject",
              name: story.title,
              description: story.summary,
              thumbnailUrl: [`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`],
              uploadDate: story.updatedAt ?? story.eventDate,
              embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
              contentUrl: `https://www.youtube.com/watch?v=${id}`,
              url: absoluteUrl(storyPath(story.type, story.slug) ?? "/watch"),
            }}
          />
        );
      })}

      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <PageHeader title="Short History Videos" lede="Big moments, short videos, each with the full story and its sources." />
        <a href={youtubeChannelUrl} target="_blank" rel="noopener noreferrer" className={outlineButtonClass}>
          Subscribe on YouTube ↗
        </a>
      </div>

      {error ? <p className="m-0 text-sm text-faded">{error}</p> : null}
      {!error && withVideo.length === 0 ? <p className="m-0 text-sm text-faded">No videos yet.</p> : null}

      {showShorts ? (
        <section className="flex flex-col gap-5" aria-labelledby="shorts-heading">
          <SectionHeading id="shorts-heading">Shorts</SectionHeading>
          <ul className="m-0 flex list-none snap-x gap-4 overflow-x-auto p-0 pb-2 [scrollbar-width:thin]">
            {shorts.map((story) => (
              <li key={story.slug} className="flex w-[200px] shrink-0 snap-start flex-col gap-3 sm:w-[220px]">
                <VideoPlayer
                  videoId={youtubeId(story.videoUrl as string) as string}
                  title={story.title}
                  sizes="220px"
                  vertical
                />
                <Link href={storyPath(story.type, story.slug) ?? "/"} className="mi-card flex flex-col gap-1">
                  <h3 className="mi-card-title m-0 font-serif text-[17px] leading-[1.25] font-bold">{story.title}</h3>
                  <span className="font-serif text-[15px] text-rust">Read the story →</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {visible.length > 0 ? (
        <section className="flex flex-col gap-5" aria-labelledby={showShorts ? "videos-heading" : undefined}>
          {showShorts ? <SectionHeading id="videos-heading">Videos</SectionHeading> : null}
          <ul className="m-0 grid list-none grid-cols-1 gap-x-6 gap-y-10 p-0 md:grid-cols-2">
            {visible.map((story) => {
              const Heading = headingLevel;
              return (
                <li key={story.slug} className="flex flex-col gap-3">
                  <VideoPlayer
                    videoId={youtubeId(story.videoUrl as string) as string}
                    title={story.title}
                    sizes="(min-width: 768px) 50vw, 100vw"
                  />
                  <Link href={storyPath(story.type, story.slug) ?? "/"} className="mi-card flex flex-col gap-1.5">
                    <span className="font-mono text-xs font-semibold tracking-[0.1em] text-rust uppercase">
                      {eventYear(story.eventDate)}
                    </span>
                    <Heading className="mi-card-title m-0 font-serif text-[24px] leading-[1.2] font-bold">{story.title}</Heading>
                    <span className="text-[13px] text-faded">{formatEventDate(story.eventDate)}</span>
                    <span className="font-serif text-[17px] text-rust">Read the story →</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {error ? null : <StoryPagination page={page} pageCount={pageCount} path="/watch" />}
    </PageShell>
  );
}
