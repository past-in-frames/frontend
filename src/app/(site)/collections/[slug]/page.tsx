import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader, PageShell } from "@/components/page-header";
import { StoryGrid } from "@/components/story-card";
import { ApiError, getCollection, type CollectionDetail } from "@/lib/api";
import { absoluteUrl } from "@/lib/site";

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
  if (!collection) return { title: "Collection not found" };
  return {
    title: collection.title,
    description: collection.description ?? `A collection of stories: ${collection.title}.`,
    alternates: { canonical: absoluteUrl(`/collections/${collection.slug}`) },
    openGraph: collection.coverUrl ? { images: [{ url: collection.coverUrl }] } : undefined,
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const collection = await load((await params).slug);
  if (!collection) notFound();

  return (
    <PageShell>
      <PageHeader title={collection.title} lede={collection.description ?? undefined} />
      <StoryGrid stories={collection.stories} empty="Nothing in this collection yet." />
    </PageShell>
  );
}
