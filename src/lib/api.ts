import "server-only";

import { sections, type SectionPath } from "@/lib/story-path";
import { DEFAULT_STORY_SORT } from "@/lib/story-sort";

const API_URL = (process.env.API_URL ?? "http://localhost:3023").replace(/\/+$/, "");

/**
 * Published stories change a few times a day at most, so pages are rendered
 * once and revalidated in the background instead of hitting the API per visit.
 */
const REVALIDATE_SECONDS = 300;

export type StoryBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "image"; mediaKey: string };

export type StoryMedia = {
  key: string;
  type: string;
  url: string | null;
  caption: string | null;
  altText: string | null;
  credit: string | null;
  isAiGenerated?: boolean;
};

export type StorySummary = {
  updatedAt?: string;
  slug: string;
  title: string;
  summary: string;
  eventDate: string;
  type: string | null;
  coverUrl: string | null;
  coverAlt: string | null;
  /** The cover is an AI illustration, so the page labels it. */
  coverIsAi?: boolean;
  videoUrl?: string | null;
};

export type OnThisDay = {
  month: number;
  day: number;
  featured: StorySummary | null;
  also: StorySummary[];
  week: StorySummary[];
};

export type CollectionSummary = {
  slug: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
  storyCount: number;
};

export type CollectionDetail = {
  slug: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
  stories: StorySummary[];
};

export type Story = {
  slug: string;
  title: string;
  summary: string;
  eventDate: string;
  publishedAt: string | null;
  updatedAt: string;
  type: string | null;
  body: StoryBlock[];
  media: StoryMedia[];
  sources: { title: string; url: string; publisher: string }[];
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }

  get isNotFound() {
    return this.status === 404;
  }
}

export function apiOrigin() {
  return API_URL;
}

async function apiFetch(path: string, options: { fresh?: boolean } = {}): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(
      `${API_URL}${path}`,
      options.fresh ? { cache: "no-store" } : { next: { revalidate: REVALIDATE_SECONDS } },
    );
  } catch {
    throw new ApiError("Can't reach the API", 503);
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new ApiError(body?.message ?? `API responded with ${response.status}`, response.status);
  }

  return response;
}

async function apiGet<T>(path: string): Promise<T> {
  const response = await apiFetch(path);
  return response.json() as Promise<T>;
}

type StoryListOptions = {
  type?: (typeof sections)[SectionPath]["type"];
  topic?: "people" | "places" | "eras" | "science";
  /** Only the story flagged for "The Story Behind the Photo". */
  photoStory?: boolean;
  /** Only stories that carry a video. */
  video?: boolean;
  excludeType?: "other";
  limit?: number;
  offset?: number;
  /** `year` (newest event first) is the default and is left off the query. */
  sort?: "latest" | "year" | "year-asc" | "month-day" | "month-day-desc";
  /** Inclusive calendar days, `YYYY-MM-DD`. */
  from?: string;
  to?: string;
};

function storyListPath(options: StoryListOptions) {
  const query = new URLSearchParams();
  if (options.type) query.set("type", options.type);
  if (options.excludeType) query.set("exclude", options.excludeType);
  if (options.topic) query.set("topic", options.topic);
  if (options.photoStory) query.set("photoStory", "true");
  if (options.video) query.set("video", "true");
  if (options.limit) query.set("limit", String(options.limit));
  if (options.offset) query.set("offset", String(options.offset));
  if (options.sort && options.sort !== DEFAULT_STORY_SORT) query.set("sort", options.sort);
  if (options.from) query.set("from", options.from);
  if (options.to) query.set("to", options.to);
  const search = query.size > 0 ? `?${query}` : "";
  return `/api/stories${search}`;
}

/**
 * `sort: "latest"` orders by publish date. The default orders by the event
 * date, newest first. `from` and `to` are inclusive calendar days.
 */
export async function getStoriesPage(options: StoryListOptions = {}) {
  const response = await apiFetch(storyListPath(options));
  const stories = (await response.json()) as StorySummary[];
  const parsed = Number(response.headers.get("X-Total-Count"));
  const total = Number.isInteger(parsed) && parsed >= 0 ? parsed : stories.length;
  return { stories, total };
}

export async function getStories(options: StoryListOptions = {}) {
  const { stories } = await getStoriesPage(options);
  return stories;
}

export function searchStories(
  title: string,
  sort?: "year" | "year-asc" | "month-day" | "month-day-desc",
  dates?: { from?: string; to?: string },
) {
  const query = new URLSearchParams({ q: title });
  if (sort && sort !== DEFAULT_STORY_SORT) query.set("sort", sort);
  if (dates?.from) query.set("from", dates.from);
  if (dates?.to) query.set("to", dates.to);
  return apiGet<StorySummary[]>(`/api/stories?${query}`);
}

export function getStory(slug: string) {
  return apiGet<Story>(`/api/stories/${encodeURIComponent(slug)}`);
}

export function getOnThisDay(month: number, day: number, scope: string) {
  const query = new URLSearchParams({ month: String(month), day: String(day), scope });
  return apiGet<OnThisDay>(`/api/on-this-day?${query}`);
}

export type SitemapData = {
  /** When the newest published story last changed. */
  latest: string | null;
  stories: { slug: string; type: string; updatedAt: string; image: string | null }[];
  days: { day: string; updatedAt: string }[];
  collections: { slug: string; updatedAt: string; storyCount: number }[];
  topics: Record<string, string | null>;
  sections: Record<string, string | null>;
  /** Newest story that has a video, or null when there are none. */
  watch: string | null;
};

/** Everything the sitemap lists. Throws when the API is down, so crawlers never see a half-empty sitemap. */
export function getSitemapData() {
  return apiGet<SitemapData>("/api/sitemap");
}

/** Calendar days (`MM-DD`) with at least one published story. */
export function getOnThisDayDays() {
  return apiGet<string[]>("/api/on-this-day/days");
}

export function getCollections(limit?: number) {
  return apiGet<CollectionSummary[]>(`/api/collections${limit ? `?limit=${limit}` : ""}`);
}

export function getCollection(slug: string) {
  return apiGet<CollectionDetail>(`/api/collections/${encodeURIComponent(slug)}`);
}

/** Any published story. Never cached, so each visit gets a different one. */
export async function getRandomStory() {
  const response = await apiFetch("/api/stories/random", { fresh: true });
  return (await response.json()) as { slug: string; type: string | null };
}

/** Returns an empty result instead of throwing, for pages that must still render. */
export async function tryGet<T>(load: () => Promise<T>, fallback: T) {
  try {
    return { data: await load(), error: undefined as string | undefined };
  } catch (error) {
    const message = error instanceof ApiError ? error.message : "Couldn't load stories";
    return { data: fallback, error: message };
  }
}
