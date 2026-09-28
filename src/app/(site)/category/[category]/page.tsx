import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader, PageShell } from "@/components/page-header";
import { StoryGrid } from "@/components/story-card";
import { getCategories, getStories, tryGet } from "@/lib/api";
import { absoluteUrl } from "@/lib/site";
import { categoryLabel, categoryPath, categorySlug, labelFromSlug } from "@/lib/story-path";

type CategoryPageProps = { params: Promise<{ category: string }> };

/** Categories are free text, so map the URL slug back to the stored value. */
async function resolveCategory(slug: string) {
  const { data: categories } = await tryGet(getCategories, []);
  return categories.find((category) => categorySlug(category.name) === slug)?.name;
}

export async function generateStaticParams() {
  const { data: categories } = await tryGet(getCategories, []);
  return categories.map((category) => ({ category: categorySlug(category.name) }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const name = (await resolveCategory(category)) ?? labelFromSlug(category);
  const label = categoryLabel(name);

  return {
    title: label,
    description: `Stories filed under ${label}.`,
    alternates: { canonical: absoluteUrl(categoryPath(name)) },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const name = await resolveCategory(category);
  if (!name) {
    notFound();
  }

  const label = categoryLabel(name);
  const { data: stories, error } = await tryGet(() => getStories(name), []);

  return (
    <PageShell>
      <PageHeader title={label} lede={`Stories filed under ${label}.`} />
      {error ? (
        <p className="m-0 text-sm text-faded">{error}</p>
      ) : (
        <StoryGrid stories={stories} empty={`Nothing in ${label} yet.`} />
      )}
    </PageShell>
  );
}
