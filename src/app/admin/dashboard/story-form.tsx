"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import type {
  StoryBlockInput,
  StoryInput,
  StoryMediaInput,
  StorySourceInput,
} from "./story-types";

const controlClass =
  "w-full rounded-[10px] border border-ink/20 bg-white px-4 font-sans text-[15px] font-normal outline-none";

export function StoryForm({
  mode,
  initial,
  originalSlug,
}: {
  mode: "create" | "edit";
  initial: StoryInput;
  originalSlug?: string;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTarget = useRef<UploadTarget>("new");
  const [story, setStory] = useState(initial);
  const storyRef = useRef(story);
  storyRef.current = story;
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [uploading, setUploading] = useState(false);

  function update(patch: Partial<StoryInput>) {
    setStory((current) => ({ ...current, ...patch }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError("");

    const payload = cleanStory(story);
    const path =
      mode === "create"
        ? "/api/admin/stories"
        : `/api/admin/stories/${encodeURIComponent(originalSlug ?? story.slug)}`;

    try {
      const response = await fetch(path, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.status === 401) {
        router.push("/admin");
        return;
      }
      if (!response.ok) {
        setError(await readError(response, "Couldn't save the story"));
        return;
      }
      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Couldn't reach the server");
    } finally {
      setPending(false);
    }
  }

  async function onDelete() {
    if (!originalSlug || pending) return;
    if (!window.confirm(`Delete “${story.title || originalSlug}”?`)) return;
    setPending(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/stories/${encodeURIComponent(originalSlug)}`, {
        method: "DELETE",
      });
      if (response.status === 401) {
        router.push("/admin");
        return;
      }
      if (!response.ok) {
        setError(await readError(response, "Couldn't delete the story"));
        return;
      }
      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Couldn't reach the server");
    } finally {
      setPending(false);
    }
  }

  function chooseImage(target: UploadTarget) {
    uploadTarget.current = target;
    fileInputRef.current?.click();
  }

  async function onImageFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || uploading) return;

    const target = uploadTarget.current;
    const current = storyRef.current;
    setUploading(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file, file.name);
      if (mode === "edit" && originalSlug) {
        body.append("slug", originalSlug);
        const mediaKey = targetMediaKey(current, target);
        if (mediaKey) body.append("mediaKey", mediaKey);
      }
      const response = await fetch("/api/admin/uploads", { method: "POST", body });
      if (response.status === 401) {
        router.push("/admin");
        return;
      }
      if (!response.ok) {
        setError(await readError(response, "Couldn't upload the image"));
        return;
      }
      const uploaded = (await response.json()) as { url?: string; mediaKey?: string };
      if (!uploaded.url || !uploaded.mediaKey) {
        setError("Couldn't upload the image");
        return;
      }
      setStory((current) => applyUpload(current, target, uploaded.url!, uploaded.mediaKey!));
    } catch {
      setError("Couldn't reach the server");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-3xl flex-col gap-10">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        className="hidden"
        onChange={onImageFile}
      />
      <section className="grid gap-4 lg:grid-cols-2">
        <Field label="Title" className="lg:col-span-2">
          <input
            required
            value={story.title}
            onChange={(event) => update({ title: event.target.value })}
            className={`${controlClass} h-11`}
          />
        </Field>
        <Field label="Slug">
          <input
            required
            value={story.slug}
            onChange={(event) => update({ slug: event.target.value })}
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            className={`${controlClass} h-11`}
          />
        </Field>
        <Field label="Event date">
          <input
            required
            type="date"
            value={story.eventDate}
            onChange={(event) => update({ eventDate: event.target.value })}
            className={`${controlClass} h-11`}
          />
        </Field>
        <Field label="Category">
          <input
            required
            value={story.category}
            onChange={(event) => update({ category: event.target.value })}
            className={`${controlClass} h-11`}
          />
        </Field>
        <Field label="Status">
          <select
            value={story.status}
            onChange={(event) =>
              update({ status: event.target.value === "published" ? "published" : "draft" })
            }
            className={`${controlClass} h-11`}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </Field>
        <Field label="Summary" className="lg:col-span-2">
          <textarea
            required
            value={story.summary}
            onChange={(event) => update({ summary: event.target.value })}
            rows={4}
            className={`${controlClass} py-3`}
          />
        </Field>
        <Field label="Type">
          <input
            value={story.type}
            onChange={(event) => update({ type: event.target.value })}
            className={`${controlClass} h-11`}
          />
        </Field>
        <Field label="Subtype">
          <input
            value={story.subtype}
            onChange={(event) => update({ subtype: event.target.value })}
            className={`${controlClass} h-11`}
          />
        </Field>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="m-0 font-serif text-2xl font-semibold">Body</h2>
        {story.body.map((block, index) => (
          <div key={index} className="flex flex-col gap-3 rounded-2xl border border-ink/10 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={block.type}
                onChange={(event) =>
                  updateBlock(index, event.target.value as StoryBlockInput["type"])
                }
                aria-label={`Block ${index + 1} type`}
                className={`${controlClass} h-11 max-w-[180px]`}
              >
                <option value="paragraph">Paragraph</option>
                <option value="heading">Heading</option>
                <option value="image">Image</option>
              </select>
              <button
                type="button"
                onClick={() => moveBlock(index, -1)}
                disabled={index === 0}
                className="h-11 rounded-[10px] px-3 text-sm font-semibold text-muted disabled:opacity-40"
              >
                Up
              </button>
              <button
                type="button"
                onClick={() => moveBlock(index, 1)}
                disabled={index === story.body.length - 1}
                className="h-11 rounded-[10px] px-3 text-sm font-semibold text-muted disabled:opacity-40"
              >
                Down
              </button>
              <button
                type="button"
                onClick={() => removeAt("body", index)}
                className="ml-auto h-11 rounded-[10px] px-3 text-sm font-semibold text-rust"
              >
                Remove
              </button>
            </div>
            {block.type === "image" ? (
              <ImageBlockFields
                media={story.media.find((item) => item.key === block.mediaKey)}
                uploading={uploading}
                onUpload={() => chooseImage({ kind: "block", index })}
              />
            ) : (
              <textarea
                value={block.text}
                onChange={(event) =>
                  replaceBlock(index, { type: block.type, text: event.target.value })
                }
                rows={block.type === "heading" ? 2 : 4}
                aria-label={`Block ${index + 1} text`}
                className={`${controlClass} py-3`}
              />
            )}
          </div>
        ))}
        <div className="flex flex-wrap gap-2">
          <AddButton onClick={() => addBlock({ type: "paragraph", text: "" })}>Add paragraph</AddButton>
          <AddButton onClick={() => addBlock({ type: "heading", text: "" })}>Add heading</AddButton>
          <AddButton onClick={() => chooseImage("new")} disabled={uploading}>
            {uploading ? "Uploading…" : "Add image"}
          </AddButton>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="m-0 font-serif text-2xl font-semibold">Media</h2>
        {story.media.map((item, index) => (
          <div key={index} className="grid gap-3 rounded-2xl border border-ink/10 p-4 lg:grid-cols-2">
            <Field label="Type">
              <select
                value={item.type}
                onChange={(event) =>
                  patchMedia(index, { type: event.target.value === "video" ? "video" : "image" })
                }
                className={`${controlClass} h-11`}
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
            </Field>
            <Field label="URL" className="lg:col-span-2">
              <div className="flex flex-col gap-2">
                <input
                  value={item.url}
                  onChange={(event) => patchMedia(index, { url: event.target.value })}
                  placeholder="https://"
                  className={`${controlClass} h-11`}
                />
                <button
                  type="button"
                  onClick={() => chooseImage({ kind: "media", index })}
                  disabled={uploading}
                  className="h-11 self-start rounded-[10px] border border-ink/15 px-4 text-sm font-semibold disabled:opacity-60"
                >
                  {uploading ? "Uploading…" : "Upload image"}
                </button>
                {item.url ? <ImagePreview url={item.url} alt={item.altText} /> : null}
              </div>
            </Field>
            <Field label="Alt text" className="lg:col-span-2">
              <input
                value={item.altText}
                onChange={(event) => patchMedia(index, { altText: event.target.value })}
                className={`${controlClass} h-11`}
              />
            </Field>
            <Field label="Caption" className="lg:col-span-2">
              <input
                value={item.caption}
                onChange={(event) => patchMedia(index, { caption: event.target.value })}
                className={`${controlClass} h-11`}
              />
            </Field>
            <Field label="Credit" className="lg:col-span-2">
              <input
                value={item.credit}
                onChange={(event) => patchMedia(index, { credit: event.target.value })}
                className={`${controlClass} h-11`}
              />
            </Field>
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={item.isAiGenerated}
                onChange={(event) => patchMedia(index, { isAiGenerated: event.target.checked })}
              />
              AI generated
            </label>
            <button
              type="button"
              onClick={() => removeAt("media", index)}
              className="h-11 justify-self-start rounded-[10px] px-3 text-sm font-semibold text-rust lg:justify-self-end"
            >
              Remove media
            </button>
          </div>
        ))}
        <AddButton
          onClick={() =>
            update({
              media: [
                ...story.media,
                {
                  key: "",
                  type: "image",
                  url: "",
                  altText: "",
                  caption: "",
                  credit: "",
                  isAiGenerated: false,
                },
              ],
            })
          }
        >
          Add media
        </AddButton>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="m-0 font-serif text-2xl font-semibold">Sources</h2>
        {story.sources.map((source, index) => (
          <div key={index} className="grid gap-3 rounded-2xl border border-ink/10 p-4 lg:grid-cols-2">
            <Field label="Title" className="lg:col-span-2">
              <input
                value={source.title}
                onChange={(event) => patchSource(index, { title: event.target.value })}
                className={`${controlClass} h-11`}
              />
            </Field>
            <Field label="URL">
              <input
                value={source.url}
                onChange={(event) => patchSource(index, { url: event.target.value })}
                placeholder="https://"
                className={`${controlClass} h-11`}
              />
            </Field>
            <Field label="Publisher">
              <input
                value={source.publisher}
                onChange={(event) => patchSource(index, { publisher: event.target.value })}
                className={`${controlClass} h-11`}
              />
            </Field>
            <button
              type="button"
              onClick={() => removeAt("sources", index)}
              className="h-11 justify-self-start rounded-[10px] px-3 text-sm font-semibold text-rust"
            >
              Remove source
            </button>
          </div>
        ))}
        <AddButton
          onClick={() =>
            update({
              sources: [...story.sources, { title: "", url: "", publisher: "" }],
            })
          }
        >
          Add source
        </AddButton>
      </section>

      {error ? (
        <p className="m-0 text-sm text-rust" role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="h-11 rounded-[10px] bg-accent-2 px-5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save"}
        </button>
        {mode === "edit" ? (
          <button
            type="button"
            onClick={onDelete}
            disabled={pending}
            className="h-11 rounded-[10px] px-4 text-sm font-semibold text-rust disabled:opacity-60"
          >
            Delete
          </button>
        ) : null}
      </div>
    </form>
  );

  function replaceBlock(index: number, block: StoryBlockInput) {
    update({ body: story.body.map((item, itemIndex) => (itemIndex === index ? block : item)) });
  }

  function updateBlock(index: number, type: StoryBlockInput["type"]) {
    const current = story.body[index];
    if (!current || current.type === type) return;
    if (type === "image") {
      replaceBlock(index, { type: "image", mediaKey: "" });
      return;
    }
    const text = current.type === "image" ? "" : current.text;
    replaceBlock(index, { type, text });
  }

  function addBlock(block: StoryBlockInput) {
    update({ body: [...story.body, block] });
  }

  function moveBlock(index: number, direction: -1 | 1) {
    const next = index + direction;
    if (next < 0 || next >= story.body.length) return;
    const body = [...story.body];
    const [item] = body.splice(index, 1);
    if (!item) return;
    body.splice(next, 0, item);
    update({ body });
  }

  function patchMedia(index: number, patch: Partial<StoryMediaInput>) {
    update({
      media: story.media.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    });
  }

  function patchSource(index: number, patch: Partial<StorySourceInput>) {
    update({
      sources: story.sources.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    });
  }

  function removeAt(list: "body" | "media" | "sources", index: number) {
    if (list === "body") {
      update({ body: story.body.filter((_, itemIndex) => itemIndex !== index) });
      return;
    }
    if (list === "media") {
      update({ media: story.media.filter((_, itemIndex) => itemIndex !== index) });
      return;
    }
    update({ sources: story.sources.filter((_, itemIndex) => itemIndex !== index) });
  }
}

type UploadTarget = "new" | { kind: "block"; index: number } | { kind: "media"; index: number };

function targetMediaKey(story: StoryInput, target: UploadTarget) {
  if (target === "new") return "";
  if (target.kind === "media") return story.media[target.index]?.key.trim() ?? "";
  const block = story.body[target.index];
  return block?.type === "image" ? block.mediaKey.trim() : "";
}

function applyUpload(story: StoryInput, target: UploadTarget, url: string, mediaKey: string): StoryInput {
  if (target === "new") {
    return {
      ...story,
      body: [...story.body, { type: "image", mediaKey }],
      media: [...story.media, emptyMedia(mediaKey, url)],
    };
  }

  if (target.kind === "media") {
    return {
      ...story,
      media: story.media.map((item, index) =>
        index === target.index
          ? { ...item, url, type: "image", key: item.key.trim() || mediaKey }
          : item,
      ),
    };
  }

  const block = story.body[target.index];
  if (!block || block.type !== "image") return story;
  const key = block.mediaKey.trim() || mediaKey;
  const media = story.media.some((item) => item.key === key)
    ? story.media.map((item) => (item.key === key ? { ...item, url, type: "image" as const } : item))
    : [...story.media, emptyMedia(key, url)];

  return {
    ...story,
    body: story.body.map((item, index) =>
      index === target.index ? { type: "image", mediaKey: key } : item,
    ),
    media,
  };
}

function emptyMedia(key: string, url: string): StoryMediaInput {
  return {
    key,
    type: "image",
    url,
    altText: "",
    caption: "",
    credit: "",
    isAiGenerated: false,
  };
}

function ImageBlockFields({
  media,
  uploading,
  onUpload,
}: {
  media: StoryMediaInput | undefined;
  uploading: boolean;
  onUpload: () => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={onUpload}
        disabled={uploading}
        className="h-11 self-start rounded-[10px] border border-ink/15 px-4 text-sm font-semibold disabled:opacity-60"
      >
        {uploading ? "Uploading…" : "Upload image"}
      </button>
      {media?.url ? <ImagePreview url={media.url} alt={media.altText} /> : null}
    </div>
  );
}

function ImagePreview({ url, alt }: { url: string; alt: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={alt || "Uploaded image"}
      className="h-40 w-full rounded-2xl object-cover"
    />
  );
}

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-1.5 text-sm font-semibold ${className ?? ""}`}>
      {label}
      {children}
    </label>
  );
}

function AddButton({
  onClick,
  children,
  disabled = false,
}: {
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="h-11 self-start rounded-[10px] border border-ink/15 px-4 text-sm font-semibold disabled:opacity-60"
    >
      {children}
    </button>
  );
}

function cleanStory(story: StoryInput): StoryInput {
  return {
    ...story,
    body: story.body.filter((block) =>
      block.type === "image" ? block.mediaKey.trim() !== "" : block.text.trim() !== "",
    ),
    media: story.media.filter((item) =>
      [item.key, item.url, item.altText, item.caption, item.credit].some((value) => value.trim()),
    ),
    sources: story.sources.filter((source) =>
      [source.title, source.url, source.publisher].some((value) => value.trim()),
    ),
  };
}

async function readError(response: Response, fallback: string) {
  const body = (await response.json().catch(() => null)) as { message?: string } | null;
  return body?.message ?? fallback;
}
