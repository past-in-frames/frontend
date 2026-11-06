import type { StorySummary } from "@/lib/api";

/** Saved stories live in this browser only: there are no reader accounts. */
const KEY = "pif:saved";
const EVENT = "pif:saved-change";

export type SavedStory = Pick<StorySummary, "slug" | "title" | "summary" | "eventDate" | "type" | "coverUrl" | "coverAlt">;

export function readSaved(): SavedStory[] {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(parsed)
      ? parsed.filter((item): item is SavedStory => typeof item?.slug === "string" && typeof item?.title === "string")
      : [];
  } catch {
    return [];
  }
}

function write(stories: SavedStory[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(stories));
  } catch {
    // Storage is full or blocked; saving is a convenience, so the page carries on.
  }
  window.dispatchEvent(new Event(EVENT));
}

export function toggleSaved(story: SavedStory) {
  const current = readSaved();
  write(
    current.some((item) => item.slug === story.slug)
      ? current.filter((item) => item.slug !== story.slug)
      : [{ ...story, coverAlt: story.coverAlt ?? null }, ...current],
  );
}

export function subscribeSaved(callback: () => void) {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}
