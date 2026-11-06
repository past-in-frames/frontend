import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PageHeader, PageShell } from "@/components/page-header";
import { StoryGrid } from "@/components/story-card";
import { StoryPagination } from "@/components/story-pagination";
import { getStoriesPage, tryGet } from "@/lib/api";
import { CATEGORY_PAGE_SIZE, pageHref, parsePageParam } from "@/lib/paging";
import { pageMetadata } from "@/lib/seo";

const TOPICS = {
  people: {
    label: "People",
    title: "People in History",
    lede: "The people behind the moments: leaders, scientists, explorers and ordinary people whose choices changed what came next.",
    description:
      "Stories about the people who shaped history: leaders, scientists, explorers and artists, with the events and dates tied to each of them.",
  },
  places: {
    label: "Places",
    title: "Historic Places and Landmarks",
    lede: "Where it happened: the bridges, cities, buildings and landscapes that became the setting for history.",
    description:
      "Stories about historic places and landmarks: the cities, buildings, bridges and disaster sites where major events took place.",
  },
  eras: {
    label: "Eras",
    title: "Wars, Revolutions and Turning Points",
    lede: "The ages that shaped what came next: wars, revolutions, treaties and the turning points between them.",
    description:
      "Stories from the great eras of history: wars, revolutions, empires, treaties and the turning points that divided one age from the next.",
  },
  science: {
    label: "Science",
    title: "Science and Space History",
    lede: "Discoveries, missions and the people who made them, from early observatories to the space age.",
    description:
      "Science and space history: discoveries, inventions, missions and experiments, told in short stories with their sources.",
  },
} as const;

type TopicName = keyof typeof TOPICS;

type TopicPageProps = {
  params: Promise<{ topic: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
};

function resolveTopic(value: string): TopicName | null {
  return value in TOPICS ? (value as TopicName) : null;
}

export function generateStaticParams() {
  return Object.keys(TOPICS).map((topic) => ({ topic }));
}

export async function generateMetadata({ params, searchParams }: TopicPageProps): Promise<Metadata> {
  const topic = resolveTopic((await params).topic);
  if (!topic) return { title: "Not found", robots: { index: false } };

  const { page } = parsePageParam((await searchParams).page);
  return pageMetadata({
    title: page > 1 ? `${TOPICS[topic].title} — Page ${page}` : TOPICS[topic].title,
    description: TOPICS[topic].description,
    path: pageHref(`/explore/${topic}`, page),
  });
}

export default async function TopicPage({ params, searchParams }: TopicPageProps) {
  const { topic: param } = await params;
  const topic = resolveTopic(param);
  if (!topic) notFound();

  const path = `/explore/${topic}`;
  const { page, redirectToFirst } = parsePageParam((await searchParams).page);
  if (redirectToFirst) redirect(pageHref(path, 1));

  const { data, error } = await tryGet(
    () => getStoriesPage({ topic, limit: CATEGORY_PAGE_SIZE, offset: (page - 1) * CATEGORY_PAGE_SIZE }),
    { stories: [], total: 0 },
  );
  const pageCount = data.total === 0 ? 0 : Math.ceil(data.total / CATEGORY_PAGE_SIZE);
  if (!error && pageCount > 0 && page > pageCount) redirect(pageHref(path, pageCount));

  return (
    <PageShell>
      <PageHeader title={TOPICS[topic].title} lede={TOPICS[topic].lede} />
      {error ? (
        <p className="m-0 text-sm text-faded">{error}</p>
      ) : (
        <StoryGrid stories={data.stories} empty={`Nothing filed under ${TOPICS[topic].label} yet.`} />
      )}
      {error ? null : <StoryPagination page={page} pageCount={pageCount} path={path} />}
    </PageShell>
  );
}
