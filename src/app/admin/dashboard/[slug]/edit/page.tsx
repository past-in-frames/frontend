import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { apiOrigin } from "@/lib/api";
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
  const token = (await cookies()).get("admin_session")?.value;
  if (!token) {
    redirect("/admin");
  }

  let response: Response | null = null;
  try {
    response = await fetch(`${apiOrigin()}/api/admin/stories/${encodeURIComponent(slug)}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  } catch {
    return (
      <main className="min-h-screen px-[18px] py-8 lg:px-16 lg:py-12">
        <p className="m-0 text-sm text-rust">Couldn&apos;t load this story</p>
      </main>
    );
  }

  if (response.status === 401) {
    redirect("/admin");
  }
  if (response.status === 404) {
    notFound();
  }
  if (!response.ok) {
    return (
      <main className="min-h-screen px-[18px] py-8 lg:px-16 lg:py-12">
        <p className="m-0 text-sm text-rust">Couldn&apos;t load this story</p>
      </main>
    );
  }

  const story = (await response.json()) as StoryInput;

  return (
    <main className="min-h-screen px-[18px] py-8 lg:px-16 lg:py-12">
      <div className="mb-8 flex items-end justify-between gap-4">
        <h1 className="m-0 font-serif text-[34px] leading-[1.08] font-semibold tracking-[-0.01em] lg:text-5xl">
          Edit story
        </h1>
        <Link href="/admin/dashboard" className="text-sm font-semibold text-accent-2">
          Back
        </Link>
      </div>
      <StoryForm mode="edit" initial={story} originalSlug={slug} />
    </main>
  );
}
