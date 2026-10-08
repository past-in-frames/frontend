import type { MetadataRoute } from "next";
import { getStories, tryGet } from "@/lib/api";
import { absoluteUrl } from "@/lib/site";
import { sections, storyPath } from "@/lib/story-path";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data: stories } = await tryGet(() => getStories(), []);

  const staticPages: MetadataRoute.Sitemap = ["/", "/about", "/editorial-policy", "/contact", "/privacy", "/terms"].map(
    (path) => ({
      url: absoluteUrl(path),
      changeFrequency: path === "/" ? "daily" : "yearly",
      priority: path === "/" ? 1 : 0.3,
    }),
  );

  const sectionPages: MetadataRoute.Sitemap = Object.keys(sections).map((section) => ({
    url: absoluteUrl(`/${section}`),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [
    ...staticPages,
    ...sectionPages,
    ...stories.flatMap((story) => {
      const path = storyPath(story.type, story.slug);
      if (!path) return [];
      return [
        {
          url: absoluteUrl(path),
          lastModified: story.updatedAt ? new Date(story.updatedAt) : undefined,
          changeFrequency: "monthly" as const,
          priority: 0.8,
        },
      ];
    }),
  ];
}
