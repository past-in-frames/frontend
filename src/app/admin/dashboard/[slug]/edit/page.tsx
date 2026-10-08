import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { loadAdmin } from "@/lib/admin-proxy";
import { StoryForm } from "../../story-form";
import type { StoryInput } from "../../story-types";

export const metadata: Metadata = {
  title: "Edit story",
  robots: { index: false, follow: false },
};

export default async function EditStoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await loadAdmin<StoryInput>(`/api/admin/stories/${encodeURIComponent(slug)}`);

  if (!result.ok && result.status === 404) {
    notFound();
  }

  if (!result.ok) {
    return (
      <main className="min-h-screen px-[18px] py-8 lg:px-16 lg:py-12">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h1 className="m-0 font-serif text-[34px] leading-[1.08] font-semibold tracking-[-0.01em] lg:text-5xl">
            Edit story
          </h1>
          <Link
            href="/admin/dashboard"
            className="text-sm font-semibold text-accent-2"
          >
            Back
          </Link>
        </div>
        <p className="m-0 text-sm text-rust">{result.error}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <StoryForm
        mode="edit"
        initial={result.data}
        originalSlug={slug}
      />
    </main>
  );
}
