"use client";

import { useState, useTransition } from "react";
import { StoryLead, StorySecondary } from "@/components/story-lead";
import { StoryTimeline } from "@/components/story-timeline";
import type { StorySummary } from "@/lib/api";
import type { StorySort } from "@/lib/story-sort";
import { loadMoreHomeStories } from "./load-more-stories";

export function HomeFeed({
  initialStories,
  total,
  sort,
}: {
  initialStories: StorySummary[];
  total: number;
  sort: StorySort;
}) {
  const [stories, setStories] = useState(initialStories);
  const [exhausted, setExhausted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [lead, ...rest] = stories;
  const secondary = rest.slice(0, 2);
  const timeline = rest.slice(2);
  const hasMore = !exhausted && stories.length < total;

  function onLoadMore() {
    setError(null);
    startTransition(async () => {
      try {
        const next = await loadMoreHomeStories(stories.length, sort);
        const seen = new Set(stories.map((story) => story.slug));
        const fresh = next.filter((story) => !seen.has(story.slug));
        if (fresh.length === 0) {
          setExhausted(true);
          return;
        }
        setStories((current) => {
          const seen = new Set(current.map((story) => story.slug));
          const added = fresh.filter((story) => !seen.has(story.slug));
          return added.length === 0 ? current : [...current, ...added];
        });
      } catch {
        setError("Couldn't load more stories.");
      }
    });
  }

  return (
    <>
      {lead ? <StoryLead story={lead} /> : null}

      {secondary.length > 0 ? (
        <div className="grid gap-7 lg:grid-cols-2 lg:gap-12">
          {secondary.map((story) => (
            <StorySecondary key={story.slug} story={story} />
          ))}
        </div>
      ) : null}

      {timeline.length > 0 ? (
        <section className="flex flex-col gap-3 lg:gap-5">
          <h2 className="m-0 font-serif text-xl font-semibold lg:text-[26px]">More from this week</h2>
          <StoryTimeline stories={timeline} />
        </section>
      ) : null}

      {hasMore ? (
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={pending}
            className="rounded-full border border-ink/18 px-5 py-2.5 text-sm font-semibold text-muted hover:border-ink/40 disabled:opacity-60"
          >
            {pending ? "Loading…" : "Load more"}
          </button>
          {error ? <p className="m-0 text-sm text-faded">{error}</p> : null}
        </div>
      ) : null}
    </>
  );
}
