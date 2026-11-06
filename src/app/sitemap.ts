import type { MetadataRoute } from "next";
import { getCollections, getStories, tryGet } from "@/lib/api";
import { absoluteUrl } from "@/lib/site";
import { sections, storyPath } from "@/lib/story-path";

export const revalidate = 3600;

const legal = ["/about", "/editorial-policy", "/contact", "/privacy", "/terms"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data: stories } = await tryGet(() => getStories(), []);
  const { data: collections } = await tryGet(() => getCollections(), []);

  const staticPages: MetadataRoute.Sitemap = ["/", "/explore", "/explore/people", "/explore/places", "/explore/eras", "/explore/science", "/collections", "/watch", "/about", "/editorial-policy", "/contact", "/privacy", "/terms"].map(
    (path) => ({
      url: absoluteUrl(path),
      changeFrequency: path === "/" ? "daily" : legal.includes(path) ? "yearly" : "weekly",
      priority: path === "/" ? 1 : legal.includes(path) ? 0.3 : 0.5,
    }),
  );

  const sectionPages: MetadataRoute.Sitemap = Object.keys(sections).map((section) => ({
    url: absoluteUrl(`/${section}`),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const collectionPages: MetadataRoute.Sitemap = collections.map((collection) => ({
    url: absoluteUrl(`/collections/${collection.slug}`),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...sectionPages,
    ...collectionPages,
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
