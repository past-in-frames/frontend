import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OnThisDayView } from "@/app/(site)/on-this-day-view";
import { monthDayKey, onThisDayDescription, onThisDayTitle, parseMonthDay, parseScope } from "@/lib/on-this-day";
import { getOnThisDay, tryGet } from "@/lib/api";
import { pageMetadata } from "@/lib/seo";

type DatePageProps = {
  params: Promise<{ date: string }>;
  searchParams: Promise<{ scope?: string | string[] }>;
};

export async function generateMetadata({ params, searchParams }: DatePageProps): Promise<Metadata> {
  const date = parseMonthDay((await params).date);
  if (!date) return { title: "Not found", robots: { index: false } };

  // A day with no stories would be a thin page, so it stays out of search results.
  const { data } = await tryGet(() => getOnThisDay(date.month, date.day, "all"), null);
  const empty = data !== null && !data.featured;

  return pageMetadata({
    title: onThisDayTitle(date),
    description: onThisDayDescription(date),
    path: `/on-this-day/${monthDayKey(date)}`,
    noindex: empty || parseScope((await searchParams).scope) !== "all",
  });
}

export default async function OnThisDayPage({ params, searchParams }: DatePageProps) {
  const date = parseMonthDay((await params).date);
  if (!date) notFound();

  return <OnThisDayView date={date} scope={parseScope((await searchParams).scope)} />;
}
