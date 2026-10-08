import type { Metadata } from "next";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import { PageHeader, PageShell } from "@/components/page-header";
import { StoryGrid } from "@/components/story-card";
import { StoryPagination } from "@/components/story-pagination";
import { getStoriesPage, tryGet } from "@/lib/api";
import { CATEGORY_PAGE_SIZE, pageHref, parsePageParam } from "@/lib/paging";
import { absoluteUrl } from "@/lib/site";
import { sectionFromPath, sections, type SectionPath } from "@/lib/story-path";

type SectionPageProps = {
  params: Promise<{ section: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
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
    return { title: "Not found" };
  }

  const { page } = parsePageParam((await searchParams).page);
  const label = sections[section].label;
  const path = `/${section}`;

  return {
    title: page > 1 ? `${label} — Page ${page}` : label,
    description: `Stories filed under ${label}.`,
    alternates: { canonical: absoluteUrl(pageHref(path, page)) },
  };
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
  const { page, redirectToFirst } = parsePageParam((await searchParams).page);
  if (redirectToFirst) {
    redirect(path);
  }

  const label = sections[section].label;
  const { data, error } = await tryGet(
    () =>
      getStoriesPage({
        type: sections[section].type,
        limit: CATEGORY_PAGE_SIZE,
        offset: (page - 1) * CATEGORY_PAGE_SIZE,
      }),
    { stories: [], total: 0 },
  );

  const pageCount = data.total === 0 ? 0 : Math.ceil(data.total / CATEGORY_PAGE_SIZE);
  if (!error && pageCount > 0 && page > pageCount) {
    redirect(pageHref(path, pageCount));
  }

  return (
    <PageShell>
      <PageHeader title={label} lede={`Stories filed under ${label}.`} />
      {error ? (
        <p className="m-0 text-sm text-faded">{error}</p>
      ) : (
        <StoryGrid stories={data.stories} empty={`Nothing in ${label} yet.`} />
      )}
      {error ? null : <StoryPagination page={page} pageCount={pageCount} path={path} />}
    </PageShell>
  );
}
