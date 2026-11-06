import type { Metadata } from "next";
import Link from "next/link";
import { loadAdmin } from "@/lib/admin-proxy";
import { LogoutButton } from "./logout-button";
import { StoriesTable, type AdminStory } from "./stories-table";
import { YoutubeSyncButton } from "./youtube-sync-button";

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
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard/collections" className="text-sm font-semibold text-accent-2">
            Collections
          </Link>
          <YoutubeSyncButton />
          <LogoutButton />
        </div>
      </div>
      {result.ok ? (
        <StoriesTable stories={result.data} />
      ) : (
        <p className="m-0 text-sm text-rust">{result.error}</p>
      )}
    </main>
  );
}
