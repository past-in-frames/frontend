import type { Metadata } from "next";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import { PageHeader, PageShell } from "@/components/page-header";
import { StoryGrid } from "@/components/story-card";
import { StoryDateFilter } from "@/components/story-date-filter";
import { StoryPagination } from "@/components/story-pagination";
import { StorySortBar } from "@/components/story-sort-bar";
import { getStoriesPage, tryGet } from "@/lib/api";
import { CATEGORY_PAGE_SIZE, pageHref, parsePageParam } from "@/lib/paging";
import { pageMetadata } from "@/lib/seo";
import { parseStoryDates, resolveStoryWindow, todayIso } from "@/lib/story-dates";
import { sectionFromPath, sections, type SectionPath } from "@/lib/story-path";
import { DEFAULT_STORY_SORT, parseStorySort } from "@/lib/story-sort";

type SectionPageProps = {
  params: Promise<{ section: string }>;
  searchParams: Promise<{
    page?: string | string[];
    sort?: string | string[];
    from?: string | string[];
    to?: string | string[];
  }>;
};

/** What each section is about, in the words a searcher would use. */
const SECTION_SEO: Record<SectionPath, { title: string; heading: string; description: string }> = {
  science: {
    title: "Science and Space Stories",
    heading: "Science and Space Stories",
    description:
      "Science and space history: discoveries, missions and experiments, told in short, well-sourced stories with the sources left in plain sight.",
  },
  history: {
    title: "History Stories",
    heading: "History Stories",
    description:
      "History stories about wars, treaties, inventions and turning points, one date at a time, each short and each with sources you can check.",
  },
  others: {
    title: "Miscellaneous and Interesting Stories",
    heading: "Miscellaneous & Interesting Stories",
    description:
      "Mysteries, trials, curiosities and the unexplained from history, written plainly and with sources, so you can tell what is known from what is legend.",
  },
};

function resolveSection(param: string): SectionPath | null {
  if (param === "other") return "others";
  return sectionFromPath(param);
}

export function generateStaticParams() {
  return Object.keys(sections).map((section) => ({ section }));
}

export async function generateMetadata({ params, searchParams }: SectionPageProps): Promise<Metadata> {
  const section = resolveSection((await params).section);
  if (!section) {
    return { title: "Not found", robots: { index: false } };
  }

  const query = await searchParams;
  const { page } = parsePageParam(query.page);
  const sort = parseStorySort(query.sort);
  const dates = parseStoryDates(query);
  const today = todayIso();
  const storyWindow = resolveStoryWindow(dates, today);
  const seo = SECTION_SEO[section];
  const custom = sort !== DEFAULT_STORY_SORT || Boolean(dates.from || dates.to);

  return pageMetadata({
    title: page > 1 ? `${seo.title} — Page ${page}` : seo.title,
    description: seo.description,
    path: pageHref(`/${section}`, page, sort, { ...storyWindow, today }),
    noindex: custom,
  });
}

export default async function SectionPage({ params, searchParams }: SectionPageProps) {
  const { section: param } = await params;
  if (param === "other") {
    permanentRedirect("/others");
  }

  const section = sectionFromPath(param);
  if (!section) {
    notFound();
  }

  const path = `/${section}`;
  const query = await searchParams;
  const { page, redirectToFirst } = parsePageParam(query.page);
  const sort = parseStorySort(query.sort);
  const today = todayIso();
  const dates = parseStoryDates(query);
  const storyWindow = resolveStoryWindow(dates, today);
  const dateHref = { from: storyWindow.from, to: storyWindow.to, today };
  if (redirectToFirst) {
    redirect(pageHref(path, 1, sort, dateHref));
  }

  const label = sections[section].label;
  const { data, error } = await tryGet(
    () =>
      getStoriesPage({
        type: sections[section].type,
        limit: CATEGORY_PAGE_SIZE,
        offset: (page - 1) * CATEGORY_PAGE_SIZE,
        sort,
        from: storyWindow.from,
        to: storyWindow.to,
      }),
    { stories: [], total: 0 },
  );

  const pageCount = data.total === 0 ? 0 : Math.ceil(data.total / CATEGORY_PAGE_SIZE);
  if (!error && pageCount > 0 && page > pageCount) {
    redirect(pageHref(path, pageCount, sort, dateHref));
  }

  const filtered = Boolean(dates.from || dates.to);

  return (
    <PageShell>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <PageHeader title={SECTION_SEO[section].heading} lede={SECTION_SEO[section].description} />
        <div className="flex flex-wrap items-center gap-3">
          <StoryDateFilter path={path} sort={sort} from={dates.from} to={dates.to} today={today} />
          <StorySortBar path={path} sort={sort} from={storyWindow.from} to={storyWindow.to} today={today} />
        </div>
      </div>
      {error ? (
        <p className="m-0 text-sm text-faded">{error}</p>
      ) : (
        <StoryGrid
          stories={data.stories}
          empty={filtered ? `Nothing in ${label} for this range.` : `Nothing in ${label} yet.`}
        />
      )}
      {error ? null : (
        <StoryPagination
          page={page}
          pageCount={pageCount}
          path={path}
          sort={sort}
          from={storyWindow.from}
          to={storyWindow.to}
          today={today}
        />
      )}
    </PageShell>
  );
}
