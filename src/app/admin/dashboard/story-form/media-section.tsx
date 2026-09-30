"use client";

import { Button, FormSection, Note, TextField } from "./controls";
import { useEditor } from "./editor-context";
import { ImageDrop, MediaDetails } from "./media-fields";
import { coverIndex, referencedKeys } from "./story-draft";

/**
 * Whatever the body and the cover do not claim. Mostly video rows and images
 * imported with a story, which would otherwise be impossible to reach.
 */
export function MediaSection() {
  const { story, actions, coverDraft } = useEditor();
  const used = referencedKeys(story.body);
  const cover = coverIndex(story.media);
  const leftovers = story.media
    .map((item, index) => ({ item, index }))
    .filter(
      ({ item, index }) =>
        index !== cover && item.key !== coverDraft && !used.has(item.key),
    );

  return (
    <FormSection
      title="Other media"
      description="Stored with the story but not used by the cover or the body."
      actions={
        <Button size="small" onClick={() => actions.addMedia("video")}>
          Add video
        </Button>
      }
    >
      {leftovers.length === 0 ? (
        <p className="m-0 text-sm text-faded">
          Nothing spare — every image is in the cover or the body.
        </p>
      ) : null}
      {leftovers.map(({ item, index }) => (
        <div
          key={item.key}
          className="flex flex-col gap-3 rounded-2xl border border-ink/10 bg-white p-3 lg:p-4"
        >
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={item.type}
              onChange={(event) =>
                actions.patchMedia(index, {
                  type: event.target.value === "video" ? "video" : "image",
                })
              }
              aria-label={`Kind of ${item.key}`}
              className="h-8 rounded-[8px] border border-ink/20 bg-white px-2 text-[13px] font-semibold outline-none focus:border-accent-2"
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
            <span className="font-mono text-xs text-pale">{item.key}</span>
            <div className="ml-auto flex gap-1">
              {item.type === "image" ? (
                <>
                  <Button
                    size="small"
                    variant="quiet"
                    onClick={() => actions.addToBody(item.key)}
                  >
                    Add to body
                  </Button>
                  <Button
                    size="small"
                    variant="quiet"
                    onClick={() => actions.useAsCover(index)}
                    disabled={!item.url.trim()}
                  >
                    Make cover
                  </Button>
                </>
              ) : null}
              <Button
                size="small"
                variant="danger"
                onClick={() => actions.removeMedia(index)}
              >
                Remove
              </Button>
            </div>
          </div>
          {item.type === "image" ? (
            <div className="grid gap-4 lg:grid-cols-[260px_1fr] lg:items-start">
              <ImageDrop
                mediaKey={item.key}
                url={item.url}
                alt={item.altText}
              />
              <MediaDetails index={index} />
            </div>
          ) : (
            <VideoFields index={index} />
          )}
        </div>
      ))}
      {leftovers.some(({ item }) => item.type === "video") ? (
        <Note>
          The site only renders images today, so video rows are stored but never
          shown to readers.
        </Note>
      ) : null}
    </FormSection>
  );
}

function VideoFields({ index }: { index: number }) {
  const { story, actions, errors } = useEditor();
  const media = story.media[index];
  if (!media) return null;

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <TextField
        label="URL"
        value={media.url}
        onChange={(url) => actions.patchMedia(index, { url })}
        error={errors[`media.${index}.url`]}
        placeholder="https://"
      />
      <TextField
        label="Caption"
        value={media.caption}
        onChange={(caption) => actions.patchMedia(index, { caption })}
      />
    </div>
  );
}
