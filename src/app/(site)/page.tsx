import type { Metadata } from "next";
import { OnThisDayView } from "@/app/(site)/on-this-day-view";
import {
  monthDayFromIso,
  onThisDayDescription,
  onThisDayTitle,
  parseScope,
} from "@/lib/on-this-day";
import { pageMetadata } from "@/lib/seo";
import { todayIso } from "@/lib/story-dates";

type HomePageProps = {
  searchParams: Promise<{ scope?: string | string[] }>;
};

/** The home page is On This Day for today, so its title and description change with the date. */
export async function generateMetadata({ searchParams }: HomePageProps): Promise<Metadata> {
  const today = monthDayFromIso(todayIso());
  const filtered = parseScope((await searchParams).scope) !== "all";
  return pageMetadata({
    title: onThisDayTitle(today),
    description: onThisDayDescription(today),
    path: "/",
    noindex: filtered,
  });
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { scope } = await searchParams;
  return <OnThisDayView date={monthDayFromIso(todayIso())} scope={parseScope(scope)} />;
}
