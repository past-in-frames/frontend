import { HomePage } from "@/components/home-page";
import { ApiError, getStories, type ApiStory } from "@/lib/api";
import { storyPath } from "@/lib/story-path";

const fallbackGradient =
  "linear-gradient(135deg, var(--accent-2), var(--teal-mid))";

function categoryLabel(category: string) {
  return category.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

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

function toCard(story: ApiStory) {
  return {
    slug: story.slug,
    category: categoryLabel(story.category),
    title: story.title,
    meta: formatEventDate(story.eventDate),
    imageLabel: story.coverAlt ?? "IMAGE",
    imageUrl: story.coverUrl,
    gradient: fallbackGradient,
    href: storyPath(story.category, story.slug),
  };
}

export default async function Home() {
  try {
    const stories = await getStories();
    const cards = stories.map(toCard);

    return (
      <HomePage
        categories={[...new Set(cards.map((card) => card.category))]}
        articles={cards}
        trending={[]}
      />
    );
  } catch (error) {
    const message =
      error instanceof ApiError
        ? error.message
        : "Couldn't load stories from the API";
    return <HomePage categories={[]} articles={[]} trending={[]} error={message} />;
  }
}
