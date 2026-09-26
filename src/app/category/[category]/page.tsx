import type { Metadata } from "next";
import { ArticleCards } from "@/components/article-cards";
import { ContentPage } from "@/components/content-page";
import { categoryLinks } from "@/lib/content";
import { categoryTitle, loadArticleCards, titleFromSlug } from "@/lib/articles";

type CategoryPageProps = {
  params: Promise<{ category: string }>;
};

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const title = titleFromSlug(category);
  return {
    title: `${title} — Past In Frames`,
    description: `Stories filed under ${title}.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const known = categoryLinks.find((item) => item.slug === category);
  const [title, { cards, error }] = await Promise.all([
    categoryTitle(category),
    loadArticleCards(category),
  ]);
  const label = known?.label ?? title;

  return (
    <ContentPage title={label} lede={`Stories filed under ${label}.`}>
      <ArticleCards
        articles={cards}
        error={error}
        empty={`Nothing in ${label} yet.`}
      />
    </ContentPage>
  );
}
