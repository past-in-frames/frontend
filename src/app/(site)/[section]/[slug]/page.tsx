import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { StoryArticle } from "@/components/story-article";
import { ApiError, getStories, getStory, tryGet, type Story } from "@/lib/api";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbJsonLd, organizationJsonLd, pageMetadata } from "@/lib/seo";
import { absoluteUrl, site } from "@/lib/site";
import { eventYear, formatEventDate, sectionFromType, sectionLabel, sections, storyPath } from "@/lib/story-path";

type StoryPageProps = { params: Promise<{ section: string; slug: string }> };

/**
 * Loads a story and sends any other address to its section URL, so each story
 * has exactly one canonical path.
 */
async function loadStory(section: string, slug: string): Promise<Story | null> {
  let story: Story;
  try {
    story = await getStory(slug);
  } catch (error) {
    if (error instanceof ApiError && error.isNotFound) return null;
    throw error;
  }

  const canonical = storyPath(story.type, story.slug);
  if (!canonical || sectionFromType(story.type) !== section) {
    if (canonical) permanentRedirect(canonical);
    return null;
  }

  return story;
}

export async function generateStaticParams() {
  const { data: stories } = await tryGet(() => getStories(), []);
  return stories.flatMap((story) => {
    const section = sectionFromType(story.type);
    return section ? [{ section, slug: story.slug }] : [];
  });
}

export async function generateMetadata({ params }: StoryPageProps): Promise<Metadata> {
  const { section, slug } = await params;
  const story = await loadStory(section, slug);
  if (!story) {
    return { title: "Story not found", robots: { index: false } };
  }

  const cover = story.media.find((item) => item.type === "image" && item.url);
  const meta = pageMetadata({
    title: story.title,
    description: story.summary,
    path: storyPath(story.type, story.slug) ?? "/",
    type: "article",
    image: cover?.url ? { url: cover.url, alt: cover.altText ?? story.title } : undefined,
  });

  return {
    ...meta,
    openGraph: {
      ...meta.openGraph,
      type: "article",
      publishedTime: story.publishedAt ?? undefined,
      modifiedTime: story.updatedAt,
      section: sectionLabel(story.type) || undefined,
      tags: [`${eventYear(story.eventDate)}`, "on this day in history"],
    } as Metadata["openGraph"],
  };
}

export default async function StoryPage({ params }: StoryPageProps) {
  const { section, slug } = await params;
  const story = await loadStory(section, slug);
  if (!story) {
    notFound();
  }

  const type =
    story.type === "science" || story.type === "history" || story.type === "other" ? story.type : null;
  const { data: related } = type
    ? await tryGet(() => getStories({ type, limit: 4, sort: "latest" }), [])
    : { data: [] };

  return (
    <>
      <StoryArticle story={story} related={related.filter((item) => item.slug !== story.slug).slice(0, 3)} />
      <JsonLd data={articleJsonLd(story)} />
      <JsonLd data={storyBreadcrumbs(story)} />
    </>
  );
}

function storyBreadcrumbs(story: Story) {
  const section = sectionFromType(story.type);
  return breadcrumbJsonLd([
    { name: "Home", path: "/" },
    ...(section ? [{ name: sections[section].label, path: `/${section}` }] : []),
    { name: story.title, path: storyPath(story.type, story.slug) ?? "/" },
  ]);
}

function articleJsonLd(story: Story) {
  const images = story.media.flatMap((item) => (item.type === "image" && item.url ? [item.url] : []));
  const url = absoluteUrl(storyPath(story.type, story.slug) ?? "/");
  const words = story.body.reduce(
    (count, block) => count + (block.type === "image" ? 0 : block.text.trim().split(/\s+/).filter(Boolean).length),
    0,
  );

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: story.title.slice(0, 110),
    alternativeHeadline: story.title,
    description: story.summary,
    inLanguage: "en",
    isAccessibleForFree: true,
    datePublished: story.publishedAt ?? undefined,
    dateModified: story.updatedAt,
    // The date the event itself happened, which readers search for.
    about: { "@type": "Event", name: story.title, startDate: story.eventDate },
    articleSection: sectionLabel(story.type) || undefined,
    keywords: [eventYear(story.eventDate), formatEventDate(story.eventDate), "on this day in history"].join(", "),
    wordCount: words,
    image: images.length ? images : undefined,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: { "@id": absoluteUrl("/#organization"), "@type": "Organization", name: site.name, url: site.url },
    publisher: organizationJsonLd,
    citation: story.sources.map((source) => ({
      "@type": "CreativeWork",
      name: source.title,
      url: source.url,
      publisher: source.publisher,
    })),
  };
}
