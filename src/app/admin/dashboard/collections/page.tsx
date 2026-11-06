import type { Metadata } from "next";
import Link from "next/link";
import { loadAdmin } from "@/lib/admin-proxy";

export const metadata: Metadata = {
  title: "Collections",
  robots: { index: false, follow: false },
};

type AdminCollection = { slug: string; title: string; status: string; sortOrder: number; storyCount: number };

export default async function AdminCollectionsPage() {
  const result = await loadAdmin<AdminCollection[]>("/api/admin/collections");

  return (
    <main className="min-h-screen px-[18px] py-8 lg:px-16 lg:py-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Link href="/admin/dashboard" className="text-sm font-semibold text-accent-2">
            ← Dashboard
          </Link>
          <h1 className="m-0 font-serif text-[34px] leading-[1.08] font-bold tracking-[-0.01em] lg:text-5xl">
            Collections
          </h1>
        </div>
        <Link
          href="/admin/dashboard/collections/new"
          className="inline-flex h-11 items-center rounded-[10px] bg-accent-2 px-5 text-sm font-semibold text-white"
        >
          New collection
        </Link>
      </div>
      {!result.ok ? (
        <p className="m-0 text-sm text-rust">{result.error}</p>
      ) : result.data.length === 0 ? (
        <p className="m-0 text-sm text-muted">No collections yet.</p>
      ) : (
        <table className="w-full max-w-4xl border-collapse text-left">
          <thead>
            <tr className="border-b border-ink/15 text-xs tracking-[0.08em] text-faded uppercase">
              <th className="py-3 pr-4 font-semibold">Title</th>
              <th className="py-3 pr-4 font-semibold">Stories</th>
              <th className="py-3 pr-4 font-semibold">Order</th>
              <th className="py-3 pr-4 font-semibold">Status</th>
              <th className="py-3 font-semibold" />
            </tr>
          </thead>
          <tbody>
            {result.data.map((collection) => (
              <tr key={collection.slug} className="border-b border-ink/10">
                <td className="py-4 pr-4 font-serif text-[17px] font-semibold">{collection.title}</td>
                <td className="py-4 pr-4 text-sm">{collection.storyCount}</td>
                <td className="py-4 pr-4 text-sm">{collection.sortOrder}</td>
                <td className="py-4 pr-4 text-sm capitalize">{collection.status}</td>
                <td className="py-4 text-sm font-semibold text-accent-2">
                  <Link href={`/admin/dashboard/collections/${encodeURIComponent(collection.slug)}`}>Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
