"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { formatEventDate } from "@/lib/story-path";
import { Button, FormSection, Note, Segmented, TextAreaField, TextField } from "../story-form/controls";
import { slugify } from "../story-form/story-draft";

export type CollectionInput = {
  slug: string;
  title: string;
  description: string;
  coverUrl: string;
  status: "draft" | "published";
  sortOrder: number;
  /** Story slugs in reading order. */
  stories: string[];
};

export type StoryOption = { slug: string; title: string; eventDate: string };

export function blankCollection(): CollectionInput {
  return { slug: "", title: "", description: "", coverUrl: "", status: "draft", sortOrder: 0, stories: [] };
}

const IMAGE_TYPES = "image/jpeg,image/png,image/webp,image/gif,image/avif";

export function CollectionForm({
  initial,
  originalSlug,
  options,
}: {
  initial: CollectionInput;
  originalSlug?: string;
  options: StoryOption[];
}) {
  const router = useRouter();
  const [collection, setCollection] = useState(initial);
  const [slugFollowsTitle, setSlugFollowsTitle] = useState(!originalSlug && initial.slug === "");
  const [pending, setPending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const byslug = new Map(options.map((option) => [option.slug, option]));
  const available = options.filter((option) => !collection.stories.includes(option.slug));

  function patch(next: Partial<CollectionInput>) {
    setCollection((current) => ({ ...current, ...next }));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= collection.stories.length) return;
    const stories = [...collection.stories];
    [stories[index], stories[target]] = [stories[target], stories[index]];
    patch({ stories });
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setMessage(null);
    try {
      const response = await fetch(
        originalSlug ? `/api/admin/collections/${encodeURIComponent(originalSlug)}` : "/api/admin/collections",
        {
          method: originalSlug ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(collection),
        },
      );
      if (response.status === 401) {
        router.push("/admin");
        return;
      }
      const body = (await response.json().catch(() => null)) as (CollectionInput & { message?: string }) | null;
      if (!response.ok || !body) {
        setMessage({ tone: "error", text: body?.message ?? "Couldn't save the collection" });
        return;
      }
      setCollection(body);
      setMessage({ tone: "ok", text: "Saved." });
      router.refresh();
      if (body.slug !== originalSlug) router.replace(`/admin/dashboard/collections/${encodeURIComponent(body.slug)}`);
    } catch {
      setMessage({ tone: "error", text: "Couldn't reach the server" });
    } finally {
      setPending(false);
    }
  }

  async function onDelete() {
    if (!originalSlug || pending || !window.confirm(`Delete “${collection.title}”? Its stories stay.`)) return;
    setPending(true);
    try {
      const response = await fetch(`/api/admin/collections/${encodeURIComponent(originalSlug)}`, { method: "DELETE" });
      if (!response.ok) {
        setMessage({ tone: "error", text: "Couldn't delete the collection" });
        return;
      }
      router.push("/admin/dashboard/collections");
      router.refresh();
    } catch {
      setMessage({ tone: "error", text: "Couldn't reach the server" });
    } finally {
      setPending(false);
    }
  }

  async function onUpload(file: File) {
    setUploading(true);
    setMessage(null);
    try {
      const body = new FormData();
      body.append("file", file, file.name);
      const response = await fetch("/api/admin/uploads", { method: "POST", body });
      const uploaded = (await response.json().catch(() => null)) as { url?: string; message?: string } | null;
      if (!response.ok || !uploaded?.url) {
        setMessage({ tone: "error", text: uploaded?.message ?? "Couldn't upload the image" });
        return;
      }
      patch({ coverUrl: uploaded.url });
    } catch {
      setMessage({ tone: "error", text: "Couldn't reach the server" });
    } finally {
      setUploading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex max-w-4xl flex-col gap-5">
      <input
        ref={fileRef}
        type="file"
        accept={IMAGE_TYPES}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void onUpload(file);
        }}
      />

      <FormSection title="Details">
        <TextField
          label="Title"
          required
          value={collection.title}
          onChange={(title) => patch(slugFollowsTitle ? { title, slug: slugify(title) } : { title })}
          maxLength={191}
          autoComplete="off"
        />
        <TextAreaField
          label="Description"
          value={collection.description}
          onChange={(description) => patch({ description })}
          rows={2}
          hint="Optional. Shown at the top of the collection page."
        />
        <div className="grid gap-4 lg:grid-cols-2">
          <TextField
            label="Slug"
            required
            value={collection.slug}
            onChange={(slug) => {
              setSlugFollowsTitle(false);
              patch({ slug });
            }}
            maxLength={191}
            autoComplete="off"
            spellCheck={false}
            hint={collection.slug ? `Lives at /collections/${collection.slug}` : "Lowercase letters, numbers and hyphens."}
          />
          <TextField
            label="Order"
            type="number"
            value={String(collection.sortOrder)}
            onChange={(value) => patch({ sortOrder: Number.parseInt(value, 10) || 0 })}
            hint="Smaller numbers come first on the home page."
          />
          <Segmented
            label="Status"
            value={collection.status}
            onChange={(status) => patch({ status })}
            options={[
              { value: "draft", label: "Draft" },
              { value: "published", label: "Published" },
            ]}
          />
        </div>
      </FormSection>

      <FormSection title="Cover" description="Optional. Without one, the first story's cover is used.">
        <div className="grid gap-4 lg:grid-cols-[220px_1fr] lg:items-start">
          <div className="relative aspect-[1.65/1] w-full overflow-hidden border border-ink/15 bg-ink/5">
            {collection.coverUrl ? (
              <Image src={collection.coverUrl} alt="" fill sizes="220px" className="object-cover" />
            ) : null}
          </div>
          <div className="flex flex-col gap-3">
            <TextField
              label="Image URL"
              value={collection.coverUrl}
              onChange={(coverUrl) => patch({ coverUrl })}
              placeholder="https://"
            />
            <div className="flex gap-2">
              <Button size="small" onClick={() => fileRef.current?.click()} disabled={uploading}>
                {uploading ? "Uploading…" : "Upload image"}
              </Button>
              {collection.coverUrl ? (
                <Button size="small" variant="quiet" onClick={() => patch({ coverUrl: "" })}>
                  Remove
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </FormSection>

      <FormSection title="Stories" description="In the order readers see them.">
        {collection.stories.length === 0 ? <p className="m-0 text-sm text-faded">No stories yet.</p> : null}
        <ol className="m-0 flex list-none flex-col gap-2 p-0">
          {collection.stories.map((slug, index) => {
            const story = byslug.get(slug);
            return (
              <li key={slug} className="flex items-center gap-2 rounded-[10px] border border-ink/10 bg-white px-3 py-2">
                <span className="w-6 text-sm tabular-nums text-faded">{index + 1}</span>
                <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                  {story ? story.title : slug}
                  {story ? <span className="font-normal text-faded"> — {formatEventDate(story.eventDate)}</span> : null}
                </span>
                <Button size="small" variant="quiet" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Move up">
                  ↑
                </Button>
                <Button
                  size="small"
                  variant="quiet"
                  onClick={() => move(index, 1)}
                  disabled={index === collection.stories.length - 1}
                  aria-label="Move down"
                >
                  ↓
                </Button>
                <Button
                  size="small"
                  variant="danger"
                  onClick={() => patch({ stories: collection.stories.filter((item) => item !== slug) })}
                >
                  Remove
                </Button>
              </li>
            );
          })}
        </ol>
        <select
          value=""
          onChange={(event) => event.target.value && patch({ stories: [...collection.stories, event.target.value] })}
          aria-label="Add a story"
          className="h-11 w-full rounded-[10px] border border-ink/20 bg-white px-3 text-[15px] outline-none focus:border-accent-2"
        >
          <option value="">Add a story…</option>
          {available.map((option) => (
            <option key={option.slug} value={option.slug}>
              {option.title} ({option.eventDate.slice(0, 4)})
            </option>
          ))}
        </select>
        <Note>Only published stories show to readers, even if a draft is listed here.</Note>
      </FormSection>

      {message ? (
        <p
          role="alert"
          className={`m-0 rounded-[10px] px-3 py-2 text-[13px] font-semibold ${
            message.tone === "ok" ? "bg-teal-deep/10 text-teal-deep" : "bg-rust/10 text-rust"
          }`}
        >
          {message.text}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
        <Link href="/admin/dashboard/collections" className="text-sm font-semibold text-accent-2">
          ← All collections
        </Link>
        {originalSlug ? (
          <Button variant="danger" className="ml-auto" onClick={onDelete} disabled={pending}>
            Delete
          </Button>
        ) : null}
      </div>
    </form>
  );
}
