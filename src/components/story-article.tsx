import Image from "next/image";
import Link from "next/link";
import type { Story, StoryMedia, StorySummary } from "@/lib/api";
import { StoryCard } from "@/components/story-card";
import { categoryLabel, categoryPath, formatEventDate } from "@/lib/story-path";

const FIGURE_SIZES = "(min-width: 1024px) 780px, 100vw";

export function StoryArticle({ story, related = [] }: { story: Story; related?: StorySummary[] }) {
  const headings = story.body.flatMap((block, index) => block.type === "heading" ? [{ text: block.text, id: `section-${index}` }] : []);
  const words = story.body.reduce((count, block) => count + (block.type === "paragraph" ? block.text.trim().split(/\s+/).filter(Boolean).length : 0), 0);
  const mediaByKey = new Map(story.media.map((item) => [item.key, item]));
  // Only the opening paragraph gets a drop cap.
  const firstParagraph = story.body.findIndex((block) => block.type === "paragraph");
  const lead = leadImage(story);
  // Whichever image opens the story is the one worth loading immediately.
  const firstBodyImage = lead ? -1 : story.body.findIndex((block) => block.type === "image");

  return (
    <article className="flex flex-grow flex-col px-[18px] pt-6 lg:items-center lg:px-16 lg:pt-12">
      <div className="flex w-full max-w-[780px] flex-col gap-5 lg:gap-7">
        <header className="flex flex-col gap-3 lg:gap-4">
          <nav aria-label="Breadcrumb" className="text-[13px] font-semibold text-faded">
            <Link href="/" className="mi-link">
              Home
            </Link>
            {" / "}
            <Link href={categoryPath(story.category)} className="mi-link">
              {categoryLabel(story.category)}
            </Link>
          </nav>
          <Link
            href={categoryPath(story.category)}
            className="self-start rounded-full bg-accent-2/12 px-3 py-[5px] text-[11px] font-bold tracking-[0.06em] text-accent-2 uppercase lg:px-3.5 lg:py-1.5 lg:text-xs"
          >
            {categoryLabel(story.category)}
          </Link>
          <h1 className="m-0 font-serif text-[30px] leading-[1.15] font-semibold lg:text-5xl lg:leading-[1.12] lg:tracking-[-0.01em]">
            {story.title}
          </h1>
          <p className="m-0 text-base leading-normal text-muted lg:text-[19px] lg:leading-normal">
            {story.summary}
          </p>
          <time
            dateTime={story.eventDate}
            className="text-xs text-faded lg:text-[13px]"
          >
            Event date: {formatEventDate(story.eventDate)}
          </time>
          <p className="m-0 text-xs text-faded">
            {story.publishedAt ? <>Published <time dateTime={story.publishedAt}>{formatEventDate(story.publishedAt.slice(0, 10))}</time> · </> : null}
            Updated <time dateTime={story.updatedAt}>{formatEventDate(story.updatedAt.slice(0, 10))}</time> · {Math.max(1, Math.ceil(words / 200))} min read
          </p>
        </header>

        {headings.length > 1 ? (
          <nav aria-label="In this story" className="rounded-xl border border-ink/12 p-4">
            <p className="m-0 mb-2 font-semibold">In this story</p>
            <ul className="m-0 space-y-1 pl-5">{headings.map((heading) => <li key={heading.id}><a className="mi-link" href={`#${heading.id}`}>{heading.text}</a></li>)}</ul>
          </nav>
        ) : null}

        {lead ? <StoryFigure media={lead} eager className="m-0" /> : null}

        <div>
          {story.body.map((block, index) => {
            if (block.type === "heading") {
              return (
                <h2
                  key={index}
                  id={`section-${index}`}
                  className="scroll-mt-24 m-0 mt-2 mb-4 font-serif text-[22px] font-semibold lg:text-[26px]"
                >
                  {block.text}
                </h2>
              );
            }

            if (block.type === "image") {
              const media = mediaByKey.get(block.mediaKey);
              // An image block whose file was never uploaded has nothing to show.
              if (!media?.url) {
                return null;
              }

              return <StoryFigure key={index} media={media} eager={index === firstBodyImage} />;
            }

            return (
              <p
                key={index}
                className={`mi-body ${index === firstParagraph ? "mi-dropcap" : ""}`}
              >
                {block.text}
              </p>
            );
          })}
        </div>

        {story.sources.length > 0 ? (
          <section className="flex flex-col gap-3 border-t border-ink/12 pt-6 pb-10 lg:pt-8 lg:pb-14">
            <h2 className="m-0 font-serif text-[19px] font-semibold lg:text-[22px]">
              Sources
            </h2>
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {story.sources.map((source) => (
                <li key={source.url}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mi-link text-sm"
                  >
                    {source.title}
                    <span className="text-faded"> — {source.publisher}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        <p className="text-sm text-faded">Found an error? <Link className="mi-link" href="/contact">Send a correction</Link>. <Link className="mi-link" href="/editorial-policy">Read our editorial standards</Link>.</p>
        {related.length > 0 ? <section className="pb-10"><h2 className="mb-4 font-serif text-2xl font-semibold">More in {categoryLabel(story.category)}</h2><div className="grid gap-5 sm:grid-cols-3">{related.map((item) => <StoryCard key={item.slug} story={item} />)}</div></section> : null}
      </div>
    </article>
  );
}

/**
 * Listings and link previews use the story's first stored image. Readers should
 * meet it too, unless the body already shows that same picture further down.
 */
function leadImage(story: Story) {
  const cover = story.media.find((item) => item.type === "image" && item.url);
  if (!cover?.url) return null;

  const inBody = story.body.some(
    (block) => block.type === "image" && block.mediaKey === cover.key,
  );
  return inBody ? null : cover;
}

function StoryFigure({
  media,
  eager = false,
  className = "my-6",
}: {
  media: StoryMedia;
  eager?: boolean;
  className?: string;
}) {
  if (!media.url) return null;

  return (
    <figure className={className}>
      <div className="relative h-[220px] w-full overflow-hidden rounded-2xl lg:h-[440px] lg:rounded-[18px]">
        <Image
          src={media.url}
          alt={media.altText ?? ""}
          fill
          sizes={FIGURE_SIZES}
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : undefined}
          className="object-cover"
        />
      </div>
      {media.caption || media.credit || media.isAiGenerated ? (
        <figcaption className="mt-2 text-[13px] text-faded">
          {media.caption}
          {media.caption && media.credit ? " · " : ""}
          {media.credit}
          {media.isAiGenerated ? <span className="block mt-1">AI-generated illustration — a recreation, not an archival photograph.</span> : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
