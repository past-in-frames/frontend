import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PageHeader, PageShell } from "@/components/page-header";
import { StoryGrid } from "@/components/story-card";
import { StoryPagination } from "@/components/story-pagination";
import { getStoriesPage, tryGet } from "@/lib/api";
import { CATEGORY_PAGE_SIZE, pageHref, parsePageParam } from "@/lib/paging";
import { absoluteUrl } from "@/lib/site";

const TOPICS = {
  people: { label: "People", lede: "The people behind the moments." },
  places: { label: "Places", lede: "Where it happened." },
  eras: { label: "Eras", lede: "The ages that shaped what came next." },
  science: { label: "Science", lede: "Discoveries, missions and the people who made them." },
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

export async function generateMetadata({ params }: TopicPageProps): Promise<Metadata> {
  const topic = resolveTopic((await params).topic);
  if (!topic) return { title: "Not found" };
  return {
    title: TOPICS[topic].label,
    description: TOPICS[topic].lede,
    alternates: { canonical: absoluteUrl(`/explore/${topic}`) },
  };
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
      <PageHeader title={TOPICS[topic].label} lede={TOPICS[topic].lede} />
      {error ? (
        <p className="m-0 text-sm text-faded">{error}</p>
      ) : (
        <StoryGrid stories={data.stories} empty={`Nothing filed under ${TOPICS[topic].label} yet.`} />
      )}
      {error ? null : <StoryPagination page={page} pageCount={pageCount} path={path} />}
    </PageShell>
  );
}
