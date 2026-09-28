import "server-only";

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
};

export type StorySummary = {
  slug: string;
  title: string;
  summary: string;
  eventDate: string;
  category: string;
  coverUrl: string | null;
  coverAlt: string | null;
};

export type Story = {
  slug: string;
  title: string;
  summary: string;
  eventDate: string;
  publishedAt: string | null;
  updatedAt: string;
  category: string;
  body: StoryBlock[];
  media: StoryMedia[];
  sources: { title: string; url: string; publisher: string }[];
};

export type Category = { name: string; count: number };

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

async function apiGet<T>(path: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
  } catch {
    throw new ApiError("Can't reach the API", 503);
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new ApiError(body?.message ?? `API responded with ${response.status}`, response.status);
  }

  return response.json() as Promise<T>;
}

/** `sort: "latest"` orders by publish date; the default orders by event date. */
export function getStories(
  options: { category?: string; limit?: number; sort?: "latest" } = {},
) {
  const query = new URLSearchParams();
  if (options.category) query.set("category", options.category);
  if (options.limit) query.set("limit", String(options.limit));
  if (options.sort) query.set("sort", options.sort);
  const search = query.size > 0 ? `?${query}` : "";
  return apiGet<StorySummary[]>(`/api/stories${search}`);
}

export function getStoriesByType(type: "science" | "history") {
  return apiGet<StorySummary[]>(`/api/stories?type=${type}`);
}

export function searchStories(title: string) {
  return apiGet<StorySummary[]>(`/api/stories?q=${encodeURIComponent(title)}`);
}

export function getCategories() {
  return apiGet<Category[]>("/api/stories/categories");
}

export function getStory(slug: string) {
  return apiGet<Story>(`/api/stories/${encodeURIComponent(slug)}`);
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
