import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticlePage } from "@/components/article-page";
import {
  ApiError,
  getArticleBySlug,
  getArticles,
  type ApiArticle,
} from "@/lib/api";

const fallbackGradient =
  "linear-gradient(135deg, var(--accent-2), var(--teal-deep))";

function formatDate(value: string | null, style: "long" | "medium") {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: style === "long" ? "long" : "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function paragraphs(body: string) {
  const parts = body
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : [body];
}

function toView(article: ApiArticle, related: ApiArticle[]) {
  return {
    category: article.category.name,
    title: article.title,
    dek: article.dek,
    author: article.author.name,
    date: formatDate(article.publishedAt, "long"),
    dateShort: formatDate(article.publishedAt, "medium"),
    readTime: `${article.readTimeMin} min read`,
    readTimeShort: `${article.readTimeMin} min`,
    tags: article.tags.map((tag) => tag.name),
    imageLabel: article.imageLabel ?? "IMAGE",
    gradient: article.gradient ?? fallbackGradient,
    paragraphs: paragraphs(article.body),
    related: related.slice(0, 2).map((item) => ({
      title: item.title,
      gradient: item.gradient ?? fallbackGradient,
      href: `/article/${item.slug}`,
    })),
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const article = await getArticleBySlug(slug);
    return {
      title: `${article.title} — Past In Frames`,
      description: article.dek,
    };
  } catch {
    return { title: "Article — Past In Frames" };
  }
}

export default async function Article({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  try {
    const [article, articles] = await Promise.all([
      getArticleBySlug(slug),
      getArticles(),
    ]);
    const related = articles.filter((item) => item.slug !== article.slug);
    return <ArticlePage article={toView(article, related)} />;
  } catch (error) {
    if (error instanceof ApiError && error.message === "Not found") {
      notFound();
    }
    const message =
      error instanceof ApiError
        ? error.message
        : "Couldn't load this article from the API";
    return (
      <main className="mx-auto max-w-[720px] px-6 py-24 text-faded">
        {message}
      </main>
    );
  }
}
