import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, PageShell } from "@/components/page-header";
import { Cover } from "@/components/ui";
import { getCollections, tryGet, type CollectionSummary } from "@/lib/api";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "History Story Collections",
  description:
    "Hand-picked sets of history stories that belong together: the road to the Moon, fires that changed cities, the age of invention and more.",
  path: "/collections",
});

export default async function CollectionsPage() {
  const { data: collections, error } = await tryGet(() => getCollections(), [] as CollectionSummary[]);

  return (
    <PageShell>
      <PageHeader title="History Story Collections" lede="Hand-picked sets of stories that belong together, each with its sources." />
      {error ? <p className="m-0 text-sm text-faded">{error}</p> : null}
      {!error && collections.length === 0 ? <p className="m-0 text-sm text-faded">No collections yet.</p> : null}
      <ul className="m-0 grid list-none grid-cols-1 gap-x-5 gap-y-8 p-0 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((collection) => (
          <li key={collection.slug}>
            <Link href={`/collections/${collection.slug}`} className="mi-card flex flex-col gap-3">
              <Cover
                src={collection.coverUrl}
                alt=""
                sizes="(min-width: 1200px) 370px, (min-width: 640px) 50vw, 100vw"
                aspect="aspect-[1.65/1]"
              />
              <h2 className="mi-card-title m-0 font-serif text-[24px] leading-[1.15] font-bold">{collection.title}</h2>
              <span className="font-mono text-xs font-semibold tracking-[0.1em] text-rust uppercase">
                {collection.storyCount} {collection.storyCount === 1 ? "story" : "stories"}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
