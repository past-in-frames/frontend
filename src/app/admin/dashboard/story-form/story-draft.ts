"use client";

import { useState } from "react";
import type {
  StoryBlockInput,
  StoryInput,
  StoryMediaInput,
  StorySourceInput,
} from "../story-types";
import { isBlankSource, LIMITS } from "./story-validation";

type TextBlockType = "paragraph" | "heading";

export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+/, "")
    .slice(0, LIMITS.slug)
    .replace(/-+$/, "");
}

/**
 * Media keys wire a body block to its image. The editor mints them so nobody
 * has to invent one, or keep two sections in sync by hand.
 */
export function nextMediaKey(media: StoryMediaInput[], prefix: string) {
  const taken = new Set(media.map((item) => item.key));
  let counter = media.length + 1;
  while (taken.has(`${prefix}-${counter}`)) counter += 1;
  return `${prefix}-${counter}`;
}

export function emptyMedia(key: string, url = ""): StoryMediaInput {
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

/** Keys the body points at; everything else is only reachable from the editor. */
export function referencedKeys(body: StoryBlockInput[]) {
  return new Set(
    body.flatMap((block) => (block.type === "image" ? [block.mediaKey] : [])),
  );
}

/** Listings show the first stored image, so that row is the story's cover. */
export function coverIndex(media: StoryMediaInput[]) {
  return media.findIndex(
    (item) => item.type === "image" && item.url.trim() !== "",
  );
}

export function wordCount(body: StoryBlockInput[]) {
  return body.reduce((total, block) => {
    if (block.type === "image") return total;
    const words = block.text.trim().split(/\s+/).filter(Boolean);
    return total + words.length;
  }, 0);
}

/**
 * Trims the draft down to what is worth storing: half-typed rows and the
 * placeholders left behind by a cancelled upload are dropped instead of being
 * saved as empty records.
 */
export function cleanStory(story: StoryInput): StoryInput {
  const body = story.body.filter((block) =>
    block.type === "image"
      ? block.mediaKey.trim() !== ""
      : block.text.trim() !== "",
  );
  const used = referencedKeys(body);

  return {
    ...story,
    slug: story.slug.trim(),
    title: story.title.trim(),
    summary: story.summary.trim(),
    category: story.category.trim(),
    type: story.type.trim(),
    subtype: story.subtype.trim(),
    body,
    media: story.media.filter(
      (item) =>
        used.has(item.key) ||
        [item.url, item.altText, item.caption, item.credit].some((value) =>
          value.trim(),
        ),
    ),
    sources: story.sources.filter((source) => !isBlankSource(source)),
  };
}

function snapshot(story: StoryInput) {
  return JSON.stringify(cleanStory(story));
}

function withInserted<T>(list: T[], at: number, item: T) {
  const next = [...list];
  next.splice(at, 0, item);
  return next;
}

function withReplaced<T>(list: T[], at: number, item: T) {
  return list.map((current, index) => (index === at ? item : current));
}

function withoutIndex<T>(list: T[], at: number) {
  return list.filter((_, index) => index !== at);
}

export type StoryDraft = ReturnType<typeof useStoryDraft>;
export type DraftActions = StoryDraft["actions"];

/**
 * Holds the story being edited. Every action keeps the body, its media and the
 * cover consistent, because those three are one thing to the person editing.
 */
export function useStoryDraft(initial: StoryInput, mode: "create" | "edit") {
  const [story, setStory] = useState(initial);
  const [saved, setSaved] = useState(() => snapshot(initial));
  // A cover is only a cover once it has a URL, so the row waiting for an
  // upload has to be remembered or it looks like spare media for a moment.
  const [coverDraft, setCoverDraft] = useState("");
  // A new story's slug follows its title until the editor writes their own.
  const [slugFollowsTitle, setSlugFollowsTitle] = useState(
    mode === "create" && initial.slug === "",
  );

  function update(patch: Partial<StoryInput>) {
    setStory((current) => ({ ...current, ...patch }));
  }

  /** Frees the media row an image block owned, unless another block shares it. */
  function mediaWithout(body: StoryBlockInput[], key: string) {
    return referencedKeys(body).has(key)
      ? story.media
      : story.media.filter((item) => item.key !== key);
  }

  const actions = {
    update,

    setTitle(title: string) {
      update(slugFollowsTitle ? { title, slug: slugify(title) } : { title });
    },

    setSlug(slug: string) {
      setSlugFollowsTitle(false);
      update({ slug });
    },

    /** Returns the new block's media key so the caller can open a file picker. */
    insertBlock(at: number, type: StoryBlockInput["type"]) {
      if (type !== "image") {
        update({ body: withInserted(story.body, at, { type, text: "" }) });
        return "";
      }

      const key = nextMediaKey(story.media, "image");
      update({
        body: withInserted(story.body, at, { type: "image", mediaKey: key }),
        media: [...story.media, emptyMedia(key)],
      });
      return key;
    },

    setBlockText(at: number, text: string) {
      const block = story.body[at];
      if (!block || block.type === "image") return;
      update({ body: withReplaced(story.body, at, { type: block.type, text }) });
    },

    setBlockType(at: number, type: TextBlockType) {
      const block = story.body[at];
      if (!block || block.type === "image") return;
      update({
        body: withReplaced(story.body, at, { type, text: block.text }),
      });
    },

    duplicateBlock(at: number) {
      const block = story.body[at];
      if (!block) return;

      if (block.type !== "image") {
        update({ body: withInserted(story.body, at + 1, { ...block }) });
        return;
      }

      // The copy gets its own media row so captions can differ from the original.
      const source = story.media.find((item) => item.key === block.mediaKey);
      const key = nextMediaKey(story.media, "image");
      update({
        body: withInserted(story.body, at + 1, { type: "image", mediaKey: key }),
        media: [...story.media, source ? { ...source, key } : emptyMedia(key)],
      });
    },

    moveBlock(at: number, direction: -1 | 1) {
      const target = at + direction;
      if (target < 0 || target >= story.body.length) return;
      const block = story.body[at];
      update({
        body: withInserted(withoutIndex(story.body, at), target, block),
      });
    },

    removeBlock(at: number) {
      const block = story.body[at];
      const body = withoutIndex(story.body, at);
      update({
        body,
        ...(block?.type === "image"
          ? { media: mediaWithout(body, block.mediaKey) }
          : {}),
      });
    },

    patchMedia(at: number, patch: Partial<StoryMediaInput>) {
      update({
        media: story.media.map((item, index) =>
          index === at ? { ...item, ...patch } : item,
        ),
      });
    },

    /** Uploads finish long after the click, so this reads the latest draft. */
    setMediaUrl(key: string, url: string) {
      setStory((current) => ({
        ...current,
        media: current.media.map((item) =>
          item.key === key ? { ...item, url, type: "image" as const } : item,
        ),
      }));
    },

    removeMedia(at: number) {
      const item = story.media[at];
      if (!item) return;
      if (item.key === coverDraft) setCoverDraft("");
      update({
        media: withoutIndex(story.media, at),
        body: story.body.filter(
          (block) => block.type !== "image" || block.mediaKey !== item.key,
        ),
      });
    },

    addMedia(type: StoryMediaInput["type"]) {
      const key = nextMediaKey(story.media, type);
      update({ media: [...story.media, { ...emptyMedia(key), type }] });
      return key;
    },

    /** Adds an empty image at the front of the media list: the cover slot. */
    addCover() {
      const key = nextMediaKey(story.media, "cover");
      setCoverDraft(key);
      update({ media: [emptyMedia(key), ...story.media] });
      return key;
    },

    useAsCover(at: number) {
      const item = story.media[at];
      if (!item) return;
      update({ media: [item, ...withoutIndex(story.media, at)] });
    },

    addToBody(key: string) {
      update({ body: [...story.body, { type: "image", mediaKey: key }] });
    },

    addSource() {
      update({
        sources: [...story.sources, { title: "", url: "", publisher: "" }],
      });
    },

    patchSource(at: number, patch: Partial<StorySourceInput>) {
      update({
        sources: story.sources.map((item, index) =>
          index === at ? { ...item, ...patch } : item,
        ),
      });
    },

    removeSource(at: number) {
      update({ sources: withoutIndex(story.sources, at) });
    },
  };

  return {
    story,
    actions,
    coverDraft,
    dirty: snapshot(story) !== saved,
    /** Adopts what the API stored, so the form shows the saved story exactly. */
    markSaved(stored: StoryInput) {
      setStory(stored);
      setSaved(snapshot(stored));
      setSlugFollowsTitle(false);
      setCoverDraft("");
    },
  };
}
