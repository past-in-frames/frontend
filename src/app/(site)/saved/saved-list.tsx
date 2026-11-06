"use client";

import { useSyncExternalStore } from "react";
import { StoryGrid } from "@/components/story-card";
import { readSaved, subscribeSaved, type SavedStory } from "@/lib/saved-stories";

let cache: { raw: string; stories: SavedStory[] } = { raw: "[]", stories: [] };

function snapshot() {
  const stories = readSaved();
  const raw = JSON.stringify(stories);
  if (raw !== cache.raw) cache = { raw, stories };
  return cache;
}

const server = { raw: "[]", stories: [] as SavedStory[] };

export function SavedList() {
  const { stories } = useSyncExternalStore(subscribeSaved, snapshot, () => server);
  return (
    <StoryGrid
      stories={stories.map((story) => ({ ...story, coverAlt: story.coverAlt ?? null }))}
      empty="Nothing saved yet. Use “Save for later” on a story and it will wait here."
    />
  );
}
