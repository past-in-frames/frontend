import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader, PageShell } from "@/components/page-header";
import { StoryGrid } from "@/components/story-card";
import { ApiError, getCollection, type CollectionDetail } from "@/lib/api";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbJsonLd, collectionPageJsonLd, pageMetadata } from "@/lib/seo";
import { storyPath } from "@/lib/story-path";

type CollectionPageProps = { params: Promise<{ slug: string }> };

async function load(slug: string): Promise<CollectionDetail | null> {
  try {
    return await getCollection(slug);
  } catch (error) {
    if (error instanceof ApiError && error.isNotFound) return null;
    throw error;
  }
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const collection = await load((await params).slug);
  if (!collection) return { title: "Collection not found", robots: { index: false } };

  const count = collection.stories.length;
  return pageMetadata({
    title: collection.title,
    description: `${collection.description ? `${collection.description} ` : `${collection.title}. `}${count} short, sourced ${count === 1 ? "story" : "stories"} from history.`,
    path: `/collections/${collection.slug}`,
    image: collection.coverUrl ? { url: collection.coverUrl, alt: collection.title } : undefined,
  });
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const collection = await load((await params).slug);
  if (!collection) notFound();

  return (
    <PageShell>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Collections", path: "/collections" },
            { name: collection.title, path: `/collections/${collection.slug}` },
          ]),
          collectionPageJsonLd({
            name: collection.title,
            description: collection.description ?? `A collection of stories: ${collection.title}.`,
            path: `/collections/${collection.slug}`,
            items: collection.stories.flatMap((story) => {
              const path = storyPath(story.type, story.slug);
              return path ? [{ name: story.title, path }] : [];
            }),
          }),
        ]}
      />
      <PageHeader title={collection.title} lede={collection.description ?? undefined} />
      <StoryGrid stories={collection.stories} empty="Nothing in this collection yet." />
    </PageShell>
  );
}
