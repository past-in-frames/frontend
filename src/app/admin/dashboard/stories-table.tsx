"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { sectionLabel } from "@/lib/story-path";

export type AdminStory = {
  slug: string;
  title: string;
  summary: string;
  eventDate: string;
  type: string | null;
  status: string;
};

export function StoriesTable({ stories }: { stories: AdminStory[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [actionError, setActionError] = useState("");
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);
  const normalized = query.trim().toLowerCase();
  const visible = useMemo(() => {
    if (!normalized) return stories;
    return stories.filter((story) =>
      [story.title, story.summary, story.slug, story.type, story.status, story.eventDate, formatEventDate(story.eventDate)]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [normalized, stories]);

  async function onDelete(story: AdminStory) {
    if (pendingSlug) return;
    if (!window.confirm(`Delete “${story.title}”?`)) return;
    setPendingSlug(story.slug);
    setActionError("");
    try {
      const response = await fetch(`/api/admin/stories/${encodeURIComponent(story.slug)}`, {
        method: "DELETE",
      });
      if (response.status === 401) {
        router.push("/admin");
        return;
      }
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { message?: string } | null;
        setActionError(body?.message ?? "Couldn't delete the story");
        return;
      }
      router.refresh();
    } catch {
      setActionError("Couldn't reach the server");
    } finally {
      setPendingSlug(null);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search stories"
          aria-label="Search stories"
          className="h-11 w-full max-w-md rounded-[10px] border border-ink/20 bg-white px-4 font-sans text-[15px] outline-none"
        />
        <Link
          href="/admin/dashboard/new"
          className="inline-flex h-11 items-center rounded-[10px] bg-accent-2 px-5 text-sm font-semibold text-white"
        >
          New story
        </Link>
      </div>
      {actionError ? (
        <p className="m-0 text-sm text-rust" role="alert">
          {actionError}
        </p>
      ) : null}
      <p className="m-0 text-sm text-faded">
        {visible.length} {visible.length === 1 ? "story" : "stories"}
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr className="border-b border-ink/15 text-xs tracking-[0.08em] text-faded uppercase">
              <th className="py-3 pr-4 font-semibold">Title</th>
              <th className="py-3 pr-4 font-semibold">Section</th>
              <th className="py-3 pr-4 font-semibold">Date</th>
              <th className="py-3 pr-4 font-semibold">Status</th>
              <th className="py-3 pr-4 font-semibold">Slug</th>
              <th className="py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-sm text-muted">
                  No stories found.
                </td>
              </tr>
            ) : (
              visible.map((story) => (
                <tr key={story.slug} className="border-b border-ink/10 align-top">
                  <td className="max-w-[360px] py-4 pr-4">
                    <div className="font-serif text-[17px] leading-snug font-semibold">
                      {story.title}
                    </div>
                    <p className="m-0 mt-1 line-clamp-2 text-sm leading-relaxed text-muted">
                      {story.summary}
                    </p>
                  </td>
                  <td className="py-4 pr-4 text-sm text-body">{sectionLabel(story.type) || "—"}</td>
                  <td className="py-4 pr-4 text-sm whitespace-nowrap text-body">
                    {formatEventDate(story.eventDate)}
                  </td>
                  <td className="py-4 pr-4 text-sm text-body capitalize">{story.status}</td>
                  <td className="py-4 pr-4 font-mono text-xs text-faded">{story.slug}</td>
                  <td className="py-4 whitespace-nowrap">
                    <Link
                      href={`/admin/dashboard/${encodeURIComponent(story.slug)}/edit`}
                      className="mr-3 text-sm font-semibold text-accent-2"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => onDelete(story)}
                      disabled={pendingSlug === story.slug}
                      className="text-sm font-semibold text-rust disabled:opacity-60"
                    >
                      {pendingSlug === story.slug ? "Deleting…" : "Delete"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatEventDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}
