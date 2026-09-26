import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/content-page";
import { loadTrending } from "@/lib/articles";

export const metadata: Metadata = {
  title: "Trending — Past In Frames",
  description: "The stories readers are opening this week.",
};

export default async function TrendingPage() {
  const { items, error } = await loadTrending();

  return (
    <ContentPage title="Trending" lede="The stories readers are opening this week.">
      {error ? (
        <p className="text-sm text-faded">{error}</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-faded">Nothing trending yet.</p>
      ) : (
        <div className="flex max-w-[860px] flex-col rounded-[18px] bg-ink px-5 py-[26px] text-cream lg:rounded-[20px] lg:px-10 lg:py-10">
          {items.map((item, index) => {
            const last = index === items.length - 1;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-start gap-3.5 py-3 lg:items-center lg:gap-6 lg:py-4 ${
                  last ? "" : "border-b border-cream/12"
                }`}
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
      )}
    </ContentPage>
  );
}
