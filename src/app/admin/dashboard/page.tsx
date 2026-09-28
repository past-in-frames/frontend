import type { Metadata } from "next";
import { loadAdmin } from "@/lib/admin-proxy";
import { LogoutButton } from "./logout-button";
import { StoriesTable, type AdminStory } from "./stories-table";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage() {
  const result = await loadAdmin<AdminStory[]>("/api/admin/stories");

  return (
    <main className="min-h-screen px-[18px] py-8 lg:px-16 lg:py-12">
      <div className="mb-8 flex items-end justify-between gap-4">
        <h1 className="m-0 font-serif text-[34px] leading-[1.08] font-semibold tracking-[-0.01em] lg:text-5xl">
          Dashboard
        </h1>
        <LogoutButton />
      </div>
      {result.ok ? (
        <StoriesTable stories={result.data} />
      ) : (
        <p className="m-0 text-sm text-rust">{result.error}</p>
      )}
    </main>
  );
}
