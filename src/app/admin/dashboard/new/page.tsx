import type { Metadata } from "next";
import { StoryForm } from "../story-form";
import { blankStory } from "../story-types";

export const metadata: Metadata = {
  title: "New story",
  robots: { index: false, follow: false },
};

export default function NewStoryPage() {
  return (
    <main className="min-h-screen">
      <StoryForm mode="create" initial={blankStory()} />
    </main>
  );
}
