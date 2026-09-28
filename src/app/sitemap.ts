import type { MetadataRoute } from "next";
import { getCategories, getStories, tryGet } from "@/lib/api";
import { absoluteUrl } from "@/lib/site";
import { categoryPath, storyPath } from "@/lib/story-path";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ data: stories }, { data: categories }] = await Promise.all([
    tryGet(() => getStories(), []),
    tryGet(getCategories, []),
  ]);

  const staticPages: MetadataRoute.Sitemap = ["/", "/about", "/privacy", "/terms"].map(
    (path) => ({
      url: absoluteUrl(path),
      changeFrequency: path === "/" ? "daily" : "yearly",
      priority: path === "/" ? 1 : 0.3,
    }),
  );

  return [
    ...staticPages,
    ...categories.map((category) => ({
      url: absoluteUrl(categoryPath(category.name)),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...stories.map((story) => ({
      url: absoluteUrl(storyPath(story.category, story.slug)),
      lastModified: new Date(story.eventDate),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
