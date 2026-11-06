import { OnThisDayView } from "@/app/(site)/on-this-day-view";
import { monthDayFromIso, parseScope } from "@/lib/on-this-day";
import { todayIso } from "@/lib/story-dates";

type HomePageProps = {
  searchParams: Promise<{ scope?: string | string[] }>;
};

/** The home page is On This Day for today. */
export default async function HomePage({ searchParams }: HomePageProps) {
  const { scope } = await searchParams;
  return <OnThisDayView date={monthDayFromIso(todayIso())} scope={parseScope(scope)} />;
}
