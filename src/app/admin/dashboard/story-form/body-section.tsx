"use client";

import { Fragment } from "react";
import type { StoryBlockInput } from "../story-types";
import { Button, FormSection, TextAreaField } from "./controls";
import { useEditor } from "./editor-context";
import { ImageDrop, MediaDetails } from "./media-fields";
import { coverIndex, wordCount } from "./story-draft";
import { LIMITS } from "./story-validation";

export function BodySection() {
  const { story } = useEditor();
  const words = wordCount(story.body);

  return (
    <FormSection
      title="Body"
      description={`${words} ${words === 1 ? "word" : "words"} · about ${Math.max(
        1,
        Math.round(words / 220),
      )} min to read`}
    >
      {story.body.length === 0 ? (
        <p className="m-0 text-sm text-faded">
          Nothing written yet — start with a paragraph.
        </p>
      ) : null}
      <Inserter at={0} />
      {story.body.map((block, index) => (
        <Fragment key={index}>
          <Block block={block} index={index} />
          <Inserter at={index + 1} />
        </Fragment>
      ))}
    </FormSection>
  );
}

/** Adds a block exactly where the story needs it instead of at the very end. */
function Inserter({ at }: { at: number }) {
  const { actions, openPicker } = useEditor();

  return (
    <div className="flex flex-wrap items-center gap-1.5 opacity-55 transition-opacity focus-within:opacity-100 hover:opacity-100">
      <Button
        size="small"
        variant="quiet"
        onClick={() => actions.insertBlock(at, "paragraph")}
      >
        + Paragraph
      </Button>
      <Button
        size="small"
        variant="quiet"
        onClick={() => actions.insertBlock(at, "heading")}
      >
        + Heading
      </Button>
      <Button
        size="small"
        variant="quiet"
        onClick={() => openPicker(actions.insertBlock(at, "image"))}
      >
        + Image
      </Button>
    </div>
  );
}

function Block({ block, index }: { block: StoryBlockInput; index: number }) {
  const { story, actions } = useEditor();
  const last = index === story.body.length - 1;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-ink/10 bg-white p-3 lg:p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="w-6 text-xs font-bold tabular-nums text-pale">
          {index + 1}
        </span>
        {block.type === "image" ? (
          <span className="text-xs font-bold tracking-[0.08em] text-faded uppercase">
            Image
          </span>
        ) : (
          <select
            value={block.type}
            onChange={(event) =>
              actions.setBlockType(
                index,
                event.target.value === "heading" ? "heading" : "paragraph",
              )
            }
            aria-label={`Block ${index + 1} type`}
            className="h-8 rounded-[8px] border border-ink/20 bg-white px-2 text-[13px] font-semibold outline-none focus:border-accent-2"
          >
            <option value="paragraph">Paragraph</option>
            <option value="heading">Heading</option>
          </select>
        )}
        <div className="ml-auto flex items-center gap-1">
          <Button
            size="small"
            variant="quiet"
            onClick={() => actions.moveBlock(index, -1)}
            disabled={index === 0}
            aria-label={`Move block ${index + 1} up`}
            title="Move up"
          >
            ↑
          </Button>
          <Button
            size="small"
            variant="quiet"
            onClick={() => actions.moveBlock(index, 1)}
            disabled={last}
            aria-label={`Move block ${index + 1} down`}
            title="Move down"
          >
            ↓
          </Button>
          <Button
            size="small"
            variant="quiet"
            onClick={() => actions.duplicateBlock(index)}
          >
            Duplicate
          </Button>
          <Button
            size="small"
            variant="danger"
            onClick={() => actions.removeBlock(index)}
          >
            Remove
          </Button>
        </div>
      </div>
      {block.type === "image" ? (
        <ImageBlock mediaKey={block.mediaKey} />
      ) : (
        <TextAreaField
          label={`Block ${index + 1} ${block.type}`}
          hideLabel
          value={block.text}
          onChange={(text) => actions.setBlockText(index, text)}
          maxLength={LIMITS.text}
          rows={block.type === "heading" ? 1 : 4}
          placeholder={
            block.type === "heading" ? "Section heading" : "Write the story…"
          }
          controlClass={
            block.type === "heading" ? "font-serif text-lg font-semibold" : ""
          }
        />
      )}
    </div>
  );
}

function ImageBlock({ mediaKey }: { mediaKey: string }) {
  const { story, actions } = useEditor();
  const index = story.media.findIndex((item) => item.key === mediaKey);
  const media = index >= 0 ? story.media[index] : undefined;

  if (!media) return null;

  // Listings show the first stored image, which is not always this one.
  const isCover = coverIndex(story.media) === index;

  return (
    <div className="grid gap-4 lg:grid-cols-[260px_1fr] lg:items-start">
      <ImageDrop
        mediaKey={media.key}
        url={media.url}
        alt={media.altText}
        actions={
          media.url.trim() && !isCover ? (
            <Button
              size="small"
              variant="quiet"
              onClick={() => actions.useAsCover(index)}
            >
              Make cover
            </Button>
          ) : null
        }
      />
      <MediaDetails index={index} />
    </div>
  );
}
