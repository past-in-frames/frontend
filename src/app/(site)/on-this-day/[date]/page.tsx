import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OnThisDayView } from "@/app/(site)/on-this-day-view";
import { longMonthDay, monthDayKey, parseMonthDay, parseScope } from "@/lib/on-this-day";
import { absoluteUrl } from "@/lib/site";

type DatePageProps = {
  params: Promise<{ date: string }>;
  searchParams: Promise<{ scope?: string | string[] }>;
};

export async function generateMetadata({ params, searchParams }: DatePageProps): Promise<Metadata> {
  const date = parseMonthDay((await params).date);
  if (!date) return { title: "Not found" };

  const label = longMonthDay(date);
  const filtered = parseScope((await searchParams).scope) !== "all";
  return {
    title: `On This Day — ${label}`,
    description: `What happened on ${label}, in stories with their sources.`,
    alternates: { canonical: absoluteUrl(`/on-this-day/${monthDayKey(date)}`) },
    ...(filtered ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function OnThisDayPage({ params, searchParams }: DatePageProps) {
  const date = parseMonthDay((await params).date);
  if (!date) notFound();

  return <OnThisDayView date={date} scope={parseScope((await searchParams).scope)} />;
}
