import { notFound, permanentRedirect } from "next/navigation";
import { ApiError, getStory } from "@/lib/api";
import { storyPath } from "@/lib/story-path";

type LegacyStoryProps = { params: Promise<{ category: string; slug: string }> };

/** Old `/category/{subject}/{slug}` addresses now live at `/{section}/{slug}`. */
export default async function LegacyStoryRedirect({ params }: LegacyStoryProps) {
  const { slug } = await params;

  let story;
  try {
    story = await getStory(slug);
  } catch (error) {
    if (error instanceof ApiError && error.isNotFound) notFound();
    throw error;
  }

  const path = storyPath(story.type, story.slug);
  if (!path) {
    notFound();
  }

  permanentRedirect(path);
}
