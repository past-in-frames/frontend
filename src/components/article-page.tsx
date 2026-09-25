import Link from "next/link";
import { MediaPlaceholder } from "@/components/media-placeholder";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export type ArticleView = {
  category: string;
  title: string;
  dek: string;
  author: string;
  date: string;
  dateShort: string;
  readTime: string;
  readTimeShort: string;
  tags: string[];
  imageLabel: string;
  gradient: string;
  paragraphs: string[];
  related: { title: string; gradient: string; href: string }[];
};

export function ArticlePage({ article }: { article: ArticleView }) {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <SiteHeader variant="article" />

      <article className="flex flex-grow flex-col px-[18px] pt-6 lg:items-center lg:px-16 lg:pt-12">
        <div className="flex w-full max-w-[780px] flex-col gap-5 lg:gap-7">
          <div className="flex flex-col gap-3 lg:gap-4">
            <div className="hidden text-[13px] font-semibold text-faded lg:block">
              <Link href="/" className="mi-link">
                Home
              </Link>
              &nbsp;/&nbsp; {article.category}
            </div>
            <span className="self-start rounded-full bg-accent-2/12 px-3 py-[5px] text-[11px] font-bold tracking-[0.06em] text-accent-2 uppercase lg:px-3.5 lg:py-1.5 lg:text-xs">
              {article.category}
            </span>
            <h1 className="m-0 font-serif text-[30px] leading-[1.15] font-semibold lg:text-5xl lg:leading-[1.12] lg:tracking-[-0.01em]">
              {article.title}
            </h1>
            <p className="m-0 text-base leading-normal text-muted lg:text-[19px] lg:leading-normal">
              {article.dek}
            </p>
            <div className="flex items-center gap-2.5 pt-0.5 lg:gap-3 lg:pt-1">
              <div
                className="size-8 rounded-full lg:size-10"
                style={{
                  background: "linear-gradient(135deg, var(--accent), var(--rust))",
                }}
              />
              <div className="flex flex-col">
                <span className="text-[13px] font-bold lg:text-sm">
                  {article.author}
                </span>
                <span className="text-xs text-faded lg:text-[13px]">
                  <span className="lg:hidden">
                    {article.dateShort} · {article.readTimeShort}
                  </span>
                  <span className="hidden lg:inline">
                    {article.date} · {article.readTime}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <MediaPlaceholder
            label={article.imageLabel}
            gradient={article.gradient}
            className="h-[220px] rounded-2xl lg:h-[440px] lg:rounded-[18px]"
            iconSize={30}
          />

          <div>
            {article.paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className={`mi-body ${index === 0 ? "mi-dropcap" : ""}`}
              >
                {paragraph}
              </p>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 pt-1 lg:pt-2">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-ink/18 px-3 py-1.5 text-xs font-semibold text-muted lg:px-3.5 lg:py-[7px] lg:text-[13px]"
              >
                {tag}
              </span>
            ))}
          </div>

          {article.related.length > 0 ? (
            <div className="mt-2 flex flex-col gap-4 border-t border-ink/12 pt-6 pb-10 lg:mt-3 lg:gap-5 lg:pt-8 lg:pb-14">
              <h2 className="m-0 font-serif text-[19px] font-semibold lg:text-[22px]">
                Keep exploring
              </h2>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5">
                {article.related.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3.5 lg:gap-4"
                  >
                    <div
                      className="h-[60px] w-20 shrink-0 rounded-[10px] lg:h-[72px] lg:w-24"
                      style={{ background: item.gradient }}
                    />
                    <span className="text-sm leading-snug font-semibold lg:text-[15px] lg:leading-snug">
                      {item.title}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </article>

      <SiteFooter variant="simple" />
    </div>
  );
}
