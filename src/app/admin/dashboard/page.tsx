import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { apiOrigin } from "@/lib/api";
import { StoriesTable, type AdminStory } from "./stories-table";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage() {
  const token = (await cookies()).get("admin_session")?.value;
  if (!token) {
    redirect("/admin");
  }

  let stories: AdminStory[] | null = null;
  let error = "";
  let response: Response | null = null;

  try {
    response = await fetch(`${apiOrigin()}/api/admin/stories`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  } catch {
    error = "Couldn't load stories";
  }

  if (response?.status === 401) {
    redirect("/admin");
  }

  if (response?.ok) {
    stories = (await response.json()) as AdminStory[];
  } else if (response) {
    error = "Couldn't load stories";
  }

  return (
    <main className="min-h-screen px-[18px] py-8 lg:px-16 lg:py-12">
      <h1 className="m-0 mb-8 font-serif text-[34px] leading-[1.08] font-semibold tracking-[-0.01em] lg:text-5xl">
        Dashboard
      </h1>
      {stories ? (
        <StoriesTable stories={stories} />
      ) : (
        <p className="m-0 text-sm text-rust">{error}</p>
      )}
    </main>
  );
}
