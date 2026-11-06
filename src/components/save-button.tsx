"use client";

import { useSyncExternalStore } from "react";
import { BookmarkIcon } from "@/components/icons";
import { readSaved, subscribeSaved, toggleSaved, type SavedStory } from "@/lib/saved-stories";

// useSyncExternalStore needs a stable snapshot; the raw JSON string is one.
function snapshot() {
  return JSON.stringify(readSaved().map((item) => item.slug));
}

export function SaveButton({ story }: { story: SavedStory }) {
  const slugs = useSyncExternalStore(subscribeSaved, snapshot, () => "[]");
  const saved = (JSON.parse(slugs) as string[]).includes(story.slug);

  return (
    <button
      type="button"
      onClick={() => toggleSaved(story)}
      aria-pressed={saved}
      className="inline-flex items-center gap-2 self-start border border-ink/40 px-3 py-1.5 text-sm font-semibold text-ink hover:border-rust hover:text-rust"
    >
      <BookmarkIcon size={16} filled={saved} />
      {saved ? "Saved" : "Save for later"}
    </button>
  );
}
