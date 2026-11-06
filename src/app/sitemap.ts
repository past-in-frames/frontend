import type { MetadataRoute } from "next";
import { getSitemapData } from "@/lib/api";
import { absoluteUrl } from "@/lib/site";
import { sectionFromType, storyPath } from "@/lib/story-path";

/** Rebuilt at most once an hour; the API response behind it is cached for five minutes. */
export const revalidate = 3600;

type Entry = MetadataRoute.Sitemap[number];

const TOPICS = ["people", "places", "eras", "science"] as const;
const SECTIONS = ["science", "history", "others"] as const;
const LEGAL = ["/about", "/editorial-policy", "/contact", "/privacy", "/terms"];

function dateOf(value: string | null | undefined) {
  return value ? new Date(value) : undefined;
}

/**
 * Every page a search engine should find: the home page and its calendar days,
 * Explore with each topic, the three sections, collections, Watch when there is
 * a video, every published story with its picture, and the legal pages.
 * Filtered, searched and saved views are left out on purpose.
 *
 * If the API cannot be reached this fails instead of returning a short list, so a
 * crawler retries later and does not conclude that the stories are gone.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await getSitemapData();
  const latest = dateOf(data.latest);

  const core: Entry[] = [
    { url: absoluteUrl("/"), lastModified: latest, changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/explore"), lastModified: latest, changeFrequency: "weekly", priority: 0.7 },
    { url: absoluteUrl("/collections"), lastModified: latest, changeFrequency: "weekly", priority: 0.7 },
    ...(data.watch
      ? [{ url: absoluteUrl("/watch"), lastModified: dateOf(data.watch), changeFrequency: "weekly" as const, priority: 0.6 }]
      : []),
  ];

  const topics: Entry[] = TOPICS.map((topic) => ({
    url: absoluteUrl(`/explore/${topic}`),
    lastModified: dateOf(data.topics[topic]),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const sections: Entry[] = SECTIONS.map((section) => ({
    url: absoluteUrl(`/${section}`),
    lastModified: dateOf(data.sections[section === "others" ? "other" : section]),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const collections: Entry[] = data.collections.map((collection) => ({
    url: absoluteUrl(`/collections/${collection.slug}`),
    lastModified: dateOf(collection.updatedAt),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const days: Entry[] = data.days.map((day) => ({
    url: absoluteUrl(`/on-this-day/${day.day}`),
    lastModified: dateOf(day.updatedAt),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const stories: Entry[] = data.stories.flatMap((story) => {
    const path = sectionFromType(story.type) ? storyPath(story.type, story.slug) : null;
    if (!path) return [];
    return [
      {
        url: absoluteUrl(path),
        lastModified: dateOf(story.updatedAt),
        changeFrequency: "monthly" as const,
        priority: 0.8,
        ...(story.image ? { images: [story.image] } : {}),
      },
    ];
  });

  const legal: Entry[] = LEGAL.map((path) => ({
    url: absoluteUrl(path),
    changeFrequency: "yearly",
    priority: 0.3,
  }));

  return [...core, ...topics, ...sections, ...collections, ...days, ...stories, ...legal];
}
