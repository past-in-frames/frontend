import { notFound, permanentRedirect } from "next/navigation";

type LegacyCategoryProps = {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
};

/** Old section addresses used a `/category` prefix. */
export default async function LegacyCategoryRedirect({ params, searchParams }: LegacyCategoryProps) {
  const { category } = await params;
  const target =
    category === "science" || category === "history"
      ? `/${category}`
      : category === "other" || category === "others"
        ? "/others"
        : null;
  if (!target) {
    notFound();
  }

  const page = (await searchParams).page;
  const raw = Array.isArray(page) ? page[0] : page;
  if (raw && raw !== "1" && /^\d+$/.test(raw)) {
    permanentRedirect(`${target}?page=${raw}`);
  }

  permanentRedirect(target);
}
