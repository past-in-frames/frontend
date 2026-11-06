import Link from "next/link";
import { Cover, Eyebrow } from "@/components/ui";
import { getStories, tryGet, type StorySummary } from "@/lib/api";
import { eventYear, sectionPaths, sections, storyPath } from "@/lib/story-path";

const PER_SHELF = 3;

/**
 * One row per section that has stories: its name, a link to the whole section and
 * its three newest stories. Sections with nothing published are left out, so the
 * home page never shows an empty row.
 */
export async function SectionShelves() {
  const shelves = await Promise.all(
    sectionPaths.map(async (path) => {
      const { data } = await tryGet(
        () => getStories({ type: sections[path].type, limit: PER_SHELF, sort: "latest" }),
        [] as StorySummary[],
      );
      return { path, label: sections[path].label, stories: data };
    }),
  );

  return (
    <>
      {shelves
        .filter((shelf) => shelf.stories.length > 0)
        .map((shelf) => (
          <section key={shelf.path} className="flex flex-col gap-5" aria-labelledby={`shelf-${shelf.path}`}>
            <div className="flex items-end justify-between gap-4 border-b border-ink/35 pb-2">
              <h2
                id={`shelf-${shelf.path}`}
                className="m-0 font-serif text-[30px] leading-[1.1] font-bold tracking-[-0.01em]"
              >
                {shelf.label}
              </h2>
              <Link href={`/${shelf.path}`} className="text-[15px] font-semibold whitespace-nowrap text-rust hover:underline">
                All {shelf.label} →
              </Link>
            </div>
            <ul className="m-0 grid list-none grid-cols-2 gap-x-4 gap-y-6 p-0 sm:grid-cols-3">
              {shelf.stories.map((story) => (
                <li key={story.slug}>
                  <Link href={storyPath(story.type, story.slug) ?? "/"} className="mi-card flex flex-col gap-3">
                    <Cover
                      src={story.coverUrl}
                      alt={story.coverAlt ?? ""}
                      sizes="(min-width: 1200px) 370px, (min-width: 640px) 33vw, 50vw"
                      aspect="aspect-[1.4/1]"
                      illustration={story.coverIsAi}
                    />
                    <Eyebrow>{eventYear(story.eventDate)}</Eyebrow>
                    <h3 className="mi-card-title m-0 font-serif text-[19px] leading-[1.2] font-bold sm:text-[22px]">
                      {story.title}
                    </h3>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
    </>
  );
}
