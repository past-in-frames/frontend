"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MediaPlaceholder } from "@/components/media-placeholder";
import { Newsletter } from "@/components/newsletter";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export type HomeArticle = {
  slug: string;
  category: string;
  title: string;
  meta: string;
  imageLabel: string;
  gradient: string;
  href: string;
};

export type HomeTrending = {
  n: string;
  title: string;
  category: string;
  href: string;
};

type HomePageProps = {
  categories: string[];
  articles: HomeArticle[];
  trending: HomeTrending[];
  error?: string;
};

export function HomePage({
  categories,
  articles: allArticles,
  trending,
  error,
}: HomePageProps) {
  const [activeCategory, setActiveCategory] = useState("All");
  const filters = ["All", ...categories];

  const articles = useMemo(() => {
    if (activeCategory === "All") return allArticles;
    return allArticles.filter((article) => article.category === activeCategory);
  }, [activeCategory, allArticles]);

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <SiteHeader />

      <section className="flex max-w-[900px] flex-col items-start gap-3.5 px-[18px] pt-8 pb-6 lg:gap-6 lg:px-16 lg:pt-24 lg:pb-16">
        <span className="text-[11px] font-bold tracking-[0.1em] text-accent-2 uppercase lg:text-[13px] lg:tracking-[0.12em]">
          <span className="lg:hidden">Issue No. 214</span>
          <span className="hidden lg:inline">
            Issue No. 214 · Curiosities, daily
          </span>
        </span>
        <h1 className="m-0 font-serif text-[34px] leading-[1.08] font-semibold tracking-[-0.01em] lg:text-[64px] lg:leading-[1.04] lg:tracking-[-0.02em]">
          Curious minds,
          <br className="hidden lg:block" /> this way.
        </h1>
        <p className="m-0 max-w-[620px] text-[15px] leading-[1.55] text-muted lg:text-[19px] lg:leading-relaxed">
          <span className="lg:hidden">
            Short, well-sourced dives into the odd, the overlooked and the
            quietly astonishing. Five minutes, every day.
          </span>
          <span className="hidden lg:inline">
            Short, well-sourced dives into the odd, the overlooked and the
            quietly astonishing — from deep-sea biology to forgotten inventions.
            Five minutes, every day.
          </span>
        </p>
        <div
          id="categories"
          className="mt-1 flex flex-wrap gap-2 lg:mt-2 lg:gap-2.5"
        >
          {filters.map((category) => {
            const selected = category === activeCategory;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`rounded-full px-3.5 py-[7px] text-[13px] font-semibold whitespace-nowrap lg:px-[18px] lg:py-[9px] lg:text-sm ${
                  selected
                    ? "bg-ink text-cream"
                    : "border border-ink/18 text-muted"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-[18px] px-[18px] pt-1 pb-8 lg:gap-6 lg:px-16 lg:pt-2 lg:pb-14">
        <div className="flex items-baseline justify-between">
          <h2 className="m-0 font-serif text-xl font-semibold lg:text-[26px]">
            Fresh finds
          </h2>
          <Link href="#" className="mi-link text-[13px] font-semibold lg:text-sm">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-3 lg:gap-7">
          {error ? (
            <p className="col-span-full text-sm text-faded">{error}</p>
          ) : articles.length === 0 ? (
            <p className="col-span-full text-sm text-faded">
              Nothing in {activeCategory} yet — try another category.
            </p>
          ) : (
            articles.map((article) => (
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
                      article.category === "History"
                        ? "text-accent"
                        : "text-accent-2"
                    }`}
                  >
                    {article.category}
                  </span>
                  <span className="mi-card-title font-serif text-lg leading-tight font-semibold lg:text-xl lg:leading-[1.25]">
                    {article.title}
                  </span>
                  <span className="text-[13px] text-faded lg:text-sm">
                    {article.meta}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      <section
        id="trending"
        className="mx-[18px] mb-7 flex flex-col gap-4 rounded-[18px] bg-ink px-5 py-[26px] text-cream lg:mx-16 lg:mb-14 lg:gap-[22px] lg:rounded-[20px] lg:px-10 lg:py-10"
      >
        <h2 className="m-0 font-serif text-[19px] font-semibold lg:text-2xl">
          Trending this week
        </h2>
        <div className="flex flex-col">
          {trending.map((item, index) => {
            const last = index === trending.length - 1;
            return (
              <Link
                key={item.n}
                href={item.href}
                className={`flex items-start gap-3.5 py-3 lg:items-center lg:gap-6 lg:py-4 ${
                  last
                    ? ""
                    : "border-b border-cream/12"
                } ${item.n === "04" ? "hidden lg:flex" : ""}`}
              >
                <span className="w-[22px] shrink-0 font-serif text-[19px] text-accent lg:w-8 lg:text-2xl">
                  {item.n}
                </span>
                <span className="flex-1 text-[15px] leading-[1.35] font-semibold lg:text-[17px] lg:leading-normal">
                  {item.title}
                </span>
                <span className="hidden text-[13px] text-cream/55 lg:inline">
                  {item.category}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <Newsletter />
      <SiteFooter />
    </div>
  );
}
