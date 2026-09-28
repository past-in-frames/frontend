import Image from "next/image";
import Link from "next/link";
import type { Story } from "@/lib/api";
import { categoryLabel, categoryPath, formatEventDate } from "@/lib/story-path";

const FIGURE_SIZES = "(min-width: 1024px) 780px, 100vw";

export function StoryArticle({ story }: { story: Story }) {
  const mediaByKey = new Map(story.media.map((item) => [item.key, item]));
  // Only the opening paragraph gets a drop cap.
  const firstParagraph = story.body.findIndex((block) => block.type === "paragraph");

  return (
    <article className="flex flex-grow flex-col px-[18px] pt-6 lg:items-center lg:px-16 lg:pt-12">
      <div className="flex w-full max-w-[780px] flex-col gap-5 lg:gap-7">
        <header className="flex flex-col gap-3 lg:gap-4">
          <nav className="hidden text-[13px] font-semibold text-faded lg:block">
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
            {formatEventDate(story.eventDate)}
          </time>
        </header>

        <div>
          {story.body.map((block, index) => {
            if (block.type === "heading") {
              return (
                <h2
                  key={index}
                  className="m-0 mt-2 mb-4 font-serif text-[22px] font-semibold lg:text-[26px]"
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

              return (
                <figure key={index} className="my-6">
                  <div className="relative h-[220px] w-full overflow-hidden rounded-2xl lg:h-[440px] lg:rounded-[18px]">
                    <Image
                      src={media.url}
                      alt={media.altText ?? ""}
                      fill
                      sizes={FIGURE_SIZES}
                      className="object-cover"
                    />
                  </div>
                  {media.caption || media.credit ? (
                    <figcaption className="mt-2 text-[13px] text-faded">
                      {media.caption}
                      {media.caption && media.credit ? " · " : ""}
                      {media.credit}
                    </figcaption>
                  ) : null}
                </figure>
              );
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
      </div>
    </article>
  );
}
