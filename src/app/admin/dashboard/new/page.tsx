import type { Metadata } from "next";
import Link from "next/link";
import { StoryForm } from "../story-form";
import { blankStory } from "../story-types";

export const metadata: Metadata = {
  title: "New story",
  robots: { index: false, follow: false },
};

export default function NewStoryPage() {
  return (
    <main className="min-h-screen px-[18px] py-8 lg:px-16 lg:py-12">
      <div className="mb-8 flex items-end justify-between gap-4">
        <h1 className="m-0 font-serif text-[34px] leading-[1.08] font-semibold tracking-[-0.01em] lg:text-5xl">
          New story
        </h1>
        <Link href="/admin/dashboard" className="text-sm font-semibold text-accent-2">
          Back
        </Link>
      </div>
      <StoryForm mode="create" initial={blankStory()} />
    </main>
  );
}
