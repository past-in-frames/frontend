import { ApiError, getArticles, getCategories, type ApiArticle } from "@/lib/api";
import { storyPath } from "@/lib/story-path";

const fallbackGradient =
  "linear-gradient(135deg, var(--accent-2), var(--teal-mid))";

export type ArticleCard = {
  slug: string;
  category: string;
  title: string;
  meta: string;
  imageLabel: string;
  gradient: string;
  href: string;
};

export type TrendingItem = {
  n: string;
  title: string;
  category: string;
  href: string;
};

export function toCard(article: ApiArticle): ArticleCard {
  return {
    slug: article.slug,
    category: article.category.name,
    title: article.title,
    meta: `${article.readTimeMin} min read`,
    imageLabel: article.imageLabel ?? "IMAGE",
    gradient: article.gradient ?? fallbackGradient,
    href: storyPath(article.category.slug, article.slug),
  };
}

function messageFrom(error: unknown) {
  return error instanceof ApiError
    ? error.message
    : "Couldn't load articles from the API";
}

export async function loadArticleCards(category?: string) {
  try {
    const articles = await getArticles(category);
    return { cards: articles.map(toCard), error: undefined as string | undefined };
  } catch (error) {
    return { cards: [] as ArticleCard[], error: messageFrom(error) };
  }
}

export async function loadTrending() {
  try {
    const articles = (await getArticles()).filter((article) => article.trending);
    return {
      items: articles.map((article, index) => ({
        n: String(index + 1).padStart(2, "0"),
        title: article.title,
        category: article.category.name,
        href: storyPath(article.category.slug, article.slug),
      })),
      error: undefined as string | undefined,
    };
  } catch (error) {
    return { items: [] as TrendingItem[], error: messageFrom(error) };
  }
}

export function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export async function categoryTitle(slug: string) {
  try {
    const categories = await getCategories();
    const match = categories.find((category) => category.slug === slug);
    if (match) return match.name;
  } catch {
    // The page still renders with a title derived from the slug.
  }
  return titleFromSlug(slug);
}
