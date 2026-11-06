import type { Metadata } from "next";
import { loadAdmin } from "@/lib/admin-proxy";
import { blankCollection, CollectionForm, type StoryOption } from "../collection-form";

export const metadata: Metadata = {
  title: "New collection",
  robots: { index: false, follow: false },
};

export default async function NewCollectionPage() {
  const stories = await loadAdmin<StoryOption[]>("/api/admin/stories");

  return (
    <main className="min-h-screen px-[18px] py-8 lg:px-16 lg:py-12">
      <h1 className="m-0 mb-8 font-serif text-[34px] leading-[1.08] font-bold lg:text-5xl">New collection</h1>
      <CollectionForm initial={blankCollection()} options={stories.ok ? stories.data : []} />
    </main>
  );
}
