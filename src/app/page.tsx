import { HomePage } from "@/components/home-page";
import {
  ApiError,
  getArticles,
  getCategories,
  type ApiArticle,
} from "@/lib/api";

const fallbackGradient =
  "linear-gradient(135deg, var(--accent-2), var(--teal-mid))";

function toCard(article: ApiArticle) {
  return {
    slug: article.slug,
    category: article.category.name,
    title: article.title,
    meta: `${article.readTimeMin} min read`,
    imageLabel: article.imageLabel ?? "IMAGE",
    gradient: article.gradient ?? fallbackGradient,
    href: `/article/${article.slug}`,
  };
}

export default async function Home() {
  try {
    const [articles, categories] = await Promise.all([
      getArticles(),
      getCategories(),
    ]);
    const featured = articles.filter((article) => article.featured);
    const cards = (featured.length > 0 ? featured : articles).map(toCard);
    const trending = articles
      .filter((article) => article.trending)
      .map((article, index) => ({
        n: String(index + 1).padStart(2, "0"),
        title: article.title,
        category: article.category.name,
        href: `/article/${article.slug}`,
      }));

    return (
      <HomePage
        categories={categories.map((category) => category.name)}
        articles={cards}
        trending={trending}
      />
    );
  } catch (error) {
    const message =
      error instanceof ApiError
        ? error.message
        : "Couldn't load articles from the API";
    return <HomePage categories={[]} articles={[]} trending={[]} error={message} />;
  }
}
