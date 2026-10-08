import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PageHeader, PageShell } from "@/components/page-header";
import { StoryGrid } from "@/components/story-card";
import { StoryPagination } from "@/components/story-pagination";
import { getCategories, getStoriesPage, tryGet } from "@/lib/api";
import { CATEGORY_PAGE_SIZE, categoryPageHref, parsePageParam } from "@/lib/paging";
import { absoluteUrl } from "@/lib/site";
import { categoryLabel, categoryPath, categorySlug, labelFromSlug } from "@/lib/story-path";

type CategoryPageProps = {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
};

const sections = {
  science: "Science",
  history: "History",
} as const;

type SectionSlug = keyof typeof sections;

function sectionFromSlug(slug: string): SectionSlug | null {
  return slug === "science" || slug === "history" ? slug : null;
}

/** Categories are free text, so map the URL slug back to the stored value. */
async function resolveCategory(slug: string) {
  const { data: categories } = await tryGet(getCategories, []);
  return categories.find((category) => categorySlug(category.name) === slug)?.name;
}

export async function generateStaticParams() {
  const { data: categories } = await tryGet(getCategories, []);
  return categories.map((category) => ({ category: categorySlug(category.name) }));
}

export async function generateMetadata({ params, searchParams }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const { page } = parsePageParam((await searchParams).page);
  const section = sectionFromSlug(category);
  const name = section ? sections[section] : ((await resolveCategory(category)) ?? labelFromSlug(category));
  const label = categoryLabel(name);
  const path = categoryPath(name);

  return {
    title: page > 1 ? `${label} — Page ${page}` : label,
    description: `Stories filed under ${label}.`,
    alternates: { canonical: absoluteUrl(categoryPageHref(path, page)) },
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { category } = await params;
  const section = sectionFromSlug(category);
  const name = section ? sections[section] : await resolveCategory(category);
  if (!name) {
    notFound();
  }

  const path = categoryPath(name);
  const { page, redirectToFirst } = parsePageParam((await searchParams).page);
  if (redirectToFirst) {
    redirect(path);
  }

  const label = categoryLabel(name);
  const { data, error } = await tryGet(
    () =>
      getStoriesPage({
        ...(section ? { type: section } : { category: name }),
        limit: CATEGORY_PAGE_SIZE,
        offset: (page - 1) * CATEGORY_PAGE_SIZE,
      }),
    { stories: [], total: 0 },
  );

  const pageCount = data.total === 0 ? 0 : Math.ceil(data.total / CATEGORY_PAGE_SIZE);
  if (!error && pageCount > 0 && page > pageCount) {
    redirect(categoryPageHref(path, pageCount));
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
