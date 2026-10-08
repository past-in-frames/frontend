import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { StoryArticle } from "@/components/story-article";
import { ApiError, getStories, getStory, tryGet, type Story } from "@/lib/api";
import { absoluteUrl, site } from "@/lib/site";
import { sectionFromType, sectionLabel, storyPath } from "@/lib/story-path";

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
    return { title: "Story not found" };
  }

  const url = absoluteUrl(storyPath(story.type, story.slug) ?? "/");
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
      <script
        type="application/ld+json"
        // Escape HTML delimiters in stored article text.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd(story)).replace(/</g, "\\u003c") }}
      />
    </>
  );
}

function articleJsonLd(story: Story) {
  const cover = story.media.find((item) => item.type === "image" && item.url)?.url;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: story.title,
    description: story.summary,
    datePublished: story.publishedAt ?? undefined,
    dateModified: story.updatedAt,
    articleSection: sectionLabel(story.type) || undefined,
    image: cover ? [cover] : undefined,
    mainEntityOfPage: absoluteUrl(storyPath(story.type, story.slug) ?? "/"),
    publisher: { "@type": "Organization", name: site.name },
    citation: story.sources.map((source) => ({
      "@type": "CreativeWork",
      name: source.title,
      url: source.url,
      publisher: source.publisher,
    })),
  };
}
