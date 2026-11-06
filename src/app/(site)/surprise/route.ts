import { NextResponse } from "next/server";
import { getRandomStory } from "@/lib/api";
import { site } from "@/lib/site";
import { storyPath } from "@/lib/story-path";

/** "Surprise me": send the reader to a random story, or home if there is none. */
export async function GET() {
  let target = "/";
  try {
    const story = await getRandomStory();
    target = storyPath(story.type, story.slug) ?? target;
  } catch {
    // Nothing published yet, or the API is down: the home page still works.
  }
  return NextResponse.redirect(new URL(target, site.url), {
    status: 307,
    headers: { "Cache-Control": "no-store" },
  });
}
