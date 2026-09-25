const API_URL = process.env.API_URL ?? "http://localhost:3023";

export type ApiCategory = {
  id: number;
  slug: string;
  name: string;
};

export type ApiArticle = {
  id: number;
  slug: string;
  title: string;
  dek: string;
  body: string;
  imageLabel: string | null;
  gradient: string | null;
  readTimeMin: number;
  featured: boolean;
  trending: boolean;
  publishedAt: string | null;
  category: ApiCategory;
  author: { id: number; name: string };
  tags: { id: number; name: string }[];
};

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export function apiOrigin() {
  return API_URL;
}

export async function apiGet<T>(path: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { cache: "no-store" });
  } catch {
    throw new ApiError(`Can't reach the API at ${API_URL}`);
  }

  if (response.status === 404) {
    throw new ApiError("Not found");
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new ApiError(body?.message ?? `API responded with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function getArticles() {
  return apiGet<ApiArticle[]>("/api/articles");
}

export function getCategories() {
  return apiGet<ApiCategory[]>("/api/categories");
}

export function getArticleBySlug(slug: string) {
  return apiGet<ApiArticle>(`/api/articles/slug/${encodeURIComponent(slug)}`);
}

export async function createSubscriber(email: string) {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/api/subscribers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
      cache: "no-store",
    });
  } catch {
    throw new ApiError(`Can't reach the API at ${API_URL}`);
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new ApiError(body?.message ?? `API responded with ${response.status}`);
  }
}
