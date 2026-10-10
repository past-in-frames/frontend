"use client";

import Link from "next/link";
import {
  DEFAULT_STORY_SORT,
  flipStorySort,
  sortDirectionLabel,
  storySortHref,
  storySortMode,
  type StorySort,
} from "@/lib/story-sort";

export function StorySortBar({
  sort,
  path = "/",
  query,
  onSort,
}: {
  sort: StorySort;
  path?: string;
  query?: string;
  onSort?: (sort: StorySort) => void;
}) {
  const mode = storySortMode(sort);
  const direction = sortDirectionLabel(sort);

  function hrefFor(next: StorySort) {
    return storySortHref(path, next, { query });
  }

  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Sort stories">
      <span className="text-[11px] font-bold tracking-[0.08em] text-faded uppercase">Sort</span>
      <div className="flex rounded-full border border-ink/15 bg-white p-1">
        <SortChoice
          current={mode === "year"}
          href={onSort ? undefined : hrefFor(mode === "year" ? sort : "year")}
          onClick={onSort ? () => onSort(mode === "year" ? sort : "year") : undefined}
        >
          Year
        </SortChoice>
        <SortChoice
          current={mode === "month-day"}
          href={onSort ? undefined : hrefFor(mode === "month-day" ? sort : DEFAULT_STORY_SORT)}
          onClick={onSort ? () => onSort(mode === "month-day" ? sort : DEFAULT_STORY_SORT) : undefined}
        >
          Day & month
        </SortChoice>
      </div>
      <SortChoice
        boxed
        href={onSort ? undefined : hrefFor(flipStorySort(sort))}
        onClick={onSort ? () => onSort(flipStorySort(sort)) : undefined}
        label={`Reverse order, currently ${direction.toLowerCase()}`}
      >
        {direction}
      </SortChoice>
    </div>
  );
}

function SortChoice({
  current = false,
  boxed = false,
  href,
  onClick,
  label,
  children,
}: {
  current?: boolean;
  boxed?: boolean;
  href?: string;
  onClick?: () => void;
  label?: string;
  children: React.ReactNode;
}) {
  const className = boxed
    ? "rounded-full border border-ink/18 bg-white px-3 py-1.5 text-sm font-semibold text-muted hover:border-ink/40"
    : `rounded-full px-3 py-1.5 text-sm font-semibold ${current ? "bg-ink text-white!" : "text-muted hover:text-ink"}`;

  if (onClick) {
    return (
      <button
        type="button"
        className={className}
        aria-pressed={boxed ? undefined : current}
        aria-label={label}
        onClick={onClick}
      >
        {children}
      </button>
    );
  }

  return (
    <Link
      href={href ?? "/"}
      className={className}
      aria-current={current ? "true" : undefined}
      aria-label={label}
    >
      {children}
    </Link>
  );
}
