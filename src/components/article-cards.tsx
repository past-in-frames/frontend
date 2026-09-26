import Link from "next/link";
import { MediaPlaceholder } from "@/components/media-placeholder";
import type { ArticleCard } from "@/lib/articles";

export function ArticleCards({
  articles,
  empty,
  error,
}: {
  articles: ArticleCard[];
  empty: string;
  error?: string;
}) {
  if (error) {
    return <p className="text-sm text-faded">{error}</p>;
  }

  if (articles.length === 0) {
    return <p className="text-sm text-faded">{empty}</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-3 lg:gap-7">
      {articles.map((article) => (
        <Link
          key={article.slug}
          href={article.href}
          className="mi-card flex flex-col overflow-hidden rounded-2xl border border-ink/8 bg-white lg:gap-3.5"
        >
          <MediaPlaceholder
            label={article.imageLabel}
            gradient={article.gradient}
            className="h-40 lg:h-[190px]"
            iconSize={26}
          />
          <div className="flex flex-col gap-1.5 px-4 py-4 lg:gap-2 lg:px-[18px] lg:pt-0 lg:pb-5">
            <span
              className={`text-[11px] font-bold tracking-[0.06em] uppercase lg:text-xs lg:tracking-[0.08em] ${
                article.category === "History" ? "text-accent" : "text-accent-2"
              }`}
            >
              {article.category}
            </span>
            <span className="mi-card-title font-serif text-lg leading-tight font-semibold lg:text-xl lg:leading-[1.25]">
              {article.title}
            </span>
            <span className="text-[13px] text-faded lg:text-sm">{article.meta}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
