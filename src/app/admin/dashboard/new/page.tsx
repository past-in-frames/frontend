import type { Metadata } from "next";
import { loadCategories } from "../story-categories";
import { StoryForm } from "../story-form";
import { blankStory } from "../story-types";

export const metadata: Metadata = {
  title: "New story",
  robots: { index: false, follow: false },
};

export default async function NewStoryPage() {
  const categories = await loadCategories();

  return (
    <main className="min-h-screen">
      <StoryForm mode="create" initial={blankStory()} categories={categories} />
    </main>
  );
}
