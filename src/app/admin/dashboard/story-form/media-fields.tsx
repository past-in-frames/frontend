"use client";

import { useState, type ReactNode } from "react";
import { Button, Checkbox, TextField } from "./controls";
import { useEditor } from "./editor-context";

/**
 * The picture itself: drop a file on it, or click through to a file dialog.
 * Uploads are keyed by media key so one image uploading never blocks another.
 */
export function ImageDrop({
  mediaKey = "",
  createKey,
  url,
  alt,
  height = "h-40",
  actions,
}: {
  mediaKey?: string;
  /** Used when there is nothing to upload into yet, such as an empty cover. */
  createKey?: () => string;
  url: string;
  alt: string;
  height?: string;
  actions?: ReactNode;
}) {
  const { uploadingKey, openPicker, uploadFile } = useEditor();
  const [dragging, setDragging] = useState(false);
  const busy = mediaKey !== "" && uploadingKey === mediaKey;

  function target() {
    return mediaKey || createKey?.() || "";
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          const file = event.dataTransfer.files[0];
          const key = target();
          if (file && key) uploadFile(key, file);
        }}
        className={`flex ${height} items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-colors ${
          dragging ? "border-accent-2 bg-accent-2/5" : "border-ink/15 bg-white"
        }`}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={alt || "Story image"}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="px-3 text-center text-[13px] text-faded">
            {busy ? "Uploading…" : "Drop an image here"}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          size="small"
          onClick={() => {
            const key = target();
            if (key) openPicker(key);
          }}
          disabled={busy}
        >
          {busy ? "Uploading…" : url ? "Replace image" : "Upload image"}
        </Button>
        {actions}
      </div>
    </div>
  );
}

/** Everything about an image except the file: what it shows and who made it. */
export function MediaDetails({
  index,
  showCaption = true,
  showUrl = true,
}: {
  index: number;
  showCaption?: boolean;
  showUrl?: boolean;
}) {
  const { story, actions, errors } = useEditor();
  const media = story.media[index];
  if (!media) return null;

  return (
    <div className="flex flex-col gap-3">
      <TextField
        label="Alt text"
        value={media.altText}
        onChange={(altText) => actions.patchMedia(index, { altText })}
        placeholder="What the picture shows"
        hint={
          media.url && !media.altText.trim()
            ? "Describe it for readers who can't see it."
            : undefined
        }
      />
      {showCaption ? (
        <div className="grid gap-3 lg:grid-cols-2">
          <TextField
            label="Caption"
            value={media.caption}
            onChange={(caption) => actions.patchMedia(index, { caption })}
            placeholder="Printed under the image"
          />
          <TextField
            label="Credit"
            value={media.credit}
            onChange={(credit) => actions.patchMedia(index, { credit })}
            placeholder="Photographer or archive"
          />
        </div>
      ) : null}
      {showUrl ? (
        <TextField
          label="Image URL"
          value={media.url}
          onChange={(url) => actions.patchMedia(index, { url })}
          error={errors[`media.${index}.url`]}
          placeholder="https://"
          hint="Filled in by the upload. Paste a link to use an image hosted elsewhere."
        />
      ) : null}
      <Checkbox
        label="AI generated"
        checked={media.isAiGenerated}
        onChange={(isAiGenerated) =>
          actions.patchMedia(index, { isAiGenerated })
        }
      />
    </div>
  );
}
