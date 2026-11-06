import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadAdmin } from "@/lib/admin-proxy";
import { CollectionForm, type CollectionInput, type StoryOption } from "../collection-form";

export const metadata: Metadata = {
  title: "Edit collection",
  robots: { index: false, follow: false },
};

export default async function EditCollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [collection, stories] = await Promise.all([
    loadAdmin<CollectionInput>(`/api/admin/collections/${encodeURIComponent(slug)}`),
    loadAdmin<StoryOption[]>("/api/admin/stories"),
  ]);

  if (!collection.ok && collection.status === 404) notFound();

  return (
    <main className="min-h-screen px-[18px] py-8 lg:px-16 lg:py-12">
      <h1 className="m-0 mb-8 font-serif text-[34px] leading-[1.08] font-bold lg:text-5xl">Edit collection</h1>
      {collection.ok ? (
        <CollectionForm initial={collection.data} originalSlug={slug} options={stories.ok ? stories.data : []} />
      ) : (
        <p className="m-0 text-sm text-rust">{collection.error}</p>
      )}
    </main>
  );
}
