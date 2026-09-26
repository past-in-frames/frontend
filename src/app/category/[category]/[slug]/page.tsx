import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StoryPage, storyBlocks } from "@/components/story-page";
import { ApiError, getStory, type ApiStoryDetail } from "@/lib/api";
import { categorySlug } from "@/lib/story-path";

type StoryPageProps = {
  params: Promise<{ category: string; slug: string }>;
};

function formatEventDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function matchesCategory(story: ApiStoryDetail, category: string) {
  return categorySlug(story.category) === category;
}

export async function generateMetadata({
  params,
}: StoryPageProps): Promise<Metadata> {
  const { category, slug } = await params;
  try {
    const story = await getStory(slug);
    if (!matchesCategory(story, category)) {
      return { title: "Story — Past In Frames" };
    }
    return {
      title: `${story.title} — Past In Frames`,
      description: story.summary,
    };
  } catch {
    return { title: "Story — Past In Frames" };
  }
}

export default async function CategoryStoryPage({ params }: StoryPageProps) {
  const { category, slug } = await params;

  try {
    const story = await getStory(slug);
    if (!matchesCategory(story, category)) {
      notFound();
    }

    return (
      <StoryPage
        story={{
          ...story,
          eventDate: formatEventDate(story.eventDate),
          body: storyBlocks(story.body),
        }}
      />
    );
  } catch (error) {
    if (error instanceof ApiError && error.message === "Not found") {
      notFound();
    }
    const message =
      error instanceof ApiError
        ? error.message
        : "Couldn't load this story from the API";
    return (
      <main className="mx-auto max-w-[720px] px-6 py-24 text-faded">{message}</main>
    );
  }
}
