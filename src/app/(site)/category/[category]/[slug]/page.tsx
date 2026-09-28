import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StoryArticle } from "@/components/story-article";
import { ApiError, getStories, getStory, tryGet, type Story } from "@/lib/api";
import { absoluteUrl, site } from "@/lib/site";
import { categorySlug, storyPath } from "@/lib/story-path";

type StoryPageProps = { params: Promise<{ category: string; slug: string }> };

/**
 * Loads a story and enforces that it is reached through its own category URL,
 * so each story has exactly one canonical address.
 */
async function loadStory(category: string, slug: string): Promise<Story | null> {
  try {
    const story = await getStory(slug);
    return categorySlug(story.category) === category ? story : null;
  } catch (error) {
    if (error instanceof ApiError && error.isNotFound) return null;
    throw error;
  }
}

export async function generateStaticParams() {
  const { data: stories } = await tryGet(() => getStories(), []);
  return stories.map((story) => ({
    category: categorySlug(story.category),
    slug: story.slug,
  }));
}

export async function generateMetadata({ params }: StoryPageProps): Promise<Metadata> {
  const { category, slug } = await params;
  const story = await loadStory(category, slug);
  if (!story) {
    return { title: "Story not found" };
  }

  const url = absoluteUrl(storyPath(story.category, story.slug));
  const cover = story.media.find((item) => item.type === "image" && item.url)?.url ?? undefined;

  return {
    title: story.title,
    description: story.summary,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: story.title,
      description: story.summary,
      siteName: site.name,
      publishedTime: story.publishedAt ?? undefined,
      modifiedTime: story.updatedAt,
      images: cover ? [{ url: cover, alt: story.title }] : undefined,
    },
    twitter: {
      card: cover ? "summary_large_image" : "summary",
      title: story.title,
      description: story.summary,
      images: cover ? [cover] : undefined,
    },
  };
}

export default async function StoryPage({ params }: StoryPageProps) {
  const { category, slug } = await params;
  const story = await loadStory(category, slug);
  if (!story) {
    notFound();
  }

  return (
    <>
      <StoryArticle story={story} />
      <script
        type="application/ld+json"
        // Structured data helps the story surface as a news result and in link previews.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd(story)) }}
      />
    </>
  );
}

function articleJsonLd(story: Story) {
  const cover = story.media.find((item) => item.type === "image" && item.url)?.url;

  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: story.title,
    description: story.summary,
    datePublished: story.publishedAt ?? undefined,
    dateModified: story.updatedAt,
    articleSection: story.category,
    image: cover ? [cover] : undefined,
    mainEntityOfPage: absoluteUrl(storyPath(story.category, story.slug)),
    publisher: { "@type": "Organization", name: site.name },
    citation: story.sources.map((source) => ({
      "@type": "CreativeWork",
      name: source.title,
      url: source.url,
      publisher: source.publisher,
    })),
  };
}
