import Link from "next/link";
import { MediaPlaceholder } from "@/components/media-placeholder";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import type { ApiStoryDetail, StoryBlock } from "@/lib/api";

const fallbackGradient =
  "linear-gradient(135deg, var(--accent-2), var(--teal-deep))";

export function StoryPage({ story }: { story: ApiStoryDetail }) {
  const mediaByKey = new Map(story.media.map((item) => [item.key, item]));
  let firstParagraph = true;

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <SiteHeader variant="article" />

      <article className="flex flex-grow flex-col px-[18px] pt-6 lg:items-center lg:px-16 lg:pt-12">
        <div className="flex w-full max-w-[780px] flex-col gap-5 lg:gap-7">
          <div className="flex flex-col gap-3 lg:gap-4">
            <div className="hidden text-[13px] font-semibold text-faded lg:block">
              <Link href="/" className="mi-link">
                Home
              </Link>
              &nbsp;/&nbsp; {story.category}
            </div>
            <span className="self-start rounded-full bg-accent-2/12 px-3 py-[5px] text-[11px] font-bold tracking-[0.06em] text-accent-2 uppercase lg:px-3.5 lg:py-1.5 lg:text-xs">
              {story.category}
            </span>
            <h1 className="m-0 font-serif text-[30px] leading-[1.15] font-semibold lg:text-5xl lg:leading-[1.12] lg:tracking-[-0.01em]">
              {story.title}
            </h1>
            <p className="m-0 text-base leading-normal text-muted lg:text-[19px] lg:leading-normal">
              {story.summary}
            </p>
            <span className="text-xs text-faded lg:text-[13px]">{story.eventDate}</span>
          </div>

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
                return (
                  <figure key={index} className="my-6">
                    {media?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={media.url}
                        alt={media.altText ?? ""}
                        className="h-[220px] w-full rounded-2xl object-cover lg:h-[440px] lg:rounded-[18px]"
                      />
                    ) : (
                      <MediaPlaceholder
                        label={media?.altText ?? "IMAGE"}
                        gradient={fallbackGradient}
                        className="h-[220px] rounded-2xl lg:h-[440px] lg:rounded-[18px]"
                        iconSize={30}
                      />
                    )}
                    {media?.caption ? (
                      <figcaption className="mt-2 text-[13px] text-faded">
                        {media.caption}
                      </figcaption>
                    ) : null}
                  </figure>
                );
              }

              const dropcap = firstParagraph;
              firstParagraph = false;
              return (
                <p key={index} className={`mi-body ${dropcap ? "mi-dropcap" : ""}`}>
                  {block.text}
                </p>
              );
            })}
          </div>

          {story.sources.length > 0 ? (
            <div className="flex flex-col gap-3 border-t border-ink/12 pt-6 pb-10 lg:pt-8 lg:pb-14">
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
            </div>
          ) : null}
        </div>
      </article>

      <SiteFooter variant="simple" />
    </div>
  );
}

export function storyBlocks(body: unknown): StoryBlock[] {
  if (!Array.isArray(body)) return [];
  return body.filter(
    (block) =>
      (block.type === "paragraph" && typeof block.text === "string") ||
      (block.type === "heading" && typeof block.text === "string") ||
      (block.type === "image" && typeof block.mediaKey === "string"),
  );
}
